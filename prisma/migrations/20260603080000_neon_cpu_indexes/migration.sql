-- Concurrent indexes for public gallery and user card reads.
-- Keep this migration free of explicit BEGIN/COMMIT; CREATE INDEX CONCURRENTLY
-- cannot run inside a transaction block.

DROP INDEX CONCURRENTLY IF EXISTS "EditedCard_public_group_recent_idx";
DROP INDEX CONCURRENTLY IF EXISTS "EditedCard_public_filter_group_recent_idx";
DROP INDEX CONCURRENTLY IF EXISTS "EditedCard_public_model_group_recent_idx";
DROP INDEX CONCURRENTLY IF EXISTS "EditedCard_public_type_group_recent_idx";
DROP INDEX CONCURRENTLY IF EXISTS "EditedCard_public_relationship_group_recent_idx";
DROP INDEX CONCURRENTLY IF EXISTS "EditedCard_id_lookup_idx";
DROP INDEX CONCURRENTLY IF EXISTS "EditedCard_customUrl_idx";

CREATE INDEX CONCURRENTLY IF NOT EXISTS "EditedCard_public_group_recent_idx"
  ON "EditedCard"("originalCardId", "createdAt" DESC, id DESC)
  INCLUDE ("cardType", relationship, model)
  WHERE "isPublic" = true
    AND deleted = false
    AND "r2Url" IS NOT NULL
    AND "r2Url" <> '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS "EditedCard_public_filter_group_recent_idx"
  ON "EditedCard"("cardType", relationship, "originalCardId", "createdAt" DESC, id DESC)
  INCLUDE (model)
  WHERE "isPublic" = true
    AND deleted = false
    AND "r2Url" IS NOT NULL
    AND "r2Url" <> '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS "EditedCard_public_type_group_recent_idx"
  ON "EditedCard"("cardType", "originalCardId", "createdAt" DESC, id DESC)
  INCLUDE (relationship, model)
  WHERE "isPublic" = true
    AND deleted = false
    AND "r2Url" IS NOT NULL
    AND "r2Url" <> '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS "EditedCard_public_relationship_group_recent_idx"
  ON "EditedCard"(relationship, "originalCardId", "createdAt" DESC, id DESC)
  INCLUDE ("cardType", model)
  WHERE "isPublic" = true
    AND deleted = false
    AND "r2Url" IS NOT NULL
    AND "r2Url" <> '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS "EditedCard_public_model_group_recent_idx"
  ON "EditedCard"(model, "cardType", relationship, "originalCardId", "createdAt" DESC, id DESC)
  WHERE "isPublic" = true
    AND deleted = false
    AND "r2Url" IS NOT NULL
    AND "r2Url" <> '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS "UserAction_recent_timestamp_card_action_idx"
  ON "UserAction"("timestamp" DESC, "cardId", action);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "UserAction_user_action_card_idx"
  ON "UserAction"("userId", action, "cardId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "ApiLog_user_timestamp_idx"
  ON "ApiLog"("userId", "timestamp" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "ApiLog_timestamp_idx"
  ON "ApiLog"("timestamp");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "EditedCard_user_created_idx"
  ON "EditedCard"("userId", "createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "EditedCard_id_lookup_idx"
  ON "EditedCard"(id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "EditedCard_customUrl_idx"
  ON "EditedCard"("customUrl")
  WHERE "customUrl" IS NOT NULL
    AND length("customUrl") <= 512;
