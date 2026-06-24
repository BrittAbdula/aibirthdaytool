import assert from 'node:assert/strict';
import {
  getUserPlanForSubscriptionStatus,
  isSubscriptionStatusEntitled,
} from '../src/lib/subscription-status';

assert.equal(isSubscriptionStatusEntitled('active'), true);
assert.equal(isSubscriptionStatusEntitled('trialing'), true);
assert.equal(getUserPlanForSubscriptionStatus('active'), 'PREMIUM');
assert.equal(getUserPlanForSubscriptionStatus('trialing'), 'PREMIUM');

for (const status of ['past_due', 'incomplete', 'incomplete_expired', 'canceled', 'unpaid', null, undefined]) {
  assert.equal(isSubscriptionStatusEntitled(status), false);
  assert.equal(getUserPlanForSubscriptionStatus(status), 'FREE');
}

console.log('subscription status rules ok');
