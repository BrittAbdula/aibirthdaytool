import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/admin-auth";
import {
  SUBSCRIPTION_LIFECYCLE_RELIABLE_FROM,
  StatsDateRangeError,
  buildFunnelMetrics,
  calculateChange,
  calculateRate,
  calculateSubscriptionValue,
  isSubscriptionLifecyclePartial,
  parseStatsDateRange,
} from '@/lib/stats-metrics';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const access = await requireAdminRequest();
    if (!access.ok) {
      return access.response;
    }

    const { searchParams } = new URL(request.url);
    const range = parseStatsDateRange({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });
    const {
      startDate,
      endDate,
      previousStartDate,
      previousEndDate,
    } = range;
    const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID;
    const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID;
    if (!monthlyPriceId || !yearlyPriceId) {
      throw new Error('Stripe price IDs are not configured');
    }


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
      `,
      // 8. Monetization funnel trend by event type.
      prisma.$queryRaw`
        WITH date_range AS (
          SELECT generate_series(
            ${startDate}::date,
            ${endDate}::date,
            interval '1 day'
          )::date as dt
        ),
        event_counts AS (
          SELECT
            date_trunc('day', me."createdAt")::date as dt,
            me."eventType",
            COUNT(me.id)::integer as count,
            COUNT(DISTINCT me."userId")::integer as users
          FROM "MonetizationEvent" me
          WHERE me."createdAt" >= ${startDate}::date
            AND me."createdAt" < (${endDate}::date + interval '1 day')
          GROUP BY date_trunc('day', me."createdAt")::date, me."eventType"
        )
        SELECT
          to_char(d.dt, 'YYYY-MM-DD') as dt,
          COALESCE(ec."eventType", 'none') as event_type,
          COALESCE(ec.count, 0)::integer as count,
          COALESCE(ec.users, 0)::integer as users
        FROM date_range d
        LEFT JOIN event_counts ec ON ec.dt = d.dt
        ORDER BY d.dt ASC, ec."eventType" ASC
      `,
      // 9. Monetization source summary.
      prisma.$queryRaw`
        SELECT
          me."eventType" as event_type,
          COALESCE(me.plan, 'unknown') as plan,
          COALESCE(me.source, 'unknown') as source,
          COUNT(me.id)::integer as count,
          COUNT(DISTINCT me."userId")::integer as users,
          COUNT(DISTINCT me."stripeSessionId") FILTER (WHERE me."stripeSessionId" IS NOT NULL)::integer as stripe_sessions
        FROM "MonetizationEvent" me
        WHERE me."createdAt" >= ${startDate}::date
          AND me."createdAt" < (${endDate}::date + interval '1 day')
        GROUP BY me."eventType", COALESCE(me.plan, 'unknown'), COALESCE(me.source, 'unknown')
        ORDER BY count DESC
        LIMIT 60
      `,
      // 10. Executive summary for the selected and previous equal-length periods.
      prisma.$queryRaw`
        SELECT
          (SELECT COUNT(*)::integer FROM "User" WHERE "createdAt" >= ${startDate}::date AND "createdAt" < (${endDate}::date + interval '1 day')) AS new_users,
          (SELECT COUNT(DISTINCT "userId")::integer FROM "ApiLog" WHERE timestamp >= ${startDate}::date AND timestamp < (${endDate}::date + interval '1 day')) AS active_creators,
          (SELECT COUNT(*)::integer FROM "ApiLog" WHERE timestamp >= ${startDate}::date AND timestamp < (${endDate}::date + interval '1 day')) AS total_generations,
          (SELECT COUNT(*)::integer FROM "ApiLog" WHERE timestamp >= ${startDate}::date AND timestamp < (${endDate}::date + interval '1 day') AND status = 'completed') AS completed_generations,
          (SELECT COUNT(*)::integer FROM "ApiLog" WHERE timestamp >= ${startDate}::date AND timestamp < (${endDate}::date + interval '1 day') AND (status IN ('failed', 'error') OR "isError" = true)) AS failed_generations,
          (SELECT COUNT(*)::integer FROM "ApiLog" WHERE timestamp >= ${startDate}::date AND timestamp < (${endDate}::date + interval '1 day') AND status IN ('pending', 'processing') AND timestamp < now() - interval '24 hours') AS stale_generations,
          (SELECT COUNT(*)::integer FROM "User" WHERE "createdAt" >= ${previousStartDate}::date AND "createdAt" < (${previousEndDate}::date + interval '1 day')) AS previous_new_users,
          (SELECT COUNT(DISTINCT "userId")::integer FROM "ApiLog" WHERE timestamp >= ${previousStartDate}::date AND timestamp < (${previousEndDate}::date + interval '1 day')) AS previous_active_creators,
          (SELECT COUNT(*)::integer FROM "ApiLog" WHERE timestamp >= ${previousStartDate}::date AND timestamp < (${previousEndDate}::date + interval '1 day')) AS previous_total_generations,
          (SELECT COUNT(*)::integer FROM "ApiLog" WHERE timestamp >= ${previousStartDate}::date AND timestamp < (${previousEndDate}::date + interval '1 day') AND status = 'completed') AS previous_completed_generations,
          (SELECT COUNT(*)::integer FROM "ApiLog" WHERE timestamp >= ${previousStartDate}::date AND timestamp < (${previousEndDate}::date + interval '1 day') AND (status IN ('failed', 'error') OR "isError" = true)) AS previous_failed_generations
      `,
      // 11. Daily business trend.
      prisma.$queryRaw`
        WITH date_range AS (
          SELECT generate_series(${startDate}::date, ${endDate}::date, interval '1 day')::date AS dt
        ),
        users AS (
          SELECT date_trunc('day', "createdAt")::date AS dt, COUNT(*)::integer AS new_users
          FROM "User"
          WHERE "createdAt" >= ${startDate}::date AND "createdAt" < (${endDate}::date + interval '1 day')
          GROUP BY 1
        ),
        generations AS (
          SELECT
            date_trunc('day', timestamp)::date AS dt,
            COUNT(*)::integer AS total_generations,
            COUNT(*) FILTER (WHERE status = 'completed')::integer AS completed_generations,
            COUNT(*) FILTER (WHERE status IN ('failed', 'error') OR "isError" = true)::integer AS failed_generations,
            COUNT(DISTINCT "userId")::integer AS active_creators
          FROM "ApiLog"
          WHERE timestamp >= ${startDate}::date AND timestamp < (${endDate}::date + interval '1 day')
          GROUP BY 1
        )
        SELECT
          to_char(d.dt, 'YYYY-MM-DD') AS dt,
          COALESCE(u.new_users, 0)::integer AS new_users,
          COALESCE(g.active_creators, 0)::integer AS active_creators,
          COALESCE(g.total_generations, 0)::integer AS total_generations,
          COALESCE(g.completed_generations, 0)::integer AS completed_generations,
          COALESCE(g.failed_generations, 0)::integer AS failed_generations
        FROM date_range d
        LEFT JOIN users u ON u.dt = d.dt
        LEFT JOIN generations g ON g.dt = d.dt
        ORDER BY d.dt ASC
      `,
      // 12. Current verified live subscription snapshot and revenue.
      prisma.$queryRaw`
        WITH verified AS (
          SELECT *
          FROM "Subscription"
          WHERE "stripeLivemode" = true
            AND "stripePriceId" IN (${monthlyPriceId}, ${yearlyPriceId})
        )
        SELECT
          COUNT(*) FILTER (WHERE status IN ('active', 'trialing'))::integer AS live_subscribers,
          COUNT(*) FILTER (WHERE status IN ('active', 'trialing') AND "billingPeriod" = 'MONTHLY')::integer AS monthly_subscribers,
          COUNT(*) FILTER (WHERE status IN ('active', 'trialing') AND "billingPeriod" = 'YEARLY')::integer AS yearly_subscribers,
          COUNT(*) FILTER (WHERE status IN ('active', 'trialing') AND "cancelAtPeriodEnd" = true)::integer AS scheduled_to_cancel,
          (SELECT COUNT(*)::integer
            FROM "User" u
            LEFT JOIN "Subscription" s ON s."userId" = u.id
            WHERE u.plan = 'PREMIUM'
              AND NOT (
                COALESCE(s."stripeLivemode", false) = true
                AND s."stripePriceId" IN (${monthlyPriceId}, ${yearlyPriceId})
                AND s.status IN ('active', 'trialing')
              )) AS unmapped_premium_entitlements,
          (SELECT COALESCE(SUM(amount), 0)::integer
            FROM "StripeLog"
            WHERE "stripeLivemode" = true
              AND "stripePriceId" IN (${monthlyPriceId}, ${yearlyPriceId})
              AND "eventType" = 'invoice.payment_succeeded'
              AND "createdAt" >= ${startDate}::date
              AND "createdAt" < (${endDate}::date + interval '1 day')) AS gross_revenue_cents,
          (SELECT COALESCE(SUM(amount), 0)::integer
            FROM "StripeLog"
            WHERE "stripeLivemode" = true
              AND "stripePriceId" IN (${monthlyPriceId}, ${yearlyPriceId})
              AND "eventType" = 'invoice.payment_succeeded'
              AND "createdAt" >= ${previousStartDate}::date
              AND "createdAt" < (${previousEndDate}::date + interval '1 day')) AS previous_gross_revenue_cents
        FROM verified
      `,
      // 13. Subscription lifecycle and cash trend.
      prisma.$queryRaw`
        WITH date_range AS (
          SELECT generate_series(${startDate}::date, ${endDate}::date, interval '1 day')::date AS dt
        ),
        stripe_daily AS (
          SELECT
            date_trunc('day', "createdAt")::date AS dt,
            COUNT(DISTINCT "stripeSubscriptionId") FILTER (WHERE "eventType" = 'customer.subscription.created')::integer AS new_subscriptions,
            COUNT(DISTINCT "stripeSubscriptionId") FILTER (WHERE "eventType" = 'customer.subscription.deleted')::integer AS ended_subscriptions,
            COALESCE(SUM(amount) FILTER (WHERE "eventType" = 'invoice.payment_succeeded'), 0)::integer AS gross_revenue_cents
          FROM "StripeLog"
          WHERE "stripeLivemode" = true
            AND "stripePriceId" IN (${monthlyPriceId}, ${yearlyPriceId})
            AND "createdAt" >= ${startDate}::date
            AND "createdAt" < (${endDate}::date + interval '1 day')
          GROUP BY 1
        )
        SELECT
          to_char(d.dt, 'YYYY-MM-DD') AS dt,
          COALESCE(s.new_subscriptions, 0)::integer AS new_subscriptions,
          COALESCE(s.ended_subscriptions, 0)::integer AS ended_subscriptions,
          (COALESCE(s.new_subscriptions, 0) - COALESCE(s.ended_subscriptions, 0))::integer AS net_growth,
          COALESCE(s.gross_revenue_cents, 0)::integer AS gross_revenue_cents
        FROM date_range d
        LEFT JOIN stripe_daily s ON s.dt = d.dt
        ORDER BY d.dt ASC
      `,
      // 14. Status mix for all recognized live subscriptions.
      prisma.$queryRaw`
        SELECT status, COUNT(*)::integer AS count
        FROM "Subscription"
        WHERE "stripeLivemode" = true
          AND "stripePriceId" IN (${monthlyPriceId}, ${yearlyPriceId})
        GROUP BY status
        ORDER BY count DESC, status ASC
      `,
      // 15. Active plan mix and value inputs.
      prisma.$queryRaw`
        SELECT
          "billingPeriod"::text AS billing_period,
          COALESCE("stripeUnitAmount", 0)::integer AS unit_amount,
          COALESCE("stripeCurrency", 'usd') AS currency,
          COUNT(*)::integer AS count
        FROM "Subscription"
        WHERE "stripeLivemode" = true
          AND "stripePriceId" IN (${monthlyPriceId}, ${yearlyPriceId})
          AND status IN ('active', 'trialing')
        GROUP BY "billingPeriod", "stripeUnitAmount", "stripeCurrency"
        ORDER BY billing_period ASC
      `,
      // 16. Unique-user monetization funnel.
      prisma.$queryRaw`
        WITH events AS (
          SELECT "eventType", "userId"
          FROM "MonetizationEvent"
          WHERE "userId" IS NOT NULL
            AND "createdAt" >= ${startDate}::date
            AND "createdAt" < (${endDate}::date + interval '1 day')
        )
        SELECT
          COUNT(DISTINCT "userId") FILTER (WHERE "eventType" IN ('premium_modal_view', 'pricing_page_view'))::integer AS upgrade_intent,
          COUNT(DISTINCT "userId") FILTER (WHERE "eventType" = 'pricing_cta_click')::integer AS cta_users,
          COUNT(DISTINCT "userId") FILTER (WHERE "eventType" = 'checkout_session_created')::integer AS checkout_users,
          COUNT(DISTINCT "userId") FILTER (WHERE "eventType" = 'subscription_activated')::integer AS activated_users
        FROM events
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
      monetizationFunnelStatsRaw,
      monetizationSourceStatsRaw,
      overviewSummaryRaw,
      businessTrendRaw,
      subscriptionCurrentRaw,
      subscriptionTrendRaw,
      subscriptionStatusMixRaw,
      subscriptionPlanMixRaw,
      subscriptionFunnelRaw,
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
    if (!Array.isArray(monetizationFunnelStatsRaw)) {
      console.error("monetizationFunnelStatsRaw is not an array:", monetizationFunnelStatsRaw);
      throw new Error('monetizationFunnelStats query did not return an array');
    }
    if (!Array.isArray(monetizationSourceStatsRaw)) {
      console.error("monetizationSourceStatsRaw is not an array:", monetizationSourceStatsRaw);
      throw new Error('monetizationSourceStats query did not return an array');
    }
    for (const [name, value] of [
      ['overviewSummary', overviewSummaryRaw],
      ['businessTrend', businessTrendRaw],
      ['subscriptionCurrent', subscriptionCurrentRaw],
      ['subscriptionTrend', subscriptionTrendRaw],
      ['subscriptionStatusMix', subscriptionStatusMixRaw],
      ['subscriptionPlanMix', subscriptionPlanMixRaw],
      ['subscriptionFunnel', subscriptionFunnelRaw],
    ] as const) {
      if (!Array.isArray(value)) {
        throw new Error(`${name} query did not return an array`);
      }
    }
    const overviewSummaryRows = overviewSummaryRaw as Record<string, unknown>[];
    const businessTrendRows = businessTrendRaw as Record<string, unknown>[];
    const subscriptionCurrentRows = subscriptionCurrentRaw as Record<string, unknown>[];
    const subscriptionTrendRows = subscriptionTrendRaw as Record<string, unknown>[];
    const subscriptionStatusMixRows = subscriptionStatusMixRaw as Record<string, unknown>[];
    const subscriptionPlanMixRows = subscriptionPlanMixRaw as Record<string, unknown>[];
    const subscriptionFunnelRows = subscriptionFunnelRaw as Record<string, unknown>[];

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

    const processedMonetizationFunnelStats = monetizationFunnelStatsRaw.map(stat => ({
      dt: String(stat.dt),
      event_type: String(stat.event_type || 'none'),
      count: Number(stat.count) || 0,
      users: Number(stat.users) || 0,
    }));

    const processedMonetizationSourceStats = monetizationSourceStatsRaw.map(stat => ({
      event_type: String(stat.event_type || 'unknown'),
      plan: String(stat.plan || 'unknown'),
      source: String(stat.source || 'unknown'),
      count: Number(stat.count) || 0,
      users: Number(stat.users) || 0,
      stripe_sessions: Number(stat.stripe_sessions) || 0,
    }));

    const numberValue = (value: unknown) => Number(value) || 0;
    const overviewRow = overviewSummaryRows[0] || {};
    const subscriptionCurrentRow = subscriptionCurrentRows[0] || {};
    const funnelRow = subscriptionFunnelRows[0] || {};
    const completedGenerations = numberValue(overviewRow.completed_generations);
    const failedGenerations = numberValue(overviewRow.failed_generations);
    const previousCompletedGenerations = numberValue(overviewRow.previous_completed_generations);
    const previousFailedGenerations = numberValue(overviewRow.previous_failed_generations);
    const successRate = calculateRate(
      completedGenerations,
      completedGenerations + failedGenerations
    );
    const previousSuccessRate = calculateRate(
      previousCompletedGenerations,
      previousCompletedGenerations + previousFailedGenerations
    );

    const processedBusinessTrend = businessTrendRows.map(stat => ({
      dt: String(stat.dt),
      new_users: numberValue(stat.new_users),
      active_creators: numberValue(stat.active_creators),
      total_generations: numberValue(stat.total_generations),
      completed_generations: numberValue(stat.completed_generations),
      failed_generations: numberValue(stat.failed_generations),
    }));
    const processedSubscriptionTrend = subscriptionTrendRows.map(stat => ({
      dt: String(stat.dt),
      new_subscriptions: numberValue(stat.new_subscriptions),
      ended_subscriptions: numberValue(stat.ended_subscriptions),
      net_growth: numberValue(stat.net_growth),
      gross_revenue_cents: numberValue(stat.gross_revenue_cents),
    }));
    const processedSubscriptionStatusMix = subscriptionStatusMixRows.map(stat => ({
      status: String(stat.status || 'unknown'),
      count: numberValue(stat.count),
    }));
    const processedSubscriptionPlanMix = subscriptionPlanMixRows.map(stat => ({
      billing_period: String(stat.billing_period || 'UNKNOWN'),
      unit_amount: numberValue(stat.unit_amount),
      currency: String(stat.currency || 'usd'),
      count: numberValue(stat.count),
    }));
    const subscriptionValue = calculateSubscriptionValue(
      processedSubscriptionPlanMix
        .filter(stat => stat.billing_period === 'MONTHLY' || stat.billing_period === 'YEARLY')
        .map(stat => ({
          billingPeriod: stat.billing_period as 'MONTHLY' | 'YEARLY',
          unitAmount: stat.unit_amount,
          count: stat.count,
        }))
    );
    const subscriptionFunnel = buildFunnelMetrics({
      upgradeIntent: numberValue(funnelRow.upgrade_intent),
      ctaUsers: numberValue(funnelRow.cta_users),
      checkoutUsers: numberValue(funnelRow.checkout_users),
      activatedUsers: numberValue(funnelRow.activated_users),
    });
    const grossRevenueCents = numberValue(subscriptionCurrentRow.gross_revenue_cents);
    const previousGrossRevenueCents = numberValue(subscriptionCurrentRow.previous_gross_revenue_cents);

    const overview = {
      newUsers: {
        value: numberValue(overviewRow.new_users),
        previous: numberValue(overviewRow.previous_new_users),
        changePct: calculateChange(
          numberValue(overviewRow.new_users),
          numberValue(overviewRow.previous_new_users)
        ),
      },
      activeCreators: {
        value: numberValue(overviewRow.active_creators),
        previous: numberValue(overviewRow.previous_active_creators),
        changePct: calculateChange(
          numberValue(overviewRow.active_creators),
          numberValue(overviewRow.previous_active_creators)
        ),
      },
      totalGenerations: {
        value: numberValue(overviewRow.total_generations),
        previous: numberValue(overviewRow.previous_total_generations),
        changePct: calculateChange(
          numberValue(overviewRow.total_generations),
          numberValue(overviewRow.previous_total_generations)
        ),
      },
      successRate: {
        value: successRate,
        previous: previousSuccessRate,
        changePct: successRate === null || previousSuccessRate === null
          ? null
          : calculateChange(successRate, previousSuccessRate),
      },
      failedGenerations: {
        value: failedGenerations,
        previous: previousFailedGenerations,
        changePct: calculateChange(failedGenerations, previousFailedGenerations),
      },
      grossRevenueCents: {
        value: grossRevenueCents,
        previous: previousGrossRevenueCents,
        changePct: calculateChange(grossRevenueCents, previousGrossRevenueCents),
      },
      staleGenerations: numberValue(overviewRow.stale_generations),
    };

    // Ensure we have data in all arrays (even if the arrays are empty, they should exist)
    const responseData = {
      userActionStats: processedUserActionStats,
      apiStatsByVersion: processedApiStatsByVersion,
      apiCallStatsByType: processedApiCallStatsByType,
      userCallVolumeStats: processedUserCallVolumeStats,
      apiFailureStatsByVersion: processedApiFailureStatsByVersion,
      modelHealthStats: processedModelHealthStats,
      cardTypeConversionStats: processedCardTypeConversionStats,
      monetizationFunnelStats: processedMonetizationFunnelStats,
      monetizationSourceStats: processedMonetizationSourceStats,
      meta: {
        startDate: range.startDate,
        endDate: range.endDate,
        previousStartDate: range.previousStartDate,
        previousEndDate: range.previousEndDate,
        timezone: 'UTC',
        generatedAt: new Date().toISOString(),
        subscriptionLifecycleReliableFrom: SUBSCRIPTION_LIFECYCLE_RELIABLE_FROM,
        subscriptionLifecyclePartial: isSubscriptionLifecyclePartial(range.startDate),
      },
      overview,
      businessTrend: processedBusinessTrend,
      subscriptions: {
        current: {
          liveSubscribers: numberValue(subscriptionCurrentRow.live_subscribers),
          monthlySubscribers: numberValue(subscriptionCurrentRow.monthly_subscribers),
          yearlySubscribers: numberValue(subscriptionCurrentRow.yearly_subscribers),
          scheduledToCancel: numberValue(subscriptionCurrentRow.scheduled_to_cancel),
          unmappedPremiumEntitlements: numberValue(subscriptionCurrentRow.unmapped_premium_entitlements),
          mrrCents: subscriptionValue.mrrCents,
          arrCents: subscriptionValue.arrCents,
          grossRevenueCents,
          currency: processedSubscriptionPlanMix[0]?.currency || 'usd',
        },
        trend: processedSubscriptionTrend,
        statusMix: processedSubscriptionStatusMix,
        planMix: processedSubscriptionPlanMix,
        funnel: subscriptionFunnel,
      },
    };

    console.log("Returning response with structure:", Object.keys(responseData));

    const response = NextResponse.json(responseData);
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=900');
    return response;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    if (error instanceof StatsDateRangeError) {
      return NextResponse.json(
        { error: error.message, code: 'INVALID_DATE_RANGE' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
