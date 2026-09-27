import assert from 'node:assert/strict';

import {
  FREE_SVG_MODEL,
  PREMIUM_SVG_MODEL,
  getSvgGenerationModel,
} from '../src/lib/svg-models';

assert.equal(FREE_SVG_MODEL, 'gpt-6-luna');
assert.equal(PREMIUM_SVG_MODEL, 'gpt-6-sol');
assert.equal(getSvgGenerationModel('FREE'), 'gpt-6-luna');
assert.equal(getSvgGenerationModel('PREMIUM'), 'gpt-6-sol');
assert.equal(getSvgGenerationModel('HM'), 'gpt-6-luna');

console.log('svg model helpers passed');
