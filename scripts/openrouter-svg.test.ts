import assert from 'node:assert/strict';

import { OPENROUTER_SVG_MODEL, requestOpenRouterMessage } from '../src/lib/openrouter';
import { extractSvgContent } from '../src/lib/svg-extract';

assert.equal(OPENROUTER_SVG_MODEL, 'openai/gpt-5.6-luna');

async function main() {
  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    calls.push({ input, init });
    return new Response(
      JSON.stringify({
        model: 'openai/gpt-5.6-luna',
        choices: [
          {
            message: {
              content: 'Here is the SVG: <svg viewBox="0 0 10 10"><text>Tom & Jerry</text></svg>',
            },
          },
        ],
        usage: { prompt_tokens: 12, completion_tokens: 34, total_tokens: 46 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  const result = await requestOpenRouterMessage(
    {
      apiKey: 'test-key',
      baseUrl: 'https://openrouter.ai/api/v1/',
      messages: [
        { role: 'system', content: 'You are a card designer' },
        { role: 'user', content: 'Create an SVG card' },
      ],
    },
    fetchImpl
  );

  assert.equal(calls.length, 1);
  assert.equal(String(calls[0].input), 'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(calls[0].init?.method, 'POST');
  const headers = calls[0].init?.headers as Record<string, string>;
  assert.equal(headers.Authorization, 'Bearer test-key');
  assert.equal(headers['X-Title'], 'MewTruCard');

  const body = JSON.parse(calls[0].init?.body as string);
  assert.equal(body.model, 'openai/gpt-5.6-luna');
  assert.equal(body.stream, false);
  assert.equal(body.max_tokens, 16000);
  assert.deepEqual(body.reasoning, { effort: 'low', exclude: true });
  assert.deepEqual(body.messages, [
    { role: 'system', content: 'You are a card designer' },
    { role: 'user', content: 'Create an SVG card' },
  ]);

  assert.equal(result.model, 'openai/gpt-5.6-luna');
  assert.equal(result.tokensUsed, 46);

  // Missing API key must fail loudly rather than sending an unauthenticated request.
  await assert.rejects(
    () => requestOpenRouterMessage({ apiKey: '', messages: [] }, fetchImpl),
    /OPENROUTER_API_KEY is not configured/
  );

  // --- extractSvgContent ---
  assert.equal(
    extractSvgContent(result.text),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><text>Tom &amp; Jerry</text></svg>'
  );

  assert.equal(
    extractSvgContent('```svg\n<svg viewBox="0 0 10 10"><text>Hi</text></svg>\n```'),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><text>Hi</text></svg>'
  );

  assert.equal(
    extractSvgContent('&lt;svg viewBox=&quot;0 0 10 10&quot;&gt;&lt;text&gt;Tom &amp; Jerry&lt;/text&gt;&lt;/svg&gt;'),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><text>Tom &amp; Jerry</text></svg>'
  );

  // Numeric and hex entities must survive intact — re-escaping them renders the
  // literal "&#8212;" on the card instead of an em dash.
  assert.equal(
    extractSvgContent('<svg><text>Mia &#8212; 29 &#183; &#x2014; &amp; more</text></svg>'),
    '<svg xmlns="http://www.w3.org/2000/svg"><text>Mia &#8212; 29 &#183; &#x2014; &amp; more</text></svg>'
  );

  assert.equal(extractSvgContent('no svg here'), null);

  console.log('openrouter svg helpers passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
