import assert from 'node:assert/strict';
import {
  AD_REWARD_DAILY_CAP,
  FREE_DAILY_CARDS,
  FREE_FIRST_DAY_CARDS,
  VIDEO_CARD_COST,
  canAfford,
  canEarnAdReward,
  describeQuota,
  getCardCost,
  getQuota,
  planConsumption,
} from '../src/lib/pricing/quota';
import { buildEntitlements } from '../src/lib/pricing/entitlements';

const freeToday = (overrides: Partial<Parameters<typeof getQuota>[0]> = {}) =>
  getQuota({
    tier: 'free',
    isFirstDay: false,
    cardsUsedToday: 0,
    adCardsEarnedToday: 0,
    packCredits: 0,
    ...overrides,
  });

// --- the regression this whole model exists to fix ---
// The old system gave free users 5 credits a day while a static image cost 6,
// so from day two onward a free user could never make one at all.
{
  const quota = freeToday();
  const imageCost = getCardCost('image');
  assert.ok(canAfford(quota, imageCost), 'a returning free user must be able to make a static image');
  assert.ok(canAfford(quota, getCardCost('svg')), 'a returning free user must be able to make an animated card');
  assert.equal(quota.dailyAllowance, FREE_DAILY_CARDS);
}

// --- costs ---
assert.equal(getCardCost('image'), 1);
assert.equal(getCardCost('svg'), 1);
assert.equal(getCardCost('video'), VIDEO_CARD_COST);
assert.ok(VIDEO_CARD_COST > getCardCost('image'), 'video costs us far more to produce');

// --- daily allowance ---
assert.equal(freeToday({ isFirstDay: true }).dailyAllowance, FREE_FIRST_DAY_CARDS);
assert.equal(freeToday({ cardsUsedToday: 2 }).dailyRemaining, FREE_DAILY_CARDS - 2);
assert.equal(freeToday({ cardsUsedToday: 99 }).dailyRemaining, 0);

// Allowance no longer varies by country: nothing in getQuota takes one.
{
  const a = freeToday();
  const b = freeToday();
  assert.deepEqual(a, b);
}

// --- unlimited tiers ---
for (const tier of ['plus', 'creator_pro'] as const) {
  const quota = getQuota({ tier, isFirstDay: false, cardsUsedToday: 500, adCardsEarnedToday: 0, packCredits: 0 });
  assert.equal(quota.unlimited, true);
  assert.ok(canAfford(quota, VIDEO_CARD_COST));
  assert.equal(canEarnAdReward(quota), false, 'unlimited users have nothing to earn');
  assert.equal(describeQuota(quota), 'Unlimited cards');
}

// --- ad rewards ---
{
  const quota = freeToday({ adCardsEarnedToday: 2 });
  assert.equal(quota.dailyAllowance, FREE_DAILY_CARDS + 2);
  assert.equal(quota.adCardsAvailableToEarn, AD_REWARD_DAILY_CAP - 2);
  assert.equal(canEarnAdReward(quota), true);

  const capped = freeToday({ adCardsEarnedToday: AD_REWARD_DAILY_CAP });
  assert.equal(capped.adCardsAvailableToEarn, 0);
  assert.equal(canEarnAdReward(capped), false);
}

// --- spending comes from exactly one place ---
{
  const quota = freeToday({ cardsUsedToday: 1, packCredits: 10 });
  assert.equal(quota.dailyRemaining, FREE_DAILY_CARDS - 1);
  assert.equal(quota.totalRemaining, FREE_DAILY_CARDS - 1 + 10);

  const plan = planConsumption(quota, 1);
  assert.deepEqual(plan, { fromDaily: 1, fromPack: 0 }, 'daily cards expire tonight, so spend them first');

  // A cost the daily allowance cannot cover comes wholly from the pack rather
  // than straddling both. Splitting would mean two table writes for one spend,
  // and the production driver has no interactive transactions to make that
  // safe — a half-applied split would overcharge.
  const videoPlan = planConsumption(quota, VIDEO_CARD_COST);
  assert.deepEqual(videoPlan, { fromDaily: 0, fromPack: VIDEO_CARD_COST });

  // Every plan draws from one source only.
  for (const cost of [1, 2, 3, 4, VIDEO_CARD_COST]) {
    const p = planConsumption(quota, cost);
    if (!p) continue;
    assert.ok(p.fromDaily === 0 || p.fromPack === 0, `cost ${cost} split across two sources`);
    assert.equal(p.fromDaily + p.fromPack, cost, `cost ${cost} charged the wrong total`);
  }
}

// Neither balance alone covering the cost means it is refused, even though the
// two together would. The 429 copy has to explain this for videos.
{
  // 3 daily + 3 pack = 6 in total, but a 5-card video fits in neither side.
  const quota = freeToday({ packCredits: 3 });
  assert.equal(quota.totalRemaining, FREE_DAILY_CARDS + 3);
  assert.ok(quota.totalRemaining > VIDEO_CARD_COST);
  assert.ok(quota.dailyRemaining < VIDEO_CARD_COST && quota.packRemaining < VIDEO_CARD_COST);
  assert.equal(planConsumption(quota, VIDEO_CARD_COST), null);
  assert.equal(canAfford(quota, VIDEO_CARD_COST), false);
  // A single card is still affordable from the daily side.
  assert.equal(canAfford(quota, 1), true);
}

// Spending more than the balance is refused rather than driving it negative.
{
  const quota = freeToday({ cardsUsedToday: FREE_DAILY_CARDS });
  assert.equal(planConsumption(quota, 1), null);
  assert.equal(canAfford(quota, 1), false);
}

// A pack alone can cover a video once the daily allowance is gone.
{
  const quota = freeToday({ cardsUsedToday: FREE_DAILY_CARDS, packCredits: VIDEO_CARD_COST });
  assert.deepEqual(planConsumption(quota, VIDEO_CARD_COST), { fromDaily: 0, fromPack: VIDEO_CARD_COST });
}

// Unlimited users are never charged.
{
  const quota = getQuota({ tier: 'plus', isFirstDay: false, cardsUsedToday: 0, adCardsEarnedToday: 0, packCredits: 0 });
  assert.deepEqual(planConsumption(quota, VIDEO_CARD_COST), { fromDaily: 0, fromPack: 0 });
}

// --- entitlements ---
{
  const free = buildEntitlements('free', freeToday());
  assert.equal(free.hasPaidAccess, false);
  assert.equal(free.canUseVideo, false);
  assert.equal(free.cleanDownload, false);
  assert.equal(free.canExportBatch, false);
  assert.equal(free.rosterLimit, 3);
  assert.equal(free.batchLimit, 1);

  // A pack buys the same per-card capabilities a subscription does.
  const withPack = buildEntitlements('free', freeToday({ packCredits: 20 }));
  assert.equal(withPack.hasPaidAccess, true);
  assert.equal(withPack.canUseVideo, true);
  assert.equal(withPack.canKeepPrivate, true);
  assert.equal(withPack.cleanDownload, true);
  assert.equal(withPack.adFree, true);
  // ...but not the workflow features, which are what Creator Pro is for.
  assert.equal(withPack.canExportBatch, false);
  assert.equal(withPack.rosterLimit, 3);

  const plus = buildEntitlements('plus', getQuota({
    tier: 'plus', isFirstDay: false, cardsUsedToday: 0, adCardsEarnedToday: 0, packCredits: 0,
  }));
  assert.equal(plus.canUseVideo, true);
  assert.equal(plus.canExportBatch, false, 'Plus is the personal tier, not the workflow tier');
  assert.equal(plus.batchLimit, 1);

  const creatorPro = buildEntitlements('creator_pro', getQuota({
    tier: 'creator_pro', isFirstDay: false, cardsUsedToday: 0, adCardsEarnedToday: 0, packCredits: 0,
  }));
  assert.equal(creatorPro.canExportBatch, true);
  assert.equal(creatorPro.rosterLimit, Infinity);
  assert.equal(creatorPro.batchLimit, 50);
}

// --- meter copy ---
assert.equal(describeQuota(freeToday()), `${FREE_DAILY_CARDS} of ${FREE_DAILY_CARDS} cards left today`);
assert.equal(describeQuota(freeToday({ cardsUsedToday: FREE_DAILY_CARDS })), `0 of ${FREE_DAILY_CARDS} cards left today`);
assert.equal(describeQuota(freeToday({ packCredits: 12 })), `${FREE_DAILY_CARDS + 12} cards left`);
// One card is a card, not "1 cards".
assert.equal(describeQuota(freeToday({ cardsUsedToday: FREE_DAILY_CARDS, packCredits: 1 })), '1 card left');

console.log('quota and entitlement rules ok');
