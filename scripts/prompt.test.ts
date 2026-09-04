import assert from 'node:assert/strict';

import type { CardSize } from '../src/lib/card-config';
import { buildPersonalizationBrief } from '../src/lib/card-brief';
import { inferDirectionHeuristically } from '../src/lib/emotion-director';
import { generatePrompt } from '../src/lib/prompt';

// Literal sizes: importing card-config would pull prisma and React's cache into a plain ts-node run.
const CARD_SIZES: Record<string, CardSize> = {
  portrait: { id: 'portrait', name: 'Portrait', width: 480, height: 760, aspectRatio: '0.63', orientation: 'portrait' },
  landscape: { id: 'landscape', name: 'Landscape', width: 760, height: 480, aspectRatio: '1.58', orientation: 'landscape' },
  square: { id: 'square', name: 'Square', width: 600, height: 600, aspectRatio: '1', orientation: 'square' },
};
const portrait = CARD_SIZES.portrait;

// --- with a read attached -------------------------------------------------------

const pleading = inferDirectionHeuristically(
  buildPersonalizationBrief({ cardType: 'sorry', to: 'Girlfriend', recipientName: 'Fathima', message: 'Sorry akka 😭 please enna vittutu poidathinga' }, 'sorry'),
  7
);
assert.equal(pleading.register, 'pleading-apology');

const system = generatePrompt('sorry', portrait, pleading);

assert.match(system, /A card is a message wearing a body/);
assert.match(system, /ANTI-TEMPLATE LAW/);
assert.match(system, /There is no house paper/);
assert.match(system, /prefers-reduced-motion: reduce/);
assert.match(system, /viewBox="0 0 480 760"/);
assert.match(system, /Canvas facts: 480×760 \(portrait\)/);
assert.match(system, /16px ≈ 42 characters/);
assert.match(system, /THE REGISTER THIS CARD IS CAST IN/);
assert.match(system, /Register: The 2 a\.m\. apology \(pleading-apology\)/);
assert.match(system, /Never in this register: confetti or balloons/);
assert.match(system, /rain-lines —/);
assert.match(system, /heartbeat-pulse —/);
assert.match(system, /Return ONLY the complete SVG/);
assert.doesNotMatch(system, /READ THE BRIEF YOURSELF/);
// The old template's copy-paste defaults must be gone: no hard-coded paper hexes, no foil snippet by default.
assert.doesNotMatch(system, /#e5b72e/i);
assert.doesNotMatch(system, /stop-color="#fff3c4"/);

// A different register renders a different range and no undertone line.
const party = inferDirectionHeuristically(
  buildPersonalizationBrief({ cardType: 'birthday', to: 'Friend', recipientName: 'ROHAN', message: 'HAPPIEST BIRTHDAY ROHAN!!! 🎉🎉🎉 PARTY TIME' }, 'birthday'),
  2
);
assert.equal(party.register, 'loud-celebration');
const partySystem = generatePrompt('birthday', CARD_SIZES.landscape, party);
assert.match(partySystem, /Register: Throw the party \(loud-celebration\)/);
assert.match(partySystem, /Canvas facts: 760×480 \(landscape\)/);
assert.match(partySystem, /16px ≈ 67 characters/);
assert.doesNotMatch(partySystem, /pleading-apology/);

// An undertone is announced as a single added element.
const banter = inferDirectionHeuristically(
  buildPersonalizationBrief(
    {
      cardType: 'birthday',
      to: 'Friend',
      recipientName: 'Minakshi',
      sharedMemory: 'Our 3 a.m. chats. I really miss that.',
      insideJokeOrMotif: 'my bakbak',
      recipientTraits: ['Funny'],
      relationshipVibe: 'Playful',
    },
    'birthday'
  ),
  4
);
assert.equal(banter.register, 'bestie-banter');
assert.equal(banter.undertone, 'tender-nostalgia');
assert.match(generatePrompt('birthday', portrait, banter), /Undertone \(add one element from it, never let it take over\): I miss old us/);

// --- without a read (modification flow) ------------------------------------------

const bare = generatePrompt('birthday', CARD_SIZES.square);
assert.match(bare, /READ THE BRIEF YOURSELF FIRST/);
assert.match(bare, /- pleading-apology —/);
assert.match(bare, /- festive-gathering —/);
assert.match(bare, /viewBox="0 0 600 600"/);
assert.doesNotMatch(bare, /THE REGISTER THIS CARD IS CAST IN/);

console.log('svg system prompt passed');
