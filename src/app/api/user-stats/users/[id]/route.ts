import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRequest } from '@/lib/admin-auth';
import { parseStatsPage } from '@/lib/stats-purchases';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminRequest();
  if (!access.ok) return access.response;

  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = parseStatsPage(searchParams.get('page'));
    const section = searchParams.get('section') || 'credits';
    const order = searchParams.get('order') || 'desc';
    if (page === null || !['credits', 'generations', 'purchases', 'usage'].includes(section) || !['asc', 'desc'].includes(order)) {
      return NextResponse.json({ error: '无效的分页或排序参数' }, { status: 400 });
    }
    const direction = order as 'asc' | 'desc';
    const user = await prisma.user.findUnique({
      where: { id }, select: { id: true, name: true, email: true, packCredits: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 });

    const pagination = { take: 26, skip: (page - 1) * 25 };
    const [credits, generations, purchases, usage] = await Promise.all([
      section === 'credits' ? prisma.creditLedger.findMany({
        where: { userId: id }, orderBy: { id: direction }, ...pagination,
        select: { id: true, amount: true, balanceAfter: true, reason: true, createdAt: true },
      }) : [],
      section === 'generations' ? prisma.apiLog.findMany({
        where: { userId: id }, orderBy: [{ timestamp: direction }, { id: direction }], ...pagination,
        select: { id: true, cardId: true, cardType: true, promptVersion: true, timestamp: true, status: true, isError: true, errorMessage: true, r2Url: true },
      }) : [],
      section === 'purchases' ? prisma.purchase.findMany({
        where: { userId: id }, orderBy: [{ createdAt: direction }, { id: direction }], ...pagination,
        select: { id: true, sku: true, amountCents: true, currency: true, cardsGranted: true, status: true, stripeLivemode: true, createdAt: true },
      }) : [],
      section === 'usage' ? prisma.apiUsage.findMany({
        where: { userId: id }, orderBy: [{ date: direction }, { id: direction }], ...pagination,
        select: { id: true, date: true, cards: true, adCards: true, count: true },
      }) : [],
    ]);
    return NextResponse.json({
      user,
      credits: credits.slice(0, 25), generations: generations.slice(0, 25),
      purchases: purchases.slice(0, 25), usage: usage.slice(0, 25),
      hasMore: [credits, generations, purchases, usage].some(rows => rows.length > 25),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Error fetching user stats detail:', error);
    return NextResponse.json({ error: '用户记录加载失败，请确认积分流水迁移已执行' }, { status: 500 });
  }
}
