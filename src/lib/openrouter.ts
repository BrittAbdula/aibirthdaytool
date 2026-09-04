export const OPENROUTER_SVG_MODEL = 'openai/gpt-5.6-luna';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterMessageOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  messages: OpenRouterMessage[];
  maxTokens?: number;
  temperature?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  /** Abort the request after this long; callers that have a fallback set it. */
  timeoutMs?: number;
}

interface OpenRouterResponse {
  model?: string;
  choices?: Array<{ message?: { content?: string } }>;
  usage?: {
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  error?: { message?: string };
}

export async function requestOpenRouterMessage(
  options: OpenRouterMessageOptions,
  fetchImpl: typeof fetch = fetch
): Promise<{ text: string; model: string; tokensUsed: number }> {
  const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
  const baseUrl = normalizeBaseUrl(
    options.baseUrl || process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
  );
  const model = options.model || OPENROUTER_SVG_MODEL;

  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  const body: Record<string, unknown> = {
    model,
    messages: options.messages,
    stream: false,
    // SVG documents routinely run past 4k tokens; too low a cap truncates the card.
    max_tokens: options.maxTokens || 16000,
    temperature: options.temperature ?? 0.85,
    // Reasoning tokens dominate latency and cost here without improving the SVG.
    reasoning: { effort: options.reasoningEffort || 'low', exclude: true },
  };

  const controller = options.timeoutMs ? new AbortController() : undefined;
  const timer = controller ? setTimeout(() => controller.abort(), options.timeoutMs) : undefined;

  let data: OpenRouterResponse;
  try {
    const response = await fetchImpl(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://mewtrucard.com',
        'X-Title': 'MewTruCard',
      },
      body: JSON.stringify(body),
      signal: controller?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${errorText}`);
    }

    data = (await response.json()) as OpenRouterResponse;
  } catch (error) {
    if (controller?.signal.aborted) {
      throw new Error(`OpenRouter request timed out after ${options.timeoutMs}ms`);
    }
    // undici reports every network failure as "fetch failed"; the cause carries the real reason.
    const cause = (error as { cause?: { code?: string; message?: string } })?.cause;
    if (cause && (cause.code || cause.message)) {
      throw new Error(`OpenRouter request failed: ${cause.code || ''} ${cause.message || ''}`.trim());
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (data.error?.message) {
    throw new Error(`OpenRouter error: ${data.error.message}`);
  }

  const text = data.choices?.[0]?.message?.content || '';
  const tokensUsed =
    data.usage?.total_tokens ??
    (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

  return {
    text,
    model: data.model || model,
    tokensUsed,
  };
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}
