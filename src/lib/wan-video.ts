export const WAN_VIDEO_MODEL = 'wan/3-0-video';
export const WAN_VIDEO_DURATION = 3;
export const WAN_VIDEO_ASPECT_RATIO = '9:16';
export const WAN_VIDEO_RESOLUTION = '480P';

interface WanVideoApiOptions {
  apiKey?: string;
  baseUrl?: string;
}

interface WanVideoGenerationOptions extends WanVideoApiOptions {
  prompt: string;
}

export interface WanVideoStatus {
  status: 'processing' | 'completed' | 'failed';
  videoUrl: string;
  progress: number;
  tokensUsed: number;
  errorMessage?: string;
}

function getApiConfig(options: WanVideoApiOptions) {
  const apiKey = options.apiKey || process.env.KIE_API_KEY;
  if (!apiKey) throw new Error('KIE_API_KEY is not configured');
  return {
    apiKey,
    baseUrl: (options.baseUrl || process.env.KIE_BASE_URL || 'https://api.kie.ai').replace(/\/+$/, ''),
  };
}

export async function requestWanVideoGeneration(
  options: WanVideoGenerationOptions,
  fetchImpl: typeof fetch = fetch
): Promise<{ taskId: string }> {
  const { apiKey, baseUrl } = getApiConfig(options);
  const prompt = options.prompt.trim();
  if (!prompt || prompt.length > 20000) throw new Error('Video prompt must contain 1–20,000 characters');

  const response = await fetchImpl(`${baseUrl}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: WAN_VIDEO_MODEL,
      input: {
        prompt,
        duration: WAN_VIDEO_DURATION,
        aspect_ratio: WAN_VIDEO_ASPECT_RATIO,
        resolution: WAN_VIDEO_RESOLUTION,
        audio: false,
      },
    }),
  });
  if (!response.ok) throw new Error(`Wan video generation failed: ${response.status} ${await response.text()}`);
  const data = await response.json() as any;
  if (Number(data?.code) !== 200) throw new Error(`Wan video generation failed: ${data?.msg || data?.code}`);
  const taskId = data?.data?.taskId;
  if (typeof taskId !== 'string' || !taskId) throw new Error('Wan video generation did not return a taskId');
  return { taskId };
}

export async function requestWanVideoStatus(
  taskId: string,
  options: WanVideoApiOptions = {},
  fetchImpl: typeof fetch = fetch
): Promise<WanVideoStatus> {
  const { apiKey, baseUrl } = getApiConfig(options);
  if (!taskId) throw new Error('Missing Wan video taskId');
  const response = await fetchImpl(`${baseUrl}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Wan video status request failed: ${response.status} ${await response.text()}`);
  return normalizeWanVideoStatus(await response.json());
}

export function normalizeWanVideoStatus(data: any): WanVideoStatus {
  if (Number(data?.code) !== 200) throw new Error(`Wan video status unavailable: ${data?.msg || data?.code}`);
  const record = data?.data;
  if (!record) throw new Error('Wan video status is unavailable');
  const tokensUsed = Number(record.creditsConsumed || 0);
  const rawProgress = parseFloat(String(record.progress || 0));
  const progress = Number.isFinite(rawProgress) ? Math.max(0, Math.min(100, rawProgress)) : 0;
  if (record.state === 'fail') {
    return { status: 'failed', videoUrl: '', progress, tokensUsed, errorMessage: record.failMsg || 'Wan video generation failed' };
  }
  if (record.state === 'success') {
    let result;
    try {
      result = typeof record.resultJson === 'string' ? JSON.parse(record.resultJson) : record.resultJson;
    } catch {
      result = null;
    }
    const videoUrl = result?.resultUrls?.[0];
    if (typeof videoUrl !== 'string' || !videoUrl) {
      return { status: 'failed', videoUrl: '', progress, tokensUsed, errorMessage: 'Wan video completed without a video URL' };
    }
    return { status: 'completed', videoUrl, progress: 100, tokensUsed };
  }
  return { status: 'processing', videoUrl: '', progress, tokensUsed };
}
