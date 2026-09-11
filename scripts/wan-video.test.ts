import assert from 'node:assert/strict';
import { generateCardVideo } from '../src/lib/image-and-video';
import { requestWanVideoGeneration, requestWanVideoStatus, normalizeWanVideoStatus } from '../src/lib/wan-video';
import { getModelQualityScore } from '../src/lib/card-ranking';

async function main() {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return Response.json({ code: 200, data: { taskId: 'wan-task-1' } });
  };
  const options = { apiKey: 'test-key', baseUrl: 'https://video.example.com/', prompt: 'A cat by candlelight' };
  assert.deepEqual(await requestWanVideoGeneration(options, fetchImpl), { taskId: 'wan-task-1' });
  assert.equal(calls[0].url, 'https://video.example.com/api/v1/jobs/createTask');
  assert.equal(calls[0].init?.method, 'POST');
  assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, 'Bearer test-key');
  assert.deepEqual(JSON.parse(calls[0].init?.body as string), {
    model: 'wan/3-0-video',
    input: { prompt: options.prompt, duration: 3, aspect_ratio: '9:16', resolution: '480P', audio: false },
  });

  const longPrompt = `${'a'.repeat(900)} preserve this final instruction`;
  await requestWanVideoGeneration({ ...options, prompt: longPrompt }, fetchImpl);
  assert.equal(JSON.parse(calls[1].init?.body as string).input.prompt, longPrompt, 'do not retain the old 800-character truncation');
  for (const prompt of ['', ' ', 'a'.repeat(20001)]) {
    await assert.rejects(requestWanVideoGeneration({ ...options, prompt }, fetchImpl), /1–20,000/);
  }
  assert.equal(calls.length, 2, 'invalid prompts must not create billable tasks');
  await assert.rejects(requestWanVideoGeneration(options, async () => Response.json({ code: 402, msg: 'Credits insufficient' })), /Credits insufficient/);
  await assert.rejects(requestWanVideoGeneration(options, async () => Response.json({ code: 200, data: {} })), /taskId/);
  await assert.rejects(requestWanVideoGeneration(options, async () => new Response('Unavailable', { status: 503 })), /503/);

  const completed = { code: 200, data: { state: 'success', resultJson: JSON.stringify({ resultUrls: ['https://example.com/video.mp4'] }), creditsConsumed: 6 } };
  assert.deepEqual(normalizeWanVideoStatus(completed), { status: 'completed', videoUrl: 'https://example.com/video.mp4', progress: 100, tokensUsed: 6 });
  for (const state of ['waiting', 'queuing', 'generating']) {
    assert.equal(normalizeWanVideoStatus({ code: 200, data: { state, progress: 45 } }).status, 'processing');
  }
  assert.equal(normalizeWanVideoStatus({ code: 200, data: { state: 'generating', progress: '42%' } }).progress, 42);
  assert.equal(normalizeWanVideoStatus({ code: 200, data: { state: 'fail', failMsg: 'Rejected' } }).errorMessage, 'Rejected');
  for (const resultJson of ['invalid JSON', '{}', JSON.stringify({ resultUrls: [] })]) {
    assert.equal(normalizeWanVideoStatus({ code: 200, data: { state: 'success', resultJson } }).status, 'failed');
  }
  assert.throws(() => normalizeWanVideoStatus({ code: 401, msg: 'Unauthorized' }), /Unauthorized/);
  assert.throws(() => normalizeWanVideoStatus({ code: 200, data: null }), /unavailable/);

  await requestWanVideoStatus('wan/task?1', options, async (url, init) => {
    assert.equal(String(url), 'https://video.example.com/api/v1/jobs/recordInfo?taskId=wan%2Ftask%3F1');
    assert.equal(init?.cache, 'no-store');
    assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer test-key');
    return Response.json(completed);
  });
  await assert.rejects(requestWanVideoStatus('', options, fetchImpl), /Missing/);
  assert.equal(getModelQualityScore('wan/3-0-video'), 65);

  const originalFetch = globalThis.fetch;
  const originalKey = process.env.KIE_API_KEY;
  process.env.KIE_API_KEY = 'test-key';
  globalThis.fetch = fetchImpl;
  try {
    for (const size of ['portrait', 'landscape', 'square']) {
      const result = await generateCardVideo({ cardType: 'birthday', size, userPrompt: 'Birthday candlelight' }, 'PREMIUM');
      assert.equal(result.model, 'wan/3-0-video');
      assert.equal(result.status, 'processing');
      const body = JSON.parse(calls.at(-1)?.init?.body as string);
      assert.equal(body.input.aspect_ratio, '9:16', 'legacy size selection must not change video orientation');
      assert.equal(body.input.duration, 3);
      assert.equal(body.input.resolution, '480P');
      assert.match(body.input.prompt, /3-second vertical 9:16/);
    }
    await assert.rejects(generateCardVideo({ cardType: 'birthday', size: 'portrait', userPrompt: 'test' }, 'FREE'), /not supported/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) Reflect.deleteProperty(process.env, 'KIE_API_KEY');
    else process.env.KIE_API_KEY = originalKey;
  }
  console.log('Wan 3.0 video integration passed');
}

main().catch(error => { console.error(error); process.exit(1); });
