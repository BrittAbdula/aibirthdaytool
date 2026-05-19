import assert from 'node:assert/strict';

import {
  FREE_SVG_MODEL,
  PREMIUM_SVG_MODEL,
  getSvgGenerationModel,
} from '../src/lib/svg-models';

assert.equal(FREE_SVG_MODEL, 'claude-opus-4-7');
assert.equal(PREMIUM_SVG_MODEL, 'claude-opus-4-7');
assert.equal(getSvgGenerationModel('FREE'), 'claude-opus-4-7');
assert.equal(getSvgGenerationModel('PREMIUM'), 'claude-opus-4-7');
assert.equal(getSvgGenerationModel('HM'), 'claude-opus-4-7');

console.log('svg model helpers passed');
