/**
 * The brief: everything the sender told us, normalised.
 *
 * Kept separate from the prompt renderers so the director and the renderers
 * can both depend on it without depending on each other.
 */

export interface PersonalizationBrief {
  cardType: string;
  relationship: string;
  recipientName: string;
  message: string;
  signed: string;
  tone: string;
  language: string;
  design: string;
  customDesign: string;
  yearsTogether: string;
  age: string;
  cardRequirements: string;
  sharedMemory: string;
  recipientTraits: string[];
  relationshipVibe: string;
  insideJokeOrMotif: string;
  avoidDetails: string;
  additionalDetails: string[];
}

/** Fields that are rendered on purpose, or are plumbing — never dumped as "extra details". */
const EXCLUDED_EXTRA_FIELDS = new Set([
  'to',
  'relationship',
  'recipientName',
  'message',
  'signed',
  'senderName',
  'design',
  'customDesign',
  'design_custom',
  'yearsTogether',
  'age',
  'cardRequirements',
  'tone',
  'language',
  'sharedMemory',
  'recipientTraits',
  'relationshipVibe',
  'insideJokeOrMotif',
  'avoidDetails',
  'size',
  'modelId',
  'styleId',
  'outputFormat',
  'imageCount',
  'referenceImageUrls',
  'animationSpeed',
  'loop',
  'styleStrength',
  'duration',
  'variationIndex',
  'isPublic',
  'cardType',
  'modificationFeedback',
  'previousCardId',
  'spotifyTrackId',
  '_direction',
]);

/** Prompt budgets. People paste whole letters; the model needs the heart, not the byte count. */
export const BRIEF_LIMITS = {
  message: 3000,
  sharedMemory: 800,
  short: 300,
} as const;

export function buildPersonalizationBrief(formData: any, cardType: string): PersonalizationBrief {
  const base = (formData?.formData ?? formData ?? {}) as Record<string, unknown>;
  const relationship = stringValue(base.to || base.relationship, BRIEF_LIMITS.short);
  const signed = stringValue(base.signed || base.senderName, BRIEF_LIMITS.short);
  const customDesign = stringValue(base.customDesign || base.design_custom, BRIEF_LIMITS.short);

  return {
    cardType,
    relationship,
    recipientName: stringValue(base.recipientName, BRIEF_LIMITS.short),
    message: clampKeepingEnds(stringValue(base.message, Number.MAX_SAFE_INTEGER), BRIEF_LIMITS.message),
    signed,
    tone: stringValue(base.tone, BRIEF_LIMITS.short).toLowerCase(),
    language: stringValue(base.language, BRIEF_LIMITS.short),
    design: stringValue(base.design, BRIEF_LIMITS.short),
    customDesign,
    yearsTogether: stringValue(base.yearsTogether, 12),
    age: stringValue(base.age, 12),
    cardRequirements: stringValue(base.cardRequirements, BRIEF_LIMITS.short),
    sharedMemory: stringValue(base.sharedMemory, BRIEF_LIMITS.sharedMemory),
    recipientTraits: normalizeTraits(base.recipientTraits),
    relationshipVibe: stringValue(base.relationshipVibe, BRIEF_LIMITS.short),
    insideJokeOrMotif: stringValue(base.insideJokeOrMotif, BRIEF_LIMITS.short),
    avoidDetails: stringValue(base.avoidDetails, BRIEF_LIMITS.short),
    additionalDetails: collectAdditionalDetails(base),
  };
}

/** All the free text the sender wrote, for reading mood and for verifying quotes. */
export function briefText(brief: PersonalizationBrief): string {
  return [brief.recipientName, brief.message, brief.sharedMemory, brief.insideJokeOrMotif, brief.signed, brief.relationshipVibe]
    .filter(Boolean)
    .join('\n');
}

function normalizeTraits(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => stringValue(item, 60)).filter(Boolean).slice(0, 3);
  }

  return stringValue(value, BRIEF_LIMITS.short)
    .split(/[,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function collectAdditionalDetails(base: Record<string, unknown>): string[] {
  const extras: string[] = [];
  Object.entries(base).forEach(([key, value]) => {
    if (EXCLUDED_EXTRA_FIELDS.has(key)) return;
    if (value === null || value === undefined) return;
    if (typeof value === 'string' && value.trim() === '') return;
    if (typeof value === 'object') return;
    const human = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').toLowerCase();
    if (typeof value === 'boolean') {
      if (value) extras.push(`Include ${human} element.`);
    } else {
      extras.push(`${human}: ${String(value).slice(0, BRIEF_LIMITS.short)}.`);
    }
  });
  return extras.slice(0, 8);
}

/**
 * A long letter's heart lives in how it opens and how it closes, so a clamp
 * keeps both ends and drops the middle instead of truncating the ending.
 */
export function clampKeepingEnds(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const tail = Math.floor(limit * 0.25);
  const head = limit - tail - 3;
  return `${text.slice(0, head).trimEnd()} … ${text.slice(text.length - tail).trimStart()}`;
}

function stringValue(value: unknown, limit: number): string {
  if (value === null || value === undefined) return '';
  const text = String(value).trim();
  return text.length > limit ? text.slice(0, limit).trimEnd() : text;
}
