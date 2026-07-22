ALTER TABLE "Subscription"
  ADD COLUMN "stripeSubscriptionId" TEXT,
  ADD COLUMN "stripeCustomerId" TEXT,
  ADD COLUMN "stripePriceId" TEXT,
  ADD COLUMN "stripeUnitAmount" INTEGER,
  ADD COLUMN "stripeCurrency" TEXT,
  ADD COLUMN "stripeLivemode" BOOLEAN;

ALTER TABLE "StripeLog"
  ADD COLUMN "stripeSubscriptionId" TEXT,
  ADD COLUMN "stripePriceId" TEXT,
  ADD COLUMN "stripeLivemode" BOOLEAN;

CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key"
  ON "Subscription"("stripeSubscriptionId");

CREATE INDEX "Subscription_stripeLivemode_stripePriceId_status_idx"
  ON "Subscription"("stripeLivemode", "stripePriceId", "status");

CREATE INDEX "Subscription_stripeCustomerId_idx"
  ON "Subscription"("stripeCustomerId");

CREATE INDEX "StripeLog_stripePriceId_eventType_createdAt_idx"
  ON "StripeLog"("stripePriceId", "eventType", "createdAt");

CREATE INDEX "StripeLog_stripeSubscriptionId_createdAt_idx"
  ON "StripeLog"("stripeSubscriptionId", "createdAt");
