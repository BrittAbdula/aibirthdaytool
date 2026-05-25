export const KIE_CLAUDE_OPUS_4_7_MODEL = 'claude-opus-4-7';
export const KIE_CLAUDE_HAIKU_4_5_MODEL = 'claude-haiku-4-5';

export interface KieClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<Record<string, unknown>>;
}

interface KieClaudeMessageOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  messages: KieClaudeMessage[];
  maxTokens?: number;
  thinkingFlag?: boolean;
}

interface KieClaudeResponse {
  model?: string;
  content?: Array<Record<string, unknown>>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

export async function requestKieClaudeMessage(
  options: KieClaudeMessageOptions,
  fetchImpl: typeof fetch = fetch
): Promise<{ text: string; model: string; tokensUsed: number }> {
  const apiKey = options.apiKey || process.env.KIE_API_KEY;
  const baseUrl = normalizeBaseUrl(options.baseUrl || process.env.KIE_BASE_URL || 'https://api.kie.ai');

  if (!apiKey) throw new Error('KIE_API_KEY is not configured');

  const body: Record<string, unknown> = {
    model: options.model || KIE_CLAUDE_OPUS_4_7_MODEL,
    messages: options.messages,
    stream: false,
    max_tokens: options.maxTokens || 4096,
  };

  if (typeof options.thinkingFlag === 'boolean') {
    body.thinkingFlag = options.thinkingFlag;
  }

  const response = await fetchImpl(`${baseUrl}/claude/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`KIE Claude error ${response.status}: ${errorText}`);
  }

  const data: KieClaudeResponse = await response.json();
  const text = extractTextContent(data.content || []);
  const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

  return {
    text,
    model: data.model || options.model || KIE_CLAUDE_OPUS_4_7_MODEL,
    tokensUsed,
  };
}

export function extractSvgContentFromKieClaudeText(content: string): string | null {
  const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
  if (!svgMatch) return null;

  return svgMatch[0]
    .replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, '')
    .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');
}

function extractTextContent(content: Array<Record<string, unknown>>): string {
  return content
    .map((block) => {
      if (block.type === 'text' && typeof block.text === 'string') return block.text;
      if (typeof block.text === 'string') return block.text;
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}
