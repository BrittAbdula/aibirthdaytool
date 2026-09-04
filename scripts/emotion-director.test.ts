import assert from 'node:assert/strict';

import { buildPersonalizationBrief } from '../src/lib/card-brief';
import {
  capsRatio,
  deriveBriefSignals,
  findElongatedWords,
  findEmoji,
  guessLanguage,
  looksLikePetName,
  nameLooksLikeMessage,
} from '../src/lib/brief-signals';
import {
  buildDirectorSystemPrompt,
  buildDirectorUserPrompt,
  chooseHeadlineAndLines,
  describeDirection,
  directCard,
  hashSeed,
  inferDirectionHeuristically,
  inferRegister,
  isQuotedFromBrief,
  normalizeDirection,
  parseDirectionJson,
} from '../src/lib/emotion-director';
import { EMOTION_REGISTERS, REGISTER_IDS, getRegister } from '../src/lib/emotion-registers';

const HEX = /^#[0-9a-f]{6}$/;

function read(input: Record<string, unknown>) {
  const brief = buildPersonalizationBrief(input, String(input.cardType));
  const signals = deriveBriefSignals(brief);
  return { brief, signals, ...inferRegister(brief, signals) };
}

// --- catalogue sanity -------------------------------------------------------

for (const id of REGISTER_IDS) {
  const r = EMOTION_REGISTERS[id];
  assert.equal(r.id, id);
  assert.ok(r.palettes.length >= 3, `${id} needs at least three palettes`);
  for (const p of r.palettes) {
    for (const key of ['ground', 'ink', 'accent', 'accent2'] as const) {
      assert.match(p[key], HEX, `${id}/${p.name}/${key} must be six-digit hex`);
    }
    assert.notEqual(p.ground, p.ink, `${id}/${p.name}: ground and ink must differ`);
  }
  assert.ok(r.typeVoices.length >= 2 && r.compositions.length >= 2 && r.worlds.length >= 3);
  assert.ok(r.motion.arrivals.length >= 2 && r.motion.presences.length >= 2);
  assert.ok(r.forbid.length >= 3 && r.techniques.length >= 2);
}
assert.equal(getRegister('nonsense').id, 'warm-wish');

// --- signals ----------------------------------------------------------------

assert.deepEqual(findEmoji('Sorry akka 😭 sorry ka 😭 ❤️‍🩹 ok'), ['😭', '❤️‍🩹']);
assert.deepEqual(findElongatedWords('I lovvvvveeee youuuu sooo much, www.example.com'), ['lovvvvveeee', 'youuuu', 'sooo']);
assert.equal(capsRatio('HAPPIEST BIRTHDAY MY DEAR'), 1);
assert.equal(capsRatio('hi'), 0);
assert.equal(guessLanguage('Mujhe nahi pata ki mere ye words tumhare dil tak pahunch payenge').language, 'Hinglish');
assert.equal(guessLanguage('Sorry akka ippala na ungala romba tension agura').language, 'Tanglish');
assert.equal(guessLanguage('Happy birthday to the most special person').language, 'English');
assert.equal(guessLanguage('जन्मदिन मुबारक हो').script, 'devanagari');
assert.equal(guessLanguage('Alles Gute zum Geburtstag, Schatz').language, 'German');
assert.equal(looksLikePetName('Mine girl 🫶😚'), true);
assert.equal(looksLikePetName('Babyyyy'), true);
assert.equal(looksLikePetName('Jesmin'), false);
assert.equal(nameLooksLikeMessage('HAPPIEST BIRTHDAY MY DEAR JAANUUU 💗 MANY MORE HAPPY RETURNS OF THE DAY'), true);
assert.equal(nameLooksLikeMessage('Sagar pundir'), false);

// --- heuristic reader on briefs modelled on real traffic -------------------

const tanglishSorry = read({
  cardType: 'sorry',
  to: 'Girlfriend',
  recipientName: 'Fathima',
  message:
    'Sorry akka 😭 ippala na ungala romba tension agura ellame emela tha thappu irukku 🤧 natha lusu mathiri pesittu irukka pannittu irukka 😖 sorry ka 😭 please enna vittutu poidathinga',
  relationshipVibe: 'Romantic',
});
assert.equal(tanglishSorry.register, 'pleading-apology');
assert.equal(tanglishSorry.signals.language, 'Tanglish');
assert.ok(tanglishSorry.signals.emoji.includes('😭'));

const nostalgicSorry = read({
  cardType: 'sorry',
  to: 'Boyfriend',
  recipientName: 'Suraj',
  signed: 'prachi',
  sharedMemory: 'I miss old us',
  insideJokeOrMotif: 'Night stay',
  recipientTraits: ['Calm'],
  relationshipVibe: 'Nostalgic',
  avoidDetails: 'No cheesy lines',
});
assert.ok(['pleading-apology', 'gentle-repair', 'playful-apology'].includes(nostalgicSorry.register));
assert.equal(nostalgicSorry.undertone, 'tender-nostalgia');

const shoutingBirthday = read({
  cardType: 'birthday',
  to: 'Husband',
  recipientName:
    'HAPPIEST BIRTHDAY MY DEAR JAANUUU 💗 MANY MORE HAPPY RETURNS OF THE DAY 🎀💞MAY YOU LIVE A LONG AND BEAUTIFUL LIFE ❤️‍🩹 LOVE YOU SO MUCH DEAR💗🎀💞🥰🎉😘',
});
assert.ok(['loud-celebration', 'gushing-love'].includes(shoutingBirthday.register), shoutingBirthday.register);
assert.ok(['loud-celebration', 'gushing-love'].includes(String(shoutingBirthday.undertone)), String(shoutingBirthday.undertone));
assert.notEqual(shoutingBirthday.register, shoutingBirthday.undertone);
assert.equal(shoutingBirthday.signals.nameLooksLikeMessage, true);
assert.ok(shoutingBirthday.signals.capsRatio >= 0.6);

const banter = read({
  cardType: 'birthday',
  to: 'Friend',
  recipientName: 'Minakshi',
  sharedMemory: 'Our conversation feels like a 3 a.m. chat between two intoxicated people, and I really miss that.',
  insideJokeOrMotif: 'thank you for listening my bakbak',
  recipientTraits: ['Funny', 'Adventurous', 'Brave'],
  relationshipVibe: 'Playful',
});
assert.equal(banter.register, 'bestie-banter');
assert.equal(banter.undertone, 'tender-nostalgia');

const gushing = read({
  cardType: 'love',
  to: 'Wife',
  recipientName: 'Mahi',
  signed: 'Shrey',
  message:
    'I lovvvvvveeeeeee youuuuuuuu sooooooooo muchhhhhhh frommmmm myyyyy wholeeeeee heartttt youuuu areeee everything tooo meeeee you areeee myyyy home',
});
assert.equal(gushing.register, 'gushing-love');
assert.ok(gushing.signals.elongatedWords.length >= 4);

const devotion = read({
  cardType: 'anniversary',
  to: 'Wife',
  recipientName: 'Priya',
  yearsTogether: '12',
  message:
    'Twelve years and you are still my home. Every day I choose you again, and I would choose you a thousand times more. Thank you for building this life with me.',
});
assert.equal(devotion.register, 'quiet-devotion');

const blessing = read({
  cardType: 'birthday',
  to: 'Father',
  recipientName: 'Papa',
  message: 'Happy birthday Papa. May God bless you with good health and a long life. 🙏',
  relationshipVibe: 'Respectful',
});
assert.equal(blessing.register, 'sacred-blessing');

const flirt = read({ cardType: 'birthday', to: 'Girlfriend', recipientName: 'Mine girl 🫶😚' });
assert.equal(flirt.register, 'sweet-flirt');
assert.equal(flirt.signals.isThin, true);

const comfort = read({ cardType: 'get-well', to: 'Father', recipientName: 'Papa pls eat ur food at time' });
assert.equal(comfort.register, 'comfort-and-care');

const teacher = read({
  cardType: 'teacher',
  to: 'Other',
  recipientName: 'Ankita Mam',
  signed: 'Aadya',
  message: "Happy Teacher's Day to the most amazing science teacher! Even though it's been three years since 7th grade, you are still the reason I love science.",
  sharedMemory: 'Her motivating diary period speeches. Her caring nature and her teaching style.',
});
assert.equal(teacher.register, 'grateful-glow');

const minimal = read({ cardType: 'birthday', to: 'Girlfriend', recipientName: 'Schatz', message: 'Alles Gute, Schatz.' });
assert.equal(minimal.register, 'cool-minimal');
assert.equal(minimal.signals.language, 'German');

const turkish = read({
  cardType: 'birthday',
  to: 'Other',
  recipientName: 'Melike',
  signed: 'Ayse',
  message: 'UMARIMMM HAYATINININ DEVAMINDA HEP MUTLU OLURSUNNN',
  sharedMemory: 'seninle disari ciktigim gunler genellikle favori gunlerim btw🤫🤫🤫',
  recipientTraits: ['Funny'],
});
assert.equal(turkish.signals.language, 'Turkish');
assert.equal(turkish.register, 'loud-celebration');

const playfulSorry = read({
  cardType: 'sorry',
  to: 'Other',
  recipientName: 'Akshit (jaanuu)',
  signed: 'Preeshita (still very sorry btw)',
  message: 'Ab toh mann jaoo babyyy pakkaaa kabhi wapas aise bina batae lambe time gayab nahi houngi pinkkyy promiseeeeeeeeeee.',
  recipientTraits: ['Funny', 'Calm', 'Gentle'],
  relationshipVibe: 'Playful',
});
assert.equal(playfulSorry.register, 'playful-apology');
assert.equal(playfulSorry.signals.language, 'Hinglish');

const steadySorry = read({
  cardType: 'sorry',
  to: 'Friend',
  recipientName: 'Daniel',
  message: 'I was wrong to cancel on you twice without a real reason. I take responsibility and I want to make it right.',
});
assert.equal(steadySorry.register, 'gentle-repair');

const diwali = read({ cardType: 'diwali', to: 'Family', recipientName: 'The Sharmas', message: 'Happy Diwali! May the lights bring you joy.' });
assert.equal(diwali.register, 'festive-gathering');

const congrats = read({ cardType: 'graduation', to: 'Sister', recipientName: 'Ana', message: 'You did it! So proud of you, Doctor Ana.' });
assert.equal(congrats.register, 'proud-milestone');

// --- headline and excerpt selection ---------------------------------------

const essayBrief = buildPersonalizationBrief(
  {
    cardType: 'anniversary',
    to: 'Girlfriend',
    recipientName: 'Aysha',
    message:
      '❤️ Happy 1st Anniversary, My Love ❤️\n\nToday is a day that means so much to me because it marks one whole year of us. 🥹❤️ One year of love, care, happiness, memories, laughter, little arguments, misunderstandings, late-night conversations, and countless moments that I will always keep close to my heart. When I look back at where we started and where we are today, I honestly feel so grateful that our paths crossed. ' +
      'It is amazing how one person can slowly become such an important part of your life. This past year was not always perfect, and I do not expect it to be. But despite everything, we stayed. ' +
      'If I could go back to the beginning and choose again, I would still choose you. One year down, forever to go. I love you more than words can ever explain. ❤️',
  },
  'anniversary'
);
const essay = chooseHeadlineAndLines(essayBrief, getRegister('quiet-devotion'));
assert.equal(essay.headline, '❤️ Happy 1st Anniversary, My Love ❤️');
assert.ok(essay.lines.length >= 3 && essay.lines.length <= 5, `got ${essay.lines.length} lines`);
for (const line of essay.lines) {
  assert.ok(line.length <= 160, `line too long: ${line}`);
  assert.ok(isQuotedFromBrief(line, essayBrief), `not a quote: ${line}`);
}
assert.ok(essay.lines.some((l) => l.includes('I would still choose you')), 'the closing thought should survive');

const pasted = chooseHeadlineAndLines(shoutingBirthday.brief, getRegister('loud-celebration'));
assert.equal(pasted.headline, 'HAPPIEST BIRTHDAY MY DEAR JAANUUU', 'a greeting pasted into the name field keeps its own first words');
assert.ok(pasted.lines.length >= 1 && pasted.lines.every((l) => isQuotedFromBrief(l, shoutingBirthday.brief)));

const thin = chooseHeadlineAndLines(buildPersonalizationBrief({ cardType: 'birthday', recipientName: 'Jesi' }, 'birthday'), getRegister('warm-wish'));
assert.equal(thin.headline, 'Happy Birthday, Jesi');
assert.deepEqual(thin.lines, []);

// --- normalisation of the LLM's answer -------------------------------------

const seed = 37;
const heuristic = inferDirectionHeuristically(tanglishSorry.brief, seed);
assert.equal(heuristic.source, 'heuristic');
assert.equal(heuristic.register, 'pleading-apology');
assert.match(heuristic.palette.ground, HEX);
assert.ok(heuristic.lines.every((l) => isQuotedFromBrief(l, tanglishSorry.brief)));

const normalized = normalizeDirection(
  {
    register: 'cosmic-rage',
    undertone: 'gushing-love',
    confidence: 2,
    read: 'He is terrified of losing her.',
    palette: { name: 'bad', ground: 'blue', ink: '#ffffff', accent: '#ff0000', accent2: '#00ff00' },
    motion: { tempo: 'warp', arrival: 'rain eases', presence: 'a lamp breathes' },
    headline: 'Sorry akka 😭',
    lines: ['sorry ka 😭', 'I rewrote this line completely', 'please enna vittutu poidathinga'],
    closing: null,
    levels: { energy: 9, warmth: 0 },
  },
  tanglishSorry.brief,
  tanglishSorry.signals,
  seed,
  { source: 'director', model: 'test-model' }
);
assert.equal(normalized.register, 'pleading-apology', 'unknown register falls back to the heuristic register');
assert.equal(normalized.undertone, 'gushing-love');
assert.equal(normalized.confidence, 1);
assert.equal(normalized.read, 'He is terrified of losing her.');
assert.equal(normalized.palette.name, heuristic.palette.name, 'invalid hex falls back to a register palette');
assert.equal(normalized.motion.tempo, 'slow', 'unknown tempo falls back to the register tempo');
assert.equal(normalized.motion.arrival, 'rain eases');
assert.deepEqual(normalized.lines, ['sorry ka 😭', 'please enna vittutu poidathinga'], 'fabricated lines are dropped');
assert.equal(normalized.closing, null);
assert.equal(normalized.levels.energy, 5);
assert.equal(normalized.levels.warmth, 1);
assert.equal(normalized.source, 'director');
assert.equal(normalized.model, 'test-model');

const allFabricated = normalizeDirection(
  { register: 'pleading-apology', lines: ['nothing she wrote'], palette: { ground: '#22304a', ink: '#f3efe6', accent: '#f2b661', accent2: '#6f8aa3' } },
  tanglishSorry.brief,
  tanglishSorry.signals,
  seed,
  { source: 'director' }
);
assert.ok(allFabricated.lines.length > 0, 'when every line is fabricated the heuristic excerpt is used');
assert.equal(allFabricated.palette.ground, '#22304a');
assert.equal(allFabricated.closing, null, 'no signed field means no closing');

const signedBrief = buildPersonalizationBrief({ cardType: 'sorry', recipientName: 'Angel', signed: 'Prem', message: "I'm sorry myyy babyyyy I'm so sorry" }, 'sorry');
const withClosing = normalizeDirection({ register: 'pleading-apology' }, signedBrief, deriveBriefSignals(signedBrief), 1, { source: 'director' });
assert.equal(withClosing.closing, 'Prem', 'a missing closing falls back to the signed field');

// --- JSON parsing -----------------------------------------------------------

assert.deepEqual(parseDirectionJson('```json\n{"register":"gushing-love"}\n```'), { register: 'gushing-love' });
assert.deepEqual(parseDirectionJson('Here you go: {"register":"gushing-love","lines":["a"]} hope it helps'), { register: 'gushing-love', lines: ['a'] });
assert.equal(parseDirectionJson('no json here'), null);
assert.equal(parseDirectionJson('[1,2]'), null);

// --- prompts ----------------------------------------------------------------

const systemPrompt = buildDirectorSystemPrompt();
for (const id of REGISTER_IDS) assert.ok(systemPrompt.includes(`- ${id} —`), `catalogue must list ${id}`);
assert.match(systemPrompt, /Return ONLY a JSON object/);
const userPrompt = buildDirectorUserPrompt(tanglishSorry.brief, tanglishSorry.signals, { medium: 'svg', seed, size: 'portrait' });
assert.match(userPrompt, /Sorry akka 😭/);
assert.match(userPrompt, /language guess: Tanglish/);
assert.match(userPrompt, /Variation seed: 37/);

const described = describeDirection(heuristic);
assert.match(described, /Register: The 2 a\.m\. apology \(pleading-apology\)/);
assert.match(described, /headline: «/);
assert.match(described, /ground #[0-9a-f]{6}/);

// --- seeded variety ---------------------------------------------------------

assert.equal(hashSeed('abc'), hashSeed('abc'));
assert.ok(hashSeed('abc') >= 0 && hashSeed('abc') < 1000);
const palettesSeen = new Set([0, 1, 2, 3].map((s) => inferDirectionHeuristically(flirt.brief, s).palette.name));
assert.ok(palettesSeen.size >= 3, 'seeds must spread across the register palettes');

// --- the LLM reader with fake transports -----------------------------------

async function main() {
  const good: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        model: 'fake/director',
        choices: [
          {
            message: {
              content: JSON.stringify({
                register: 'pleading-apology',
                undertone: null,
                confidence: 0.9,
                read: 'A boy who is scared she will leave.',
                voice: 'Tanglish, tears, all lower case.',
                language: 'Tanglish',
                script: 'latin',
                levels: { energy: 2, warmth: 5, formality: 1, playfulness: 1, gravity: 4 },
                world: 'a phone glowing in a dark room while rain slows outside',
                arc: 'rain eases; the screen lights up; the words arrive.',
                palette: { name: 'midnight with one lamp', ground: '#14161f', ink: '#ece6d9', accent: '#ffb347', accent2: '#3d4c6b', note: 'one lamp stays on' },
                type: { display: 'rounded lowercase', body: 'quiet serif', treatment: 'the name larger than sorry' },
                composition: 'text low, light above',
                motion: { tempo: 'slow', arrival: 'rain eases', presence: 'the lamp breathes' },
                texture: 'rain on glass',
                headline: 'Sorry akka 😭',
                lines: ['sorry ka 😭'],
                closing: null,
                spark: 'the F of her name in the rain',
                avoid: ['confetti'],
              }),
            },
          },
        ],
        usage: { total_tokens: 500 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  const directed = await directCard({ brief: tanglishSorry.brief, medium: 'svg', seed, apiKey: 'test', fetchImpl: good });
  assert.equal(directed.source, 'director');
  assert.equal(directed.model, 'fake/director');
  assert.equal(directed.palette.ground, '#14161f');
  assert.equal(directed.headline, 'Sorry akka 😭');
  assert.deepEqual(directed.lines, ['sorry ka 😭']);

  const broken: typeof fetch = async () => new Response('upstream down', { status: 503 });
  const fallback = await directCard({ brief: tanglishSorry.brief, medium: 'svg', seed, apiKey: 'test', fetchImpl: broken });
  assert.equal(fallback.source, 'heuristic');
  assert.equal(fallback.register, 'pleading-apology');

  const hanging: typeof fetch = (_input, init) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    });
  const started = Date.now();
  const timedOut = await directCard({ brief: tanglishSorry.brief, medium: 'svg', seed, apiKey: 'test', fetchImpl: hanging, timeoutMs: 60 });
  assert.equal(timedOut.source, 'heuristic');
  assert.ok(Date.now() - started < 2000, 'a hanging director must not stall generation');

  const noKey = await directCard({ brief: tanglishSorry.brief, medium: 'svg', seed, apiKey: '', fetchImpl: good });
  assert.equal(noKey.source, process.env.OPENROUTER_API_KEY ? 'director' : 'heuristic');

  console.log('emotion director passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
