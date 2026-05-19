export const GPT_IMAGE_2_MODEL = 'gpt-image-2';
export const GPT_IMAGE_2_EDIT_MODEL = 'gpt-image-2-edit';

type GptImage2Quality = 'low' | 'medium' | 'high' | 'auto';
type GptImage2ResponseFormat = 'b64_json' | 'url';

interface GptImage2RequestParams {
  apiKey?: string;
  baseUrl?: string;
  prompt: string;
  size: string;
  quality?: GptImage2Quality;
  responseFormat?: GptImage2ResponseFormat;
}

interface GptImage2EditParams extends GptImage2RequestParams {
  imageUrls: string[];
}

export interface GptImage2Result {
  imageBase64?: string;
  imageUrl?: string;
  tokensUsed: number;
  raw: unknown;
}

interface GptImage2ApiConfig {
  apiKey: string;
  baseUrl: string;
}

export function getGptImage2ApiConfig(env: NodeJS.ProcessEnv = process.env): GptImage2ApiConfig {
  const apiKey = env.KIE_API_KEY || '';
  const baseUrl = env.KIE_BASE_URL || 'https://api.kie.ai';

  return {
    apiKey,
    baseUrl: trimTrailingSlash(baseUrl),
  };
}

export function getGptImage2Size(size: string): string {
  if (size === 'landscape') return '1536x1024';
  if (size === 'square' || size === 'instagram') return '1024x1024';
  return '1024x1536';
}

export async function requestGptImage2Generation(
  params: GptImage2RequestParams,
  fetchImpl: typeof fetch = fetch
): Promise<GptImage2Result> {
  const { apiKey, baseUrl } = resolveRequestConfig(params);
  const response = await fetchImpl(`${baseUrl}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GPT_IMAGE_2_MODEL,
      prompt: params.prompt,
      size: getGptImage2Size(params.size),
      quality: params.quality || 'auto',
      response_format: params.responseFormat || 'b64_json',
    }),
  });

  return parseGptImage2Response(response, 'gpt-image-2 generation');
}

export async function requestGptImage2Edit(
  params: GptImage2EditParams,
  fetchImpl: typeof fetch = fetch
): Promise<GptImage2Result> {
  const { apiKey, baseUrl } = resolveRequestConfig(params);
  if (!params.imageUrls.length) {
    throw new Error('No reference images provided');
  }

  const formData = new FormData();
  for (const [index, imageUrl] of params.imageUrls.entries()) {
    const image = await fetchImageAsBlob(imageUrl, index, fetchImpl);
    formData.append('image', image.blob, image.filename);
  }
  formData.append('prompt', params.prompt);
  formData.append('model', GPT_IMAGE_2_MODEL);
  formData.append('size', getGptImage2Size(params.size));
  formData.append('quality', params.quality || 'auto');
  formData.append('response_format', params.responseFormat || 'b64_json');

  const response = await fetchImpl(`${baseUrl}/v1/images/edits`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  return parseGptImage2Response(response, 'gpt-image-2 edit');
}

function resolveRequestConfig(params: Pick<GptImage2RequestParams, 'apiKey' | 'baseUrl'>): GptImage2ApiConfig {
  const config = getGptImage2ApiConfig();
  const apiKey = params.apiKey || config.apiKey;
  const baseUrl = trimTrailingSlash(params.baseUrl || config.baseUrl);

  if (!apiKey) {
    throw new Error('KIE_API_KEY is not configured');
  }

  return { apiKey, baseUrl };
}

async function parseGptImage2Response(response: Response, label: string): Promise<GptImage2Result> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${label} failed: ${response.status} ${errorText}`);
  }

  const data = await response.json() as any;
  const image = data?.data?.[0];
  const imageBase64 = normalizeBase64Image(image?.b64_json);
  const imageUrl = typeof image?.url === 'string' ? image.url : undefined;

  if (!imageBase64 && !imageUrl) {
    throw new Error(`${label} did not return image data`);
  }

  return {
    imageBase64,
    imageUrl,
    tokensUsed: Number(data?.usage?.total_tokens || 0),
    raw: data,
  };
}

async function fetchImageAsBlob(
  imageUrl: string,
  index: number,
  fetchImpl: typeof fetch
): Promise<{ blob: Blob; filename: string }> {
  const response = await fetchImpl(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch reference image ${index + 1}: ${response.status}`);
  }

  const contentType = response.headers.get('Content-Type') || 'image/png';
  const imageBuffer = await response.arrayBuffer();
  const blob = new Blob([imageBuffer], { type: contentType });

  return {
    blob,
    filename: getImageFilename(imageUrl, index, contentType),
  };
}

function getImageFilename(imageUrl: string, index: number, contentType: string): string {
  const extension = contentType.includes('jpeg') || contentType.includes('jpg')
    ? 'jpg'
    : contentType.includes('webp')
      ? 'webp'
      : 'png';

  try {
    const pathname = new URL(imageUrl).pathname;
    const filename = pathname.split('/').filter(Boolean).pop();
    if (filename && filename.includes('.')) return filename;
  } catch {}

  return `reference-${index + 1}.${extension}`;
}

function normalizeBase64Image(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  const dataUrlPrefix = ';base64,';
  const prefixIndex = value.indexOf(dataUrlPrefix);
  return prefixIndex >= 0 ? value.slice(prefixIndex + dataUrlPrefix.length) : value;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}
