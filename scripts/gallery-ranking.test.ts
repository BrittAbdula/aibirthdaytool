import assert from 'node:assert/strict';

import {
  ACTION_WEIGHTS,
  PREMIUM_TAB_TEXT_MODELS,
  getInteractionScore,
  getModelQualityScore,
  getRecencyBoost,
} from '../src/lib/card-ranking';

assert.equal(getModelQualityScore('google/nano-banana-edit'), 70);
assert.equal(getModelQualityScore('gpt-image-2-edit'), 70);
assert.equal(getModelQualityScore('gpt-image-2'), 65);
assert.equal(getModelQualityScore('google/nano-banana-pro'), 65);
assert.equal(getModelQualityScore('claude-opus-4-7'), 40);
assert.equal(getModelQualityScore('claude-sonnet-4-6'), 40);
assert.equal(getModelQualityScore('claude-sonnet-4-5-20250929'), 40);
assert.equal(PREMIUM_TAB_TEXT_MODELS.includes('claude-opus-4-7'), true);
assert.equal(PREMIUM_TAB_TEXT_MODELS.includes('claude-sonnet-4-6'), true);
assert.equal(getModelQualityScore('some-new-model'), 15);
assert.equal(getModelQualityScore(null), 0);

assert.equal(
  getInteractionScore({
    up: 2,
    send: 3,
    download: 5,
    copy: 7,
  }),
  Math.log1p(
    2 * ACTION_WEIGHTS.up +
      3 * ACTION_WEIGHTS.send +
      5 * ACTION_WEIGHTS.download +
      7 * ACTION_WEIGHTS.copy
  )
);

const now = new Date('2026-05-11T00:00:00.000Z');
assert.equal(getRecencyBoost(new Date('2026-05-10T12:00:00.000Z'), now), 30);
assert.equal(getRecencyBoost(new Date('2026-05-06T00:00:00.000Z'), now), 20);
assert.equal(getRecencyBoost(new Date('2026-04-20T00:00:00.000Z'), now), 10);
assert.equal(getRecencyBoost(new Date('2026-03-01T00:00:00.000Z'), now), 3);
assert.equal(getRecencyBoost(new Date('2025-12-01T00:00:00.000Z'), now), 0);

console.log('gallery ranking helpers passed');
