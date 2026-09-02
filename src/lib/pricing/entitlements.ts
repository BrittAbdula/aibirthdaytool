/**
 * The server's answer to "what is this user allowed to do right now".
 *
 * Every gate — the generator, downloads, privacy, the creator workspace — reads
 * from here instead of testing `plan === 'PREMIUM'` on its own, so a change to
 * what a tier includes happens in one place.
 */

import { prisma } from '../prisma';
import { isSubscriptionStatusEntitled } from '../subscription-status';
import { getTierForPriceId, type PlanTier } from './plans';
import {
  AD_REWARD_CARDS_PER_VIEW,
  AD_REWARD_DAILY_CAP,
  canEarnAdReward,
  getQuota,
  planConsumption,
  type Quota,
} from './quota';

export const FREE_ROSTER_LIMIT = 3;
export const CREATOR_BATCH_LIMIT = 50;

export interface Entitlements {
  tier: PlanTier;
  quota: Quota;
  /** A pack balance buys the same per-card capabilities a subscription does. */
  hasPaidAccess: boolean;
  canUseVideo: boolean;
  canUsePremiumStyles: boolean;
  canKeepPrivate: boolean;
  cleanDownload: boolean;
  adFree: boolean;
  rosterLimit: number;
  batchLimit: number;
  canExportBatch: boolean;
}

/**
 * The start of the current UTC day.
 *
 * `setHours(0,0,0,0)` would use the runtime's local midnight, which lands on a
 * different calendar date once written to a `date` column on a UTC database —
 * so the day the allowance resets would depend on where the code happens to
 * run. Production runs in UTC and dev machines do not; pinning to UTC makes the
 * reset boundary the same everywhere.
 */
function startOfToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * The coarse `User.plan` flag says whether someone is paying; the subscription's
 * price id says for what. A paying user whose price we cannot place is treated
 * as Creator Pro — that is the pre-split plan, and guessing generously is the
 * only safe direction when someone's money has already been taken.
 */
export function resolveTier(subscription: {
  status: string | null;
  stripePriceId: string | null;
} | null): PlanTier {
  if (!subscription || !isSubscriptionStatusEntitled(subscription.status)) return 'free';
  return getTierForPriceId(subscription.stripePriceId ?? '') ?? 'creator_pro';
}

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const todayStart = startOfToday();

  const [user, usage] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        packCredits: true,
        subscription: { select: { status: true, stripePriceId: true } },
      },
    }),
    prisma.apiUsage.findUnique({
      where: { userId_date: { userId, date: todayStart } },
      select: { cards: true, adCards: true },
    }),
  ]);

  const tier = resolveTier(user?.subscription ?? null);
  const quota = getQuota({
    tier,
    isFirstDay: !!user?.createdAt && user.createdAt >= todayStart,
    cardsUsedToday: usage?.cards ?? 0,
    adCardsEarnedToday: usage?.adCards ?? 0,
    packCredits: user?.packCredits ?? 0,
  });

  return buildEntitlements(tier, quota);
}

export function buildEntitlements(tier: PlanTier, quota: Quota): Entitlements {
  const subscribed = tier !== 'free';
  const hasPaidAccess = subscribed || quota.packRemaining > 0;

  return {
    tier,
    quota,
    hasPaidAccess,
    canUseVideo: hasPaidAccess,
    canUsePremiumStyles: hasPaidAccess,
    canKeepPrivate: hasPaidAccess,
    cleanDownload: hasPaidAccess,
    adFree: hasPaidAccess,
    rosterLimit: tier === 'creator_pro' ? Infinity : FREE_ROSTER_LIMIT,
    batchLimit: tier === 'creator_pro' ? CREATOR_BATCH_LIMIT : 1,
    canExportBatch: tier === 'creator_pro',
  };
}

export type ConsumeResult =
  | { ok: true; consumedFromDaily: number; consumedFromPack: number }
  | { ok: false; reason: 'insufficient_cards' };

/**
 * Every write below goes through `$executeRaw`.
 *
 * The production client talks to Neon over HTTP, which has no transactions, and
 * this Prisma version wraps `upsert`, `createMany` and friends in one — they all
 * fail at runtime. A single raw statement does not, and it returns the number of
 * rows it touched, which is exactly the signal a guarded balance check needs:
 * the WHERE clause carries the check, so a losing racer updates zero rows
 * instead of overdrawing.
 */
async function ensureUsageRow(userId: string, todayStart: Date): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO "ApiUsage" ("userId", "date", "cards", "adCards", "count")
    VALUES (${userId}, ${todayStart}::date, 0, 0, 0)
    ON CONFLICT ("userId", "date") DO NOTHING
  `;
}

export async function consumeCards(
  userId: string,
  cost: number,
  /**
   * The pre-refactor credit value of this generation. Gating no longer reads it,
   * but the admin usage chart plots `ApiUsage.count` with credit-scale
   * thresholds, so we keep the column filled to avoid a break in the series.
   */
  legacyCredits = 0
): Promise<ConsumeResult> {
  const todayStart = startOfToday();
  const { quota } = await getEntitlements(userId);

  if (quota.unlimited) {
    await ensureUsageRow(userId, todayStart);
    await prisma.$executeRaw`
      UPDATE "ApiUsage" SET "count" = "count" + ${legacyCredits}, "updatedAt" = now()
      WHERE "userId" = ${userId} AND "date" = ${todayStart}::date
    `;
    return { ok: true, consumedFromDaily: 0, consumedFromPack: 0 };
  }

  const plan = planConsumption(quota, cost);
  if (!plan) return { ok: false, reason: 'insufficient_cards' };

  await ensureUsageRow(userId, todayStart);

  if (plan.fromDaily > 0) {
    const affected = await prisma.$executeRaw`
      UPDATE "ApiUsage"
      SET "cards" = "cards" + ${plan.fromDaily},
          "count" = "count" + ${legacyCredits},
          "updatedAt" = now()
      WHERE "userId" = ${userId}
        AND "date" = ${todayStart}::date
        AND "cards" <= ${quota.dailyAllowance - cost}
    `;
    if (affected === 0) return { ok: false, reason: 'insufficient_cards' };
    return { ok: true, consumedFromDaily: plan.fromDaily, consumedFromPack: 0 };
  }

  const affected = await prisma.$executeRaw`
    UPDATE "User"
    SET "packCredits" = "packCredits" - ${plan.fromPack}, "updatedAt" = now()
    WHERE "id" = ${userId} AND "packCredits" >= ${plan.fromPack}
  `;
  if (affected === 0) return { ok: false, reason: 'insufficient_cards' };

  await prisma.$executeRaw`
    UPDATE "ApiUsage" SET "count" = "count" + ${legacyCredits}, "updatedAt" = now()
    WHERE "userId" = ${userId} AND "date" = ${todayStart}::date
  `;

  return { ok: true, consumedFromDaily: 0, consumedFromPack: plan.fromPack };
}

/** Gives the cards back when the generation they paid for never happened. */
export async function refundCards(
  userId: string,
  consumedFromDaily: number,
  consumedFromPack: number,
  legacyCredits = 0
): Promise<void> {
  const todayStart = startOfToday();

  if (consumedFromDaily > 0 || legacyCredits > 0) {
    await prisma.$executeRaw`
      UPDATE "ApiUsage"
      SET "cards" = GREATEST("cards" - ${consumedFromDaily}, 0),
          "count" = GREATEST("count" - ${legacyCredits}, 0),
          "updatedAt" = now()
      WHERE "userId" = ${userId} AND "date" = ${todayStart}::date
    `;
  }

  if (consumedFromPack > 0) {
    await prisma.$executeRaw`
      UPDATE "User"
      SET "packCredits" = "packCredits" + ${consumedFromPack}, "updatedAt" = now()
      WHERE "id" = ${userId}
    `;
  }
}

export type AdRewardResult =
  | { ok: true; cardsEarned: number; quota: Quota }
  | { ok: false; reason: 'cap_reached' | 'not_applicable' };

/**
 * Grants the reward for watching an ad, capped per day.
 *
 * This exists because the audience that actually reaches our paywall is
 * concentrated in markets where a subscription converts at zero but ad
 * inventory does not. The cap lives in the WHERE clause, so replaying the
 * request cannot push anyone past it.
 */
export async function grantAdReward(userId: string): Promise<AdRewardResult> {
  const todayStart = startOfToday();
  const { tier, quota } = await getEntitlements(userId);

  if (tier !== 'free') return { ok: false, reason: 'not_applicable' };
  if (!canEarnAdReward(quota)) return { ok: false, reason: 'cap_reached' };

  await ensureUsageRow(userId, todayStart);

  const affected = await prisma.$executeRaw`
    UPDATE "ApiUsage"
    SET "adCards" = "adCards" + ${AD_REWARD_CARDS_PER_VIEW}, "updatedAt" = now()
    WHERE "userId" = ${userId}
      AND "date" = ${todayStart}::date
      AND "adCards" <= ${AD_REWARD_DAILY_CAP - AD_REWARD_CARDS_PER_VIEW}
  `;

  if (affected === 0) return { ok: false, reason: 'cap_reached' };

  return {
    ok: true,
    cardsEarned: AD_REWARD_CARDS_PER_VIEW,
    quota: (await getEntitlements(userId)).quota,
  };
}
