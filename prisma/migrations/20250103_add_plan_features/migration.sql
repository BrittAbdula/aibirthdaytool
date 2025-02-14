-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PREMIUM');
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateTable
CREATE TABLE "PlanFeature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanLimit" (
    "id" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL,
    "featureId" TEXT NOT NULL,
    "limitValue" INTEGER NOT NULL,
    "limitType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusCredit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BonusCredit_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Subscription" 
ADD COLUMN "billingPeriod" "BillingPeriod",
ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "trialEndsAt" TIMESTAMP(3),
ADD COLUMN "lastBilledAt" TIMESTAMP(3),
ADD COLUMN "nextBillingAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "PlanFeature_featureKey_key" ON "PlanFeature"("featureKey");
CREATE UNIQUE INDEX "PlanLimit_planType_featureId_key" ON "PlanLimit"("planType", "featureId");
CREATE INDEX "BonusCredit_userId_idx" ON "BonusCredit"("userId");

-- AddForeignKey
ALTER TABLE "PlanLimit" ADD CONSTRAINT "PlanLimit_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "PlanFeature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BonusCredit" ADD CONSTRAINT "BonusCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Initialize default features
INSERT INTO "PlanFeature" ("id", "name", "description", "featureKey", "createdAt", "updatedAt") VALUES
('feat_daily_gen', '每日生成次数', '每天可以生成的卡片数量', 'daily_generations', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('feat_monthly_gen', '每月生成次数', '每月可以生成的卡片总数', 'monthly_generations', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('feat_batch_gen', '批量生成', '一次可以生成多张不同风格的卡片', 'batch_generation', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('feat_priority', '优先生成队列', '优先处理您的生成请求', 'priority_queue', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('feat_advanced_edit', '高级编辑功能', '使用高级编辑工具优化您的卡片', 'advanced_editing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('feat_api_access', 'API访问', '通过API集成到您的应用中', 'api_access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('feat_privacy', '隐私模式', '生成的卡片仅自己可见', 'privacy_mode', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('feat_ad_free', '无广告体验', '完全无广告的使用体验', 'ad_free', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Initialize plan limits for FREE plan
INSERT INTO "PlanLimit" ("id", "planType", "featureId", "limitValue", "limitType", "createdAt", "updatedAt") VALUES
('limit_free_daily', 'FREE', 'feat_daily_gen', 3, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_free_monthly', 'FREE', 'feat_monthly_gen', 90, 'monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_free_batch', 'FREE', 'feat_batch_gen', 0, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_free_priority', 'FREE', 'feat_priority', 0, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_free_advanced', 'FREE', 'feat_advanced_edit', 0, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_free_api', 'FREE', 'feat_api_access', 0, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_free_privacy', 'FREE', 'feat_privacy', 0, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_free_ad', 'FREE', 'feat_ad_free', 0, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Initialize plan limits for BASIC plan
INSERT INTO "PlanLimit" ("id", "planType", "featureId", "limitValue", "limitType", "createdAt", "updatedAt") VALUES
('limit_basic_daily', 'BASIC', 'feat_daily_gen', 1000, 'monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_basic_monthly', 'BASIC', 'feat_monthly_gen', 1000, 'monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_basic_batch', 'BASIC', 'feat_batch_gen', 1, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_basic_priority', 'BASIC', 'feat_priority', 1, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_basic_advanced', 'BASIC', 'feat_advanced_edit', 1, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_basic_api', 'BASIC', 'feat_api_access', 0, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_basic_privacy', 'BASIC', 'feat_privacy', 1, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_basic_ad', 'BASIC', 'feat_ad_free', 1, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Initialize plan limits for PREMIUM plan
INSERT INTO "PlanLimit" ("id", "planType", "featureId", "limitValue", "limitType", "createdAt", "updatedAt") VALUES
('limit_premium_daily', 'PREMIUM', 'feat_daily_gen', 3000, 'monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_premium_monthly', 'PREMIUM', 'feat_monthly_gen', 3000, 'monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_premium_batch', 'PREMIUM', 'feat_batch_gen', 1, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_premium_priority', 'PREMIUM', 'feat_priority', 1, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_premium_advanced', 'PREMIUM', 'feat_advanced_edit', 1, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_premium_api', 'PREMIUM', 'feat_api_access', 1, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_premium_privacy', 'PREMIUM', 'feat_privacy', 1, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('limit_premium_ad', 'PREMIUM', 'feat_ad_free', 1, 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 