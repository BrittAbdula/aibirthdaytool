import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (session?.user?.id !== 'cm56ic66y000110jijyw2ir8r') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];


    // Collect raw query results first, without destructuring
    const results = await Promise.all([
      // 1. 用户行为统计 (按 action 分类)
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
          COALESCE(ua.action, 'unknown') as action,
          COUNT(ua.id)::integer as count
        FROM date_range d
        LEFT JOIN "UserAction" ua ON to_char(ua.timestamp, 'YYYY-MM-DD') = to_char(d.dt, 'YYYY-MM-DD')
        GROUP BY d.dt, ua.action
        ORDER BY d.dt ASC, ua.action ASC
      `,
      // 2. API 调用统计根据 promptVersion 进行分类统计 (全部调用)
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
          COALESCE(al."promptVersion", 'unknown') as "promptVersion",
          COUNT(al.id)::integer as count
        FROM date_range d
        LEFT JOIN "ApiLog" al ON to_char(al.timestamp, 'YYYY-MM-DD') = to_char(d.dt, 'YYYY-MM-DD')
        GROUP BY d.dt, al."promptVersion"
        ORDER BY d.dt ASC, al."promptVersion" ASC
      `,
      // 3. 近三十天每天卡片类型cardType的api调用量统计
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
          COALESCE(al."cardType", 'unknown') as "cardType",
          COUNT(al.id)::integer as total_count
        FROM date_range d
        LEFT JOIN "ApiLog" al ON to_char(al.timestamp, 'YYYY-MM-DD') = to_char(d.dt, 'YYYY-MM-DD')
        GROUP BY d.dt, al."cardType"
        ORDER BY d.dt ASC, al."cardType" ASC
      `,
      // 4. 近三十天每天用户调用量的分层统计
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
          COUNT(au.id)::integer AS total_users,
          COALESCE(SUM(au.count), 0)::integer AS total_calls,
          COALESCE(SUM(CASE WHEN au.count > 2 THEN 1 ELSE 0 END), 0)::integer AS up2_users,
          COALESCE(SUM(CASE WHEN au.count > 5 THEN 1 ELSE 0 END), 0)::integer AS up5_users,
          COALESCE(SUM(CASE WHEN au.count > 8 THEN 1 ELSE 0 END), 0)::integer AS up8_users,
          COALESCE(to_char(CASE 
                          WHEN COUNT(au.id) > 0 THEN round(SUM(COALESCE(au.count, 0))::numeric / COUNT(au.id), 2)
                          ELSE 0
                       END, 'FM9999990.99'), '0.00') AS avg_calls
        FROM date_range d
        LEFT JOIN "ApiUsage" au ON to_char(au."createdAt", 'YYYY-MM-DD') = to_char(d.dt, 'YYYY-MM-DD')
        GROUP BY d.dt
        ORDER BY d.dt ASC
      `,
      // 5. API 失败调用统计（按 promptVersion 分类，只包含错误）
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
          COALESCE(al."promptVersion", 'unknown') as "promptVersion",
          COUNT(al.id)::integer as count
        FROM date_range d
        LEFT JOIN "ApiLog" al ON to_char(al.timestamp, 'YYYY-MM-DD') = to_char(d.dt, 'YYYY-MM-DD')
          AND al."isError" = 'true'
        GROUP BY d.dt, al."promptVersion"
        ORDER BY d.dt ASC, al."promptVersion" ASC
      `
    ]);

    // Now destructure with more confidence
    const [userActionStatsRaw, apiStatsByVersionRaw, apiCallStatsByTypeRaw, userCallVolumeStatsRaw, apiFailureStatsByVersionRaw] = results;

    // 确保返回的是数组，使用更精确的错误消息
    if (!Array.isArray(userActionStatsRaw)) {
      console.error("userActionStatsRaw is not an array:", userActionStatsRaw);
      throw new Error('userActionStats query did not return an array');
    }
    if (!Array.isArray(apiStatsByVersionRaw)) {
      console.error("apiStatsByVersionRaw is not an array:", apiStatsByVersionRaw);
      throw new Error('apiStatsByVersion query did not return an array');
    }
    if (!Array.isArray(apiCallStatsByTypeRaw)) {
      console.error("apiCallStatsByTypeRaw is not an array:", apiCallStatsByTypeRaw);
      throw new Error('apiCallStatsByType query did not return an array');
    }
    if (!Array.isArray(userCallVolumeStatsRaw)) {
      console.error("userCallVolumeStatsRaw is not an array:", userCallVolumeStatsRaw);
      throw new Error('userCallVolumeStats query did not return an array');
    }
    if (!Array.isArray(apiFailureStatsByVersionRaw)) {
      console.error("apiFailureStatsByVersionRaw is not an array:", apiFailureStatsByVersionRaw);
      throw new Error('apiFailureStatsByVersion query did not return an array');
    }

    // Process and format data (handle potential nulls and convert numeric types)
    const processedUserActionStats = userActionStatsRaw.map(stat => ({
        dt: String(stat.dt),
        action: String(stat.action || 'unknown'),
        count: Number(stat.count) || 0,
    }));

    const processedApiStatsByVersion = apiStatsByVersionRaw.map(stat => ({
        dt: String(stat.dt),
        promptVersion: stat.promptVersion === null ? null : String(stat.promptVersion),
        count: Number(stat.count) || 0,
    }));

    const processedApiCallStatsByType = apiCallStatsByTypeRaw.map(stat => ({
        dt: String(stat.dt),
        cardType: stat.cardType === null ? null : String(stat.cardType),
        total_count: Number(stat.total_count) || 0,
    }));

    const processedUserCallVolumeStats = userCallVolumeStatsRaw.map(stat => ({
        dt: String(stat.dt),
        total_users: Number(stat.total_users) || 0,
        total_calls: Number(stat.total_calls) || 0,
        up2_users: Number(stat.up2_users) || 0,
        up5_users: Number(stat.up5_users) || 0,
        up8_users: Number(stat.up8_users) || 0,
        avg_calls: String(stat.avg_calls || '0.00'),
    }));

    const processedApiFailureStatsByVersion = apiFailureStatsByVersionRaw.map(stat => ({
        dt: String(stat.dt),
        promptVersion: stat.promptVersion === null ? null : String(stat.promptVersion),
        count: Number(stat.count) || 0,
    }));

    // Ensure we have data in all arrays (even if the arrays are empty, they should exist)
    const responseData = {
      userActionStats: processedUserActionStats,
      apiStatsByVersion: processedApiStatsByVersion,
      apiCallStatsByType: processedApiCallStatsByType,
      userCallVolumeStats: processedUserCallVolumeStats,
      apiFailureStatsByVersion: processedApiFailureStatsByVersion
    };

    console.log("Returning response with structure:", Object.keys(responseData));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
