-- Drop foreign keys first
ALTER TABLE "PlanLimit" DROP CONSTRAINT "PlanLimit_featureId_fkey";
ALTER TABLE "BonusCredit" DROP CONSTRAINT "BonusCredit_userId_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "PlanFeature_featureKey_key";
DROP INDEX IF EXISTS "PlanLimit_planType_featureId_key";
DROP INDEX IF EXISTS "BonusCredit_userId_idx";

-- Drop tables
DROP TABLE IF EXISTS "PlanLimit";
DROP TABLE IF EXISTS "PlanFeature";
DROP TABLE IF EXISTS "BonusCredit";

-- Remove columns from Subscription
ALTER TABLE "Subscription" 
DROP COLUMN IF EXISTS "billingPeriod",
DROP COLUMN IF EXISTS "cancelAtPeriodEnd",
DROP COLUMN IF EXISTS "trialEndsAt",
DROP COLUMN IF EXISTS "lastBilledAt",
DROP COLUMN IF EXISTS "nextBillingAt";

-- Drop enums
DROP TYPE IF EXISTS "BillingPeriod"; 