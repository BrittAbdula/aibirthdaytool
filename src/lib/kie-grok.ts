export const KIE_GROK_4_6_MODEL = 'grok-4-6';

export interface KieGrokMessage {
  role: 'user' | 'assistant';
  content: string | Array<Record<string, unknown>>;
}

interface KieGrokMessageOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  messages: KieGrokMessage[];
  reasoningEffort?: 'low' | 'medium' | 'high' | 'xhigh';
}

interface KieGrokOutputContent {
  type?: string;
  text?: string;
}

interface KieGrokOutputItem {
  type?: string;
  role?: string;
  content?: KieGrokOutputContent[];
  status?: string;
}

interface KieGrokResponse {
  output?: KieGrokOutputItem[];
  usage?: {
    total_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
  };
}

export async function requestKieGrokMessage(
  options: KieGrokMessageOptions,
  fetchImpl: typeof fetch = fetch
): Promise<{ text: string; model: string; tokensUsed: number }> {
  const apiKey = options.apiKey || process.env.KIE_API_KEY;
  const baseUrl = normalizeBaseUrl(options.baseUrl || process.env.KIE_BASE_URL || 'https://api.kie.ai');
  const model = options.model || KIE_GROK_4_6_MODEL;

  if (!apiKey) throw new Error('KIE_API_KEY is not configured');

  const body: Record<string, unknown> = {
    model,
    input: options.messages,
    stream: false,
  };

  if (options.reasoningEffort) {
    body.reasoning = { effort: options.reasoningEffort };
  }

  const response = await fetchImpl(`${baseUrl}/grok/v1/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`KIE Grok error ${response.status}: ${errorText}`);
  }

  const data: KieGrokResponse = await response.json();
  const text = extractTextContent(data.output || []);
  const tokensUsed =
    data.usage?.total_tokens ?? (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

  return {
    text,
    model,
    tokensUsed,
  };
}

function extractTextContent(output: KieGrokOutputItem[]): string {
  return output
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content || [])
    .map((block) => (block.type === 'output_text' && typeof block.text === 'string' ? block.text : ''))
    .filter(Boolean)
    .join('\n');
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}
