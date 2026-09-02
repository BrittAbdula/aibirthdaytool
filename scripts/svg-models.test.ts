import assert from 'node:assert/strict';

import {
  FREE_SVG_MODEL,
  PREMIUM_SVG_MODEL,
  getSvgGenerationModel,
} from '../src/lib/svg-models';

assert.equal(FREE_SVG_MODEL, 'openai/gpt-5.6-luna');
assert.equal(PREMIUM_SVG_MODEL, 'openai/gpt-5.6-luna');
assert.equal(getSvgGenerationModel('FREE'), 'openai/gpt-5.6-luna');
assert.equal(getSvgGenerationModel('PREMIUM'), 'openai/gpt-5.6-luna');
assert.equal(getSvgGenerationModel('HM'), 'openai/gpt-5.6-luna');

console.log('svg model helpers passed');
