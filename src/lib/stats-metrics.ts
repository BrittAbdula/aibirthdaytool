const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const STATS_MAX_RANGE_DAYS = 366;
export const SUBSCRIPTION_LIFECYCLE_RELIABLE_FROM = '2026-07-16T12:07:24.757Z';

export interface StatsDateRange {
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
  days: number;
}

export interface SubscriptionValueInput {
  billingPeriod: 'MONTHLY' | 'YEARLY';
  unitAmount: number;
  count?: number;
}

export interface FunnelCounts {
  upgradeIntent: number;
  ctaUsers: number;
  checkoutUsers: number;
  activatedUsers: number;
}

export class StatsDateRangeError extends Error {}

function utcDate(value: string): Date | null {
  if (!ISO_DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export function formatUtcDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function parseStatsDateRange(input: {
  startDate?: string | null;
  endDate?: string | null;
  now?: Date;
}): StatsDateRange {
  const today = new Date(input.now ?? new Date());
  const defaultEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const defaultStart = new Date(defaultEnd.getTime() - 29 * DAY_MS);
  const startValue = input.startDate ?? formatUtcDate(defaultStart);
  const endValue = input.endDate ?? formatUtcDate(defaultEnd);
  const start = utcDate(startValue);
  const end = utcDate(endValue);

  if (!start || !end) {
    throw new StatsDateRangeError('日期必须使用 YYYY-MM-DD 格式');
  }
  if (start.getTime() > end.getTime()) {
    throw new StatsDateRangeError('开始日期不能晚于结束日期');
  }

  const days = Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;
  if (days > STATS_MAX_RANGE_DAYS) {
    throw new StatsDateRangeError(`日期范围不能超过 ${STATS_MAX_RANGE_DAYS} 天`);
  }

  const previousEnd = new Date(start.getTime() - DAY_MS);
  const previousStart = new Date(previousEnd.getTime() - (days - 1) * DAY_MS);

  return {
    startDate: formatUtcDate(start),
    endDate: formatUtcDate(end),
    previousStartDate: formatUtcDate(previousStart),
    previousEndDate: formatUtcDate(previousEnd),
    days,
  };
}

export function calculateRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export function calculateChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function calculateSubscriptionValue(subscriptions: SubscriptionValueInput[]): {
  mrrCents: number;
  arrCents: number;
} {
  const arrCents = subscriptions.reduce((total, subscription) => {
    const count = subscription.count ?? 1;
    return total + count * (subscription.billingPeriod === 'MONTHLY'
      ? subscription.unitAmount * 12
      : subscription.unitAmount);
  }, 0);

  return {
    mrrCents: Math.round(arrCents / 12),
    arrCents,
  };
}

export function buildFunnelMetrics(counts: FunnelCounts) {
  return {
    ...counts,
    intentToCtaRate: calculateRate(counts.ctaUsers, counts.upgradeIntent),
    ctaToCheckoutRate: calculateRate(counts.checkoutUsers, counts.ctaUsers),
    checkoutToActivationRate: calculateRate(counts.activatedUsers, counts.checkoutUsers),
    intentToActivationRate: calculateRate(counts.activatedUsers, counts.upgradeIntent),
  };
}

export function isSubscriptionLifecyclePartial(startDate: string): boolean {
  return startDate < SUBSCRIPTION_LIFECYCLE_RELIABLE_FROM.slice(0, 10);
}
