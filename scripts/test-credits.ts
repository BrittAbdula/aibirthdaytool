import assert from 'node:assert/strict';
import {
  getCountryCodeFromHeaders,
  getDailyCreditAllowance,
  isHighValueCountry,
} from '../src/lib/credits';

const vercelHeaders = new Headers({ 'x-vercel-ip-country': 'us' });
const cloudflareHeaders = new Headers({ 'cf-ipcountry': 'sg' });
const cloudfrontHeaders = new Headers({ 'cloudfront-viewer-country': 'jp' });
const unknownHeaders = new Headers({ 'x-vercel-ip-country': 'xx' });

assert.equal(getCountryCodeFromHeaders(vercelHeaders), 'US');
assert.equal(getCountryCodeFromHeaders(cloudflareHeaders), 'SG');
assert.equal(getCountryCodeFromHeaders(cloudfrontHeaders), 'JP');
assert.equal(getCountryCodeFromHeaders(unknownHeaders), null);

assert.equal(isHighValueCountry('US'), true);
assert.equal(isHighValueCountry('us'), true);
assert.equal(isHighValueCountry('IN'), false);
assert.equal(isHighValueCountry(null), false);

assert.equal(
  getDailyCreditAllowance({
    planType: 'FREE',
    isFirstDay: true,
    countryCode: 'US',
  }),
  8
);
assert.equal(
  getDailyCreditAllowance({
    planType: 'FREE',
    isFirstDay: true,
    countryCode: 'IN',
  }),
  4
);
assert.equal(
  getDailyCreditAllowance({
    planType: 'FREE',
    isFirstDay: false,
    countryCode: 'US',
  }),
  5
);
assert.equal(
  getDailyCreditAllowance({
    planType: 'PREMIUM',
    isFirstDay: true,
    countryCode: 'IN',
  }),
  Infinity
);

console.log('credit rules ok');
