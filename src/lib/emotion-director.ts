/**
 * The director: reads a brief and casts the card into an emotional register,
 * then makes the concrete art-direction choices inside that register's range.
 *
 * Two readers exist. The LLM reader (directCard) is the real one; the
 * heuristic reader (inferDirectionHeuristically) is what runs when the LLM
 * call fails, times out, or returns something we cannot trust. Both return the
 * same CardDirection so the renderers never care which one spoke.
 */

import {
  DEFAULT_REGISTER_ID,
  EMOTION_REGISTERS,
  REGISTER_IDS,
  describeRegisterCatalog,
  describeRegisterRange,
  getRegister,
  isRegisterId,
  type EmotionRegister,
  type MotionTempo,
  type RegisterId,
  type RegisterPalette,
} from './emotion-registers';
import { briefText, type PersonalizationBrief } from './card-brief';
import { deriveBriefSignals, describeSignals, nameLooksLikeMessage, type BriefSignals } from './brief-signals';
import { OPENROUTER_SVG_MODEL, requestOpenRouterMessage } from './openrouter';

export type CardMedium = 'svg' | 'image' | 'video';

export interface DirectionLevels {
  energy: number;
  warmth: number;
  formality: number;
  playfulness: number;
  gravity: number;
}

export interface DirectionPalette extends RegisterPalette {
  note: string;
}

export interface CardDirection {
  register: RegisterId;
  undertone: RegisterId | null;
  confidence: number;
  /** What the sender feels, what they cannot quite say, what the recipient must feel. */
  read: string;
  /** How the sender writes: language, register, emoji, energy. */
  voice: string;
  language: string;
  script: string;
  levels: DirectionLevels;
  /** The one visual world the card lives in, drawn from the message. */
  world: string;
  /** The card's story from first frame to settled state. */
  arc: string;
  palette: DirectionPalette;
  type: { display: string; body: string; treatment: string };
  composition: string;
  motion: { tempo: MotionTempo; arrival: string; presence: string };
  texture: string;
  /** Exact headline text, in the sender's language and voice. */
  headline: string;
  /** Exact message lines to set, verbatim and in order. */
  lines: string[];
  /** Exact sign-off, or null. */
  closing: string | null;
  /** The hidden detail only the recipient would catch. */
  spark: string;
  avoid: string[];
  source: 'director' | 'heuristic';
  seed: number;
  model?: string;
}

export interface DirectCardOptions {
  brief: PersonalizationBrief;
  medium: CardMedium;
  seed: number;
  model?: string;
  apiKey?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/** Past this the heuristic reader takes over so a slow director never stalls a card. */
export const DIRECTOR_TIMEOUT_MS = Number(process.env.CARD_DIRECTOR_TIMEOUT_MS) || 20000;
const DIRECTOR_MAX_TOKENS = 1400;
const HEX_PATTERN = /^#[0-9a-f]{6}$/i;
const TEMPOS: MotionTempo[] = ['still', 'slow', 'steady', 'lively', 'bouncy'];
const NON_ALNUM = new RegExp(String.raw`[^\p{L}\p{N}]+`, 'gu');
const EMOJI_AND_JOINERS = new RegExp(String.raw`[\p{Extended_Pictographic}️‍]`, 'gu');

export function getDirectorModel(): string {
  return process.env.CARD_DIRECTOR_MODEL || OPENROUTER_SVG_MODEL;
}

/** Stable small integer from any string, for seeded variety. */
export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash % 1000;
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

export function buildDirectorSystemPrompt(): string {
  const ranges = REGISTER_IDS.map((id) => describeRegisterRange(EMOTION_REGISTERS[id], { forDirector: true })).join('\n\n');

  return `You are the READER for a small greeting-card studio. Before anything gets designed, you read the brief the way a close friend reads a late-night text: what is this person actually feeling, how do they talk, what do they need the other person to feel? Then you cast the card into ONE emotional register and hand the designers concrete, specific direction.

You are not designing the occasion. You are designing this sender's state of mind, for this recipient. A "birthday" can be a party, a blessing, a quiet devotion or a roast. A "sorry" can be pleading, steady or cute. The message decides, never the card type.

## HOW TO READ
- Read the message first and the occasion last.
- The name field may hold a nickname, a pet name, emoji, or even the whole message (people paste their wishes there). Whatever is there is voice — use it.
- Language: detect the language(s) and script. Romanized Hindi, Urdu, Tamil, Bengali, Punjabi, Turkish, Portuguese and friends are NOT typos and must be kept exactly. Notice code-switching (Hinglish, Tanglish) and keep it.
- Emoji are mood data: 😭🥺😢💔 pleading or hurt; 😂😁🤣 banter; 🫶🥹 tender affection; ❤️💗😘🥰 gushing; 🎉🥳🎂 loud party; 🙏 blessing or respect.
- Elongated words (sooooo, youuuu, sorryyyy) are intensity and youth. That voice belongs on the card exactly as written.
- ALL CAPS is volume. A very long message is devotion plus the need to be heard: the card cannot hold an essay, so choose the lines that carry its heart.
- Chips (traits, vibe) are hints, not verdicts. If they conflict with the message, the message wins.
- A thin brief (name and occasion only): read the relationship, the style of the name and the occasion, choose a register that suits a first-time sender, and still make it specific rather than generic.
- Never invent facts about the people. Never rewrite, translate or "improve" the sender's words.

## THE REGISTERS (choose ONE primary; optionally ONE undertone that adds a single element)
${describeRegisterCatalog()}

## EACH REGISTER'S RANGE (your concrete picks must live inside the chosen register's range)
${ranges}

## OUTPUT
Return ONLY a JSON object — no markdown fences, no commentary — with exactly these keys:
{
  "register": "<register id>",
  "undertone": "<register id or null>",
  "confidence": <0 to 1>,
  "read": "2-3 sentences: what the sender feels, what they cannot quite say, what they need the recipient to feel.",
  "voice": "One sentence on how they write: language(s), register (teen texting, formal, poetic...), emoji use, energy.",
  "language": "e.g. Hinglish, Tanglish, English, Turkish",
  "script": "latin | devanagari | tamil | arabic | bengali | cjk | mixed | ...",
  "levels": { "energy": 1-5, "warmth": 1-5, "formality": 1-5, "playfulness": 1-5, "gravity": 1-5 },
  "world": "The single visual world the card lives in, drawn from THIS message rather than the occasion. One concrete sentence.",
  "arc": "The card's story in one sentence: what happens from the first frame to the settled state.",
  "palette": { "name": "...", "ground": "#rrggbb", "ink": "#rrggbb", "accent": "#rrggbb", "accent2": "#rrggbb", "note": "why these colours fit this mood" },
  "type": { "display": "the headline voice", "body": "the message voice", "treatment": "one typographic move (size, case, spacing, a hand-drawn word...)" },
  "composition": "One sentence.",
  "motion": { "tempo": "still | slow | steady | lively | bouncy", "arrival": "the one-time entrance", "presence": "the looping idle" },
  "texture": "The material of the card.",
  "headline": "The exact headline text in the sender's language and voice, six words or fewer; it may carry one of their emoji.",
  "lines": ["Exact message lines to set, verbatim and in order: four at most, each under 120 characters, about 320 characters in total — a card is not a letter. Keep spelling, elongations, code-switching and emoji. For a long message pick the two or three sentences that carry its heart. Empty array if there is no message."],
  "closing": "The exact sign-off from the signed field, verbatim, or null.",
  "spark": "One hidden detail only the recipient would catch, derived from the brief (a memory, a joke, an age, an initial).",
  "avoid": ["things that would break this mood"]
}

Rules: hex colours are real six-digit hex inside the chosen register's palette family (pick one of its named palettes or tune it; never leave the family). Tempo must fit the register. Quote the sender exactly — a line that is not a verbatim quote will be thrown away. If the message is empty, the headline is the occasion greeting in the sender's likely language and "lines" is [].`;
}

export function buildDirectorUserPrompt(
  brief: PersonalizationBrief,
  signals: BriefSignals,
  opts: { medium: CardMedium; seed: number; size?: string }
): string {
  const q = (value: string) => `«${value}»`;
  const relationship = brief.relationship
    ? brief.relationship.toLowerCase() === 'myself'
      ? 'myself'
      : `my ${brief.relationship.toLowerCase()}`
    : 'someone';
  const mediumLabel =
    opts.medium === 'svg'
      ? `an animated SVG card (${opts.size || 'portrait'})`
      : opts.medium === 'image'
        ? 'a static image card'
        : 'a five-second video card';

  const lines = [
    'BRIEF',
    `- Occasion / card type: ${brief.cardType}`,
    `- For: ${relationship} — name field: ${brief.recipientName ? q(brief.recipientName) : '(empty)'}`,
    `- Signed: ${brief.signed ? q(brief.signed) : '(empty)'}`,
    brief.age ? `- Age: ${brief.age}` : '',
    brief.yearsTogether ? `- Years together: ${brief.yearsTogether}` : '',
    `- Message (verbatim): ${brief.message ? q(brief.message) : '(empty)'}`,
    brief.sharedMemory ? `- Shared memory or recent moment: ${q(brief.sharedMemory)}` : '',
    brief.insideJokeOrMotif ? `- Inside joke or motif: ${q(brief.insideJokeOrMotif)}` : '',
    brief.recipientTraits.length ? `- Recipient traits (chips): ${brief.recipientTraits.join(', ')}` : '',
    brief.relationshipVibe ? `- Relationship vibe (chip): ${brief.relationshipVibe}` : '',
    brief.tone ? `- Requested tone: ${brief.tone}` : '',
    brief.language ? `- Requested language: ${brief.language}` : '',
    brief.design && brief.design !== 'custom' ? `- Requested palette or design: ${brief.design}` : '',
    brief.design === 'custom' && brief.customDesign ? `- Requested palette or design: ${brief.customDesign}` : '',
    brief.cardRequirements ? `- Specific requests: ${q(brief.cardRequirements)}` : '',
    brief.avoidDetails ? `- Avoid: ${q(brief.avoidDetails)}` : '',
    brief.additionalDetails.length ? `- Other details: ${brief.additionalDetails.join(' ')}` : '',
    `- Output medium: ${mediumLabel}`,
    '',
    'WHAT THE MACHINE NOTICED (verify, do not trust blindly)',
    describeSignals(signals),
    '',
    `Variation seed: ${opts.seed}. When two choices are equally right, take the (seed mod n)-th option so two similar briefs do not get the same card.`,
    '',
    'Read, then return the JSON.',
  ];

  return lines.filter(Boolean).join('\n');
}

// ---------------------------------------------------------------------------
// Parsing and validation
// ---------------------------------------------------------------------------

export function parseDirectionJson(text: string): Record<string, unknown> | null {
  if (!text) return null;
  const candidates: string[] = [];
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.push(fenced[1]);
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) candidates.push(text.slice(first, last + 1));
  candidates.push(text);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.trim());
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

function canon(text: string): string {
  return text.replace(EMOJI_AND_JOINERS, ' ').toLowerCase().replace(NON_ALNUM, ' ').trim();
}

/** True when `line` is a verbatim quote from what the sender wrote. */
export function isQuotedFromBrief(line: string, brief: PersonalizationBrief): boolean {
  const needle = canon(line);
  if (needle.length < 2) return false;
  return canon(briefText(brief)).includes(needle);
}

/** A card holds a few lines, not a letter: at most five lines and roughly 360 characters, kept in order. */
export const LINE_BUDGET = { maxLines: 5, maxChars: 360 } as const;

export function fitLineBudget(lines: string[]): string[] {
  const kept: string[] = [];
  let total = 0;
  for (const line of lines) {
    if (kept.length >= LINE_BUDGET.maxLines) break;
    if (total + line.length > LINE_BUDGET.maxChars && kept.length > 0) break;
    kept.push(line);
    total += line.length;
  }
  return kept;
}

function str(value: unknown, limit: number): string {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  return text.length > limit ? text.slice(0, limit).trimEnd() : text;
}

function level(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(5, Math.max(1, Math.round(n)));
}

function paletteFrom(raw: unknown, fallback: DirectionPalette): DirectionPalette {
  if (!raw || typeof raw !== 'object') return fallback;
  const p = raw as Record<string, unknown>;
  const hex = (v: unknown) => (typeof v === 'string' && HEX_PATTERN.test(v.trim()) ? v.trim().toLowerCase() : null);
  const ground = hex(p.ground);
  const ink = hex(p.ink);
  const accent = hex(p.accent);
  const accent2 = hex(p.accent2) || accent;
  if (!ground || !ink || !accent || !accent2 || ground === ink) return fallback;
  return {
    name: str(p.name, 60) || fallback.name,
    ground,
    ink,
    accent,
    accent2,
    note: str(p.note, 240) || fallback.note,
  };
}

export function normalizeDirection(
  raw: Record<string, unknown>,
  brief: PersonalizationBrief,
  signals: BriefSignals,
  seed: number,
  meta: { source: 'director' | 'heuristic'; model?: string }
): CardDirection {
  const heuristic = inferDirectionHeuristically(brief, seed, signals);
  const register: RegisterId = isRegisterId(raw.register) ? raw.register : heuristic.register;
  const def = register === heuristic.register ? heuristic : buildDefaultDirection(getRegister(register), brief, signals, seed, heuristic.undertone);
  const undertone = isRegisterId(raw.undertone) && raw.undertone !== register ? raw.undertone : null;

  const rawLevels = (raw.levels && typeof raw.levels === 'object' ? raw.levels : {}) as Record<string, unknown>;
  const rawType = (raw.type && typeof raw.type === 'object' ? raw.type : {}) as Record<string, unknown>;
  const rawMotion = (raw.motion && typeof raw.motion === 'object' ? raw.motion : {}) as Record<string, unknown>;

  const rawLines = Array.isArray(raw.lines) ? raw.lines : [];
  const lines = fitLineBudget(
    rawLines.map((l) => str(l, 200)).filter((l) => l.length > 0 && isQuotedFromBrief(l, brief))
  );

  const confidence = typeof raw.confidence === 'number' && Number.isFinite(raw.confidence) ? Math.min(1, Math.max(0, raw.confidence)) : 0.5;
  const tempo = TEMPOS.includes(rawMotion.tempo as MotionTempo) ? (rawMotion.tempo as MotionTempo) : def.motion.tempo;

  const avoid = (Array.isArray(raw.avoid) ? raw.avoid : [])
    .map((a) => str(a, 120))
    .filter(Boolean)
    .slice(0, 8);
  if (brief.avoidDetails && !avoid.some((a) => a.toLowerCase().includes(brief.avoidDetails.toLowerCase()))) {
    avoid.unshift(brief.avoidDetails);
  }

  const closingRaw = raw.closing;
  const closing = typeof closingRaw === 'string' && closingRaw.trim() ? str(closingRaw, 120) : closingRaw === null ? null : def.closing;

  return {
    register,
    undertone,
    confidence,
    read: str(raw.read, 600) || def.read,
    voice: str(raw.voice, 300) || def.voice,
    language: str(raw.language, 60) || def.language,
    script: str(raw.script, 30) || def.script,
    levels: {
      energy: level(rawLevels.energy, def.levels.energy),
      warmth: level(rawLevels.warmth, def.levels.warmth),
      formality: level(rawLevels.formality, def.levels.formality),
      playfulness: level(rawLevels.playfulness, def.levels.playfulness),
      gravity: level(rawLevels.gravity, def.levels.gravity),
    },
    world: str(raw.world, 400) || def.world,
    arc: str(raw.arc, 400) || def.arc,
    palette: paletteFrom(raw.palette, def.palette),
    type: {
      display: str(rawType.display, 200) || def.type.display,
      body: str(rawType.body, 200) || def.type.body,
      treatment: str(rawType.treatment, 200) || def.type.treatment,
    },
    composition: str(raw.composition, 300) || def.composition,
    motion: {
      tempo,
      arrival: str(rawMotion.arrival, 300) || def.motion.arrival,
      presence: str(rawMotion.presence, 300) || def.motion.presence,
    },
    texture: str(raw.texture, 200) || def.texture,
    headline: str(raw.headline, 90) || def.headline,
    lines: lines.length || !brief.message ? lines : def.lines,
    closing,
    spark: str(raw.spark, 300) || def.spark,
    avoid: avoid.length ? avoid : def.avoid,
    source: meta.source,
    seed,
    model: meta.model,
  };
}

// ---------------------------------------------------------------------------
// Heuristic reader
// ---------------------------------------------------------------------------

type Bucket = 'sorry' | 'love' | 'anniversary' | 'birthday' | 'thanks' | 'congrats' | 'care' | 'holiday' | 'baby' | 'parents' | 'other';

const ROMANTIC_RELATIONSHIPS = ['girlfriend', 'boyfriend', 'wife', 'husband', 'partner', 'spouse', 'crush', 'fiance', 'fiancé', 'fiancée', 'lover'];
const ELDER_RELATIONSHIPS = ['mother', 'mom', 'father', 'dad', 'grandparent', 'grandma', 'grandpa', 'teacher', 'mentor', 'boss', 'uncle', 'aunt'];

const BUCKET_REGISTERS: Record<Bucket, RegisterId[]> = {
  sorry: ['pleading-apology', 'gentle-repair', 'playful-apology'],
  love: ['gushing-love', 'quiet-devotion', 'sweet-flirt', 'tender-nostalgia', 'pleading-apology'],
  anniversary: ['quiet-devotion', 'gushing-love', 'proud-milestone', 'tender-nostalgia', 'loud-celebration'],
  birthday: ['warm-wish', 'loud-celebration', 'bestie-banter', 'gushing-love', 'quiet-devotion', 'sacred-blessing', 'cool-minimal', 'sweet-flirt', 'tender-nostalgia'],
  thanks: ['grateful-glow', 'proud-milestone', 'sacred-blessing', 'bestie-banter', 'warm-wish'],
  congrats: ['proud-milestone', 'loud-celebration', 'warm-wish', 'bestie-banter'],
  care: ['comfort-and-care', 'warm-wish', 'bestie-banter'],
  holiday: ['festive-gathering', 'sacred-blessing', 'warm-wish', 'loud-celebration'],
  baby: ['warm-wish', 'quiet-devotion', 'gushing-love', 'loud-celebration'],
  parents: ['grateful-glow', 'quiet-devotion', 'warm-wish', 'sacred-blessing', 'bestie-banter'],
  other: REGISTER_IDS,
};

function bucketFor(cardType: string): Bucket {
  const t = cardType.toLowerCase();
  if (/sorry|apolog|forgive/.test(t)) return 'sorry';
  if (/anniversary|wedding|marriage/.test(t)) return 'anniversary';
  if (/valentine|love|romance|crush|miss-you|missyou/.test(t)) return 'love';
  if (/birthday|bday/.test(t)) return 'birthday';
  if (/thank|teacher|appreciation|gratitude/.test(t)) return 'thanks';
  if (/congrat|graduat|promotion|new-job|newjob|achievement|success|farewell|retire/.test(t)) return 'congrats';
  if (/get-well|getwell|sympathy|condolence|comfort|recovery|encourage/.test(t)) return 'care';
  if (/christmas|xmas|diwali|eid|newyear|new-year|chinesenewyear|lunar|holiday|halloween|easter|midautumn|thanksgiving|hanukkah|pongal|holi|navratri|ramadan/.test(t)) return 'holiday';
  if (/baby|newborn|shower/.test(t)) return 'baby';
  if (/mother|father|mom|dad|parents|womensday|grandparent/.test(t)) return 'parents';
  return 'other';
}

function hasAny(text: string, words: string[]): number {
  let hits = 0;
  for (const w of words) if (text.includes(w)) hits += 1;
  return hits;
}

function emojiHits(emoji: string[], set: string): number {
  return emoji.filter((e) => set.includes(e.replace(/️/g, ''))).length;
}

export function scoreRegisters(brief: PersonalizationBrief, signals: BriefSignals): Record<RegisterId, number> {
  const text = briefText(brief).toLowerCase();
  const relationship = brief.relationship.toLowerCase();
  const vibe = brief.relationshipVibe.toLowerCase();
  const traits = brief.recipientTraits.map((t) => t.toLowerCase());
  const bucket = bucketFor(brief.cardType);
  const romantic = ROMANTIC_RELATIONSHIPS.some((r) => relationship.includes(r));
  const elder = ELDER_RELATIONSHIPS.some((r) => relationship.includes(r));
  const funny = traits.includes('funny');
  const playful = vibe === 'playful';
  const emoji = signals.emoji;
  const elongated = signals.elongatedWords;
  const yearsTogether = parseInt(brief.yearsTogether, 10) || 0;

  const sadEmoji = emojiHits(emoji, '😭🥺😢💔😞😔🤧😖🥲');
  const laughEmoji = emojiHits(emoji, '😂🤣😁😆🤪😜😹🙈');
  const loveEmoji = emojiHits(emoji, '❤💗💞💕😘🥰😍💖💓❣🩷💜💛🤍🩵🫂💋');
  const tenderEmoji = emojiHits(emoji, '🫶🥹😚☺');
  const partyEmoji = emojiHits(emoji, '🎉🥳🎂🎈🎊🎁🍰🕺💃🎀');
  const prayEmoji = emojiHits(emoji, '🙏🕉☪✝🤲🌙');

  const s: Record<RegisterId, number> = Object.fromEntries(REGISTER_IDS.map((id) => [id, 0])) as Record<RegisterId, number>;

  s['pleading-apology'] +=
    sadEmoji * 2 +
    hasAny(text, ['plz', 'please', 'maan jao', 'mana jao', 'maan ja', 'forgive', 'maaf', 'maafi', "don't leave", 'dont leave', 'never again', 'last chance', 'sorry na', 'i promise', 'pls', 'not leave']) +
    elongated.filter((w) => /sorr|pl(ea)?s|forgiv/.test(w)).length * 2 +
    (bucket === 'sorry' ? 1 : 0);

  s['gentle-repair'] +=
    (bucket === 'sorry' && signals.emojiCount === 0 ? 2 : 0) +
    hasAny(text, ['i was wrong', 'my mistake', 'i take', 'apologize', 'apologise', 'responsibility', 'i understand', 'make it right', 'do better']) +
    (bucket === 'sorry' && vibe === 'respectful' ? 1 : 0);

  s['playful-apology'] +=
    (bucket === 'sorry' ? laughEmoji * 2 + emojiHits(emoji, '😅🙈') * 2 : 0) +
    (bucket === 'sorry' ? hasAny(text, ['btw', 'pinky', 'promise', 'cutie', 'kidding', 'still sorry', 'ok fine', 'okay fine']) : 0) +
    (bucket === 'sorry' && (funny || playful) ? 2 : 0);

  s['gushing-love'] +=
    loveEmoji * 1.5 +
    elongated.filter((w) => /lov|you|much|miss|jaan|baby|ily|forever/.test(w)).length * 1.5 +
    hasAny(text, ['love you so much', 'i love you', 'my everything', 'jaan', 'jaanu', 'meri jaan', 'my world', 'soulmate', 'ilysm', 'ily', 'whole heart', 'love youuu']) +
    (bucket === 'love' ? 1 : 0);

  s['quiet-devotion'] +=
    hasAny(text, ['home', 'forever', 'always', 'every day', 'choose you', 'grateful for you', 'my person', 'safe', 'with you', 'stay with u', 'stay with you']) +
    (yearsTogether >= 3 ? 1 : 0) +
    (yearsTogether >= 10 ? 1 : 0) +
    (romantic && /wife|husband|spouse/.test(relationship) ? 1 : 0) +
    (bucket === 'anniversary' || bucket === 'love' ? 1 : 0) +
    (elongated.length === 0 && signals.emojiCount <= 2 && signals.messageWords > 20 && (bucket === 'love' || bucket === 'anniversary') ? 1 : 0);

  s['sweet-flirt'] +=
    tenderEmoji * 1.5 +
    emojiHits(emoji, '😉😚💘🫠') * 2 +
    hasAny(text, ['crush', 'cutie', 'cute', 'madam ji', 'mine girl', 'shy', 'pretty', 'handsome', 'butterflies', 'date me']) +
    (bucket === 'love' && signals.messageWords < 25 ? 1 : 0) +
    (vibe === 'romantic' && signals.messageWords < 25 && !sadEmoji ? 1 : 0) +
    (signals.hasPetName && romantic && signals.messageWords < 25 ? 1 : 0);

  // Party emoji are the default garnish on any birthday text, so they count once each and only up to three;
  // volume (caps, exclamation floods) is the stronger evidence of a loud sender.
  s['loud-celebration'] +=
    (signals.capsRatio >= 0.6 ? 3 : 0) +
    Math.min(partyEmoji, 3) +
    (signals.exclamations >= 3 ? 1 : 0) +
    hasAny(text, ['happiest', 'many more happy returns', 'party', 'cheers', 'hbd', 'yayy', 'woohoo', 'let\'s celebrate']) +
    (bucket === 'birthday' || bucket === 'congrats' ? 0.5 : 0);

  s['warm-wish'] +=
    hasAny(text, ['stay blessed', 'keep smiling', 'hope this year', 'may this year', 'wish you', 'all the best', 'dreams come true', 'stay happy', 'happy birthday', 'best wishes', 'good luck']) +
    (bucket === 'birthday' ? 1 : 0);

  s['bestie-banter'] +=
    laughEmoji * 2 +
    hasAny(text, ['idiot', 'pagal', 'lol', 'lmao', 'haha', 'bakbak', 'doremon', 'doraemon', 'churail', 'kalbo', 'stupid', 'dumb', 'roast', 'annoying', 'drama', 'crazy', 'weird', 'bestie', 'besties', 'kidding']) +
    (funny ? 1 : 0) +
    (playful ? 1 : 0) +
    (brief.insideJokeOrMotif ? 1 : 0) +
    (funny && playful ? 1 : 0);

  s['tender-nostalgia'] +=
    hasAny(text, ['miss', 'old us', 'remember', 'yaad', 'those days', 'back then', 'used to', 'memories', 'childhood', 'school days', 'college days', 'first time', 'still remember']) * 1.5 +
    (vibe === 'nostalgic' ? 2 : 0) +
    (brief.sharedMemory && /miss|remember|yaad|old/.test(brief.sharedMemory.toLowerCase()) ? 1 : 0);

  s['proud-milestone'] +=
    (bucket === 'congrats' ? 3 : 0) +
    hasAny(text, ['congrat', 'proud', 'graduat', 'promotion', 'achiev', 'new job', 'passed', 'exam', 'degree', 'milestone', 'well done', 'you did it']) +
    (yearsTogether >= 10 && bucket === 'anniversary' ? 1 : 0);

  s['grateful-glow'] +=
    (bucket === 'thanks' ? 3 : 0) +
    hasAny(text, ['thank', 'thanks', 'grateful', 'gratitude', 'teacher', 'mentor', 'guidance', 'support', 'appreciate', 'shukriya', 'nandri']) +
    (bucket === 'parents' ? 1 : 0);

  s['comfort-and-care'] +=
    (bucket === 'care' ? 3 : 0) +
    hasAny(text, ['get well', 'eat', 'rest', 'health', 'take care', 'recover', 'hospital', 'stay strong', 'here for you', 'sick', 'medicine', 'sleep', 'feel better', 'not alone']);

  s['sacred-blessing'] +=
    hasAny(text, ['god bless', 'bhagwan', 'allah', 'dua', 'inshallah', 'mashallah', 'blessing', 'bless you', 'may god', 'prayers', 'khuda', 'waheguru', 'jesus', 'lord', 'ameen', 'amen', 'bhagavan', 'iswar', 'ishwar']) * 2 +
    prayEmoji * 1.5 +
    (elder && vibe === 'respectful' ? 1 : 0) +
    (bucket === 'holiday' && /diwali|eid|ramadan|pongal|navratri|christmas/.test(brief.cardType.toLowerCase()) ? 1 : 0);

  s['cool-minimal'] +=
    (signals.messageChars > 0 && signals.messageChars <= 40 && signals.emojiCount === 0 && elongated.length === 0 && signals.exclamations <= 1 && bucket !== 'sorry' ? 2 : 0) +
    (vibe === 'respectful' && signals.messageChars <= 40 && signals.emojiCount === 0 ? 1 : 0) +
    (signals.isThin && signals.emojiCount === 0 && !signals.hasPetName && !romantic && bucket !== 'sorry' ? 0.5 : 0);

  s['festive-gathering'] +=
    (bucket === 'holiday' ? 3 : 0) +
    hasAny(text, ['diwali', 'christmas', 'eid', 'new year', 'navratri', 'holi', 'pongal', 'hanukkah', 'thanksgiving', 'merry', 'happy holidays', 'chinese new year', 'lunar']);

  return s;
}

export function inferRegister(brief: PersonalizationBrief, signals: BriefSignals): { register: RegisterId; undertone: RegisterId | null } {
  const scores = scoreRegisters(brief, signals);
  const bucket = bucketFor(brief.cardType);
  const allowed = BUCKET_REGISTERS[bucket];
  const relationship = brief.relationship.toLowerCase();
  const romantic = ROMANTIC_RELATIONSHIPS.some((r) => relationship.includes(r));

  let register: RegisterId = allowed[0];
  let best = -1;
  for (const id of allowed) {
    if (scores[id] > best) {
      best = scores[id];
      register = id;
    }
  }

  if (best <= 0) {
    // Nothing in the message pointed anywhere: choose the honest default for the occasion.
    if (bucket === 'sorry') register = romantic || signals.emojiCount > 0 || signals.hasPetName ? 'pleading-apology' : 'gentle-repair';
    else if (bucket === 'love') register = romantic && signals.hasPetName ? 'sweet-flirt' : 'quiet-devotion';
    else if (bucket === 'other') register = DEFAULT_REGISTER_ID;
    else register = allowed[0];
  }

  let undertone: RegisterId | null = null;
  let undertoneScore = 1.5;
  for (const id of REGISTER_IDS) {
    if (id === register) continue;
    if (scores[id] > undertoneScore) {
      undertoneScore = scores[id];
      undertone = id;
    }
  }

  return { register, undertone };
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function firstSentence(text: string): string {
  const line = text.split(/\n+/).map((l) => l.trim()).find(Boolean) || '';
  const match = line.match(/^.*?[.!?…](?=\s|$)/);
  return (match ? match[0] : line).trim();
}

const HAS_WORD = new RegExp(String.raw`[\p{L}\p{N}]`, 'u');

function splitSentences(text: string): string[] {
  const fragments = text
    .split(/\n+|(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  // A trailing "❤️" or "!!!" is punctuation for the sentence before it, not a line of its own.
  const sentences: string[] = [];
  for (const fragment of fragments) {
    if (!HAS_WORD.test(fragment) && sentences.length) sentences[sentences.length - 1] += ` ${fragment}`;
    else if (HAS_WORD.test(fragment)) sentences.push(fragment);
  }
  return sentences;
}

function clauseSplit(sentence: string, limit: number): string[] {
  if (sentence.length <= limit) return [sentence];
  const parts: string[] = [];
  let rest = sentence;
  while (rest.length > limit) {
    const window = rest.slice(0, limit);
    const cut = Math.max(window.lastIndexOf(', '), window.lastIndexOf(' and '), window.lastIndexOf('; '), window.lastIndexOf(' '));
    const at = cut > limit * 0.4 ? cut + 1 : limit;
    parts.push(rest.slice(0, at).trim());
    rest = rest.slice(at).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

const GREETING_OPENER = /^(happy|happiest|sorry|i'm sorry|im sorry|thank|thanks|congrat|welcome|merry|feliz|alles gute|joyeux)/i;

export function chooseHeadlineAndLines(brief: PersonalizationBrief, register: EmotionRegister): { headline: string; lines: string[] } {
  const nameIsMessage = nameLooksLikeMessage(brief.recipientName);
  const name = brief.recipientName && brief.recipientName.length <= 24 && !nameIsMessage ? brief.recipientName : '';
  // People paste their whole greeting into the name field; those are the sender's words too.
  const message = brief.message.trim() || (nameIsMessage ? brief.recipientName.trim() : '');

  if (!message) {
    const greeting = occasionGreeting(brief.cardType, name, register.id);
    const lines = brief.sharedMemory ? clauseSplit(brief.sharedMemory, 150).slice(0, 2) : [];
    return { headline: greeting, lines };
  }

  const sentences = splitSentences(message);
  const opener = firstSentence(message);
  let headline = '';
  let body = sentences;
  const openerWords = opener.split(/\s+/);
  if (opener && opener.length <= 60 && openerWords.length <= 8) {
    headline = opener;
    body = sentences.slice(1);
  } else if (GREETING_OPENER.test(opener) && !/[.!?…]/.test(opener) && openerWords.slice(0, 5).join(' ').length <= 45) {
    // An unpunctuated greeting that runs on ("HAPPIEST BIRTHDAY MY DEAR JAANUUU 💗 MANY MORE...") keeps its own first words as the headline;
    // a proper sentence that merely starts with "Happy" keeps the occasion greeting instead.
    headline = openerWords.slice(0, 5).join(' ');
  } else {
    headline = occasionGreeting(brief.cardType, name, register.id);
  }

  // The heart of a long letter usually lives in how it opens and how it closes.
  const chosen = body.length <= 4 ? body : [body[0], ...body.slice(-3)];

  const lines: string[] = [];
  for (const sentence of chosen) {
    for (const part of clauseSplit(sentence, 150)) {
      if (lines.length >= LINE_BUDGET.maxLines) break;
      lines.push(part);
    }
  }
  return { headline, lines: fitLineBudget(lines) };
}

export function occasionGreeting(cardType: string, name: string, register: RegisterId): string {
  const bucket = bucketFor(cardType);
  const suffix = name ? `, ${name}` : '';
  switch (bucket) {
    case 'sorry':
      return register === 'playful-apology' ? `Sorry${suffix}` : `I'm sorry${suffix}`;
    case 'love':
      return register === 'sweet-flirt' ? `Hey${suffix}` : `I love you${suffix}`;
    case 'anniversary':
      return `Happy Anniversary${suffix}`;
    case 'birthday':
      return register === 'loud-celebration' ? `HAPPY BIRTHDAY${suffix ? suffix.toUpperCase() : ''}` : `Happy Birthday${suffix}`;
    case 'thanks':
      return `Thank you${suffix}`;
    case 'congrats':
      return `Congratulations${suffix}`;
    case 'care':
      return `Thinking of you${suffix}`;
    case 'holiday':
      return `Happy holidays${suffix}`;
    case 'baby':
      return `Welcome, little one`;
    case 'parents':
      return `With love${suffix}`;
    default: {
      const label = cardType.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return `${label}${suffix}`;
    }
  }
}

function buildSpark(brief: PersonalizationBrief, register: EmotionRegister, seed: number): string {
  const seeds = [
    brief.insideJokeOrMotif && `the inside joke or motif "${brief.insideJokeOrMotif}", drawn small and literal somewhere only they would look`,
    brief.sharedMemory && `the shared memory ("${brief.sharedMemory.slice(0, 120)}"), reduced to one tiny object in the scene`,
    brief.age && `their age (${brief.age}) hidden as a count — that many of the smallest element`,
    brief.yearsTogether && `the ${brief.yearsTogether} years together hidden as a count of rings, stars or marks`,
    brief.recipientName && `the initial "${brief.recipientName.trim().charAt(0).toUpperCase()}" worked quietly into the world`,
  ].filter(Boolean) as string[];
  if (!seeds.length) return `one small surprising detail in the ${pick(register.worlds, seed)} that rewards a second look`;
  return seeds[0];
}

function buildDefaultDirection(
  register: EmotionRegister,
  brief: PersonalizationBrief,
  signals: BriefSignals,
  seed: number,
  undertone: RegisterId | null
): CardDirection {
  const palette = pick(register.palettes, seed);
  const typeVoice = pick(register.typeVoices, seed, 1);
  const composition = pick(register.compositions, seed, 2);
  const arrival = pick(register.motion.arrivals, seed, 3);
  const presence = pick(register.motion.presences, seed, 4);
  const texture = pick(register.textures, seed, 5);
  const { headline, lines } = chooseHeadlineAndLines(brief, register);

  const world = brief.insideJokeOrMotif
    ? `${pick(register.worlds, seed)}, with the inside joke ("${brief.insideJokeOrMotif}") drawn into it literally`
    : brief.sharedMemory
      ? `${pick(register.worlds, seed)}, set inside the shared memory: ${brief.sharedMemory.slice(0, 140)}`
      : pick(register.worlds, seed);

  const relationship = brief.relationship ? brief.relationship.toLowerCase() : 'someone';
  const levels = defaultLevels(register.id, signals);

  return {
    register: register.id,
    undertone,
    confidence: 0.4,
    read: `${register.senderState} Written to ${relationship}${brief.recipientName ? ` (${brief.recipientName})` : ''}. The recipient should feel: ${register.feeling}`,
    voice: `${signals.language}${signals.codeSwitch ? ' mixed with English' : ''}; ${signals.emojiCount ? `uses emoji (${signals.emoji.slice(0, 4).join(' ')})` : 'no emoji'}; ${signals.elongatedWords.length ? `stretches words (${signals.elongatedWords.slice(0, 3).join(', ')})` : 'plain spelling'}; ${signals.capsRatio >= 0.6 ? 'writes in caps' : 'normal case'}.`,
    language: signals.language,
    script: signals.script,
    levels,
    world,
    arc: `${arrival}; then ${presence}.`,
    palette: { ...palette, note: register.paletteRule },
    type: { display: typeVoice, body: register.typeVoices[(seed + 2) % register.typeVoices.length], treatment: 'the recipient\'s name gets the most care' },
    composition,
    motion: { tempo: register.motion.tempo, arrival, presence },
    texture,
    headline,
    lines,
    closing: brief.signed || null,
    spark: buildSpark(brief, register, seed),
    avoid: [brief.avoidDetails, ...register.forbid.slice(0, 3)].filter(Boolean),
    source: 'heuristic',
    seed,
  };
}

function defaultLevels(register: RegisterId, signals: BriefSignals): DirectionLevels {
  const base: Record<RegisterId, DirectionLevels> = {
    'pleading-apology': { energy: 2, warmth: 5, formality: 1, playfulness: 1, gravity: 4 },
    'gentle-repair': { energy: 2, warmth: 4, formality: 3, playfulness: 1, gravity: 4 },
    'playful-apology': { energy: 4, warmth: 4, formality: 1, playfulness: 5, gravity: 2 },
    'gushing-love': { energy: 5, warmth: 5, formality: 1, playfulness: 3, gravity: 2 },
    'quiet-devotion': { energy: 2, warmth: 5, formality: 3, playfulness: 1, gravity: 3 },
    'sweet-flirt': { energy: 4, warmth: 4, formality: 1, playfulness: 4, gravity: 1 },
    'loud-celebration': { energy: 5, warmth: 4, formality: 1, playfulness: 4, gravity: 1 },
    'warm-wish': { energy: 3, warmth: 4, formality: 2, playfulness: 2, gravity: 2 },
    'bestie-banter': { energy: 4, warmth: 4, formality: 1, playfulness: 5, gravity: 1 },
    'tender-nostalgia': { energy: 2, warmth: 4, formality: 2, playfulness: 1, gravity: 3 },
    'proud-milestone': { energy: 3, warmth: 3, formality: 4, playfulness: 1, gravity: 3 },
    'grateful-glow': { energy: 3, warmth: 5, formality: 3, playfulness: 1, gravity: 2 },
    'comfort-and-care': { energy: 1, warmth: 5, formality: 2, playfulness: 1, gravity: 3 },
    'sacred-blessing': { energy: 2, warmth: 4, formality: 5, playfulness: 1, gravity: 4 },
    'cool-minimal': { energy: 2, warmth: 2, formality: 3, playfulness: 1, gravity: 2 },
    'festive-gathering': { energy: 4, warmth: 4, formality: 2, playfulness: 3, gravity: 1 },
  };
  const levels = { ...base[register] };
  if (signals.capsRatio >= 0.6) levels.energy = Math.min(5, levels.energy + 1);
  if (signals.elongatedWords.length >= 2) levels.energy = Math.min(5, levels.energy + 1);
  return levels;
}

export function inferDirectionHeuristically(brief: PersonalizationBrief, seed: number, signals?: BriefSignals): CardDirection {
  const derived = signals || deriveBriefSignals(brief);
  const { register, undertone } = inferRegister(brief, derived);
  return buildDefaultDirection(EMOTION_REGISTERS[register], brief, derived, seed, undertone);
}

// ---------------------------------------------------------------------------
// The LLM reader
// ---------------------------------------------------------------------------

export async function directCard(options: DirectCardOptions): Promise<CardDirection> {
  const { brief, medium, seed } = options;
  const signals = deriveBriefSignals(brief);
  const fallback = () => inferDirectionHeuristically(brief, seed, signals);
  const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) return fallback();

  try {
    const response = await requestOpenRouterMessage(
      {
        apiKey,
        model: options.model || getDirectorModel(),
        messages: [
          { role: 'system', content: buildDirectorSystemPrompt() },
          { role: 'user', content: buildDirectorUserPrompt(brief, signals, { medium, seed }) },
        ],
        maxTokens: DIRECTOR_MAX_TOKENS,
        temperature: 0.6,
        reasoningEffort: 'low',
        timeoutMs: options.timeoutMs ?? DIRECTOR_TIMEOUT_MS,
      },
      options.fetchImpl
    );

    const raw = parseDirectionJson(response.text);
    if (!raw) {
      console.warn('[director] no JSON in response; using heuristic read');
      return fallback();
    }
    return normalizeDirection(raw, brief, signals, seed, { source: 'director', model: response.model });
  } catch (error) {
    console.warn('[director] failed; using heuristic read:', error instanceof Error ? error.message : error);
    return fallback();
  }
}

// ---------------------------------------------------------------------------
// Rendering the read for the generators
// ---------------------------------------------------------------------------

export function describeDirection(direction: CardDirection): string {
  const register = getRegister(direction.register);
  const undertone = direction.undertone ? getRegister(direction.undertone) : null;
  const q = (value: string) => `«${value}»`;
  const lines = [
    `Register: ${register.name} (${register.id})${undertone ? ` · undertone: ${undertone.name} (${undertone.id}) — add ONE element from it, never let it take over` : ''}`,
    `The read: ${direction.read}`,
    `Sender's voice: ${direction.voice} Language: ${direction.language} (${direction.script} script).`,
    `Levels (1-5): energy ${direction.levels.energy} · warmth ${direction.levels.warmth} · formality ${direction.levels.formality} · playfulness ${direction.levels.playfulness} · gravity ${direction.levels.gravity}`,
    `World: ${direction.world}`,
    `Arc: ${direction.arc}`,
    `Palette "${direction.palette.name}": ground ${direction.palette.ground} · ink ${direction.palette.ink} · accent ${direction.palette.accent} · accent2 ${direction.palette.accent2}. ${direction.palette.note}`,
    `Type: display — ${direction.type.display}; body — ${direction.type.body}; treatment — ${direction.type.treatment}`,
    `Composition: ${direction.composition}`,
    `Motion: tempo ${direction.motion.tempo} · arrival — ${direction.motion.arrival} · presence — ${direction.motion.presence}`,
    `Texture: ${direction.texture}`,
    'TEXT TO SET (verbatim, in this order — spelling, emoji and elongations exactly as given):',
    `  headline: ${q(direction.headline)}`,
    ...direction.lines.map((line, i) => `  line ${i + 1}: ${q(line)}`),
    direction.closing ? `  closing: ${q(direction.closing)}` : '  closing: (none)',
    `The spark: ${direction.spark}`,
    direction.avoid.length ? `Avoid: ${direction.avoid.join('; ')}` : '',
  ];
  return lines.filter(Boolean).join('\n');
}
