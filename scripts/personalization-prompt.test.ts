import assert from 'node:assert/strict';

import {
  buildPersonalizationBrief,
  buildReferenceEditPrompt,
  createNaturalPrompt,
} from '../src/lib/personalization-prompt';
import { inferDirectionHeuristically } from '../src/lib/emotion-director';

const richInput = {
  cardType: 'birthday',
  relationship: 'friend',
  recipientName: 'Maya',
  message: 'Happy birthday to the person who makes ordinary Tuesdays hilarious. Never change, you absolute menace.',
  tone: 'humor',
  signed: 'Tom',
  sharedMemory: 'our rainy coffee walk after the concert',
  recipientTraits: ['funny', 'gentle', 'ambitious', 'extra ignored'],
  relationshipVibe: 'Playful',
  insideJokeOrMotif: 'tiny croissants and a blue umbrella',
  avoidDetails: 'no cheesy hearts, no childish style',
  design: 'Pastel',
  language: 'English',
  isPublic: true,
  variationIndex: 0,
};

// --- the brief --------------------------------------------------------------

const brief = buildPersonalizationBrief(richInput, 'birthday');

assert.equal(brief.cardType, 'birthday');
assert.equal(brief.relationship, 'friend');
assert.equal(brief.recipientName, 'Maya');
assert.deepEqual(brief.recipientTraits, ['funny', 'gentle', 'ambitious']);
assert.equal(brief.sharedMemory, 'our rainy coffee walk after the concert');
assert.equal(brief.relationshipVibe, 'Playful');
assert.equal(brief.insideJokeOrMotif, 'tiny croissants and a blue umbrella');
assert.equal(brief.avoidDetails, 'no cheesy hearts, no childish style');
assert.equal(brief.language, 'English');
assert.deepEqual(brief.additionalDetails, [], 'plumbing fields never leak into the prompt as extra details');

const nested = buildPersonalizationBrief({ formData: { to: 'Mother', recipientName: 'Ana', senderName: 'Leo' } }, 'birthday');
assert.equal(nested.relationship, 'Mother');
assert.equal(nested.signed, 'Leo');

const longMessage = buildPersonalizationBrief({ message: `${'x'.repeat(5000)} the ending matters` }, 'love');
assert.ok(longMessage.message.length <= 3000, 'messages are clamped to the prompt budget');
assert.match(longMessage.message, / … /, 'the clamp drops the middle');
assert.match(longMessage.message, /the ending matters$/, 'the clamp keeps the ending');

// --- SVG prompt ---------------------------------------------------------------

const direction = inferDirectionHeuristically(brief, 5);
assert.equal(direction.register, 'bestie-banter');

const svgPrompt = createNaturalPrompt(richInput, 'birthday', { size: 'square', medium: 'svg', direction });

assert.match(svgPrompt, /THE BRIEF/);
assert.match(svgPrompt, /For: my friend, Maya\./);
assert.match(svgPrompt, /Shared memory: «our rainy coffee walk after the concert»/);
assert.match(svgPrompt, /Recipient traits: funny, gentle, ambitious/);
assert.match(svgPrompt, /Inside joke or motif: «tiny croissants and a blue umbrella»/);
assert.match(svgPrompt, /THE READ/);
assert.match(svgPrompt, /Register: Roast with love \(bestie-banter\)/);
assert.match(svgPrompt, /Palette "[^"]+": ground #[0-9a-f]{6} · ink #[0-9a-f]{6}/);
assert.match(svgPrompt, /TEXT TO SET/);
// The opening sentence is too long to be a headline, so the greeting leads and the words follow as lines.
assert.match(svgPrompt, /headline: «Happy Birthday, Maya»/);
assert.match(svgPrompt, /line 1: «Happy birthday to the person who makes ordinary Tuesdays hilarious\.»/);
assert.match(svgPrompt, /line 2: «Never change, you absolute menace\.»/);
assert.match(svgPrompt, /closing: «Tom»/);
assert.match(svgPrompt, /Avoid: no cheesy hearts, no childish style/);
assert.match(svgPrompt, /Canvas: square/);
assert.match(svgPrompt, /Return only the SVG\./);

// Without an explicit direction the renderer still reads the brief itself.
const selfRead = createNaturalPrompt(richInput, 'birthday', { size: 'portrait', medium: 'svg' });
assert.match(selfRead, /Register: Roast with love \(bestie-banter\)/);

// --- image prompt -------------------------------------------------------------

const imagePrompt = createNaturalPrompt(richInput, 'birthday', { size: 'portrait', medium: 'image', direction });

assert.match(imagePrompt, /Creative intent: a birthday greeting-card image/);
assert.match(imagePrompt, /Recipient: my friend, Maya\. From Tom\./);
assert.match(imagePrompt, /Style family: zine or sticker illustration/);
assert.match(imagePrompt, /Palette "[^"]+": ground #[0-9a-f]{6}/);
assert.match(imagePrompt, /portrait orientation/);
assert.match(imagePrompt, /Lettering, spelled exactly as written/);
assert.match(imagePrompt, /the headline "Happy Birthday, Maya"/);
assert.match(imagePrompt, /one line "Happy birthday to the person who makes ordinary Tuesdays hilarious\."/);
assert.match(imagePrompt, /Avoid: no cheesy hearts, no childish style/);
assert.match(imagePrompt, /Full-bleed, edge-to-edge/);
assert.ok(imagePrompt.length < 4800, 'image prompts must stay under the provider limit');

// --- video prompt -------------------------------------------------------------

const videoPrompt = createNaturalPrompt(richInput, 'birthday', { size: 'landscape', medium: 'video', direction });
assert.match(videoPrompt, /Direct a five-second greeting-card film/);
assert.match(videoPrompt, /Beat 1 \(arrival\)/);
assert.match(videoPrompt, /Beat 3 \(settle\)/);
assert.match(videoPrompt, /Tempo: bouncy/);
assert.match(videoPrompt, /Must loop cleanly/);
assert.ok(videoPrompt.length < 4200);

// --- reference edit prompt ----------------------------------------------------

const likeness = buildReferenceEditPrompt(richInput, 'birthday', { size: 'landscape', direction });
assert.match(likeness, /Keep the subject clearly recognizable/);
assert.match(likeness, /Use a balanced horizontal composition\./);
assert.match(likeness, /Palette: ground #[0-9a-f]{6}/);
assert.match(likeness, /NO text\./);

// --- a thin brief still produces a complete, specific prompt ------------------

const basicPrompt = createNaturalPrompt({ cardType: 'birthday', relationship: 'mother', recipientName: 'Ana' }, 'birthday', {
  size: 'landscape',
  medium: 'svg',
  seed: 3,
});
assert.match(basicPrompt, /For: my mother, Ana\./);
assert.match(basicPrompt, /headline: «Happy Birthday, Ana»/);
assert.match(basicPrompt, /closing: \(none\)/);
assert.match(basicPrompt, /Canvas: landscape/);
assert.doesNotMatch(basicPrompt, /FULL MESSAGE/);

// --- long messages: the read carries the excerpt, the context is trimmed ------

const essay = createNaturalPrompt(
  {
    cardType: 'anniversary',
    to: 'Girlfriend',
    recipientName: 'Aysha',
    message: 'Happy 1st Anniversary, My Love. ' + 'We had beautiful days and difficult moments, but we stayed. '.repeat(60) + 'One year down, forever to go.',
  },
  'anniversary',
  { size: 'portrait', medium: 'svg', seed: 1 }
);
assert.match(essay, /FULL MESSAGE \(for context only/);
assert.match(essay, /headline: «Happy 1st Anniversary, My Love\.»/);
assert.match(essay, /One year down, forever to go\./);
assert.ok(essay.length < 12000, 'the SVG user prompt must stay under the generation guard');

console.log('personalization prompt helpers passed');
