import assert from 'node:assert/strict';

import {
  FREE_SVG_MODEL,
  PREMIUM_SVG_MODEL,
  getSvgGenerationModel,
} from '../src/lib/svg-models';

assert.equal(FREE_SVG_MODEL, 'claude-haiku-4-5-20251001');
assert.equal(PREMIUM_SVG_MODEL, 'claude-haiku-4-5-20251001');
assert.equal(getSvgGenerationModel('FREE'), 'claude-haiku-4-5-20251001');
assert.equal(getSvgGenerationModel('PREMIUM'), 'claude-haiku-4-5-20251001');
assert.equal(getSvgGenerationModel('HM'), 'claude-haiku-4-5-20251001');

console.log('svg model helpers passed');
