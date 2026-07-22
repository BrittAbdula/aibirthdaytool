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

export type PremiumModalContext = 'default' | 'limit' | 'video' | 'privacy' | 'download';

export const premiumPlans: Record<PremiumPlanKey, PremiumPlan> = {
  monthly: {
    key: 'monthly',
    label: 'Monthly',
    price: '$6.99',
    amountCents: 699,
    billingLabel: 'per month',
    description: 'The complete recurring workflow for people who create team cards every month.',
  },
  yearly: {
    key: 'yearly',
    label: 'Yearly',
    price: '$52.99',
    amountCents: 5299,
    billingLabel: 'per year',
    monthlyEquivalent: '$4.42/month',
    description: 'A lower effective monthly price for established recurring workflows.',
  },
};

export const premiumPlanOrder: PremiumPlanKey[] = ['monthly', 'yearly'];
export const premiumModalPlanOrder: PremiumPlanKey[] = ['monthly'];

export const premiumHighlights = [
  'Unlimited recipient roster and complete batches',
  'Reusable brand preset and 30-day occasion queue',
  'Private cards, premium formats, no watermarks or ads',
];

export const premiumFeatureRows: PremiumFeatureRow[] = [
  { feature: 'Recipient roster', free: 'Up to 3 people', premium: 'Unlimited' },
  { feature: 'Batch generation', free: 'One card preview', premium: 'Up to 50 per batch' },
  { feature: '30-day occasion queue', free: 'Included', premium: 'Included' },
  { feature: 'Reusable brand preset', free: 'Included', premium: 'Included' },
  { feature: 'Batch export and reuse', free: 'Locked', premium: 'Included' },
  { feature: 'Premium image and video', free: 'Limited or locked', premium: 'Included' },
  { feature: 'Private cards', free: 'Public gallery eligible', premium: 'Private by default' },
  { feature: 'Watermarks and ads', free: 'Included', premium: 'Removed' },
  { feature: 'Cancellation', free: 'No subscription', premium: 'Cancel anytime' },
];

export const premiumModalCopy: Record<
  PremiumModalContext,
  { eyebrow: string; title: string; description: string }
> = {
  default: {
    eyebrow: 'MewTruCard Creator Pro',
    title: 'Turn repeat card making into one organized workflow.',
    description: 'Keep a recipient roster, reuse your brand direction, generate complete batches, and work without ads.',
  },
  limit: {
    eyebrow: 'Daily limit reached',
    title: 'Keep creating — and make the next occasion easier.',
    description: 'Creator Pro removes daily limits and adds a roster, 30-day queue, brand preset, and repeatable batches.',
  },
  video: {
    eyebrow: 'Creator Pro video',
    title: 'Unlock video cards and the complete creator workflow.',
    description: 'Create premium motion cards while keeping recurring recipients, batches, and brand direction organized.',
  },
  privacy: {
    eyebrow: 'Private sharing',
    title: 'Keep this card private.',
    description: 'Creator Pro cards stay out of public galleries and are cleaner to send professionally.',
  },
  download: {
    eyebrow: 'Cleaner download',
    title: 'Send this card without the extra friction.',
    description: 'Creator Pro keeps downloads, batch exports, and sharing cleaner when the work is ready to go.',
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
    return url.pathname || '/';
  } catch {
    return '/';
  }
}

export function buildCheckoutRedirectUrls(origin: string, returnPath: string | null | undefined) {
  const normalizedOrigin = (origin || 'http://localhost:3000').replace(/\/+$/, '');
  const normalizedReturnPath = normalizeCheckoutReturnPath(returnPath);

  return {
    successUrl: `${normalizedOrigin}${normalizedReturnPath}?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${normalizedOrigin}${normalizedReturnPath}?status=cancelled`,
  };
}
