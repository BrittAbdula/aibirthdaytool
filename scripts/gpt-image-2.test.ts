import assert from 'node:assert/strict';

import * as gptImage2 from '../src/lib/gpt-image-2';
import { generateCardImage } from '../src/lib/image';
import { generateCardImageWithGptImage2Edit } from '../src/lib/image-and-video';

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
    const calls: any[] = [];
    const fetchImpl: typeof fetch = async (_url, init) => {
      calls.push(JSON.parse(init?.body as string));
      return Response.json({ code: 200, data: { taskId: 'long-prompt' } });
    };
    const params = { apiKey: 'test-key', size: 'square', prompt: 'x'.repeat(20000) };
    await gptImage2.requestGptImage2Generation(params, fetchImpl);
    await gptImage2.requestGptImage2Edit({ ...params, imageUrls: ['https://example.com/photo.png'] }, fetchImpl);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].input.prompt.length, 20000);
    assert.equal(calls[1].input.prompt.length, 20000);
    await assert.rejects(gptImage2.requestGptImage2Generation({ ...params, prompt: 'x'.repeat(20001) }, fetchImpl), /20000/);
    await assert.rejects(gptImage2.requestGptImage2Generation({ ...params, prompt: '  ' }, fetchImpl), /prompt is required/);
    for (const imageUrls of [[], ['data:image/png;base64,abc'], Array(17).fill('https://example.com/photo.png')]) {
      await assert.rejects(gptImage2.requestGptImage2Edit({ ...params, imageUrls }, fetchImpl));
    }
    assert.equal(calls.length, 2, 'invalid requests must not reach the provider');
    await assert.rejects(gptImage2.requestGptImage2Generation(params, async () => Response.json({ code: 402, msg: 'Credits insufficient' })), /Credits insufficient/);
    await assert.rejects(gptImage2.requestGptImage2Generation(params, async () => Response.json({ code: 200, data: {} })), /taskId/);
    assert.throws(() => gptImage2.normalizeGptImage2Status({ code: 401, msg: 'Unauthorized' }), /Unauthorized/);
    assert.equal(gptImage2.normalizeGptImage2Status({ code: 200, data: { state: 'generating' } }).status, 'processing');
    const failed = gptImage2.normalizeGptImage2Status({ code: 200, data: { state: 'fail', failMsg: 'Unable to process image' } });
    assert.equal(failed.status, 'failed');
    assert.equal(failed.errorMessage, 'Unable to process image');
  }

  {
    const originalFetch = globalThis.fetch;
    const originalKey = process.env.KIE_API_KEY;
    const calls: any[] = [];
    process.env.KIE_API_KEY = 'test-key';
    globalThis.fetch = async (_url, init) => {
      calls.push(JSON.parse(init?.body as string));
      return Response.json({ code: 200, data: { taskId: 'quality-check' } });
    };
    try {
      for (const tier of ['FREE', 'PREMIUM']) {
        const params = { cardType: 'birthday' as const, size: 'portrait', userPrompt: 'x'.repeat(6000) };
        const text = await generateCardImage(params, tier);
        const edit = await generateCardImageWithGptImage2Edit({ ...params, imageUrls: ['https://example.com/photo.png'] }, tier);
        assert.equal(text.status, 'processing');
        assert.equal(edit.status, 'processing');
        assert.equal(text.model, gptImage2.GPT_IMAGE_2_MODEL);
        assert.equal(edit.model, gptImage2.GPT_IMAGE_2_EDIT_MODEL);
      }
      assert.deepEqual(calls.map(call => call.input.resolution), ['1K', '1K', '2K', '2K']);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalKey === undefined) Reflect.deleteProperty(process.env, 'KIE_API_KEY');
      else process.env.KIE_API_KEY = originalKey;
    }
  }

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
