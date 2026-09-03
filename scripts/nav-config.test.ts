import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  FALLBACK_CARD_MAKERS,
  isActivePath,
  isGeneratorComposePath,
  matchCardMakers,
  type CardMaker,
} from '../src/lib/nav-config';

const root = process.cwd();
const readSource = (path: string) => readFileSync(join(root, path), 'utf8');

const makers: CardMaker[] = [
  { slug: 'birthday', label: 'Birthday' },
  { slug: 'newyear', label: 'New Year' },
  { slug: 'mothersday', label: "Mother's Day" },
  { slug: 'thankyou', label: 'Thank You' },
];

// Only single-segment generator paths get the compose header.
assert.equal(isGeneratorComposePath('/birthday/', makers), true);
assert.equal(isGeneratorComposePath('/newyear/', makers), true);
assert.equal(isGeneratorComposePath('/pricing/', makers), false);
assert.equal(isGeneratorComposePath('/type/birthday/', makers), false);
assert.equal(isGeneratorComposePath('/', makers), false);

// Multi-word occasions must be findable the way people type them.
assert.deepEqual(matchCardMakers(makers, 'new year').map((m) => m.slug), ['newyear']);
assert.deepEqual(matchCardMakers(makers, 'newyear').map((m) => m.slug), ['newyear']);
assert.deepEqual(matchCardMakers(makers, 'mothers day').map((m) => m.slug), ['mothersday']);
assert.deepEqual(matchCardMakers(makers, "mother's day").map((m) => m.slug), ['mothersday']);
assert.deepEqual(matchCardMakers(makers, 'thank you').map((m) => m.slug), ['thankyou']);
assert.deepEqual(matchCardMakers(makers, 'BIRTH').map((m) => m.slug), ['birthday']);
assert.deepEqual(matchCardMakers(makers, 'quinceanera'), []);
assert.equal(matchCardMakers(makers, '   ').length, makers.length);

assert.ok(isActivePath('/card-gallery/', '/card-gallery/'));
assert.ok(isActivePath('/type/birthday/', '/type/'));
assert.ok(!isActivePath('/pricing/', '/card-gallery/'));
assert.ok(isActivePath('/', '/'));
assert.ok(!isActivePath('/pricing/', '/'));

// The fallback list only matters when the database read fails, so it must stay usable.
assert.ok(FALLBACK_CARD_MAKERS.length >= 15, 'fallback list should cover the main makers');
assert.ok(FALLBACK_CARD_MAKERS.some((maker) => maker.slug === 'birthday'));
assert.equal(
  new Set(FALLBACK_CARD_MAKERS.map((maker) => maker.slug)).size,
  FALLBACK_CARD_MAKERS.length,
  'fallback list should not repeat a slug'
);

// The live list must come from the database, not a hardcoded array in the UI.
const searchSource = readSource('src/components/nav/GeneratorSearch.tsx');
assert.doesNotMatch(searchSource, /slug:\s*'/, 'search should not hardcode card makers');
const makersSource = readSource('src/lib/nav-card-makers.ts');
assert.match(makersSource, /cardGenerator\.findMany/, 'nav card makers should be read from the database');
assert.match(makersSource, /FALLBACK_CARD_MAKERS/, 'nav card makers should fall back when the read fails');

console.log('nav config checks passed');
