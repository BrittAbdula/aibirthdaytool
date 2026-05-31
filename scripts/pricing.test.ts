import assert from 'node:assert/strict';
import {
  buildCheckoutRedirectUrls,
  getYearlySavingsPercent,
  normalizeCheckoutReturnPath,
  premiumPlans,
} from '../src/lib/pricing';

assert.equal(premiumPlans.monthly.price, '$6.99');
assert.equal(premiumPlans.yearly.price, '$52.99');
assert.equal(premiumPlans.yearly.monthlyEquivalent, '$4.42/month');
assert.equal(getYearlySavingsPercent(), 36);

assert.equal(normalizeCheckoutReturnPath('/pricing?billing=yearly#plans'), '/pricing?billing=yearly#plans');
assert.equal(normalizeCheckoutReturnPath('https://evil.example/pricing'), '/');
assert.equal(normalizeCheckoutReturnPath('//evil.example/pricing'), '/');
assert.equal(normalizeCheckoutReturnPath(null), '/');

const redirects = buildCheckoutRedirectUrls('https://mewtrucard.com/', '/pricing?billing=yearly#plans');

assert.equal(
  redirects.successUrl,
  'https://mewtrucard.com/pricing?billing=yearly&status=success&session_id={CHECKOUT_SESSION_ID}#plans'
);
assert.equal(
  redirects.cancelUrl,
  'https://mewtrucard.com/pricing?billing=yearly&status=cancelled#plans'
);

console.log('pricing rules ok');
