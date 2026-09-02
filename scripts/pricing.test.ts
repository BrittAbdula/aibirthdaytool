import assert from 'node:assert/strict';
import {
  SKUS,
  formatPerCardPrice,
  formatPrice,
  getMonthlyEquivalent,
  getPackForPriceId,
  getAllSubscriptionPriceIds,
  getStripePriceId,
  getTierForPriceId,
  getYearlySavingsPercent,
  isPackSkuKey,
  isSkuKey,
} from '../src/lib/pricing/plans';
import {
  buildCheckoutRedirectUrls,
  normalizeCheckoutReturnPath,
} from '../src/lib/pricing/checkout';
import { resolvePaywallOffer } from '../src/lib/pricing/paywall';

// --- catalog ---
assert.equal(formatPrice(SKUS.pack_20.amountCents), '$2.99');
assert.equal(formatPrice(SKUS.pack_50.amountCents), '$4.99');
assert.equal(formatPrice(SKUS.plus_monthly.amountCents), '$6.99');
assert.equal(formatPrice(SKUS.plus_yearly.amountCents), '$49');
assert.equal(formatPrice(SKUS.creator_pro_monthly.amountCents), '$19.99');
assert.equal(formatPrice(SKUS.creator_pro_yearly.amountCents), '$169');

assert.equal(formatPerCardPrice(SKUS.pack_20), '$0.15 per card');
assert.equal(formatPerCardPrice(SKUS.pack_50), '$0.10 per card');
assert.equal(formatPerCardPrice(SKUS.plus_monthly), null);

// The bigger pack must be the better deal, or the ladder makes no sense.
const smallUnit = SKUS.pack_20.amountCents / (SKUS.pack_20.cards ?? 1);
const largeUnit = SKUS.pack_50.amountCents / (SKUS.pack_50.cards ?? 1);
assert.ok(largeUnit < smallUnit, 'pack_50 must cost less per card than pack_20');

assert.equal(getMonthlyEquivalent(SKUS.plus_yearly), '$4.08/month');
assert.equal(getYearlySavingsPercent(SKUS.plus_monthly, SKUS.plus_yearly), 41);
assert.equal(getYearlySavingsPercent(SKUS.creator_pro_monthly, SKUS.creator_pro_yearly), 29);

assert.equal(isSkuKey('pack_20'), true);
assert.equal(isSkuKey('monthly'), false);
assert.equal(isPackSkuKey('plus_monthly'), false);

// --- price id resolution ---
const env = {
  STRIPE_PLUS_MONTHLY_PRICE_ID: 'price_plus_m',
  STRIPE_PLUS_YEARLY_PRICE_ID: 'price_plus_y',
  STRIPE_CREATOR_PRO_MONTHLY_PRICE_ID: 'price_cp_m',
  STRIPE_CREATOR_PRO_YEARLY_PRICE_ID: 'price_cp_y',
  STRIPE_PACK_20_PRICE_ID: 'price_pack_20',
  STRIPE_PACK_50_PRICE_ID: 'price_pack_50',
  STRIPE_MONTHLY_PRICE_ID: 'price_legacy_m',
  STRIPE_YEARLY_PRICE_ID: 'price_legacy_y',
};

assert.equal(getStripePriceId('pack_20', env), 'price_pack_20');
assert.throws(() => getStripePriceId('pack_20', {}), /STRIPE_PACK_20_PRICE_ID/);

assert.equal(getTierForPriceId('price_plus_m', env), 'plus');
assert.equal(getTierForPriceId('price_cp_y', env), 'creator_pro');
assert.equal(getTierForPriceId('price_unknown', env), null);

// Anyone still billing on a pre-split price keeps the full Creator Pro feature
// set: a paying subscriber must never silently lose what they had.
assert.equal(getTierForPriceId('price_legacy_m', env), 'creator_pro');
assert.equal(getTierForPriceId('price_legacy_y', env), 'creator_pro');

assert.equal(getPackForPriceId('price_pack_50', env)?.key, 'pack_50');
assert.equal(getPackForPriceId('price_plus_m', env), null);

// A price id must never resolve to both a subscription tier and a pack.
for (const priceId of Object.values(env)) {
  const bothWays = getTierForPriceId(priceId, env) !== null && getPackForPriceId(priceId, env) !== null;
  assert.equal(bothWays, false, `${priceId} resolves ambiguously`);
}

// Reporting filters on this list; missing an id here hides real revenue.
{
  const ids = getAllSubscriptionPriceIds(env);
  assert.deepEqual(new Set(ids), new Set([
    'price_plus_m', 'price_plus_y', 'price_cp_m', 'price_cp_y',
    'price_legacy_m', 'price_legacy_y',
  ]));
  assert.equal(ids.length, new Set(ids).size, 'no duplicates');
  // Packs are one-time purchases, not subscriptions: including them would
  // inflate MRR with revenue that never recurs.
  assert.equal(ids.includes('price_pack_20'), false);
  assert.deepEqual(getAllSubscriptionPriceIds({}), []);
}

// --- offer routing ---
// Single-occasion moments must lead with a pack, not a subscription: most
// people who hit these walls are making one card for one person.
for (const intent of ['daily_limit', 'video', 'privacy', 'download', 'premium_style'] as const) {
  const offer = resolvePaywallOffer(intent);
  assert.equal(offer.audience, 'single', `${intent} should be a single-occasion offer`);
  assert.equal(SKUS[offer.primary].kind, 'pack', `${intent} should lead with a pack`);
}

// Recurring moments lead with the workflow subscription.
for (const intent of ['roster_limit', 'batch_size', 'batch_export', 'preview_used', 'csv_limit'] as const) {
  const offer = resolvePaywallOffer(intent);
  assert.equal(offer.audience, 'recurring', `${intent} should be a recurring offer`);
  assert.equal(offer.primary, 'creator_pro_monthly', `${intent} should lead with Creator Pro`);
}

// Every offer's SKUs must exist, and the primary must not repeat in secondary.
for (const intent of ['daily_limit', 'video', 'default', 'roster_limit'] as const) {
  const offer = resolvePaywallOffer(intent);
  assert.ok(SKUS[offer.primary], `${intent} primary missing`);
  for (const key of offer.secondary) {
    assert.ok(SKUS[key], `${intent} secondary ${key} missing`);
    assert.notEqual(key, offer.primary, `${intent} repeats its primary SKU`);
  }
}

// --- checkout redirects ---
// Only the pathname survives: recipient names and messages live in the query
// string and must not travel to Stripe or into browser history.
assert.equal(normalizeCheckoutReturnPath('/pricing?billing=yearly#plans'), '/pricing');
assert.equal(normalizeCheckoutReturnPath('https://evil.example/pricing'), '/');
assert.equal(normalizeCheckoutReturnPath('//evil.example/pricing'), '/');
assert.equal(normalizeCheckoutReturnPath(null), '/');

const redirects = buildCheckoutRedirectUrls('https://mewtrucard.com/', '/birthday?recipientName=Ana#card');
assert.equal(redirects.successUrl, 'https://mewtrucard.com/birthday?status=success&session_id={CHECKOUT_SESSION_ID}');
assert.equal(redirects.cancelUrl, 'https://mewtrucard.com/birthday?status=cancelled');
assert.equal(redirects.successUrl.includes('Ana'), false);

console.log('pricing rules ok');
