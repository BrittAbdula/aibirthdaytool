/**
 * Design comparison: regenerate historical cards with the new Atelier prompt
 * system + the latest Grok SVG model, next to what shipped at the time.
 *
 * Usage:
 *   ts-node --compiler-options '{"module":"commonjs","moduleResolution":"node"}' scripts/design-grok-compare.ts <outDir>
 */
import fs from 'node:fs';
import path from 'node:path';

// Load .env.local the way Next.js would (plain scripts don't get it for free).
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

import { prisma } from '../src/lib/prisma';
import { generatePrompt } from '../src/lib/prompt';
import type { CardType, CardSize } from '../src/lib/card-config';
import { createNaturalPrompt } from '../src/lib/personalization-prompt';
const XAI_MODEL = 'grok-4.20-0309-reasoning';

async function xaiChat(content: string): Promise<{ text: string; model: string; tokensUsed: number }> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.X_AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: XAI_MODEL,
      messages: [{ role: 'user', content }],
      temperature: 0.8,
    }),
  });
  if (!res.ok) throw new Error(`xAI error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    model: data.model || XAI_MODEL,
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

interface CompareCase {
  cardId: string;
  cardType: string;
  timestamp: string;
  inputs: Record<string, unknown>;
  oldSvg: string;
  oldUrl: string;
  brief: string;
  newSvg: string;
  model: string;
  tokensUsed: number;
}

function extractSvg(text: string): string {
  const match = text.match(/<svg[\s\S]*?<\/svg>/);
  return match ? match[0] : '';
}

function richness(inputs: Record<string, any>): number {
  let score = 0;
  const f = inputs?.formData ?? inputs ?? {};
  if (f.message) score += 2;
  if (f.recipientName) score += 1;
  if (f.sharedMemory) score += 3;
  if (f.insideJokeOrMotif) score += 3;
  if (f.recipientTraits?.length) score += 2;
  if (f.age || f.yearsTogether) score += 1;
  if (f.tone) score += 1;
  return score;
}

async function main() {
  const outDir = process.argv[2] || './grok-compare';
  fs.mkdirSync(outDir, { recursive: true });

  const rows = await prisma.apiLog.findMany({
    where: { isError: false },
    orderBy: { timestamp: 'desc' },
    take: 400,
    select: {
      cardId: true,
      cardType: true,
      userInputs: true,
      responseContent: true,
      r2Url: true,
      timestamp: true,
    },
  });

  const svgRows = rows.filter(
    (r) =>
      (r.responseContent?.includes('<svg') || r.r2Url?.toLowerCase().endsWith('.svg')) &&
      richness(r.userInputs as any) >= 4
  );

  // pick up to 3 distinct card types, richest first
  svgRows.sort((a, b) => richness(b.userInputs as any) - richness(a.userInputs as any));
  const picked: typeof svgRows = [];
  const seenTypes = new Set<string>();
  for (const row of svgRows) {
    if (seenTypes.has(row.cardType)) continue;
    seenTypes.add(row.cardType);
    picked.push(row);
    if (picked.length >= 3) break;
  }
  for (const row of svgRows) {
    if (picked.length >= 3) break;
    if (!picked.includes(row)) picked.push(row);
  }

  console.log(`picked ${picked.length} historical cases:`, picked.map((p) => `${p.cardType}/${p.cardId}`));

  const cases: CompareCase[] = [];
  for (const row of picked) {
    const cardType = row.cardType as CardType;
    const size = { id: 'portrait', name: 'Portrait', width: 480, height: 760, aspectRatio: '0.63', orientation: 'portrait' } as CardSize;
    const system = generatePrompt(cardType, size);
    const brief = createNaturalPrompt(row.userInputs, cardType, { medium: 'svg', size: 'portrait' });

    console.log(`\n=== ${row.cardType}/${row.cardId} — calling ${XAI_MODEL} ...`);
    const started = Date.now();
    let newSvg = '';
    let model = XAI_MODEL;
    let tokensUsed = 0;
    for (let attempt = 1; attempt <= 2 && !newSvg; attempt++) {
      try {
        const result = await xaiChat([
          'You are generating an animated greeting card SVG.',
          'Follow the complete SVG system instructions and user brief below.',
          'Return ONLY one complete SVG document. Do not wrap it in markdown.',
          '',
          'SVG system instructions:',
          system,
          '',
          'User brief:',
          brief,
        ].join('\n'));
        newSvg = extractSvg(result.text);
        model = result.model;
        tokensUsed = result.tokensUsed;
      } catch (err) {
        console.log(`  attempt ${attempt} failed: ${err instanceof Error ? err.message.slice(0, 120) : err}`);
      }
    }
    console.log(`  done in ${Math.round((Date.now() - started) / 1000)}s, svg=${newSvg.length} chars, tokens=${tokensUsed}`);

    cases.push({
      cardId: row.cardId,
      cardType: row.cardType,
      timestamp: row.timestamp.toISOString(),
      inputs: (row.userInputs as any) ?? {},
      oldSvg: row.responseContent?.includes('<svg') ? extractSvg(row.responseContent) : '',
      oldUrl: row.r2Url || '',
      brief,
      newSvg,
      model,
      tokensUsed,
    });
  }

  fs.writeFileSync(path.join(outDir, 'cases.json'), JSON.stringify(cases, null, 1));
  console.log(`\nwrote ${path.join(outDir, 'cases.json')}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
