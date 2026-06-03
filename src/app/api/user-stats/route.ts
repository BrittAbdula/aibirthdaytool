import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const access = await requireAdminRequest();
    if (!access.ok) {
      return access.response;
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
        ),
        action_counts AS (
          SELECT
            date_trunc('day', ua.timestamp)::date as dt,
            ua.action,
            COUNT(ua.id)::integer as count
          FROM "UserAction" ua
          WHERE ua.timestamp >= ${startDate}::date
            AND ua.timestamp < (${endDate}::date + interval '1 day')
          GROUP BY date_trunc('day', ua.timestamp)::date, ua.action
        )
        SELECT
          to_char(d.dt, 'YYYY-MM-DD') as dt,
          COALESCE(ac.action, 'unknown') as action,
          COALESCE(ac.count, 0)::integer as count
        FROM date_range d
        LEFT JOIN action_counts ac ON ac.dt = d.dt
        ORDER BY d.dt ASC, ac.action ASC
      `,
      // 2. API 调用统计根据 promptVersion 进行分类统计 (全部调用)
      prisma.$queryRaw`
        WITH date_range AS (
          SELECT generate_series(
            ${startDate}::date,
            ${endDate}::date,
            interval '1 day'
          )::date as dt
        ),
        api_counts AS (
          SELECT
            date_trunc('day', al.timestamp)::date as dt,
            al."promptVersion",
            COUNT(al.id)::integer as count
          FROM "ApiLog" al
          WHERE al.timestamp >= ${startDate}::date
            AND al.timestamp < (${endDate}::date + interval '1 day')
          GROUP BY date_trunc('day', al.timestamp)::date, al."promptVersion"
        )
        SELECT
          to_char(d.dt, 'YYYY-MM-DD') as dt,
          COALESCE(ac."promptVersion", 'unknown') as "promptVersion",
          COALESCE(ac.count, 0)::integer as count
        FROM date_range d
        LEFT JOIN api_counts ac ON ac.dt = d.dt
        ORDER BY d.dt ASC, ac."promptVersion" ASC
      `,
      // 3. 近三十天每天卡片类型cardType的api调用量统计
      prisma.$queryRaw`
         WITH date_range AS (
          SELECT generate_series(
            ${startDate}::date,
            ${endDate}::date,
            interval '1 day'
          )::date as dt
        ),
        card_type_counts AS (
          SELECT
            date_trunc('day', al.timestamp)::date as dt,
            al."cardType",
            COUNT(al.id)::integer as total_count
          FROM "ApiLog" al
          WHERE al.timestamp >= ${startDate}::date
            AND al.timestamp < (${endDate}::date + interval '1 day')
          GROUP BY date_trunc('day', al.timestamp)::date, al."cardType"
        )
        SELECT
          to_char(d.dt, 'YYYY-MM-DD') as dt,
          COALESCE(ctc."cardType", 'unknown') as "cardType",
          COALESCE(ctc.total_count, 0)::integer as total_count
        FROM date_range d
        LEFT JOIN card_type_counts ctc ON ctc.dt = d.dt
        ORDER BY d.dt ASC, ctc."cardType" ASC
      `,
      // 4. 近三十天每天用户调用量的分层统计
      prisma.$queryRaw`
        WITH date_range AS (
          SELECT generate_series(
            ${startDate}::date,
            ${endDate}::date,
            interval '1 day'
          )::date as dt
        ),
        usage_counts AS (
          SELECT
            au.date::date as dt,
            COUNT(au.id)::integer AS total_users,
            COALESCE(SUM(au.count), 0)::integer AS total_calls,
            COALESCE(SUM(CASE WHEN au.count > 2 THEN 1 ELSE 0 END), 0)::integer AS up2_users,
            COALESCE(SUM(CASE WHEN au.count > 5 THEN 1 ELSE 0 END), 0)::integer AS up5_users,
            COALESCE(SUM(CASE WHEN au.count > 8 THEN 1 ELSE 0 END), 0)::integer AS up8_users,
            COALESCE(to_char(CASE
                            WHEN COUNT(au.id) > 0 THEN round(SUM(COALESCE(au.count, 0))::numeric / COUNT(au.id), 2)
                            ELSE 0
                         END, 'FM9999990.99'), '0.00') AS avg_calls
          FROM "ApiUsage" au
          WHERE au.date >= ${startDate}::date
            AND au.date <= ${endDate}::date
          GROUP BY au.date::date
        )
        SELECT
          to_char(d.dt, 'YYYY-MM-DD') as dt,
          COALESCE(uc.total_users, 0)::integer AS total_users,
          COALESCE(uc.total_calls, 0)::integer AS total_calls,
          COALESCE(uc.up2_users, 0)::integer AS up2_users,
          COALESCE(uc.up5_users, 0)::integer AS up5_users,
          COALESCE(uc.up8_users, 0)::integer AS up8_users,
          COALESCE(uc.avg_calls, '0.00') AS avg_calls
        FROM date_range d
        LEFT JOIN usage_counts uc ON uc.dt = d.dt
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
        ),
        failure_counts AS (
          SELECT
            date_trunc('day', al.timestamp)::date as dt,
            al."promptVersion",
            COUNT(al.id)::integer as count
          FROM "ApiLog" al
          WHERE al.timestamp >= ${startDate}::date
            AND al.timestamp < (${endDate}::date + interval '1 day')
            AND al."isError" = true
          GROUP BY date_trunc('day', al.timestamp)::date, al."promptVersion"
        )
        SELECT
          to_char(d.dt, 'YYYY-MM-DD') as dt,
          COALESCE(fc."promptVersion", 'unknown') as "promptVersion",
          COALESCE(fc.count, 0)::integer as count
        FROM date_range d
        LEFT JOIN failure_counts fc ON fc.dt = d.dt
        ORDER BY d.dt ASC, fc."promptVersion" ASC
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

    const response = NextResponse.json(responseData);
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=900');
    return response;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
