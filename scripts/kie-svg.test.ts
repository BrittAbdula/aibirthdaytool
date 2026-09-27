import assert from 'node:assert/strict';
import { requestKieSvg } from '../src/lib/kie-svg';

const options = { model: 'gpt-6-luna', systemPrompt: 'Design an SVG', userPrompt: 'Happy birthday', apiKey: 'test-key' };
const success = () => new Response(JSON.stringify({
  status: 'completed',
  output: [{ type: 'message', content: [{ type: 'output_text', text: '<svg><text>Hi</text></svg>' }] }],
  usage: { input_tokens: 10, output_tokens: 20 },
}));

async function main() {
  for (const model of ['gpt-6-luna', 'gpt-6-sol']) {
    let calls = 0;
    const result = await requestKieSvg({ ...options, model }, async (url, init) => {
      calls++;
      assert.equal(url, 'https://api.kie.ai/codex/v1/responses');
      assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer test-key');
      assert.deepEqual(JSON.parse(init?.body as string), {
        model, input: [{ role: 'system', content: options.systemPrompt }, { role: 'user', content: options.userPrompt }],
        stream: false, reasoning: { effort: 'low' },
      });
      return success();
    });
    assert.equal(calls, 1);
    assert.equal(result.model, model);
    assert.equal(result.tokensUsed, 30);
    assert.match(result.svgContent, /xmlns=/);
  }

  const failures: Array<typeof fetch> = [
    async () => new Response('', { status: 503 }),
    async () => { throw new TypeError('fetch failed'); },
    async () => new Response('not JSON'),
    async () => new Response(JSON.stringify({ error: { message: 'upstream failed' } })),
    async () => new Response(JSON.stringify({ status: 'incomplete' })),
    async () => new Response(JSON.stringify({ output: [] })),
    async (_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }),
  ];
  for (const fail of failures) {
    const calls: string[] = [];
    const result = await requestKieSvg({ ...options, timeoutMs: 5 }, async (url, init) => {
      calls.push(String(url));
      if (calls.length === 1) return fail(url, init);
      assert.equal(JSON.parse(init?.body as string).model, 'grok-4-7');
      return success();
    });
    assert.deepEqual(calls, ['https://api.kie.ai/codex/v1/responses', 'https://api.kie.ai/grok/v1/responses']);
    assert.equal(result.model, 'grok-4-7');
  }
  let attempts = 0;
  await assert.rejects(requestKieSvg(options, async () => {
    attempts++;
    return new Response('', { status: 502 });
  }), /grok-4-7 error 502/);
  assert.equal(attempts, 2);
  console.log('Kie SVG primary and fallback tests passed');
}

main().catch(error => { console.error(error); process.exit(1); });
