/**
 * What to offer, at which moment.
 *
 * The old paywall showed one message everywhere: a recurring team workflow with
 * a recipient roster and a brand preset. Most people who hit it were making a
 * single card for one person, so the offer answered a question they had not
 * asked. Each intent below resolves to the offer that actually matches it.
 */

import { SKUS, type SkuKey } from './plans';

export type PaywallIntent =
  // Single-occasion moments: someone wants this card, now.
  | 'daily_limit'
  | 'video'
  | 'privacy'
  | 'download'
  | 'premium_style'
  // Recurring moments: someone is running the same process every month.
  | 'roster_limit'
  | 'batch_size'
  | 'batch_export'
  | 'preview_used'
  | 'csv_limit'
  | 'default';

export type PaywallAudience = 'single' | 'recurring';

export interface PaywallOffer {
  intent: PaywallIntent;
  audience: PaywallAudience;
  eyebrow: string;
  title: string;
  description: string;
  /** The SKU the primary button buys. */
  primary: SkuKey;
  /** Alternatives shown beneath it, in order. */
  secondary: SkuKey[];
  highlights: string[];
}

const SINGLE_HIGHLIGHTS = [
  'Cards that never expire — no subscription',
  'Video cards, premium styles, private sharing',
  'Clean downloads with no watermark',
];

const RECURRING_HIGHLIGHTS = [
  'Unlimited recipients and complete batches',
  'Reusable brand preset and 30-day occasion queue',
  'Batch export, private cards, no ads',
];

const OFFERS: Record<PaywallIntent, Omit<PaywallOffer, 'intent'>> = {
  daily_limit: {
    audience: 'single',
    eyebrow: "That's today's free cards",
    title: 'Keep going with a card pack.',
    description:
      'Twenty cards for the price of one paper card, and they never expire. Or wait until tomorrow for three more free ones.',
    primary: 'pack_20',
    secondary: ['pack_50', 'plus_monthly'],
    highlights: SINGLE_HIGHLIGHTS,
  },
  video: {
    audience: 'single',
    eyebrow: 'Video cards',
    title: 'Make this one move.',
    description:
      'A card pack unlocks video, premium styles, and clean downloads. One video uses five cards from your pack.',
    primary: 'pack_20',
    secondary: ['pack_50', 'plus_monthly'],
    highlights: SINGLE_HIGHLIGHTS,
  },
  privacy: {
    audience: 'single',
    eyebrow: 'Private sharing',
    title: 'Keep this card between you two.',
    description:
      'Cards made with a pack stay out of the public gallery, and the link you send stays clean.',
    primary: 'pack_20',
    secondary: ['pack_50', 'plus_monthly'],
    highlights: SINGLE_HIGHLIGHTS,
  },
  download: {
    audience: 'single',
    eyebrow: 'Clean download',
    title: 'Download it without the corner mark.',
    description:
      'A card pack removes the watermark from every download and unlocks premium formats.',
    primary: 'pack_20',
    secondary: ['pack_50', 'plus_monthly'],
    highlights: SINGLE_HIGHLIGHTS,
  },
  premium_style: {
    audience: 'single',
    eyebrow: 'Premium styles',
    title: 'Unlock the full style shelf.',
    description:
      'Card packs open every style, including the ones that take longer to render.',
    primary: 'pack_20',
    secondary: ['pack_50', 'plus_monthly'],
    highlights: SINGLE_HIGHLIGHTS,
  },
  roster_limit: {
    audience: 'recurring',
    eyebrow: 'Recipient roster',
    title: 'Keep everyone in one place.',
    description:
      'Creator Pro lifts the three-recipient limit and keeps the whole roster, with the next 30 days already queued.',
    primary: 'creator_pro_monthly',
    secondary: ['plus_monthly'],
    highlights: RECURRING_HIGHLIGHTS,
  },
  batch_size: {
    audience: 'recurring',
    eyebrow: 'Complete batches',
    title: 'Generate the whole list at once.',
    description:
      'Creator Pro runs up to 50 personalized cards per batch instead of a single preview.',
    primary: 'creator_pro_monthly',
    secondary: ['plus_monthly'],
    highlights: RECURRING_HIGHLIGHTS,
  },
  batch_export: {
    audience: 'recurring',
    eyebrow: 'Batch export',
    title: 'Take the batch with you.',
    description:
      'Creator Pro exports the finished batch and keeps the history for the next occasion.',
    primary: 'creator_pro_monthly',
    secondary: ['plus_monthly'],
    highlights: RECURRING_HIGHLIGHTS,
  },
  preview_used: {
    audience: 'recurring',
    eyebrow: 'Preview used',
    title: 'You have seen how it works.',
    description:
      'Creator Pro turns that preview into the full batch, with the roster and brand direction saved for next month.',
    primary: 'creator_pro_monthly',
    secondary: ['plus_monthly'],
    highlights: RECURRING_HIGHLIGHTS,
  },
  csv_limit: {
    audience: 'recurring',
    eyebrow: 'Roster import',
    title: 'Import the whole list.',
    description:
      'Creator Pro imports your full recipient list instead of the first three rows.',
    primary: 'creator_pro_monthly',
    secondary: ['plus_monthly'],
    highlights: RECURRING_HIGHLIGHTS,
  },
  default: {
    audience: 'single',
    eyebrow: 'MewTruCard',
    title: 'Make more cards, whenever you need them.',
    description:
      'Card packs never expire and unlock every format. Subscribe only if you make cards all the time.',
    primary: 'pack_20',
    secondary: ['pack_50', 'plus_monthly'],
    highlights: SINGLE_HIGHLIGHTS,
  },
};

export function resolvePaywallOffer(intent: PaywallIntent): PaywallOffer {
  return { intent, ...(OFFERS[intent] ?? OFFERS.default) };
}

export function isPaywallIntent(value: unknown): value is PaywallIntent {
  return typeof value === 'string' && value in OFFERS;
}

/** Every SKU an offer can present, in display order. */
export function getOfferSkus(offer: PaywallOffer) {
  return [offer.primary, ...offer.secondary].map((key) => SKUS[key]);
}
