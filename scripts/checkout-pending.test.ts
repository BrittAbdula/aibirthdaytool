import assert from 'node:assert/strict';
import {
  PENDING_CHECKOUT_STORAGE_KEY,
  buildPendingCheckout,
  parsePendingCheckout,
} from '../src/lib/checkout-pending';

assert.equal(PENDING_CHECKOUT_STORAGE_KEY, 'mewtrucard.pendingCheckout');

const pending = buildPendingCheckout({
  plan: 'monthly',
  source: 'premium_modal_limit',
  returnUrl: '/birthday?foo=bar#card',
});

assert.equal(pending.plan, 'monthly');
assert.equal(pending.source, 'premium_modal_limit');
assert.equal(pending.returnUrl, '/birthday?foo=bar#card');
assert.equal(typeof pending.createdAt, 'number');

assert.deepEqual(parsePendingCheckout(JSON.stringify(pending)), pending);
assert.equal(parsePendingCheckout('{bad json'), null);
assert.equal(parsePendingCheckout(JSON.stringify({ ...pending, plan: 'weekly' })), null);
assert.equal(parsePendingCheckout(JSON.stringify({ ...pending, returnUrl: 'https://evil.example' })), null);

console.log('pending checkout rules ok');
