import assert from 'node:assert/strict';
import {
  MONETIZATION_EVENT_TYPES,
  normalizeMonetizationEventInput,
} from '../src/lib/monetization';

assert.ok(MONETIZATION_EVENT_TYPES.includes('premium_modal_view'));
assert.ok(MONETIZATION_EVENT_TYPES.includes('checkout_session_created'));
assert.ok(MONETIZATION_EVENT_TYPES.includes('checkout_session_create_failed'));
assert.ok(MONETIZATION_EVENT_TYPES.includes('subscription_activated'));
assert.ok(MONETIZATION_EVENT_TYPES.includes('creator_batch_preview_completed'));
assert.ok(MONETIZATION_EVENT_TYPES.includes('creator_day_30_retained'));

const normalized = normalizeMonetizationEventInput({
  eventType: 'checkout_session_created',
  plan: 'monthly',
  source: 'pricing_page_monthly',
  path: '/pricing?billing=monthly',
  stripeSessionId: 'cs_test_123',
  metadata: { taskSize: 12, recipientName: 'Private Name' },
});

assert.equal(normalized.eventType, 'checkout_session_created');
assert.equal(normalized.plan, 'monthly');
assert.equal(normalized.source, 'pricing_page_monthly');
assert.equal(normalized.path, '/pricing');
assert.equal(normalized.stripeSessionId, 'cs_test_123');
assert.deepEqual(normalized.metadata, { taskSize: 12 });

assert.throws(() => normalizeMonetizationEventInput({ eventType: 'not_real' }));
assert.throws(() => normalizeMonetizationEventInput({ eventType: 'pricing_cta_click', plan: 'weekly' }));
assert.equal(normalizeMonetizationEventInput({ eventType: 'pricing_page_view', path: 'https://evil.example' }).path, null);

console.log('monetization rules ok');
