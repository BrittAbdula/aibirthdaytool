export type PremiumPlanKey = 'monthly' | 'yearly';

export interface PremiumPlan {
  key: PremiumPlanKey;
  label: string;
  price: string;
  amountCents: number;
  billingLabel: string;
  monthlyEquivalent?: string;
  badge?: string;
  description: string;
}

export interface PremiumFeatureRow {
  feature: string;
  free: string;
  premium: string;
}

export type PremiumModalContext = 'default' | 'limit' | 'video' | 'privacy';

export const premiumPlans: Record<PremiumPlanKey, PremiumPlan> = {
  monthly: {
    key: 'monthly',
    label: 'Monthly',
    price: '$6.99',
    amountCents: 699,
    billingLabel: 'per month',
    description: 'Best when you need a short burst of premium card making.',
  },
  yearly: {
    key: 'yearly',
    label: 'Yearly',
    price: '$52.99',
    amountCents: 5299,
    billingLabel: 'per year',
    monthlyEquivalent: '$4.42/month',
    badge: 'Best value',
    description: 'Lower monthly cost for birthdays, holidays, and repeat gifting.',
  },
};

export const premiumPlanOrder: PremiumPlanKey[] = ['yearly', 'monthly'];

export const premiumHighlights = [
  'Unlimited daily creations',
  'Premium image and video models',
  'Private cards, no watermarks, and no ads',
];

export const premiumFeatureRows: PremiumFeatureRow[] = [
  { feature: 'Daily card creations', free: 'Limited daily credits', premium: 'Unlimited' },
  { feature: 'Animated SVG cards', free: 'Included', premium: 'Included' },
  { feature: 'Premium image models', free: 'Limited by credits', premium: 'Included' },
  { feature: 'Video cards', free: 'Locked', premium: 'Included' },
  { feature: 'Private cards', free: 'Public gallery eligible', premium: 'Private by default' },
  { feature: 'Watermarks and ads', free: 'Included', premium: 'Removed' },
  { feature: 'Saved card links', free: 'Included', premium: 'Included' },
  { feature: 'Cancellation', free: 'No subscription', premium: 'Cancel anytime' },
];

export const premiumModalCopy: Record<
  PremiumModalContext,
  { eyebrow: string; title: string; description: string }
> = {
  default: {
    eyebrow: 'MewTruCard Premium',
    title: 'Create more polished cards with fewer limits.',
    description: 'Upgrade when you want premium models, private sharing, video cards, and an ad-free workspace.',
  },
  limit: {
    eyebrow: 'Daily limit reached',
    title: 'Keep creating today.',
    description: 'Premium removes the daily credit ceiling so you can finish every card while the idea is fresh.',
  },
  video: {
    eyebrow: 'Premium video',
    title: 'Unlock video cards.',
    description: 'Generate shareable motion cards for birthdays, anniversaries, apologies, and big moments.',
  },
  privacy: {
    eyebrow: 'Private sharing',
    title: 'Keep this card private.',
    description: 'Premium cards can stay out of public idea galleries and are cleaner to send professionally.',
  },
};

export function getYearlySavingsPercent(): number {
  const yearlyCost = premiumPlans.yearly.amountCents;
  const monthlyCostForYear = premiumPlans.monthly.amountCents * 12;

  return Math.floor(((monthlyCostForYear - yearlyCost) / monthlyCostForYear) * 100);
}

export function normalizeCheckoutReturnPath(returnPath: string | null | undefined): string {
  if (!returnPath || !returnPath.startsWith('/') || returnPath.startsWith('//')) {
    return '/';
  }

  try {
    const url = new URL(returnPath, 'https://mewtrucard.local');
    return `${url.pathname}${url.search}${url.hash}` || '/';
  } catch {
    return '/';
  }
}

function appendCheckoutParams(returnPath: string, params: string): string {
  const hashIndex = returnPath.indexOf('#');
  const pathAndSearch = hashIndex >= 0 ? returnPath.slice(0, hashIndex) : returnPath;
  const hash = hashIndex >= 0 ? returnPath.slice(hashIndex) : '';
  const separator = pathAndSearch.includes('?') ? '&' : '?';

  return `${pathAndSearch}${separator}${params}${hash}`;
}

export function buildCheckoutRedirectUrls(origin: string, returnPath: string | null | undefined) {
  const normalizedOrigin = (origin || 'http://localhost:3000').replace(/\/+$/, '');
  const normalizedReturnPath = normalizeCheckoutReturnPath(returnPath);

  return {
    successUrl: `${normalizedOrigin}${appendCheckoutParams(
      normalizedReturnPath,
      'status=success&session_id={CHECKOUT_SESSION_ID}'
    )}`,
    cancelUrl: `${normalizedOrigin}${appendCheckoutParams(normalizedReturnPath, 'status=cancelled')}`,
  };
}
