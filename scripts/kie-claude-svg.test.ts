import assert from 'node:assert/strict';

import {
  KIE_CLAUDE_OPUS_4_7_MODEL,
  extractSvgContentFromKieClaudeText,
  requestKieClaudeMessage,
} from '../src/lib/kie-claude';

assert.equal(KIE_CLAUDE_OPUS_4_7_MODEL, 'claude-opus-4-7');

async function main() {
  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    calls.push({ input, init });
    return new Response(
      JSON.stringify({
        model: 'claude-opus-4-7',
        content: [
          {
            type: 'text',
            text: 'Here is the SVG: <svg viewBox="0 0 10 10"><text>Tom & Jerry</text></svg>',
          },
        ],
        usage: {
          input_tokens: 12,
          output_tokens: 34,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  const result = await requestKieClaudeMessage(
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
  assert.equal(String(calls[0].input), 'https://api.kie.ai/claude/v1/messages');
  assert.equal(calls[0].init?.method, 'POST');
  assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, 'Bearer test-key');

  const body = JSON.parse(calls[0].init?.body as string);
  assert.deepEqual(body, {
    model: 'claude-opus-4-7',
    messages: [
      {
        role: 'user',
        content: 'Create an SVG card',
      },
    ],
    stream: false,
    max_tokens: 4096,
  });
  assert.equal(result.model, 'claude-opus-4-7');
  assert.equal(result.text, 'Here is the SVG: <svg viewBox="0 0 10 10"><text>Tom & Jerry</text></svg>');
  assert.equal(result.tokensUsed, 46);

  assert.equal(
    extractSvgContentFromKieClaudeText(result.text),
    '<svg viewBox="0 0 10 10"><text>Tom &amp; Jerry</text></svg>'
  );

  console.log('kie claude svg helpers passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
