import { FREE_DAILY_CARDS, AD_REWARD_DAILY_CAP, VIDEO_CARD_COST } from './quota';

export interface PlanFeatureRow {
  feature: string;
  free: string;
  pack: string;
  plus: string;
  creatorPro: string;
}

export const PLAN_FEATURE_ROWS: PlanFeatureRow[] = [
  {
    feature: 'Cards',
    free: `${FREE_DAILY_CARDS} a day`,
    pack: '20 or 50, never expire',
    plus: 'Unlimited',
    creatorPro: 'Unlimited',
  },
  {
    feature: 'Extra cards from a short ad',
    free: `Up to ${AD_REWARD_DAILY_CAP} a day`,
    pack: 'Not needed',
    plus: 'Not needed',
    creatorPro: 'Not needed',
  },
  {
    feature: 'Animated and static cards',
    free: 'Included',
    pack: 'Included',
    plus: 'Included',
    creatorPro: 'Included',
  },
  {
    feature: 'Video cards',
    free: 'Locked',
    pack: `${VIDEO_CARD_COST} cards each`,
    plus: 'Included',
    creatorPro: 'Included',
  },
  {
    feature: 'Premium styles',
    free: 'Locked',
    pack: 'Included',
    plus: 'Included',
    creatorPro: 'Included',
  },
  {
    feature: 'Watermark-free downloads',
    free: 'Corner mark',
    pack: 'Clean',
    plus: 'Clean',
    creatorPro: 'Clean',
  },
  {
    feature: 'Private cards',
    free: 'Public gallery eligible',
    pack: 'Private',
    plus: 'Private',
    creatorPro: 'Private',
  },
  {
    feature: 'Ads',
    free: 'Shown',
    pack: 'Removed',
    plus: 'Removed',
    creatorPro: 'Removed',
  },
  {
    feature: 'Recipient roster',
    free: 'Up to 3',
    pack: 'Up to 3',
    plus: 'Up to 3',
    creatorPro: 'Unlimited',
  },
  {
    feature: 'Batch generation',
    free: 'One preview',
    pack: 'One preview',
    plus: 'One preview',
    creatorPro: 'Up to 50 per batch',
  },
  {
    feature: 'Batch export and history',
    free: 'Locked',
    pack: 'Locked',
    plus: 'Locked',
    creatorPro: 'Included',
  },
];
