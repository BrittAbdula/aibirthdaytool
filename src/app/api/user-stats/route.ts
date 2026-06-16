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
            AND (al.status IN ('failed', 'error') OR al."isError" = true)
          GROUP BY date_trunc('day', al.timestamp)::date, al."promptVersion"
        )
        SELECT
          to_char(d.dt, 'YYYY-MM-DD') as dt,
          COALESCE(fc."promptVersion", 'unknown') as "promptVersion",
          COALESCE(fc.count, 0)::integer as count
        FROM date_range d
        LEFT JOIN failure_counts fc ON fc.dt = d.dt
        ORDER BY d.dt ASC, fc."promptVersion" ASC
      `,
      // 6. Model-level health and behavior signals.
      prisma.$queryRaw`
        WITH logs AS (
          SELECT *
          FROM "ApiLog" al
          WHERE al.timestamp >= ${startDate}::date
            AND al.timestamp < (${endDate}::date + interval '1 day')
        ),
        log_agg AS (
          SELECT
            COALESCE(l."promptVersion", 'unknown') AS prompt_version,
            COUNT(*)::integer AS total_calls,
            COUNT(*) FILTER (WHERE l.status = 'completed')::integer AS completed_calls,
            COUNT(*) FILTER (WHERE l.status IN ('failed', 'error') OR l."isError" = true)::integer AS failed_calls,
            COUNT(*) FILTER (WHERE l.status = 'pending')::integer AS pending_calls,
            COUNT(*) FILTER (WHERE l.status = 'processing')::integer AS processing_calls,
            COUNT(*) FILTER (
              WHERE l.status IN ('pending', 'processing')
                AND l.timestamp < now() - interval '24 hours'
            )::integer AS stale_non_terminal_calls,
            ROUND((COALESCE(AVG(l.duration) FILTER (WHERE l.status = 'completed' AND l.duration > 0), 0)::numeric / 1000), 2) AS avg_duration_sec,
            COALESCE(SUM(l."tokensUsed"), 0)::integer AS tokens_used,
            COUNT(DISTINCT l."userId") FILTER (WHERE l."userId" IS NOT NULL)::integer AS unique_users,
            COUNT(*) FILTER (
              WHERE COALESCE(BTRIM(l."modificationFeedback"), '') <> ''
            )::integer AS modification_calls,
            COUNT(*) FILTER (
              WHERE jsonb_typeof(l."userInputs"->'referenceImageUrls') = 'array'
                AND jsonb_array_length(l."userInputs"->'referenceImageUrls') > 0
            )::integer AS reference_image_calls
          FROM logs l
          GROUP BY COALESCE(l."promptVersion", 'unknown')
        ),
        action_agg AS (
          SELECT
            COALESCE(l."promptVersion", 'unknown') AS prompt_version,
            COUNT(DISTINCT ua."cardId") FILTER (WHERE ua.action = 'copy')::integer AS copy_cards,
            COUNT(DISTINCT ua."cardId") FILTER (WHERE ua.action = 'download')::integer AS download_cards,
            COUNT(DISTINCT ua."cardId") FILTER (WHERE ua.action = 'send')::integer AS send_cards,
            COUNT(DISTINCT ua."cardId") FILTER (WHERE ua.action = 'up')::integer AS up_cards,
            COUNT(DISTINCT ua."cardId") FILTER (WHERE ua.action = 'moment_answer')::integer AS moment_answer_cards
          FROM logs l
          LEFT JOIN "UserAction" ua ON ua."cardId" = l."cardId"
            AND ua.timestamp >= ${startDate}::date
            AND ua.timestamp < (${endDate}::date + interval '1 day')
          GROUP BY COALESCE(l."promptVersion", 'unknown')
        ),
        edit_agg AS (
          SELECT
            COALESCE(l."promptVersion", 'unknown') AS prompt_version,
            COUNT(DISTINCT ec."originalCardId") FILTER (WHERE ec.deleted = false)::integer AS saved_cards,
            COUNT(DISTINCT ec."originalCardId") FILTER (WHERE ec.deleted = false AND ec."isPublic" = true)::integer AS public_cards
          FROM logs l
          LEFT JOIN "EditedCard" ec ON ec."originalCardId" = l."cardId"
            AND ec."createdAt" >= ${startDate}::date
            AND ec."createdAt" < (${endDate}::date + interval '1 day')
          GROUP BY COALESCE(l."promptVersion", 'unknown')
        )
        SELECT
          la.prompt_version AS "promptVersion",
          la.total_calls,
          la.completed_calls,
          la.failed_calls,
          la.pending_calls,
          la.processing_calls,
          la.stale_non_terminal_calls,
          la.avg_duration_sec,
          la.tokens_used,
          la.unique_users,
          la.modification_calls,
          la.reference_image_calls,
          COALESCE(ea.saved_cards, 0)::integer AS saved_cards,
          COALESCE(ea.public_cards, 0)::integer AS public_cards,
          COALESCE(aa.copy_cards, 0)::integer AS copy_cards,
          COALESCE(aa.download_cards, 0)::integer AS download_cards,
          COALESCE(aa.send_cards, 0)::integer AS send_cards,
          COALESCE(aa.up_cards, 0)::integer AS up_cards,
          COALESCE(aa.moment_answer_cards, 0)::integer AS moment_answer_cards,
          COALESCE(ROUND((la.completed_calls::numeric / NULLIF(la.total_calls, 0)) * 100, 1), 0) AS completion_rate,
          COALESCE(ROUND((la.failed_calls::numeric / NULLIF(la.total_calls, 0)) * 100, 1), 0) AS failure_rate,
          COALESCE(ROUND((COALESCE(ea.saved_cards, 0)::numeric / NULLIF(la.completed_calls, 0)) * 100, 1), 0) AS save_rate,
          COALESCE(ROUND((COALESCE(aa.send_cards, 0)::numeric / NULLIF(la.completed_calls, 0)) * 100, 1), 0) AS send_rate,
          COALESCE(ROUND(((
            COALESCE(aa.send_cards, 0) * 10 +
            COALESCE(aa.download_cards, 0) * 7 +
            COALESCE(aa.copy_cards, 0) * 5 +
            COALESCE(aa.up_cards, 0) * 4 +
            COALESCE(ea.public_cards, 0) * 3 +
            COALESCE(ea.saved_cards, 0) * 2 +
            COALESCE(aa.moment_answer_cards, 0) * 8
          )::numeric / NULLIF(la.completed_calls, 0)) * 100, 1), 0) AS satisfaction_proxy
        FROM log_agg la
        LEFT JOIN action_agg aa ON aa.prompt_version = la.prompt_version
        LEFT JOIN edit_agg ea ON ea.prompt_version = la.prompt_version
        ORDER BY la.total_calls DESC, la.prompt_version ASC
      `,
      // 7. Card-type conversion and satisfaction proxy.
      prisma.$queryRaw`
        WITH logs AS (
          SELECT *
          FROM "ApiLog" al
          WHERE al.timestamp >= ${startDate}::date
            AND al.timestamp < (${endDate}::date + interval '1 day')
        ),
        log_agg AS (
          SELECT
            COALESCE(l."cardType", 'unknown') AS card_type,
            COUNT(*)::integer AS total_calls,
            COUNT(*) FILTER (WHERE l.status = 'completed')::integer AS completed_calls,
            COUNT(*) FILTER (WHERE l.status IN ('failed', 'error') OR l."isError" = true)::integer AS failed_calls,
            COUNT(DISTINCT l."userId") FILTER (WHERE l."userId" IS NOT NULL)::integer AS unique_users,
            ROUND((COALESCE(AVG(l.duration) FILTER (WHERE l.status = 'completed' AND l.duration > 0), 0)::numeric / 1000), 2) AS avg_duration_sec
          FROM logs l
          GROUP BY COALESCE(l."cardType", 'unknown')
        ),
        action_agg AS (
          SELECT
            COALESCE(l."cardType", 'unknown') AS card_type,
            COUNT(DISTINCT ua."cardId") FILTER (WHERE ua.action = 'copy')::integer AS copy_cards,
            COUNT(DISTINCT ua."cardId") FILTER (WHERE ua.action = 'download')::integer AS download_cards,
            COUNT(DISTINCT ua."cardId") FILTER (WHERE ua.action = 'send')::integer AS send_cards,
            COUNT(DISTINCT ua."cardId") FILTER (WHERE ua.action = 'up')::integer AS up_cards,
            COUNT(DISTINCT ua."cardId") FILTER (WHERE ua.action = 'moment_answer')::integer AS moment_answer_cards
          FROM logs l
          LEFT JOIN "UserAction" ua ON ua."cardId" = l."cardId"
            AND ua.timestamp >= ${startDate}::date
            AND ua.timestamp < (${endDate}::date + interval '1 day')
          GROUP BY COALESCE(l."cardType", 'unknown')
        ),
        edit_agg AS (
          SELECT
            COALESCE(l."cardType", 'unknown') AS card_type,
            COUNT(DISTINCT ec."originalCardId") FILTER (WHERE ec.deleted = false)::integer AS saved_cards,
            COUNT(DISTINCT ec."originalCardId") FILTER (WHERE ec.deleted = false AND ec."isPublic" = true)::integer AS public_cards
          FROM logs l
          LEFT JOIN "EditedCard" ec ON ec."originalCardId" = l."cardId"
            AND ec."createdAt" >= ${startDate}::date
            AND ec."createdAt" < (${endDate}::date + interval '1 day')
          GROUP BY COALESCE(l."cardType", 'unknown')
        ),
        top_model AS (
          SELECT card_type, prompt_version
          FROM (
            SELECT
              COALESCE(l."cardType", 'unknown') AS card_type,
              COALESCE(l."promptVersion", 'unknown') AS prompt_version,
              COUNT(*) AS model_calls,
              ROW_NUMBER() OVER (
                PARTITION BY COALESCE(l."cardType", 'unknown')
                ORDER BY COUNT(*) DESC, COALESCE(l."promptVersion", 'unknown') ASC
              ) AS rn
            FROM logs l
            GROUP BY COALESCE(l."cardType", 'unknown'), COALESCE(l."promptVersion", 'unknown')
          ) ranked
          WHERE rn = 1
        )
        SELECT
          la.card_type AS "cardType",
          COALESCE(tm.prompt_version, 'unknown') AS "topModel",
          la.total_calls,
          la.completed_calls,
          la.failed_calls,
          la.unique_users,
          la.avg_duration_sec,
          COALESCE(ea.saved_cards, 0)::integer AS saved_cards,
          COALESCE(ea.public_cards, 0)::integer AS public_cards,
          COALESCE(aa.copy_cards, 0)::integer AS copy_cards,
          COALESCE(aa.download_cards, 0)::integer AS download_cards,
          COALESCE(aa.send_cards, 0)::integer AS send_cards,
          COALESCE(aa.up_cards, 0)::integer AS up_cards,
          COALESCE(aa.moment_answer_cards, 0)::integer AS moment_answer_cards,
          COALESCE(ROUND((la.completed_calls::numeric / NULLIF(la.total_calls, 0)) * 100, 1), 0) AS completion_rate,
          COALESCE(ROUND((la.failed_calls::numeric / NULLIF(la.total_calls, 0)) * 100, 1), 0) AS failure_rate,
          COALESCE(ROUND((COALESCE(ea.saved_cards, 0)::numeric / NULLIF(la.completed_calls, 0)) * 100, 1), 0) AS save_rate,
          COALESCE(ROUND((COALESCE(aa.send_cards, 0)::numeric / NULLIF(la.completed_calls, 0)) * 100, 1), 0) AS send_rate,
          COALESCE(ROUND((COALESCE(aa.download_cards, 0)::numeric / NULLIF(la.completed_calls, 0)) * 100, 1), 0) AS download_rate,
          COALESCE(ROUND((COALESCE(aa.copy_cards, 0)::numeric / NULLIF(la.completed_calls, 0)) * 100, 1), 0) AS copy_rate,
          COALESCE(ROUND((COALESCE(aa.up_cards, 0)::numeric / NULLIF(la.completed_calls, 0)) * 100, 1), 0) AS up_rate,
          COALESCE(ROUND(((
            COALESCE(aa.send_cards, 0) * 10 +
            COALESCE(aa.download_cards, 0) * 7 +
            COALESCE(aa.copy_cards, 0) * 5 +
            COALESCE(aa.up_cards, 0) * 4 +
            COALESCE(ea.public_cards, 0) * 3 +
            COALESCE(ea.saved_cards, 0) * 2 +
            COALESCE(aa.moment_answer_cards, 0) * 8
          )::numeric / NULLIF(la.completed_calls, 0)) * 100, 1), 0) AS satisfaction_proxy
        FROM log_agg la
        LEFT JOIN action_agg aa ON aa.card_type = la.card_type
        LEFT JOIN edit_agg ea ON ea.card_type = la.card_type
        LEFT JOIN top_model tm ON tm.card_type = la.card_type
        ORDER BY la.total_calls DESC, la.card_type ASC
      `
    ]);

    // Now destructure with more confidence
    const [
      userActionStatsRaw,
      apiStatsByVersionRaw,
      apiCallStatsByTypeRaw,
      userCallVolumeStatsRaw,
      apiFailureStatsByVersionRaw,
      modelHealthStatsRaw,
      cardTypeConversionStatsRaw,
    ] = results;

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
    if (!Array.isArray(modelHealthStatsRaw)) {
      console.error("modelHealthStatsRaw is not an array:", modelHealthStatsRaw);
      throw new Error('modelHealthStats query did not return an array');
    }
    if (!Array.isArray(cardTypeConversionStatsRaw)) {
      console.error("cardTypeConversionStatsRaw is not an array:", cardTypeConversionStatsRaw);
      throw new Error('cardTypeConversionStats query did not return an array');
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

    const processedModelHealthStats = modelHealthStatsRaw.map(stat => ({
      promptVersion: String(stat.promptVersion || 'unknown'),
      total_calls: Number(stat.total_calls) || 0,
      completed_calls: Number(stat.completed_calls) || 0,
      failed_calls: Number(stat.failed_calls) || 0,
      pending_calls: Number(stat.pending_calls) || 0,
      processing_calls: Number(stat.processing_calls) || 0,
      stale_non_terminal_calls: Number(stat.stale_non_terminal_calls) || 0,
      avg_duration_sec: Number(stat.avg_duration_sec) || 0,
      tokens_used: Number(stat.tokens_used) || 0,
      unique_users: Number(stat.unique_users) || 0,
      modification_calls: Number(stat.modification_calls) || 0,
      reference_image_calls: Number(stat.reference_image_calls) || 0,
      saved_cards: Number(stat.saved_cards) || 0,
      public_cards: Number(stat.public_cards) || 0,
      copy_cards: Number(stat.copy_cards) || 0,
      download_cards: Number(stat.download_cards) || 0,
      send_cards: Number(stat.send_cards) || 0,
      up_cards: Number(stat.up_cards) || 0,
      moment_answer_cards: Number(stat.moment_answer_cards) || 0,
      completion_rate: Number(stat.completion_rate) || 0,
      failure_rate: Number(stat.failure_rate) || 0,
      save_rate: Number(stat.save_rate) || 0,
      send_rate: Number(stat.send_rate) || 0,
      satisfaction_proxy: Number(stat.satisfaction_proxy) || 0,
    }));

    const processedCardTypeConversionStats = cardTypeConversionStatsRaw.map(stat => ({
      cardType: String(stat.cardType || 'unknown'),
      topModel: String(stat.topModel || 'unknown'),
      total_calls: Number(stat.total_calls) || 0,
      completed_calls: Number(stat.completed_calls) || 0,
      failed_calls: Number(stat.failed_calls) || 0,
      unique_users: Number(stat.unique_users) || 0,
      avg_duration_sec: Number(stat.avg_duration_sec) || 0,
      saved_cards: Number(stat.saved_cards) || 0,
      public_cards: Number(stat.public_cards) || 0,
      copy_cards: Number(stat.copy_cards) || 0,
      download_cards: Number(stat.download_cards) || 0,
      send_cards: Number(stat.send_cards) || 0,
      up_cards: Number(stat.up_cards) || 0,
      moment_answer_cards: Number(stat.moment_answer_cards) || 0,
      completion_rate: Number(stat.completion_rate) || 0,
      failure_rate: Number(stat.failure_rate) || 0,
      save_rate: Number(stat.save_rate) || 0,
      send_rate: Number(stat.send_rate) || 0,
      download_rate: Number(stat.download_rate) || 0,
      copy_rate: Number(stat.copy_rate) || 0,
      up_rate: Number(stat.up_rate) || 0,
      satisfaction_proxy: Number(stat.satisfaction_proxy) || 0,
    }));

    // Ensure we have data in all arrays (even if the arrays are empty, they should exist)
    const responseData = {
      userActionStats: processedUserActionStats,
      apiStatsByVersion: processedApiStatsByVersion,
      apiCallStatsByType: processedApiCallStatsByType,
      userCallVolumeStats: processedUserCallVolumeStats,
      apiFailureStatsByVersion: processedApiFailureStatsByVersion,
      modelHealthStats: processedModelHealthStats,
      cardTypeConversionStats: processedCardTypeConversionStats
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
