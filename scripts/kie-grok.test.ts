import assert from 'node:assert/strict';

import { KIE_GROK_4_6_MODEL, requestKieGrokMessage } from '../src/lib/kie-grok';

assert.equal(KIE_GROK_4_6_MODEL, 'grok-4-6');

async function main() {
  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    calls.push({ input, init });
    return new Response(
      JSON.stringify({
        output: [
          { type: 'reasoning', status: 'completed' },
          {
            type: 'message',
            role: 'assistant',
            content: [{ type: 'output_text', text: 'Here is the SVG: <svg viewBox="0 0 10 10"><text>Tom & Jerry</text></svg>' }],
            status: 'completed',
          },
        ],
        usage: {
          total_tokens: 46,
          input_tokens: 12,
          output_tokens: 34,
        },
        status: 'completed',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  const result = await requestKieGrokMessage(
    {
      apiKey: 'test-key',
      baseUrl: 'https://api.kie.ai/',
      messages: [
        {
          role: 'user',
          content: 'Create an SVG card',
        },
      ],
    },
    fetchImpl
  );

  assert.equal(calls.length, 1);
  assert.equal(String(calls[0].input), 'https://api.kie.ai/grok/v1/responses');
  assert.equal(calls[0].init?.method, 'POST');
  assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, 'Bearer test-key');

  const body = JSON.parse(calls[0].init?.body as string);
  assert.deepEqual(body, {
    model: 'grok-4-6',
    input: [
      {
        role: 'user',
        content: 'Create an SVG card',
      },
    ],
    stream: false,
  });

  assert.equal(result.model, 'grok-4-6');
  assert.equal(result.text, 'Here is the SVG: <svg viewBox="0 0 10 10"><text>Tom & Jerry</text></svg>');
  assert.equal(result.tokensUsed, 46);

  console.log('kie grok helpers passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
