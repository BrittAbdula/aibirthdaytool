/**
 * Register preview: run real briefs through the director and the SVG model,
 * then write the cards plus their reads into a contact sheet.
 *
 * Usage:
 *   pnpm preview:registers <outDir> [--heuristic] [--only=1,4] [--concurrency=3] [--cases=briefs.json] [--prompts-only]
 *
 * --heuristic     skip the LLM director and use the fallback reader
 * --prompts-only  write the prompts without calling any model (free, offline)
 * --cases         a JSON array of { label, input } objects instead of the built-in briefs
 */
import fs from 'node:fs';
import path from 'node:path';

// Load .env.local the way Next.js would (plain scripts do not get it for free).
for (const file of ['.env', '.env.local']) {
  const full = path.join(__dirname, '..', file);
  if (!fs.existsSync(full)) continue;
  for (const line of fs.readFileSync(full, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].trim().replace(/^"|"$/g, '');
    }
  }
}

import type { CardSize } from '../src/lib/card-config';
import { buildPersonalizationBrief } from '../src/lib/card-brief';
import { directCard, hashSeed, inferDirectionHeuristically, type CardDirection } from '../src/lib/emotion-director';
import { getRegister } from '../src/lib/emotion-registers';
import { createNaturalPrompt } from '../src/lib/personalization-prompt';
import { generatePrompt } from '../src/lib/prompt';
import { extractSvgContent } from '../src/lib/svg-extract';
import { OPENROUTER_SVG_MODEL, requestOpenRouterMessage } from '../src/lib/openrouter';

// Literal size: importing card-config would pull prisma and React's cache into a plain ts-node run.
const PORTRAIT: CardSize = { id: 'portrait', name: 'Portrait', width: 480, height: 760, aspectRatio: '0.63', orientation: 'portrait' };

interface PreviewCase {
  label: string;
  input: Record<string, unknown>;
}

// Modelled on real traffic (names changed): Hinglish and Tanglish apologies,
// emoji storms, essays, thin briefs, banter, blessings, minimal notes.
const BUILT_IN_CASES: PreviewCase[] = [
  {
    label: 'Tanglish pleading sorry',
    input: {
      cardType: 'sorry',
      to: 'Girlfriend',
      recipientName: 'Fathima',
      message:
        'Sorry akka 😭 ippala na ungala romba tension agura ellame emela tha thappu irukku 🤧 natha lusu mathiri pesittu irukka pannittu irukka 😖 sorry ka 😭 please enna vittutu poidathinga ka. Enakku irukkara ore happiness neetha.',
      relationshipVibe: 'Romantic',
    },
  },
  {
    label: 'Shouting birthday pasted into the name field',
    input: {
      cardType: 'birthday',
      to: 'Husband',
      recipientName: 'HAPPIEST BIRTHDAY MY DEAR JAANUUU 💗 MANY MORE HAPPY RETURNS OF THE DAY 🎀💞 MAY GOD BLESS YOU 🤗 LOVE YOU SO MUCH DEAR 💗🎉😘',
    },
  },
  {
    label: 'Bestie banter with a 3 a.m. memory',
    input: {
      cardType: 'birthday',
      to: 'Friend',
      recipientName: 'Minakshi',
      signed: 'Ritika',
      message: 'Happy Birthday meri Dost 🥳🎂🕺🏻',
      sharedMemory: 'Our conversation feels like a 3 a.m. chat between two intoxicated people, and I really miss that.',
      insideJokeOrMotif: 'thank you for listening my bakbak',
      recipientTraits: ['Funny', 'Adventurous', 'Brave'],
      relationshipVibe: 'Playful',
    },
  },
  {
    label: 'Gushing love, elongated',
    input: {
      cardType: 'love',
      to: 'Wife',
      recipientName: 'Mahiiiii',
      signed: 'Shreyyyy',
      message:
        'I lovvvvvveeeeeee youuuuuuuuuu sooooooooo muchhhhhhh frommmmm myyyyy wholeeeeee heartttttt youuuuuu areeeeee everything tooo meeeeee you areeee myyyy homeeeee',
    },
  },
  {
    label: 'Hinglish playful sorry with a promise',
    input: {
      cardType: 'sorry',
      to: 'Boyfriend',
      recipientName: 'Akshit (jaanuu)',
      signed: 'Preeshita (still very sorry btw)',
      message:
        'Ab toh mann jaoo babyyy pakkaaa kabhi wapas aise bina batae lambe time gayab nahi houngi pinkkyy promiseeeeeeeeeee. Also like gussa shant karne ke liye nahi sona chahiye.',
      recipientTraits: ['Funny', 'Calm', 'Gentle'],
      relationshipVibe: 'Playful',
    },
  },
  {
    label: 'Anniversary essay',
    input: {
      cardType: 'anniversary',
      to: 'Girlfriend',
      recipientName: 'Aysha',
      signed: 'Forever Yours',
      message:
        '❤️ Happy 1st Anniversary, My Love ❤️\n\nToday is a day that means so much to me because it marks one whole year of us. 🥹❤️ One year of love, care, happiness, memories, laughter, little arguments, misunderstandings, late-night conversations, and countless moments that I will always keep close to my heart. When I look back at where we started and where we are today, I honestly feel so grateful that our paths crossed.\n\nThis past year was not always perfect, and I do not expect it to be. There were times when we misunderstood each other, got angry, argued, or felt hurt. But despite everything, we stayed. We talked, we understood, we forgave, and we continued choosing each other.\n\nIf I could go back to the beginning and choose again, I would still choose you. One year down, forever to go. I love you more than words can ever explain. ❤️',
    },
  },
  {
    label: 'Blessing for Papa',
    input: {
      cardType: 'birthday',
      to: 'Father',
      recipientName: 'Papa',
      signed: 'Gopal',
      message: 'Happy birthday Papa. Bhagwan aapko lambi umar de aur hamesha khush rakhe. 🙏 May God bless you with good health.',
      relationshipVibe: 'Respectful',
    },
  },
  {
    label: 'Thin brief, pet name',
    input: { cardType: 'birthday', to: 'Girlfriend', recipientName: 'Mine girl 🫶😚' },
  },
  {
    label: 'Get well for Papa',
    input: { cardType: 'get-well', to: 'Father', recipientName: 'Papa', message: 'Papa pls eat ur food on time and rest. We need you strong. ❤️' },
  },
  {
    label: 'Minimal German note',
    input: { cardType: 'birthday', to: 'Girlfriend', recipientName: 'Schatz', message: 'Alles Gute, Schatz.', signed: 'M.' },
  },
  {
    label: 'Teacher gratitude',
    input: {
      cardType: 'teacher',
      to: 'Other',
      recipientName: 'Ankita Mam',
      signed: 'Aadya',
      message:
        "Happy Teacher's Day to the most amazing science teacher! Even though it's been three years since 7th grade, you are still the reason I love science.",
      sharedMemory: 'Her motivating diary period speeches. Her caring nature and her teaching style.',
      recipientTraits: ['Funny', 'Ambitious', 'Creative'],
    },
  },
  {
    label: 'Nostalgic sorry, no message',
    input: {
      cardType: 'sorry',
      to: 'Boyfriend',
      recipientName: 'Suraj',
      signed: 'prachi',
      sharedMemory: 'I miss old us',
      insideJokeOrMotif: 'Night stay',
      recipientTraits: ['Calm'],
      relationshipVibe: 'Nostalgic',
      avoidDetails: 'No cheesy lines',
    },
  },
];

interface PreviewResult {
  index: number;
  label: string;
  direction: CardDirection;
  svgFile?: string;
  model?: string;
  tokensUsed?: number;
  durationMs?: number;
  error?: string;
}

function parseArgs(argv: string[]) {
  const positional = argv.filter((a) => !a.startsWith('--'));
  const flag = (name: string) => argv.find((a) => a.startsWith(`--${name}`));
  const value = (name: string) => flag(name)?.split('=')[1];
  return {
    outDir: positional[0] || './register-preview',
    heuristic: !!flag('heuristic'),
    promptsOnly: !!flag('prompts-only'),
    only: value('only')?.split(',').map((n) => parseInt(n, 10)).filter((n) => Number.isFinite(n)) || null,
    concurrency: parseInt(value('concurrency') || '3', 10),
    cases: value('cases'),
  };
}

async function runCase(c: PreviewCase, index: number, opts: ReturnType<typeof parseArgs>, outDir: string): Promise<PreviewResult> {
  const cardType = String(c.input.cardType);
  const brief = buildPersonalizationBrief(c.input, cardType);
  const seed = hashSeed(`${c.label}-${index}`);
  const direction = opts.heuristic || opts.promptsOnly
    ? inferDirectionHeuristically(brief, seed)
    : await directCard({ brief, medium: 'svg', seed });

  const userPrompt = createNaturalPrompt(c.input, cardType, { size: 'portrait', medium: 'svg', direction, seed });
  const systemPrompt = generatePrompt(cardType, PORTRAIT, direction);
  const base = `${String(index + 1).padStart(2, '0')}-${direction.register}`;
  fs.writeFileSync(path.join(outDir, `${base}.prompt.txt`), `SYSTEM\n\n${systemPrompt}\n\n\nUSER\n\n${userPrompt}\n`);

  const result: PreviewResult = { index, label: c.label, direction };
  if (opts.promptsOnly) return result;

  const started = Date.now();
  try {
    const response = await requestOpenRouterMessage({
      model: process.env.CARD_SVG_MODEL || OPENROUTER_SVG_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });
    const svg = extractSvgContent(response.text);
    if (!svg) throw new Error('No SVG in the response');
    const svgFile = `${base}.svg`;
    fs.writeFileSync(path.join(outDir, svgFile), svg);
    result.svgFile = svgFile;
    result.model = response.model;
    result.tokensUsed = response.tokensUsed;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }
  result.durationMs = Date.now() - started;
  return result;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderSheet(results: PreviewResult[], opts: ReturnType<typeof parseArgs>): string {
  const cards = results
    .map((r) => {
      const d = r.direction;
      const register = getRegister(d.register);
      const swatches = [d.palette.ground, d.palette.ink, d.palette.accent, d.palette.accent2]
        .map((hex) => `<span class="swatch" style="background:${hex}" title="${hex}"></span>`)
        .join('');
      const media = r.svgFile
        ? `<img src="${r.svgFile}" alt="${escapeHtml(r.label)}">`
        : `<div class="missing">${escapeHtml(r.error || 'prompt only')}</div>`;
      return `<article>
  <div class="card">${media}</div>
  <div class="meta">
    <div class="label">${r.index + 1}. ${escapeHtml(r.label)}</div>
    <div class="register">${escapeHtml(register.name)} <code>${d.register}</code>${d.undertone ? ` + <code>${d.undertone}</code>` : ''} · <em>${d.source}</em>${d.confidence ? ` · ${Math.round(d.confidence * 100)}%` : ''}</div>
    <div class="swatches">${swatches} <span class="palette">${escapeHtml(d.palette.name)}</span></div>
    <p class="read">${escapeHtml(d.read)}</p>
    <p class="world"><b>World:</b> ${escapeHtml(d.world)}</p>
    <p class="text"><b>Headline:</b> ${escapeHtml(d.headline)}${d.lines.length ? `<br><b>Lines:</b> ${d.lines.map(escapeHtml).join(' / ')}` : ''}${d.closing ? `<br><b>Closing:</b> ${escapeHtml(d.closing)}` : ''}</p>
    <p class="spark"><b>Spark:</b> ${escapeHtml(d.spark)}</p>
    <p class="stats">${escapeHtml(d.language)} · tempo ${d.motion.tempo}${r.tokensUsed ? ` · ${r.tokensUsed} tokens` : ''}${r.durationMs ? ` · ${(r.durationMs / 1000).toFixed(1)}s` : ''}</p>
  </div>
</article>`;
    })
    .join('\n');

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Register preview</title>
<style>
  body{margin:0;padding:24px;background:#f3f1ec;font:14px/1.45 -apple-system,Helvetica,Arial,sans-serif;color:#222}
  h1{font-size:18px;margin:0 0 16px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}
  article{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  .card{aspect-ratio:480/760;background:#ddd}
  .card img{width:100%;height:100%;display:block}
  .missing{padding:16px;color:#a33}
  .meta{padding:12px 14px 14px}
  .label{font-weight:600}
  .register{margin:4px 0;color:#555}
  code{background:#eee;padding:1px 5px;border-radius:4px;font-size:12px}
  .swatch{display:inline-block;width:18px;height:18px;border-radius:4px;border:1px solid rgba(0,0,0,.1);vertical-align:middle;margin-right:3px}
  .palette{color:#666;font-size:12px;margin-left:4px}
  p{margin:6px 0;font-size:13px}
  .read{color:#333}
  .stats{color:#777;font-size:12px}
</style></head>
<body>
<h1>Register preview · ${results.length} cards · ${opts.heuristic ? 'heuristic reader' : opts.promptsOnly ? 'prompts only' : 'LLM director'} · ${new Date().toISOString()}</h1>
<div class="grid">
${cards}
</div>
</body></html>`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(opts.outDir);
  fs.mkdirSync(outDir, { recursive: true });

  let cases = BUILT_IN_CASES;
  if (opts.cases) cases = JSON.parse(fs.readFileSync(path.resolve(opts.cases), 'utf8')) as PreviewCase[];
  const selected = cases.map((c, i) => ({ c, i })).filter(({ i }) => !opts.only || opts.only.includes(i + 1));

  console.log(`Running ${selected.length} cases → ${outDir} (${opts.heuristic ? 'heuristic' : opts.promptsOnly ? 'prompts only' : 'director'}; concurrency ${opts.concurrency})`);

  const results: PreviewResult[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.max(1, opts.concurrency) }, async () => {
    while (cursor < selected.length) {
      const { c, i } = selected[cursor++];
      const started = Date.now();
      const result = await runCase(c, i, opts, outDir);
      results.push(result);
      console.log(
        `${String(i + 1).padStart(2, '0')} ${result.direction.register.padEnd(18)} ${result.direction.source.padEnd(9)} ${result.error ? `ERROR ${result.error}` : result.svgFile || 'prompt'} (${((Date.now() - started) / 1000).toFixed(1)}s) — ${c.label}`
      );
    }
  });
  await Promise.all(workers);

  results.sort((a, b) => a.index - b.index);
  fs.writeFileSync(path.join(outDir, 'directions.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(outDir, 'index.html'), renderSheet(results, opts));
  console.log(`\nContact sheet: ${path.join(outDir, 'index.html')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
