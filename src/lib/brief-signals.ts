/**
 * Cheap, deterministic readings of a brief: what language it is in, how loud
 * it is, which emoji carry the mood. The director gets these as hints and the
 * heuristic fallback classifier runs on them alone.
 */

import type { PersonalizationBrief } from './card-brief';
import { briefText } from './card-brief';

export interface BriefSignals {
  messageChars: number;
  messageWords: number;
  /** Distinct emoji in order of first appearance. */
  emoji: string[];
  emojiCount: number;
  /** Words with a letter repeated three or more times: "sooooo", "youuuu". */
  elongatedWords: string[];
  /** Share of latin letters that are upper case; 0 when there are too few letters to judge. */
  capsRatio: number;
  exclamations: number;
  language: string;
  script: string;
  codeSwitch: boolean;
  /** The name field holds a greeting or a whole message, not a name. */
  nameLooksLikeMessage: boolean;
  /** The name field is a pet name ("Babyyyy", "Mine girl 🫶😚"). */
  hasPetName: boolean;
  /** No message, memory or motif — only a name and an occasion. */
  isThin: boolean;
}

// Built with RegExp() so the TypeScript target does not have to admit unicode property escapes.
const EMOJI_PATTERN = new RegExp(String.raw`\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*`, 'gu');
const ELONGATION_PATTERN = /\b\S*([a-z])\1{2,}\S*\b/gi;
const NON_WORD_PATTERN = new RegExp(String.raw`[^\p{L}\p{N}]+`, 'gu');

interface LanguageHint {
  name: string;
  keywords: string[];
  /** Distinct keyword hits needed before we claim the language. */
  minHits: number;
}

const LANGUAGE_HINTS: LanguageHint[] = [
  {
    name: 'Hinglish',
    minHits: 2,
    keywords: [
      'hai', 'nahi', 'nhi', 'mujhe', 'tum', 'tumhe', 'tumse', 'tumhare', 'yaar', 'jaan', 'jaanu', 'meri', 'mera', 'mere',
      'bahut', 'bohot', 'bhot', 'pyaar', 'pyar', 'maan', 'jao', 'kya', 'kabhi', 'zindagi', 'dil', 'hoon', 'hun', 'karo',
      'abhi', 'toh', 'bas', 'sach', 'sachi', 'sab', 'kuch', 'aap', 'aapko', 'yaad', 'dost', 'bhai', 'didi', 'pakka', 'kaise',
      'kyun', 'kyu', 'hamesha', 'khush', 'raho', 'rakhna', 'wapas', 'gussa', 'ladki', 'ladka', 'shona', 'sona', 'babu', 'motu',
      'bacha', 'baccha', 'ji', 'janu', 'janam', 'mubarak', 'shukriya', 'maaf', 'maafi', 'aise', 'waise', 'phir', 'fir',
    ],
  },
  {
    name: 'Tanglish',
    minHits: 2,
    keywords: [
      'romba', 'akka', 'anna', 'enakku', 'unga', 'ungala', 'neenga', 'illa', 'irukku', 'sollanu', 'pudikku', 'vazhthukkal',
      'vazthukal', 'vazthukkal', 'nanba', 'kanna', 'machan', 'machi', 'pesu', 'vanakkam', 'nalla', 'iruka', 'iruken', 'unnoda',
      'ennoda', 'thala', 'losu', 'lusu', 'paravala', 'pannitu', 'pannu', 'sollu', 'poda', 'podi', 'piranthanal', 'piranthanall',
    ],
  },
  {
    name: 'Bengali (romanized)',
    minHits: 2,
    keywords: ['tumi', 'ami', 'bhalo', 'bhalobashi', 'khub', 'tomake', 'tomar', 'amar', 'sathe', 'jonno', 'shubho', 'jonmodin', 'bou', 'kemon', 'acho'],
  },
  {
    name: 'Turkish',
    minHits: 2,
    keywords: ['seni', 'seviyorum', 'canım', 'canim', 'doğum', 'dogum', 'günün', 'gunun', 'mutlu', 'umarım', 'umarim', 'hayat', 'çok', 'cok', 'iyi', 'aşkım', 'askim', 'seninle', 'olsun'],
  },
  {
    name: 'Portuguese',
    minHits: 2,
    keywords: ['feliz', 'aniversário', 'aniversario', 'obrigado', 'obrigada', 'muito', 'você', 'voce', 'amo', 'saudade', 'parabéns', 'parabens', 'querida', 'querido', 'beijos'],
  },
  {
    name: 'Spanish',
    minHits: 2,
    keywords: ['feliz', 'cumpleaños', 'cumpleanos', 'gracias', 'te amo', 'te quiero', 'mucho', 'siempre', 'perdón', 'perdon', 'lo siento', 'cariño', 'querida', 'querido', 'abrazo'],
  },
  {
    name: 'German',
    minHits: 2,
    keywords: ['schatz', 'alles', 'gute', 'geburtstag', 'liebe', 'ich', 'dich', 'danke', 'immer', 'herzlichen'],
  },
  {
    name: 'French',
    minHits: 2,
    keywords: ['joyeux', 'anniversaire', 'merci', 'toujours', 'je t\'aime', 'mon amour', 'bisous', 'désolé', 'desole', 'pardon'],
  },
  {
    name: 'Indonesian/Malay',
    minHits: 2,
    keywords: ['selamat', 'ulang', 'tahun', 'sayang', 'terima', 'kasih', 'maaf', 'kamu', 'aku', 'semoga'],
  },
  {
    name: 'Tagalog',
    minHits: 2,
    keywords: ['maligayang', 'kaarawan', 'salamat', 'mahal', 'kita', 'ikaw', 'sana', 'lagi', 'palagi'],
  },
];

const SCRIPT_RANGES: Array<{ name: string; pattern: RegExp; language: string }> = [
  { name: 'devanagari', pattern: /[ऀ-ॿ]/, language: 'Hindi' },
  { name: 'bengali', pattern: /[ঀ-৿]/, language: 'Bengali' },
  { name: 'gurmukhi', pattern: /[਀-੿]/, language: 'Punjabi' },
  { name: 'gujarati', pattern: /[઀-૿]/, language: 'Gujarati' },
  { name: 'tamil', pattern: /[஀-௿]/, language: 'Tamil' },
  { name: 'telugu', pattern: /[ఀ-౿]/, language: 'Telugu' },
  { name: 'kannada', pattern: /[ಀ-೿]/, language: 'Kannada' },
  { name: 'malayalam', pattern: /[ഀ-ൿ]/, language: 'Malayalam' },
  { name: 'arabic', pattern: /[؀-ۿ]/, language: 'Arabic/Urdu' },
  { name: 'hebrew', pattern: /[֐-׿]/, language: 'Hebrew' },
  { name: 'thai', pattern: /[฀-๿]/, language: 'Thai' },
  { name: 'cyrillic', pattern: /[Ѐ-ӿ]/, language: 'Russian/Ukrainian' },
  { name: 'greek', pattern: /[Ͱ-Ͽ]/, language: 'Greek' },
  { name: 'hangul', pattern: /[가-힯ᄀ-ᇿ]/, language: 'Korean' },
  { name: 'kana', pattern: /[぀-ヿ]/, language: 'Japanese' },
  { name: 'cjk', pattern: /[一-鿿]/, language: 'Chinese' },
];

const PET_NAME_WORDS = [
  'baby', 'babyy', 'bby', 'babe', 'babu', 'bubu', 'jaan', 'jaanu', 'janu', 'jaanuu', 'cutie', 'cutiee', 'shona', 'sona', 'motu',
  'panda', 'bacha', 'baccha', 'pagal', 'honey', 'hubby', 'wifey', 'schatz', 'amor', 'mine', 'love', 'lovey', 'sweetheart',
  'darling', 'dear', 'meri', 'mera', 'jaanam', 'janam', 'kanna', 'chellam', 'kutty', 'ji', 'akka', 'bou',
];

export function findEmoji(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const match of text.matchAll(EMOJI_PATTERN)) {
    const glyph = match[0];
    // Digits and symbols like © or ™ also carry the pictographic property in some engines; skip the ASCII ones.
    if (/^[\x00-\x7F]$/.test(glyph)) continue;
    if (!seen.has(glyph)) {
      seen.add(glyph);
      out.push(glyph);
    }
  }
  return out;
}

export function countEmoji(text: string): number {
  let count = 0;
  for (const match of text.matchAll(EMOJI_PATTERN)) {
    if (!/^[\x00-\x7F]$/.test(match[0])) count += 1;
  }
  return count;
}

export function findElongatedWords(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const match of text.matchAll(ELONGATION_PATTERN)) {
    const word = match[0].toLowerCase();
    // "www", "lll" style noise and URLs are not feelings.
    if (word.length < 4 || /https?:|www\./.test(word)) continue;
    if (!seen.has(word)) {
      seen.add(word);
      out.push(word);
    }
  }
  return out.slice(0, 8);
}

export function capsRatio(text: string): number {
  const letters = text.match(/[A-Za-z]/g) || [];
  if (letters.length < 12) return 0;
  const upper = letters.filter((ch) => ch >= 'A' && ch <= 'Z').length;
  return Math.round((upper / letters.length) * 100) / 100;
}

export function guessLanguage(text: string): { language: string; script: string; codeSwitch: boolean } {
  const scripts = SCRIPT_RANGES.filter((s) => s.pattern.test(text));
  const hasLatin = /[A-Za-z]{2,}/.test(text);

  if (scripts.length > 0) {
    const primary = scripts[0];
    return {
      language: primary.language,
      script: scripts.length > 1 ? 'mixed' : primary.name,
      codeSwitch: hasLatin || scripts.length > 1,
    };
  }

  const words = new Set(
    text
      .toLowerCase()
      .replace(NON_WORD_PATTERN, ' ')
      .split(' ')
      .filter(Boolean)
  );
  let best: { name: string; hits: number } | null = null;
  for (const hint of LANGUAGE_HINTS) {
    let hits = 0;
    for (const keyword of hint.keywords) {
      if (keyword.includes(' ')) {
        if (text.toLowerCase().includes(keyword)) hits += 1;
      } else if (words.has(keyword)) {
        hits += 1;
      }
    }
    if (hits >= hint.minHits && (!best || hits > best.hits)) best = { name: hint.name, hits };
  }

  if (best) {
    const englishMarkers = ['the', 'you', 'happy', 'love', 'sorry', 'birthday', 'always', 'thank', 'miss', 'never', 'forever', 'best'];
    const englishHits = englishMarkers.filter((w) => words.has(w)).length;
    return { language: best.name, script: 'latin', codeSwitch: englishHits >= 2 };
  }

  return { language: hasLatin ? 'English' : 'unknown', script: hasLatin ? 'latin' : 'unknown', codeSwitch: false };
}

export function looksLikePetName(name: string): boolean {
  if (!name) return false;
  if (countEmoji(name) > 0) return true;
  if (findElongatedWords(name).length > 0) return true;
  const words = name.toLowerCase().replace(NON_WORD_PATTERN, ' ').split(' ').filter(Boolean);
  return words.some((w) => PET_NAME_WORDS.includes(w));
}

export function nameLooksLikeMessage(name: string): boolean {
  if (!name) return false;
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (name.length > 40) return true;
  if (words.length >= 4 && countEmoji(name) > 0) return true;
  return /\b(happy|sorry|love you|thank|miss you|please|plz)\b/i.test(name) && words.length >= 3;
}

export function deriveBriefSignals(brief: PersonalizationBrief): BriefSignals {
  const text = briefText(brief);
  const message = brief.message || '';
  const lang = guessLanguage(text);

  return {
    messageChars: message.length,
    messageWords: message ? message.trim().split(/\s+/).filter(Boolean).length : 0,
    emoji: findEmoji(text).slice(0, 12),
    emojiCount: countEmoji(text),
    elongatedWords: findElongatedWords(text),
    capsRatio: capsRatio(message || brief.recipientName),
    exclamations: (text.match(/!/g) || []).length,
    language: brief.language || lang.language,
    script: lang.script,
    codeSwitch: lang.codeSwitch,
    nameLooksLikeMessage: nameLooksLikeMessage(brief.recipientName),
    hasPetName: looksLikePetName(brief.recipientName),
    isThin: !brief.message && !brief.sharedMemory && !brief.insideJokeOrMotif,
  };
}

export function describeSignals(signals: BriefSignals): string {
  const lines = [
    `language guess: ${signals.language} (${signals.script} script)${signals.codeSwitch ? ', code-switching with English' : ''}`,
    `emoji: ${signals.emoji.length ? signals.emoji.join(' ') : 'none'} (${signals.emojiCount} total)`,
    `elongated words: ${signals.elongatedWords.length ? signals.elongatedWords.join(', ') : 'none'}`,
    `caps ratio: ${signals.capsRatio} · exclamation marks: ${signals.exclamations} · message length: ${signals.messageChars} chars / ${signals.messageWords} words`,
    `name field: ${signals.nameLooksLikeMessage ? 'looks like a whole greeting or message' : signals.hasPetName ? 'a pet name or nickname' : 'a plain name'}`,
    `thin brief (name + occasion only): ${signals.isThin ? 'yes' : 'no'}`,
  ];
  return lines.map((l) => `- ${l}`).join('\n');
}
