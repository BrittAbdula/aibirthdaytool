-- Run during a low-traffic window on the production branch.
-- This starts a fresh pg_stat_statements measurement window and refreshes
-- planner statistics for the tables involved in the current CPU hotspots.

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
SELECT pg_stat_statements_reset();

ANALYZE "EditedCard";
ANALYZE "UserAction";
ANALYZE "ApiLog";
ANALYZE "ApiUsage";
ANALYZE "Account";
ANALYZE "StripeLog";

-- Baseline: highest total execution time after the reset window has collected traffic.
SELECT
  query,
  calls,
  rows AS total_rows,
  CASE WHEN calls > 0 THEN round((rows::numeric / calls), 2) ELSE 0 END AS avg_rows_per_call,
  round(total_exec_time::numeric, 2) AS total_exec_ms,
  round(mean_exec_time::numeric, 2) AS mean_exec_ms
FROM pg_stat_statements
WHERE calls > 0
ORDER BY total_exec_time DESC
LIMIT 20;
