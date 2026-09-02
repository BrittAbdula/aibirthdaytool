import assert from 'node:assert/strict';
import {
  PENDING_CHECKOUT_STORAGE_KEY,
  buildPendingCheckout,
  parsePendingCheckout,
} from '../src/lib/checkout-pending';
import { buildCheckoutRedirectUrls } from '../src/lib/pricing/checkout';

assert.equal(PENDING_CHECKOUT_STORAGE_KEY, 'mewtrucard.pendingCheckout');

const pending = buildPendingCheckout({
  sku: 'pack_20',
  source: 'paywall_daily_limit',
  returnUrl: '/birthday?foo=bar#card',
  taskSize: 72,
});

assert.equal(pending.sku, 'pack_20');
assert.equal(pending.source, 'paywall_daily_limit');
assert.equal(pending.returnUrl, '/birthday');
assert.equal(pending.taskSize, 50);
assert.equal(typeof pending.createdAt, 'number');

assert.deepEqual(parsePendingCheckout(JSON.stringify(pending)), pending);
assert.equal(parsePendingCheckout('{bad json'), null);
assert.equal(parsePendingCheckout(JSON.stringify({ ...pending, sku: 'weekly' })), null);
// Pre-split entries stored a `plan` and no `sku`; they must not resume as a
// checkout for whichever SKU happens to sort first.
assert.equal(parsePendingCheckout(JSON.stringify({ plan: 'monthly', source: 'x', returnUrl: '/', createdAt: Date.now() })), null);
assert.equal(parsePendingCheckout(JSON.stringify({ ...pending, returnUrl: 'https://evil.example' })), null);

const redirects = buildCheckoutRedirectUrls('https://mewtrucard.com/', '/birthday?recipientName=Private&message=Secret#card');
assert.equal(redirects.successUrl, 'https://mewtrucard.com/birthday?status=success&session_id={CHECKOUT_SESSION_ID}');
assert.equal(redirects.cancelUrl, 'https://mewtrucard.com/birthday?status=cancelled');
assert.equal(redirects.successUrl.includes('Private'), false);
assert.equal(redirects.successUrl.includes('Secret'), false);

console.log('pending checkout rules ok');
