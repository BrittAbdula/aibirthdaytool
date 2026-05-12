export const SEEDANCE_VIDEO_MODEL = 'doubao-seedance-2-0-fast-260128';

type SeedanceRatio = '21:9' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | '9:21';
type SeedanceResolution = '480p' | '720p' | '1080p';

interface SeedanceGenerationOptions {
  apiKey?: string;
  baseUrl?: string;
  prompt: string;
  size: string;
  imageUrls?: string[];
  seed?: number;
}

interface SeedanceStatusOptions {
  apiKey?: string;
  baseUrl?: string;
}

export interface NormalizedSeedanceVideoStatus {
  status: 'processing' | 'completed' | 'failed';
  videoUrl: string;
  progress: number;
  tokensUsed: number;
  errorMessage?: string;
}

export function getSeedanceRatio(size: string): SeedanceRatio {
  if (size === 'landscape') return '16:9';
  if (size === 'square') return '1:1';
  return '9:16';
}

export function getSeedanceResolution(_size: string): SeedanceResolution {
  return '720p';
}

export async function requestSeedanceVideoGeneration(
  options: SeedanceGenerationOptions,
  fetchImpl: typeof fetch = fetch
): Promise<{ taskId: string }> {
  const apiKey = options.apiKey || process.env.SEEDANCE_API_KEY || process.env.HM_API_KEY;
  const baseUrl = normalizeBaseUrl(options.baseUrl || process.env.SEEDANCE_BASE_URL || process.env.HM_BASE_URL);

  if (!apiKey) throw new Error('SEEDANCE_API_KEY or HM_API_KEY is not configured');
  if (!baseUrl) throw new Error('SEEDANCE_BASE_URL or HM_BASE_URL is not configured');

  const body: Record<string, unknown> = {
    prompt: trimSeedancePrompt(options.prompt),
    model: SEEDANCE_VIDEO_MODEL,
    duration: 5,
    resolution: getSeedanceResolution(options.size),
    ratio: getSeedanceRatio(options.size),
    watermark: false,
    camerafixed: false,
    return_last_frame: false,
    generate_audio: false,
  };

  if (typeof options.seed === 'number') body.seed = options.seed;
  if (options.imageUrls?.length) body.images = options.imageUrls;

  const response = await fetchImpl(`${baseUrl}/v2/videos/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Seedance video generation failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const taskId = data?.task_id;
  if (!taskId) throw new Error('No task_id returned from Seedance video generation');

  return { taskId };
}

export async function requestSeedanceVideoStatus(
  taskId: string,
  options: SeedanceStatusOptions = {},
  fetchImpl: typeof fetch = fetch
): Promise<NormalizedSeedanceVideoStatus> {
  const apiKey = options.apiKey || process.env.SEEDANCE_API_KEY || process.env.HM_API_KEY;
  const baseUrl = normalizeBaseUrl(options.baseUrl || process.env.SEEDANCE_BASE_URL || process.env.HM_BASE_URL);

  if (!apiKey) throw new Error('SEEDANCE_API_KEY or HM_API_KEY is not configured');
  if (!baseUrl) throw new Error('SEEDANCE_BASE_URL or HM_BASE_URL is not configured');

  const response = await fetchImpl(`${baseUrl}/v2/videos/generations/${encodeURIComponent(taskId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Seedance status request failed: ${response.status} ${errorText}`);
  }

  return normalizeSeedanceVideoStatus(await response.json());
}

export function normalizeSeedanceVideoStatus(data: any): NormalizedSeedanceVideoStatus {
  const status = String(data?.status || '').toUpperCase();
  const progress = parseProgress(data?.progress);
  const videoUrl = String(data?.data?.output || '');
  const tokensUsed = Number(data?.data?.usage?.total_tokens || 0);

  if (status === 'SUCCESS') {
    return {
      status: 'completed',
      videoUrl,
      progress: 100,
      tokensUsed,
    };
  }

  if (status === 'FAILURE') {
    return {
      status: 'failed',
      videoUrl: '',
      progress,
      tokensUsed,
      errorMessage: String(data?.fail_reason || 'Seedance video generation failed'),
    };
  }

  return {
    status: 'processing',
    videoUrl: '',
    progress,
    tokensUsed,
  };
}

function normalizeBaseUrl(baseUrl?: string): string {
  return (baseUrl || '').replace(/\/+$/, '');
}

function trimSeedancePrompt(prompt: string): string {
  const normalized = prompt.replace(/\s+/g, ' ').trim();
  return normalized.length > 800 ? normalized.slice(0, 800) : normalized;
}

function parseProgress(progress: unknown): number {
  if (typeof progress === 'number') return Math.max(0, Math.min(100, progress));
  if (typeof progress === 'string') {
    const parsed = parseInt(progress.replace('%', ''), 10);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 0;
  }
  return 0;
}
