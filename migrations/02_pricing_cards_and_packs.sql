-- P0 pricing refactor: count cards instead of credits, and support card packs.
-- Additive only. Every column has a default, so existing rows stay valid and
-- the pre-deploy database keeps working with the currently deployed code.

ALTER TABLE "ApiUsage" ADD COLUMN IF NOT EXISTS "cards"   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ApiUsage" ADD COLUMN IF NOT EXISTS "adCards" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "packCredits" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "Purchase" (
  "id"                    TEXT PRIMARY KEY,
  "userId"                TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "sku"                   TEXT NOT NULL,
  "stripePriceId"         TEXT,
  "stripeSessionId"       TEXT NOT NULL UNIQUE,
  "stripePaymentIntentId" TEXT,
  "amountCents"           INTEGER NOT NULL,
  "currency"              TEXT NOT NULL DEFAULT 'usd',
  "cardsGranted"          INTEGER NOT NULL DEFAULT 0,
  "status"                TEXT NOT NULL DEFAULT 'completed',
  "stripeLivemode"        BOOLEAN,
  "metadata"              JSONB,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Purchase_userId_createdAt_idx" ON "Purchase"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Purchase_sku_createdAt_idx"    ON "Purchase"("sku", "createdAt");
