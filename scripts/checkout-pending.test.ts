import assert from 'node:assert/strict';
import {
  PENDING_CHECKOUT_STORAGE_KEY,
  buildPendingCheckout,
  parsePendingCheckout,
} from '../src/lib/checkout-pending';
import { buildCheckoutRedirectUrls } from '../src/lib/pricing';

assert.equal(PENDING_CHECKOUT_STORAGE_KEY, 'mewtrucard.pendingCheckout');

const pending = buildPendingCheckout({
  plan: 'monthly',
  source: 'premium_modal_limit',
  returnUrl: '/birthday?foo=bar#card',
  taskSize: 72,
});

assert.equal(pending.plan, 'monthly');
assert.equal(pending.source, 'premium_modal_limit');
assert.equal(pending.returnUrl, '/birthday');
assert.equal(pending.taskSize, 50);
assert.equal(typeof pending.createdAt, 'number');

assert.deepEqual(parsePendingCheckout(JSON.stringify(pending)), pending);
assert.equal(parsePendingCheckout('{bad json'), null);
assert.equal(parsePendingCheckout(JSON.stringify({ ...pending, plan: 'weekly' })), null);
assert.equal(parsePendingCheckout(JSON.stringify({ ...pending, returnUrl: 'https://evil.example' })), null);

const redirects = buildCheckoutRedirectUrls('https://mewtrucard.com/', '/birthday?recipientName=Private&message=Secret#card');
assert.equal(redirects.successUrl, 'https://mewtrucard.com/birthday?status=success&session_id={CHECKOUT_SESSION_ID}');
assert.equal(redirects.cancelUrl, 'https://mewtrucard.com/birthday?status=cancelled');
assert.equal(redirects.successUrl.includes('Private'), false);
assert.equal(redirects.successUrl.includes('Secret'), false);

console.log('pending checkout rules ok');
