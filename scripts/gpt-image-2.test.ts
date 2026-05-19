import assert from 'node:assert/strict';

import {
  getGptImage2ApiConfig,
  getGptImage2Size,
  requestGptImage2Edit,
  requestGptImage2Generation,
} from '../src/lib/gpt-image-2';

const pngBase64 = Buffer.from('fake-png').toString('base64');

assert.equal(getGptImage2Size('portrait'), '1024x1536');
assert.equal(getGptImage2Size('story'), '1024x1536');
assert.equal(getGptImage2Size('landscape'), '1536x1024');
assert.equal(getGptImage2Size('square'), '1024x1024');
assert.equal(getGptImage2Size('unknown'), '1024x1536');

assert.deepEqual(
  getGptImage2ApiConfig({
    KIE_API_KEY: 'kie-key',
    KIE_BASE_URL: 'https://api.kie.ai/',
  } as unknown as NodeJS.ProcessEnv),
  {
    apiKey: 'kie-key',
    baseUrl: 'https://api.kie.ai',
  }
);

assert.deepEqual(
  getGptImage2ApiConfig({
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
          data: [{ b64_json: pngBase64 }],
          usage: { total_tokens: 17 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const result = await requestGptImage2Generation(
      {
        apiKey: 'test-key',
        baseUrl: 'https://image.example.com/',
        prompt: 'birthday card',
        size: 'landscape',
      },
      fetchImpl
    );

    assert.equal(calls.length, 1);
    assert.equal(String(calls[0].input), 'https://image.example.com/v1/images/generations');
    assert.equal(calls[0].init?.method, 'POST');
    assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, 'Bearer test-key');

    const body = JSON.parse(calls[0].init?.body as string);
    assert.deepEqual(body, {
      model: 'gpt-image-2',
      prompt: 'birthday card',
      size: '1536x1024',
      quality: 'auto',
      response_format: 'b64_json',
    });
    assert.equal(result.imageBase64, pngBase64);
    assert.equal(result.tokensUsed, 17);
  }

  {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      calls.push({ input, init });
      if (String(input).startsWith('https://cdn.example.com/')) {
        return new Response(Buffer.from([1, 2, 3]), {
          status: 200,
          headers: { 'Content-Type': 'image/png' },
        });
      }

      return new Response(
        JSON.stringify({
          data: [{ b64_json: pngBase64 }],
          usage: { total_tokens: 23 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const result = await requestGptImage2Edit(
      {
        apiKey: 'test-key',
        baseUrl: 'https://image.example.com',
        prompt: 'add glasses',
        size: 'portrait',
        imageUrls: ['https://cdn.example.com/a.png', 'https://cdn.example.com/b.png'],
      },
      fetchImpl
    );

    assert.equal(calls.length, 3);
    assert.equal(String(calls[2].input), 'https://image.example.com/v1/images/edits');
    assert.equal(calls[2].init?.method, 'POST');
    assert.equal((calls[2].init?.headers as Record<string, string>).Authorization, 'Bearer test-key');

    const form = calls[2].init?.body as FormData;
    assert.equal(form.get('model'), 'gpt-image-2');
    assert.equal(form.get('prompt'), 'add glasses');
    assert.equal(form.get('size'), '1024x1536');
    assert.equal(form.get('quality'), 'auto');
    assert.equal(form.get('response_format'), 'b64_json');
    assert.equal(form.getAll('image').length, 2);
    assert.equal(result.imageBase64, pngBase64);
    assert.equal(result.tokensUsed, 23);
  }

  console.log('gpt-image-2 helpers passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
