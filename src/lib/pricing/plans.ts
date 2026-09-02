/**
 * The single source of truth for what MewTruCard sells.
 *
 * Every price, label, and Stripe identifier lives here. Components read from
 * this catalog rather than hardcoding numbers, so changing a price is one edit.
 */

export type PlanTier = 'free' | 'plus' | 'creator_pro';

export type SubscriptionSkuKey =
  | 'plus_monthly'
  | 'plus_yearly'
  | 'creator_pro_monthly'
  | 'creator_pro_yearly';

export type PackSkuKey = 'pack_20' | 'pack_50';

export type SkuKey = SubscriptionSkuKey | PackSkuKey;

export interface Sku {
  key: SkuKey;
  kind: 'subscription' | 'pack';
  /** The tier a completed purchase grants. Packs add credits without changing tier. */
  grantsTier: PlanTier | null;
  label: string;
  amountCents: number;
  interval: 'month' | 'year' | null;
  /** Card credits granted by a pack purchase. */
  cards?: number;
  /** Environment variable holding this SKU's Stripe price id. */
  priceIdEnvVar: string;
  description: string;
}

export const SKUS: Record<SkuKey, Sku> = {
  plus_monthly: {
    key: 'plus_monthly',
    kind: 'subscription',
    grantsTier: 'plus',
    label: 'Plus monthly',
    amountCents: 699,
    interval: 'month',
    priceIdEnvVar: 'STRIPE_PLUS_MONTHLY_PRICE_ID',
    description: 'Unlimited cards in every format, including video.',
  },
  plus_yearly: {
    key: 'plus_yearly',
    kind: 'subscription',
    grantsTier: 'plus',
    label: 'Plus yearly',
    amountCents: 4900,
    interval: 'year',
    priceIdEnvVar: 'STRIPE_PLUS_YEARLY_PRICE_ID',
    description: 'Unlimited cards, billed once a year.',
  },
  creator_pro_monthly: {
    key: 'creator_pro_monthly',
    kind: 'subscription',
    grantsTier: 'creator_pro',
    label: 'Creator Pro monthly',
    amountCents: 1999,
    interval: 'month',
    priceIdEnvVar: 'STRIPE_CREATOR_PRO_MONTHLY_PRICE_ID',
    description: 'Everything in Plus, plus roster, batches, and brand preset.',
  },
  creator_pro_yearly: {
    key: 'creator_pro_yearly',
    kind: 'subscription',
    grantsTier: 'creator_pro',
    label: 'Creator Pro yearly',
    amountCents: 16900,
    interval: 'year',
    priceIdEnvVar: 'STRIPE_CREATOR_PRO_YEARLY_PRICE_ID',
    description: 'The full creator workflow, billed once a year.',
  },
  pack_20: {
    key: 'pack_20',
    kind: 'pack',
    grantsTier: null,
    label: '20 cards',
    amountCents: 299,
    interval: null,
    cards: 20,
    priceIdEnvVar: 'STRIPE_PACK_20_PRICE_ID',
    description: 'Twenty cards that never expire. No subscription.',
  },
  pack_50: {
    key: 'pack_50',
    kind: 'pack',
    grantsTier: null,
    label: '50 cards',
    amountCents: 499,
    interval: null,
    cards: 50,
    priceIdEnvVar: 'STRIPE_PACK_50_PRICE_ID',
    description: 'Fifty cards that never expire. Best value per card.',
  },
};

export const PACK_SKU_KEYS: PackSkuKey[] = ['pack_20', 'pack_50'];
export const SUBSCRIPTION_SKU_KEYS: SubscriptionSkuKey[] = [
  'plus_monthly',
  'plus_yearly',
  'creator_pro_monthly',
  'creator_pro_yearly',
];

/**
 * Prices sold before the Plus / Creator Pro split. Anyone still billing on one
 * keeps the full Creator Pro feature set at their original price — we never
 * downgrade an existing subscriber to make room for a new tier.
 */
export const LEGACY_PRICE_ID_ENV_VARS = [
  'STRIPE_MONTHLY_PRICE_ID',
  'STRIPE_YEARLY_PRICE_ID',
] as const;

export function formatPrice(amountCents: number): string {
  return amountCents % 100 === 0
    ? `$${amountCents / 100}`
    : `$${(amountCents / 100).toFixed(2)}`;
}

/** "$0.15 per card" — the number that makes a pack legible next to a subscription. */
export function formatPerCardPrice(sku: Sku): string | null {
  if (!sku.cards) return null;
  return `$${(sku.amountCents / sku.cards / 100).toFixed(2)} per card`;
}

export function formatBillingLabel(sku: Sku): string {
  if (sku.interval === 'month') return 'per month';
  if (sku.interval === 'year') return 'per year';
  return 'one time';
}

export function getMonthlyEquivalent(sku: Sku): string | null {
  if (sku.interval !== 'year') return null;
  return `${formatPrice(Math.round(sku.amountCents / 12))}/month`;
}

export function getYearlySavingsPercent(monthly: Sku, yearly: Sku): number {
  const monthlyCostForYear = monthly.amountCents * 12;
  return Math.floor(((monthlyCostForYear - yearly.amountCents) / monthlyCostForYear) * 100);
}

/**
 * Resolves a SKU's Stripe price id. Throws rather than returning a blank,
 * because a silently empty price id turns into an opaque Stripe error at
 * checkout — long after the misconfiguration happened.
 */
export function getStripePriceId(
  key: SkuKey,
  env: Record<string, string | undefined> = process.env
): string {
  const sku = SKUS[key];
  const priceId = env[sku.priceIdEnvVar];
  if (!priceId) {
    throw new Error(`Missing ${sku.priceIdEnvVar} for SKU "${key}"`);
  }
  return priceId;
}

/**
 * Maps a Stripe price id back to the tier it grants.
 *
 * The webhook depends on this: a price it cannot place is a payment that never
 * becomes an entitlement, so every id we sell — legacy ids included — must be
 * resolvable here.
 */
export function getTierForPriceId(
  priceId: string,
  env: Record<string, string | undefined> = process.env
): PlanTier | null {
  for (const key of SUBSCRIPTION_SKU_KEYS) {
    if (env[SKUS[key].priceIdEnvVar] === priceId) {
      return SKUS[key].grantsTier;
    }
  }
  for (const envVar of LEGACY_PRICE_ID_ENV_VARS) {
    if (env[envVar] === priceId) return 'creator_pro';
  }
  return null;
}

/**
 * Every subscription price id we have ever sold, current and legacy.
 *
 * Reporting must filter on this rather than on a hardcoded pair, or revenue
 * from a newly added tier silently fails to appear in the dashboards.
 */
export function getAllSubscriptionPriceIds(
  env: Record<string, string | undefined> = process.env
): string[] {
  const ids = [
    ...SUBSCRIPTION_SKU_KEYS.map((key) => env[SKUS[key].priceIdEnvVar]),
    ...LEGACY_PRICE_ID_ENV_VARS.map((envVar) => env[envVar]),
  ].filter((id): id is string => !!id);

  return Array.from(new Set(ids));
}

export function getPackForPriceId(
  priceId: string,
  env: Record<string, string | undefined> = process.env
): Sku | null {
  for (const key of PACK_SKU_KEYS) {
    if (env[SKUS[key].priceIdEnvVar] === priceId) return SKUS[key];
  }
  return null;
}

export function getSkuForKey(value: string): Sku | null {
  return value in SKUS ? SKUS[value as SkuKey] : null;
}

export function isPackSkuKey(value: unknown): value is PackSkuKey {
  return typeof value === 'string' && PACK_SKU_KEYS.includes(value as PackSkuKey);
}

export function isSubscriptionSkuKey(value: unknown): value is SubscriptionSkuKey {
  return typeof value === 'string' && SUBSCRIPTION_SKU_KEYS.includes(value as SubscriptionSkuKey);
}

export function isSkuKey(value: unknown): value is SkuKey {
  return isPackSkuKey(value) || isSubscriptionSkuKey(value);
}
