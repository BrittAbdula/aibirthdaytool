import assert from 'node:assert/strict';

import {
  buildPersonalizationBrief,
  createNaturalPrompt,
} from '../src/lib/personalization-prompt';

const richInput = {
  cardType: 'birthday',
  relationship: 'friend',
  recipientName: 'Maya',
  message: 'Happy birthday to the person who makes ordinary Tuesdays hilarious.',
  tone: 'humor',
  signed: 'Tom',
  sharedMemory: 'our rainy coffee walk after the concert',
  recipientTraits: ['funny', 'gentle', 'ambitious', 'extra ignored'],
  relationshipVibe: 'playful and loyal',
  insideJokeOrMotif: 'tiny croissants and a blue umbrella',
  avoidDetails: 'no cheesy hearts, no childish style',
  design: 'Pastel',
};

const brief = buildPersonalizationBrief(richInput, 'birthday');

assert.equal(brief.cardType, 'birthday');
assert.equal(brief.relationship, 'friend');
assert.equal(brief.recipientName, 'Maya');
assert.deepEqual(brief.recipientTraits, ['funny', 'gentle', 'ambitious']);
assert.equal(brief.sharedMemory, 'our rainy coffee walk after the concert');
assert.equal(brief.relationshipVibe, 'playful and loyal');
assert.equal(brief.insideJokeOrMotif, 'tiny croissants and a blue umbrella');
assert.equal(brief.avoidDetails, 'no cheesy hearts, no childish style');

const imagePrompt = createNaturalPrompt(richInput, 'birthday', {
  size: 'portrait',
  medium: 'image',
});

assert.match(imagePrompt, /Recipient context:/);
assert.match(imagePrompt, /This is for my friend, Maya\./);
assert.match(imagePrompt, /Memory and personality:/);
assert.match(imagePrompt, /Shared memory: our rainy coffee walk after the concert\./);
assert.match(imagePrompt, /Recipient traits: funny, gentle, ambitious\./);
assert.match(imagePrompt, /Relationship vibe: playful and loyal\./);
assert.match(imagePrompt, /Personal motif: tiny croissants and a blue umbrella\./);
assert.match(imagePrompt, /Avoid: no cheesy hearts, no childish style\./);
assert.match(imagePrompt, /Full-bleed, edge-to-edge composition/);
assert.match(imagePrompt, /Frame the main subject at 65-85% of canvas/);

const svgPrompt = createNaturalPrompt(richInput, 'birthday', {
  size: 'square',
  medium: 'svg',
});

assert.match(svgPrompt, /SVG execution:/);
assert.match(svgPrompt, /Use clean vector shapes/);
assert.match(svgPrompt, /Include ONE signature animation/);
assert.match(svgPrompt, /Avoid: no cheesy hearts, no childish style\./);

const basicPrompt = createNaturalPrompt(
  {
    cardType: 'birthday',
    relationship: 'mother',
    recipientName: 'Ana',
  },
  'birthday',
  { size: 'landscape', medium: 'image' }
);

assert.match(basicPrompt, /This is for my mother, Ana\./);
assert.match(basicPrompt, /Composition: landscape orientation/);

console.log('personalization prompt helpers passed');
