export const KIE_CLAUDE_OPUS_4_7_MODEL = 'claude-opus-4-7';
export const KIE_CLAUDE_HAIKU_4_5_MODEL = 'claude-haiku-4-5-20251001';
const DEFAULT_KIE_CLAUDE_MODEL = KIE_CLAUDE_HAIKU_4_5_MODEL;

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
    model: options.model || DEFAULT_KIE_CLAUDE_MODEL,
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
    model: data.model || options.model || DEFAULT_KIE_CLAUDE_MODEL,
    tokensUsed,
  };
}

export function extractSvgContentFromKieClaudeText(content: string): string | null {
  const normalizedContent = normalizeSvgCandidateText(content);
  const svgMatch = normalizedContent.match(/<svg\b[\s\S]*<\/svg>/i);
  if (!svgMatch) return null;

  let svgContent = svgMatch[0]
    .replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, '')
    .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');

  const openingTagEnd = svgContent.indexOf('>');
  const openingTag = openingTagEnd >= 0 ? svgContent.slice(0, openingTagEnd + 1) : '';
  if (openingTag && !/\sxmlns=/.test(openingTag)) {
    svgContent = svgContent.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return svgContent;
}

function normalizeSvgCandidateText(content: string): string {
  let text = content.trim();
  const fencedSvg = text.match(/```(?:svg|xml|html)?\s*([\s\S]*?)```/i);
  if (fencedSvg?.[1] && /(?:<svg\b|&lt;svg\b)/i.test(fencedSvg[1])) {
    text = fencedSvg[1].trim();
  }

  if (!/<svg\b/i.test(text) && /&lt;svg\b/i.test(text)) {
    text = text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&amp;/g, '&');
  }

  return text;
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
