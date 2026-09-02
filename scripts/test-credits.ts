import assert from 'node:assert';
import { getCountryCodeFromHeaders } from '../src/lib/credits';

const vercelHeaders = new Headers({ 'x-vercel-ip-country': 'US' });
const cloudflareHeaders = new Headers({ 'cf-ipcountry': 'sg' });
const cloudfrontHeaders = new Headers({ 'cloudfront-viewer-country': 'JP' });
const unknownHeaders = new Headers({ 'cf-ipcountry': 'XX' });
const malformedHeaders = new Headers({ 'cf-ipcountry': 'USA' });

assert.equal(getCountryCodeFromHeaders(vercelHeaders), 'US');
assert.equal(getCountryCodeFromHeaders(cloudflareHeaders), 'SG');
assert.equal(getCountryCodeFromHeaders(cloudfrontHeaders), 'JP');
assert.equal(getCountryCodeFromHeaders(unknownHeaders), null);
assert.equal(getCountryCodeFromHeaders(malformedHeaders), null);
assert.equal(getCountryCodeFromHeaders(new Headers()), null);

console.log('credits tests passed');
