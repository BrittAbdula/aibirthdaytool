import { extractSvgContent } from './svg-extract';
import { FALLBACK_SVG_MODEL } from './svg-models';

interface KieSvgOptions {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

interface KieResponse {
  status?: string;
  error?: { message?: string };
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  usage?: { total_tokens?: number; input_tokens?: number; output_tokens?: number };
}

// Kie uses Responses endpoints for both GPT-6 and Grok 4.7.
export async function requestKieSvg(options: KieSvgOptions, fetchImpl: typeof fetch = fetch) {
  const apiKey = options.apiKey || process.env.KIE_API_KEY;
  if (!apiKey) throw new Error('KIE_API_KEY is not configured');
  const baseUrl = (options.baseUrl || process.env.KIE_BASE_URL || 'https://api.kie.ai').replace(/\/+$/, '');

  async function attempt(model: string) {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 120000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const endpoint = model === FALLBACK_SVG_MODEL ? 'grok' : 'codex';
      const response = await fetchImpl(`${baseUrl}/${endpoint}/v1/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          input: [
            { role: 'system', content: options.systemPrompt },
            { role: 'user', content: options.userPrompt },
          ],
          stream: false,
          reasoning: { effort: 'low' },
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Kie ${model} error ${response.status}`);
      const data: KieResponse = await response.json();
      if (data.error || (data.status && data.status !== 'completed')) {
        throw new Error(`Kie ${model}: ${data.error?.message || data.status}`);
      }
      const text = (data.output || [])
        .filter(item => item.type === 'message')
        .flatMap(item => item.content || [])
        .filter(block => block.type === 'output_text' && typeof block.text === 'string')
        .map(block => block.text)
        .join('\n');
      const svgContent = extractSvgContent(text);
      if (!svgContent) throw new Error(`Kie ${model}: No valid SVG content found`);
      return {
        svgContent,
        model,
        tokensUsed: data.usage?.total_tokens ??
          (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      };
    } catch (error) {
      if (controller.signal.aborted) throw new Error(`Kie ${model} timed out after ${timeoutMs}ms`);
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  try {
    return await attempt(options.model);
  } catch (error) {
    console.warn(`[svg] ${options.model} failed; falling back to ${FALLBACK_SVG_MODEL}:`,
      error instanceof Error ? error.message : 'Unknown error');
    return attempt(FALLBACK_SVG_MODEL);
  }
}
