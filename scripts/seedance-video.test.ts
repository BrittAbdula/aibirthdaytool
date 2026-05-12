import assert from 'node:assert/strict';

import {
  SEEDANCE_VIDEO_MODEL,
  getSeedanceRatio,
  normalizeSeedanceVideoStatus,
  requestSeedanceVideoGeneration,
} from '../src/lib/seedance-video';

assert.equal(SEEDANCE_VIDEO_MODEL, 'doubao-seedance-2-0-fast-260128');
assert.equal(getSeedanceRatio('portrait'), '9:16');
assert.equal(getSeedanceRatio('story'), '9:16');
assert.equal(getSeedanceRatio('landscape'), '16:9');
assert.equal(getSeedanceRatio('square'), '1:1');
assert.equal(getSeedanceRatio('unknown'), '9:16');

async function main() {
  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    calls.push({ input, init });
    return new Response(JSON.stringify({ task_id: 'seedance-task-1' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const result = await requestSeedanceVideoGeneration(
    {
      apiKey: 'test-key',
      baseUrl: 'https://video.example.com/',
      prompt: 'a warm birthday card video with floating candlelight',
      size: 'landscape',
    },
    fetchImpl
  );

  assert.equal(result.taskId, 'seedance-task-1');
  assert.equal(calls.length, 1);
  assert.equal(String(calls[0].input), 'https://video.example.com/v2/videos/generations');
  assert.equal(calls[0].init?.method, 'POST');
  assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, 'Bearer test-key');

  const body = JSON.parse(calls[0].init?.body as string);
  assert.equal(body.model, 'doubao-seedance-2-0-fast-260128');
  assert.equal(body.prompt, 'a warm birthday card video with floating candlelight');
  assert.equal(body.duration, 5);
  assert.equal(body.resolution, '720p');
  assert.equal(body.ratio, '16:9');
  assert.equal(body.watermark, false);
  assert.equal(body.camerafixed, false);
  assert.equal(body.return_last_frame, false);
  assert.equal(body.generate_audio, false);

  const completed = normalizeSeedanceVideoStatus({
    status: 'SUCCESS',
    progress: '100%',
    data: {
      output: 'https://cdn.example.com/video.mp4',
      usage: { total_tokens: 49005 },
    },
  });
  assert.deepEqual(completed, {
    status: 'completed',
    videoUrl: 'https://cdn.example.com/video.mp4',
    progress: 100,
    tokensUsed: 49005,
  });

  const processing = normalizeSeedanceVideoStatus({
    status: 'IN_PROGRESS',
    progress: '42%',
  });
  assert.deepEqual(processing, {
    status: 'processing',
    videoUrl: '',
    progress: 42,
    tokensUsed: 0,
  });

  const failed = normalizeSeedanceVideoStatus({
    status: 'FAILURE',
    fail_reason: 'policy blocked',
  });
  assert.deepEqual(failed, {
    status: 'failed',
    videoUrl: '',
    progress: 0,
    tokensUsed: 0,
    errorMessage: 'policy blocked',
  });

  console.log('seedance video helpers passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
