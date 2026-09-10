import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRequest } from '@/lib/admin-auth';
import { parseStatsDateRange, StatsDateRangeError } from '@/lib/stats-metrics';
import { parseStatsPage, type PurchaseSummaryRow, type PurchaseUserRow } from '@/lib/stats-purchases';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const access = await requireAdminRequest();
  if (!access.ok) return access.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseStatsPage(searchParams.get('page'));
    if (page === null) return NextResponse.json({ error: '无效页码' }, { status: 400 });
    const { startDate, endDate } = parseStatsDateRange({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });
    const pageSize = 25;
    const [summary, users] = await Promise.all([
      prisma.$queryRaw<PurchaseSummaryRow[]>`
        SELECT sku, currency,
          COUNT(*) FILTER (WHERE status = 'completed')::integer AS orders,
          COUNT(DISTINCT "userId") FILTER (WHERE status = 'completed')::integer AS buyers,
          COALESCE(SUM("amountCents") FILTER (WHERE status = 'completed'), 0)::integer AS "revenueCents",
          COALESCE(SUM("cardsGranted") FILTER (WHERE status = 'completed'), 0)::integer AS "cardsGranted",
          COUNT(*) FILTER (WHERE status = 'refunded')::integer AS "refundedOrders"
        FROM "Purchase"
        WHERE "stripeLivemode" = true
          AND "createdAt" >= ${startDate}::date
          AND "createdAt" < ${endDate}::date + interval '1 day'
        GROUP BY sku, currency ORDER BY sku, currency
      `,
      prisma.$queryRaw<PurchaseUserRow[]>`
        SELECT u.id, u.name, u.email, u."packCredits",
          COUNT(*)::integer AS orders,
          ARRAY_AGG(DISTINCT p.sku ORDER BY p.sku) AS skus,
          MAX(p."createdAt") AS "lastPurchaseAt"
        FROM "Purchase" p JOIN "User" u ON u.id = p."userId"
        WHERE p."stripeLivemode" = true AND p.status IN ('completed', 'refunded')
          AND p."createdAt" >= ${startDate}::date
          AND p."createdAt" < ${endDate}::date + interval '1 day'
        GROUP BY u.id
        ORDER BY MAX(p."createdAt") DESC, u.id ASC
        LIMIT ${pageSize + 1} OFFSET ${(page - 1) * pageSize}
      `,
    ]);
    return NextResponse.json({ summary, users: users.slice(0, pageSize), page, hasMore: users.length > pageSize }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Error fetching purchase stats:', error);
    return NextResponse.json({ error: error instanceof StatsDateRangeError ? error.message : '一次性购买统计加载失败' }, {
      status: error instanceof StatsDateRangeError ? 400 : 500,
    });
  }
}
