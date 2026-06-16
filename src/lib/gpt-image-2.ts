export const LEGACY_GPT_IMAGE_2_MODEL = 'gpt-image-2';
export const GPT_IMAGE_2_MODEL = 'gpt-image-2-text-to-image';
export const GPT_IMAGE_2_EDIT_MODEL = 'gpt-image-2-image-to-image';

type GptImage2Quality = 'low' | 'medium' | 'high' | 'auto';
type GptImage2AspectRatio = 'auto' | '1:1' | '9:16' | '16:9' | '4:3' | '3:4';
type GptImage2Resolution = '1K' | '2K' | '4K';

interface GptImage2RequestParams {
  apiKey?: string;
  baseUrl?: string;
  prompt: string;
  size: string;
  quality?: GptImage2Quality;
  callBackUrl?: string;
}

interface GptImage2EditParams extends GptImage2RequestParams {
  imageUrls: string[];
}

interface GptImage2StatusOptions {
  apiKey?: string;
  baseUrl?: string;
}

export interface GptImage2Result {
  taskId: string;
  tokensUsed: number;
  raw: unknown;
}

export interface NormalizedGptImage2Status {
  status: 'processing' | 'completed' | 'failed';
  imageUrl: string;
  progress: number;
  tokensUsed: number;
  errorMessage?: string;
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

export function getGptImage2AspectRatio(size: string): GptImage2AspectRatio {
  if (size === 'landscape') return '16:9';
  if (size === 'square' || size === 'instagram') return '1:1';
  return '9:16';
}

export function getGptImage2Resolution(quality: GptImage2Quality = 'auto'): GptImage2Resolution {
  return quality === 'high' ? '2K' : '1K';
}

export async function requestGptImage2Generation(
  params: GptImage2RequestParams,
  fetchImpl: typeof fetch = fetch
): Promise<GptImage2Result> {
  return createGptImage2Task(
    {
      ...params,
      model: GPT_IMAGE_2_MODEL,
      input: {
        prompt: params.prompt,
        aspect_ratio: getGptImage2AspectRatio(params.size),
        resolution: getGptImage2Resolution(params.quality),
      },
    },
    'gpt-image-2 generation',
    fetchImpl
  );
}

export async function requestGptImage2Edit(
  params: GptImage2EditParams,
  fetchImpl: typeof fetch = fetch
): Promise<GptImage2Result> {
  const imageUrls = params.imageUrls.filter((url) => typeof url === 'string' && url.length > 0);
  if (!imageUrls.length) {
    throw new Error('No reference images provided');
  }

  return createGptImage2Task(
    {
      ...params,
      model: GPT_IMAGE_2_EDIT_MODEL,
      input: {
        prompt: params.prompt,
        input_urls: imageUrls,
        aspect_ratio: getGptImage2AspectRatio(params.size),
        resolution: getGptImage2Resolution(params.quality),
      },
    },
    'gpt-image-2 edit',
    fetchImpl
  );
}

export async function requestGptImage2Status(
  taskId: string,
  options: GptImage2StatusOptions = {},
  fetchImpl: typeof fetch = fetch
): Promise<NormalizedGptImage2Status> {
  const { apiKey, baseUrl } = resolveRequestConfig(options);
  if (!taskId) {
    throw new Error('Missing gpt-image-2 taskId');
  }

  const response = await fetchImpl(`${baseUrl}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`gpt-image-2 status request failed: ${response.status} ${errorText}`);
  }

  return normalizeGptImage2Status(await response.json());
}

export function normalizeGptImage2Status(data: any): NormalizedGptImage2Status {
  const record = data?.data || data || {};
  const state = String(record?.state || record?.status || '').toLowerCase();
  const imageUrl = getFirstResultUrl(record);
  const tokensUsed = Number(record?.creditsConsumed || record?.credits_consumed || 0);
  const rawProgress = parseProgress(record?.progress);

  if (state === 'success') {
    return {
      status: 'completed',
      imageUrl,
      progress: 100,
      tokensUsed,
      raw: data,
    };
  }

  if (state === 'fail' || state === 'failed' || state === 'generate_failed') {
    return {
      status: 'failed',
      imageUrl: '',
      progress: rawProgress,
      tokensUsed,
      errorMessage: String(record?.failMsg || record?.errorMessage || record?.failCode || 'GPT Image 2 generation failed'),
      raw: data,
    };
  }

  return {
    status: 'processing',
    imageUrl: '',
    progress: rawProgress,
    tokensUsed,
    raw: data,
  };
}

interface CreateTaskOptions extends Pick<GptImage2RequestParams, 'apiKey' | 'baseUrl' | 'callBackUrl'> {
  model: string;
  input: Record<string, unknown>;
}

async function createGptImage2Task(
  options: CreateTaskOptions,
  label: string,
  fetchImpl: typeof fetch
): Promise<GptImage2Result> {
  const { apiKey, baseUrl } = resolveRequestConfig(options);
  const body: Record<string, unknown> = {
    model: options.model,
    input: options.input,
  };
  if (options.callBackUrl) body.callBackUrl = options.callBackUrl;

  const response = await fetchImpl(`${baseUrl}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  return parseGptImage2TaskResponse(response, label);
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

async function parseGptImage2TaskResponse(response: Response, label: string): Promise<GptImage2Result> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${label} failed: ${response.status} ${errorText}`);
  }

  const data = await response.json() as any;
  if (Number(data?.code) !== 200) {
    throw new Error(`${label} failed: ${data?.code || 'unknown'} ${data?.msg || 'Unknown error'}`);
  }

  const taskId = data?.data?.taskId || data?.data?.task_id || data?.taskId || data?.task_id;
  if (typeof taskId !== 'string' || !taskId) {
    throw new Error(`${label} did not return taskId`);
  }

  return {
    taskId,
    tokensUsed: Number(data?.data?.creditsConsumed || data?.usage?.total_tokens || 0),
    raw: data,
  };
}

function getFirstResultUrl(record: any): string {
  const result = parseResultJson(record?.resultJson);
  const resultUrls = result?.resultUrls || result?.result_urls || record?.response?.resultUrls || record?.resultUrls;
  return Array.isArray(resultUrls) && typeof resultUrls[0] === 'string' ? resultUrls[0] : '';
}

function parseResultJson(value: unknown): any {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseProgress(progress: unknown): number {
  if (typeof progress === 'number') return clampProgress(progress);
  if (typeof progress === 'string') {
    const parsed = parseInt(progress.replace('%', ''), 10);
    return Number.isFinite(parsed) ? clampProgress(parsed) : 0;
  }
  return 0;
}

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}
