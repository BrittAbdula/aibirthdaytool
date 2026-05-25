import assert from 'node:assert/strict';

import * as gptImage2 from '../src/lib/gpt-image-2';

assert.equal(gptImage2.getGptImage2AspectRatio('portrait'), '9:16');
assert.equal(gptImage2.getGptImage2AspectRatio('story'), '9:16');
assert.equal(gptImage2.getGptImage2AspectRatio('landscape'), '16:9');
assert.equal(gptImage2.getGptImage2AspectRatio('square'), '1:1');
assert.equal(gptImage2.getGptImage2AspectRatio('instagram'), '1:1');
assert.equal(gptImage2.getGptImage2AspectRatio('unknown'), '9:16');
assert.equal(gptImage2.getGptImage2Resolution('medium'), '1K');
assert.equal(gptImage2.getGptImage2Resolution('high'), '2K');
assert.equal(gptImage2.getGptImage2Resolution('auto'), '1K');

assert.deepEqual(
  gptImage2.getGptImage2ApiConfig({
    KIE_API_KEY: 'kie-key',
    KIE_BASE_URL: 'https://api.kie.ai/',
  } as unknown as NodeJS.ProcessEnv),
  {
    apiKey: 'kie-key',
    baseUrl: 'https://api.kie.ai',
  }
);

assert.deepEqual(
  gptImage2.getGptImage2ApiConfig({
    GPT_IMAGE_2_API_KEY: 'legacy-image-key',
    GPT_IMAGE_2_BASE_URL: 'https://legacy-image.example.com',
    OPENAI_API_KEY: 'openai-key',
    HM_API_KEY: 'hm-key',
  } as unknown as NodeJS.ProcessEnv),
  {
    apiKey: '',
    baseUrl: 'https://api.kie.ai',
  }
);

async function main() {
  {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      calls.push({ input, init });
      return new Response(
        JSON.stringify({
          code: 200,
          msg: 'success',
          data: { taskId: 'task_gptimage_text' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const result = await gptImage2.requestGptImage2Generation(
      {
        apiKey: 'test-key',
        baseUrl: 'https://image.example.com/',
        prompt: 'birthday card',
        size: 'landscape',
        quality: 'medium',
      },
      fetchImpl
    );

    assert.equal(calls.length, 1);
    assert.equal(String(calls[0].input), 'https://image.example.com/api/v1/jobs/createTask');
    assert.equal(calls[0].init?.method, 'POST');
    assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, 'Bearer test-key');

    const body = JSON.parse(calls[0].init?.body as string);
    assert.deepEqual(body, {
      model: 'gpt-image-2-text-to-image',
      input: {
        prompt: 'birthday card',
        aspect_ratio: '16:9',
        resolution: '1K',
      },
    });
    assert.equal(result.taskId, 'task_gptimage_text');
    assert.equal(result.tokensUsed, 0);
  }

  {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      calls.push({ input, init });
      return new Response(
        JSON.stringify({
          code: 200,
          msg: 'success',
          data: { taskId: 'task_gptimage_edit' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const result = await gptImage2.requestGptImage2Edit(
      {
        apiKey: 'test-key',
        baseUrl: 'https://image.example.com',
        prompt: 'add glasses',
        size: 'portrait',
        quality: 'high',
        imageUrls: ['https://cdn.example.com/a.png', 'https://cdn.example.com/b.png'],
      },
      fetchImpl
    );

    assert.equal(calls.length, 1);
    assert.equal(String(calls[0].input), 'https://image.example.com/api/v1/jobs/createTask');
    assert.equal(calls[0].init?.method, 'POST');
    assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, 'Bearer test-key');

    const body = JSON.parse(calls[0].init?.body as string);
    assert.deepEqual(body, {
      model: 'gpt-image-2-image-to-image',
      input: {
        prompt: 'add glasses',
        input_urls: ['https://cdn.example.com/a.png', 'https://cdn.example.com/b.png'],
        aspect_ratio: '9:16',
        resolution: '2K',
      },
    });
    assert.equal(result.taskId, 'task_gptimage_edit');
    assert.equal(result.tokensUsed, 0);
  }

  {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      calls.push({ input, init });
      return new Response(
        JSON.stringify({
          code: 200,
          msg: 'success',
          data: {
            taskId: 'task_gptimage_text',
            state: 'success',
            resultJson: JSON.stringify({
              resultUrls: ['https://cdn.example.com/result.png'],
            }),
            progress: 45,
            creditsConsumed: 50,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const status = await gptImage2.requestGptImage2Status(
      'task_gptimage_text',
      {
        apiKey: 'test-key',
        baseUrl: 'https://image.example.com/',
      },
      fetchImpl
    );

    assert.equal(calls.length, 1);
    assert.equal(String(calls[0].input), 'https://image.example.com/api/v1/jobs/recordInfo?taskId=task_gptimage_text');
    assert.equal(calls[0].init?.method, 'GET');
    assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, 'Bearer test-key');
    assert.deepEqual(status, {
      status: 'completed',
      imageUrl: 'https://cdn.example.com/result.png',
      progress: 100,
      tokensUsed: 50,
      raw: {
        code: 200,
        msg: 'success',
        data: {
          taskId: 'task_gptimage_text',
          state: 'success',
          resultJson: JSON.stringify({
            resultUrls: ['https://cdn.example.com/result.png'],
          }),
          progress: 45,
          creditsConsumed: 50,
        },
      },
    });
  }

  console.log('gpt-image-2 helpers passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
