/**
 * Renders a brief plus its read into the user prompt for each medium.
 *
 * The read (CardDirection) carries the register, the palette, the world and
 * the exact text to set; this module turns it into prose for the SVG model,
 * the image model and the video model.
 */

import { buildPersonalizationBrief, type PersonalizationBrief } from './card-brief';
import { describeDirection, inferDirectionHeuristically, hashSeed, type CardDirection, type CardMedium } from './emotion-director';
import { getRegister } from './emotion-registers';
import { GPT_IMAGE_2_PROMPT_LIMIT } from './gpt-image-2';

export type { PersonalizationBrief } from './card-brief';
export { buildPersonalizationBrief } from './card-brief';

interface PromptOptions {
  size?: string;
  medium?: CardMedium;
  /** The director's read. When absent, a heuristic read is used so the prompt still has a register. */
  direction?: CardDirection;
  seed?: number;
}

// Leave room for the selected style and reference-photo instructions.
const IMAGE_PROMPT_LIMIT = GPT_IMAGE_2_PROMPT_LIMIT - 4000;
const VIDEO_PROMPT_LIMIT = 4200;
const MESSAGE_CONTEXT_LIMIT = 1600;

export function createNaturalPrompt(formData: any, cardType: string, opts?: PromptOptions): string {
  const size = opts?.size || 'portrait';
  const medium = opts?.medium || 'image';
  const brief = buildPersonalizationBrief(formData, cardType);
  const direction = opts?.direction || inferDirectionHeuristically(brief, opts?.seed ?? hashSeed(JSON.stringify(brief)));

  if (medium === 'svg') return buildSvgPrompt(brief, direction, size);
  if (medium === 'video') return buildVideoPrompt(brief, direction, size).slice(0, VIDEO_PROMPT_LIMIT);
  return buildImagePrompt(brief, direction, size).slice(0, IMAGE_PROMPT_LIMIT);
}

/** Likeness instructions appended when the sender uploaded reference photos. */
export function buildReferenceEditPrompt(formData: any, cardType: string, opts?: { size?: string; direction?: CardDirection }): string {
  const brief = buildPersonalizationBrief(formData, cardType);
  const direction = opts?.direction || inferDirectionHeuristically(brief, hashSeed(JSON.stringify(brief)));
  const register = getRegister(direction.register);
  const size = opts?.size || 'portrait';
  const orientationLine =
    size === 'landscape'
      ? 'Use a balanced horizontal composition.'
      : size === 'square' || size === 'instagram'
        ? 'Use a centered, balanced square composition.'
        : 'Use a balanced vertical composition.';

  return [
    'Create a high-quality, elegant transformation of the reference photo.',
    'Keep the subject clearly recognizable (face geometry, hairstyle, skin tone, accessories).',
    'Preserve the main clothing colours and patterns but refine them for a premium look.',
    'Make the subject the star; place them inside the world described above.',
    'Subject scale: 65-85% of canvas.',
    orientationLine,
    `Background and mood: ${direction.world} Rendered as ${register.imageStyle}.`,
    `Palette: ground ${direction.palette.ground}, ink ${direction.palette.ink}, accent ${direction.palette.accent}, accent2 ${direction.palette.accent2}; tints and shades only.`,
    'Extend the background to the edges (full-bleed, opaque).',
    direction.spark ? `Hidden detail: ${direction.spark}.` : '',
    direction.avoid.length ? `Avoid: ${direction.avoid.join(', ')}.` : '',
    'Keep the exact greeting, recipient name, and signature specified above, with clear, readable lettering. No additional text. No white borders. No letterboxing.',
    'Respect the reference pose. No watermarks or logos.',
  ]
    .filter(Boolean)
    .join(' ');
}

// ---------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------

function buildSvgPrompt(brief: PersonalizationBrief, direction: CardDirection, size: string): string {
  return [
    'THE BRIEF',
    describeBrief(brief, size),
    '',
    'THE READ (art direction — obey it, improvise inside the register for the rest)',
    describeDirection(direction),
    '',
    fullMessageContext(brief, direction),
    'Return only the SVG.',
  ]
    .filter((part) => part !== null)
    .join('\n')
    .trim();
}

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

function buildImagePrompt(brief: PersonalizationBrief, direction: CardDirection, size: string): string {
  const register = getRegister(direction.register);
  const orientation =
    size === 'landscape'
      ? 'landscape orientation, cinematic depth and horizontal flow'
      : size === 'square' || size === 'instagram'
        ? 'square layout with intentional balance'
        : 'portrait orientation with a clear focal point and breathing room';

  const lettering = buildImageLettering(direction);

  const sections = [
    `Creative intent: a ${brief.cardType} greeting-card image that catches one specific person's mood. ${direction.read}`,
    `Recipient: ${describeRecipient(brief)}${brief.signed ? ` From ${brief.signed}.` : ''}`,
    `Sender's voice: ${direction.voice}`,
    `Register: ${register.name} — ${register.feeling}`,
    `Style family: ${register.imageStyle}.`,
    `World: ${direction.world} Story, frozen at its peak: ${direction.arc}`,
    `Palette "${direction.palette.name}": ground ${direction.palette.ground}, ink ${direction.palette.ink}, accent ${direction.palette.accent}, accent2 ${direction.palette.accent2}. Use these and their tints and shades only. ${direction.palette.note}`,
    `Composition: ${direction.composition} ${orientation}. One clear protagonist at 65-85% of the canvas, generous breathing room, deliberate asymmetry unless the register is ceremonial.`,
    `Material and light: ${direction.texture}. One light source, obeyed by every shadow.`,
    lettering,
    `Hidden detail only they would catch: ${direction.spark}`,
    brief.cardRequirements ? `Specific requests: ${brief.cardRequirements}.` : '',
    brief.additionalDetails.length ? `Additional details: ${brief.additionalDetails.join(' ')}` : '',
    `Avoid: ${[...direction.avoid, 'watermarks', 'logos', 'visual artifacts', 'awkward empty margins', 'stock-card composition'].join(', ')}.`,
    'Full-bleed, edge-to-edge, fully opaque; no borders, no letterboxing. Pristine finish — a gift worth giving.',
  ];

  return sections.filter(Boolean).join('\n\n').trim();
}

function buildImageLettering(direction: CardDirection): string {
  const parts: string[] = [];
  if (direction.headline) parts.push(`the headline "${direction.headline}" in ${direction.type.display}`);
  const shortLine = direction.lines.find((line) => line.length <= 70);
  if (shortLine) parts.push(`one line "${shortLine}" in ${direction.type.body}`);
  if (direction.closing) parts.push(`the sign-off "${direction.closing}" small, like a real signature`);
  if (!parts.length) return 'No lettering; let the image carry the feeling.';
  return `Lettering, spelled exactly as written (keep emoji, elongated words and non-English words untouched): ${parts.join('; ')}. ${direction.type.treatment}. No other text anywhere in the image.`;
}

// ---------------------------------------------------------------------------
// Video
// ---------------------------------------------------------------------------

function buildVideoPrompt(brief: PersonalizationBrief, direction: CardDirection, size: string): string {
  const register = getRegister(direction.register);
  const tempoCamera: Record<CardDirection['motion']['tempo'], string> = {
    still: 'a locked camera with one almost imperceptible drift',
    slow: 'a very slow push-in, nothing else',
    steady: 'a gentle parallax drift',
    lively: 'a slow push-in with one soft reveal',
    bouncy: 'a static frame that lets the elements do the moving',
  };

  return [
    `Direct a five-second greeting-card film for ${describeRecipient(brief)}. ${direction.read}`,
    `Register: ${register.name} — ${register.feeling} Sender's voice: ${direction.voice}`,
    `Art direction: ${register.imageStyle}. World: ${direction.world}`,
    `Palette "${direction.palette.name}": ground ${direction.palette.ground}, ink ${direction.palette.ink}, accent ${direction.palette.accent}, accent2 ${direction.palette.accent2}; tints and shades only.`,
    `Beat 1 (arrival): ${direction.motion.arrival}`,
    `Beat 2 (peak): ${direction.arc}`,
    `Beat 3 (settle): ${direction.motion.presence} The final frame is a composed card that could hold text.`,
    `Tempo: ${direction.motion.tempo}. Camera: ${tempoCamera[direction.motion.tempo]}. No cuts, no shake, no whip pans.`,
    `Material and light: ${direction.texture}. One light source, consistent shadows, warm practicals where they belong.`,
    `Hidden detail only they would catch: ${direction.spark}`,
    'Must loop cleanly — first and last frames match in composition and tone.',
    `Avoid: ${[...direction.avoid, 'overlaid text', 'watermarks', 'logos'].join(', ')}.`,
  ]
    .filter(Boolean)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function describeRecipient(brief: PersonalizationBrief): string {
  if (brief.relationship && brief.recipientName) {
    const relationship = brief.relationship.toLowerCase() === 'myself' ? 'myself' : `my ${brief.relationship.toLowerCase()}`;
    return `${relationship}, ${brief.recipientName}.`;
  }
  if (brief.recipientName) return `${brief.recipientName}.`;
  if (brief.relationship) return `my ${brief.relationship.toLowerCase()}.`;
  return 'someone dear.';
}

function describeBrief(brief: PersonalizationBrief, size: string): string {
  const lines = [
    `- Occasion: ${brief.cardType}`,
    `- For: ${describeRecipient(brief)}`,
    brief.signed ? `- Signed: «${brief.signed}»` : '',
    brief.age ? `- Age: ${brief.age}` : '',
    brief.yearsTogether ? `- Years together: ${brief.yearsTogether}` : '',
    brief.sharedMemory ? `- Shared memory: «${brief.sharedMemory}»` : '',
    brief.insideJokeOrMotif ? `- Inside joke or motif: «${brief.insideJokeOrMotif}»` : '',
    brief.recipientTraits.length ? `- Recipient traits: ${brief.recipientTraits.join(', ')}` : '',
    brief.relationshipVibe ? `- Relationship vibe: ${brief.relationshipVibe}` : '',
    brief.cardRequirements ? `- Specific requests: «${brief.cardRequirements}»` : '',
    brief.design && brief.design !== 'custom' ? `- Requested design note: ${brief.design} (interpret it inside the read's palette)` : '',
    brief.design === 'custom' && brief.customDesign ? `- Requested design note: ${brief.customDesign} (interpret it inside the read's palette)` : '',
    brief.additionalDetails.length ? `- Other details: ${brief.additionalDetails.join(' ')}` : '',
    `- Canvas: ${size}`,
  ];
  return lines.filter(Boolean).join('\n');
}

function fullMessageContext(brief: PersonalizationBrief, direction: CardDirection): string | null {
  if (!brief.message) return null;
  const message = brief.message.length > MESSAGE_CONTEXT_LIMIT ? `${brief.message.slice(0, MESSAGE_CONTEXT_LIMIT).trimEnd()} …` : brief.message;
  const allSet = direction.lines.length && brief.message.length <= 320;
  return [
    allSet
      ? 'FULL MESSAGE (for context; the lines above are the same words):'
      : 'FULL MESSAGE (for context only — set the lines from THE READ, not this whole text):',
    `«${message}»`,
    '',
  ].join('\n');
}
