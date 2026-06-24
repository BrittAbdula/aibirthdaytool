CREATE TABLE IF NOT EXISTS "MonetizationEvent" (
  "id" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "userId" TEXT,
  "plan" TEXT,
  "source" TEXT,
  "path" TEXT,
  "stripeSessionId" TEXT,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MonetizationEvent_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'MonetizationEvent_userId_fkey'
  ) THEN
    ALTER TABLE "MonetizationEvent"
      ADD CONSTRAINT "MonetizationEvent_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "MonetizationEvent_eventType_createdAt_idx"
  ON "MonetizationEvent"("eventType", "createdAt");

CREATE INDEX IF NOT EXISTS "MonetizationEvent_userId_createdAt_idx"
  ON "MonetizationEvent"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "MonetizationEvent_source_createdAt_idx"
  ON "MonetizationEvent"("source", "createdAt");

CREATE INDEX IF NOT EXISTS "MonetizationEvent_stripeSessionId_idx"
  ON "MonetizationEvent"("stripeSessionId");
