import assert from 'node:assert/strict';

import {
  buildFunnelMetrics,
  calculateChange,
  calculateRate,
  calculateSubscriptionValue,
  isSubscriptionLifecyclePartial,
  parseStatsDateRange,
  StatsDateRangeError,
} from '../src/lib/stats-metrics';

assert.deepEqual(
  parseStatsDateRange({ startDate: '2026-07-01', endDate: '2026-07-30' }),
  {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    previousStartDate: '2026-06-01',
    previousEndDate: '2026-06-30',
    days: 30,
  }
);
assert.throws(
  () => parseStatsDateRange({ startDate: '2026/07/01', endDate: '2026-07-30' }),
  StatsDateRangeError
);
assert.throws(
  () => parseStatsDateRange({ startDate: '2026-07-30', endDate: '2026-07-01' }),
  StatsDateRangeError
);
assert.throws(
  () => parseStatsDateRange({ startDate: '2025-01-01', endDate: '2026-07-30' }),
  StatsDateRangeError
);

assert.equal(calculateRate(9, 10), 90);
assert.equal(calculateRate(0, 0), null);
assert.equal(calculateChange(120, 100), 20);
assert.equal(calculateChange(1, 0), null);
assert.equal(calculateChange(0, 0), 0);

assert.deepEqual(
  calculateSubscriptionValue([
    { billingPeriod: 'MONTHLY', unitAmount: 699, count: 1 },
    { billingPeriod: 'YEARLY', unitAmount: 5299 },
  ]),
  { mrrCents: 1141, arrCents: 13687 }
);

assert.deepEqual(
  buildFunnelMetrics({ upgradeIntent: 100, ctaUsers: 40, checkoutUsers: 20, activatedUsers: 5 }),
  {
    upgradeIntent: 100,
    ctaUsers: 40,
    checkoutUsers: 20,
    activatedUsers: 5,
    intentToCtaRate: 40,
    ctaToCheckoutRate: 50,
    checkoutToActivationRate: 25,
    intentToActivationRate: 5,
  }
);
assert.equal(isSubscriptionLifecyclePartial('2026-07-15'), true);
assert.equal(isSubscriptionLifecyclePartial('2026-07-16'), false);

console.log('stats metric helpers passed');
