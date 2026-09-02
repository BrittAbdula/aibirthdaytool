/**
 * How many cards a user may make, expressed in cards.
 *
 * The previous model billed opaque "credits" whose costs (6 per image) exceeded
 * the daily free allowance (5), so a free user past their first day could never
 * generate a static image at all. Counting cards keeps the promise on the screen
 * and the rule in the code identical.
 */

import type { PlanTier } from './plans';

export const FREE_DAILY_CARDS = 3;
/** A slightly larger first day: the cost of activation is paid once. */
export const FREE_FIRST_DAY_CARDS = 5;

export const AD_REWARD_CARDS_PER_VIEW = 1;
export const AD_REWARD_DAILY_CAP = 5;

/** Video generation costs an order of magnitude more per call than an image. */
export const VIDEO_CARD_COST = 5;
export const STANDARD_CARD_COST = 1;

export type CardFormat = 'image' | 'svg' | 'video';

export interface QuotaInput {
  tier: PlanTier;
  isFirstDay: boolean;
  /** Cards consumed today against the daily + ad-earned allowance. */
  cardsUsedToday: number;
  /** Cards earned from watching ads today. */
  adCardsEarnedToday: number;
  /** Purchased pack balance. Never expires, never resets. */
  packCredits: number;
}

export interface Quota {
  unlimited: boolean;
  /** Free cards available today before ad rewards. */
  baseDailyCards: number;
  /** Base + ad-earned, i.e. everything that resets at midnight. */
  dailyAllowance: number;
  dailyUsed: number;
  dailyRemaining: number;
  packRemaining: number;
  /** What the user can actually spend right now. */
  totalRemaining: number;
  adCardsEarnedToday: number;
  adCardsAvailableToEarn: number;
}

export function getCardCost(format: CardFormat): number {
  return format === 'video' ? VIDEO_CARD_COST : STANDARD_CARD_COST;
}

export function isUnlimitedTier(tier: PlanTier): boolean {
  return tier === 'plus' || tier === 'creator_pro';
}

export function getBaseDailyCards(tier: PlanTier, isFirstDay: boolean): number {
  if (isUnlimitedTier(tier)) return Infinity;
  return isFirstDay ? FREE_FIRST_DAY_CARDS : FREE_DAILY_CARDS;
}

export function getQuota({
  tier,
  isFirstDay,
  cardsUsedToday,
  adCardsEarnedToday,
  packCredits,
}: QuotaInput): Quota {
  const unlimited = isUnlimitedTier(tier);
  const baseDailyCards = getBaseDailyCards(tier, isFirstDay);
  const earned = clampNonNegative(adCardsEarnedToday);
  const dailyAllowance = unlimited ? Infinity : baseDailyCards + earned;
  const dailyUsed = clampNonNegative(cardsUsedToday);
  const dailyRemaining = unlimited ? Infinity : Math.max(0, dailyAllowance - dailyUsed);
  const packRemaining = unlimited ? 0 : clampNonNegative(packCredits);

  return {
    unlimited,
    baseDailyCards,
    dailyAllowance,
    dailyUsed,
    dailyRemaining,
    packRemaining,
    totalRemaining: unlimited ? Infinity : dailyRemaining + packRemaining,
    adCardsEarnedToday: earned,
    adCardsAvailableToEarn: unlimited ? 0 : Math.max(0, AD_REWARD_DAILY_CAP - earned),
  };
}

export function canAfford(quota: Quota, cost: number): boolean {
  return planConsumption(quota, cost) !== null;
}

export interface ConsumptionPlan {
  fromDaily: number;
  fromPack: number;
}

/**
 * Decides where a generation is paid from.
 *
 * The whole cost comes from one place. Splitting it across the daily allowance
 * and the purchased balance would mean writing to two tables for one spend, and
 * the production database runs on a driver with no interactive transactions —
 * a half-applied split would silently overcharge. One table per spend keeps
 * each deduction a single guarded statement, which is atomic on its own.
 *
 * The perishable allowance goes first, since it is gone at midnight either way.
 */
export function planConsumption(quota: Quota, cost: number): ConsumptionPlan | null {
  if (quota.unlimited) return { fromDaily: 0, fromPack: 0 };
  if (quota.dailyRemaining >= cost) return { fromDaily: cost, fromPack: 0 };
  if (quota.packRemaining >= cost) return { fromDaily: 0, fromPack: cost };
  return null;
}

export function canEarnAdReward(quota: Quota): boolean {
  return !quota.unlimited && quota.adCardsAvailableToEarn > 0;
}

/** "2 of 3 cards left today" — the string the meter shows. */
export function describeQuota(quota: Quota): string {
  if (quota.unlimited) return 'Unlimited cards';
  if (quota.packRemaining > 0) {
    const total = quota.dailyRemaining + quota.packRemaining;
    return `${total} ${total === 1 ? 'card' : 'cards'} left`;
  }
  return `${quota.dailyRemaining} of ${quota.dailyAllowance} cards left today`;
}

function clampNonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}
