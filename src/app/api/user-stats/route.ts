import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    const [stats, errorStats] = await Promise.all([
      // 用户行为统计
      prisma.$queryRaw`
        WITH date_range AS (
          SELECT generate_series(
            ${startDate}::date,
            ${endDate}::date,
            interval '1 day'
          )::date as dt
        )
        SELECT 
          to_char(d.dt, 'YYYY-MM-DD') as dt,
          COUNT(a.id)::integer as action_cards,
          SUM(CASE WHEN to_char(a.timestamp, 'YYYY-MM-DD') = to_char(b.timestamp, 'YYYY-MM-DD') THEN 1 ELSE 0 END)::integer as same_day_cards,
          SUM(CASE WHEN to_char(a.timestamp, 'YYYY-MM-DD') != to_char(b.timestamp, 'YYYY-MM-DD') THEN 1 ELSE 0 END)::integer as different_day_cards,
          COUNT(DISTINCT a."cardId")::integer as unique_cards,
          COUNT(DISTINCT CASE WHEN to_char(a.timestamp, 'YYYY-MM-DD') = to_char(b.timestamp, 'YYYY-MM-DD') THEN a."cardId" ELSE NULL END)::integer as unique_same_day_cards
        FROM date_range d
        LEFT JOIN "UserAction" a ON to_char(a.timestamp, 'YYYY-MM-DD') = to_char(d.dt, 'YYYY-MM-DD')
        LEFT JOIN "ApiLog" b ON a."cardId" = b."cardId"
        GROUP BY d.dt
        ORDER BY d.dt DESC
      `,
      // API 错误统计
      prisma.$queryRaw`
        WITH date_range AS (
          SELECT generate_series(
            ${startDate}::date,
            ${endDate}::date,
            interval '1 day'
          )::date as dt
        )
        SELECT 
          to_char(d.dt, 'YYYY-MM-DD') as dt,
          COUNT(CASE WHEN l."isError" = true THEN 1 END)::integer as error_count,
          COUNT(CASE WHEN l."isError" = false THEN 1 END)::integer as success_count,
          COUNT(l.id)::integer as total_count
        FROM date_range d
        LEFT JOIN "ApiLog" l ON to_char(l.timestamp, 'YYYY-MM-DD') = to_char(d.dt, 'YYYY-MM-DD')
        GROUP BY d.dt
        ORDER BY d.dt DESC
      `
    ]);

    // 确保返回的是数组
    if (!Array.isArray(stats) || !Array.isArray(errorStats)) {
      throw new Error('Invalid data format from database');
    }

    // 处理 null 值
    const processedStats = stats.map(stat => ({
      ...stat,
      action_cards: Number(stat.action_cards) || 0,
      same_day_cards: Number(stat.same_day_cards) || 0,
      different_day_cards: Number(stat.different_day_cards) || 0,
      unique_cards: Number(stat.unique_cards) || 0,
      unique_same_day_cards: Number(stat.unique_same_day_cards) || 0,
    }));

    const processedErrorStats = errorStats.map(stat => ({
      ...stat,
      error_count: Number(stat.error_count) || 0,
      success_count: Number(stat.success_count) || 0,
      total_count: Number(stat.total_count) || 0,
    }));

    return NextResponse.json({ 
      stats: processedStats,
      errorStats: processedErrorStats
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
