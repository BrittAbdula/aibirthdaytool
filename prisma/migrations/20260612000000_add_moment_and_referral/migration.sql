-- Moment interactive layer on shared cards + referral attribution
ALTER TABLE "EditedCard" ADD COLUMN IF NOT EXISTS "momentConfig" JSONB;
ALTER TABLE "EditedCard" ADD COLUMN IF NOT EXISTS "momentResponse" JSONB;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredByCardId" TEXT;
