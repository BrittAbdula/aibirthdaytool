import { CARD_SIZES } from './card-config';
import { generatePrompt } from './prompt';

interface CardContentParams {
    cardType: string;
    size: string;
    userPrompt: string;
    modificationFeedback?: string;
    previousCardId?: string;
}

interface MessagesResponse {
    id: string;
    type: string;
    model: string;
    role?: string;
    content: Array<{
        type: 'text';
        text: string;
    }>;
    usage?: {
        input_tokens?: number;
        output_tokens?: number;
    };
}

function extractSvgContent(content: string): string | null {
    const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
    if (!svgMatch) return null;
    let svgContent = svgMatch[0]
        .replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, '')
        .replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, '&amp;');
    return svgContent;
}

export async function generateCardContentWithAnthropic(
    params: CardContentParams,
    model: string
): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string , status?: string }>{
    const { cardType, size, userPrompt } = params;
    const startTime = Date.now();

    const baseUrl = process.env.HOLD_AI_BASE_URL || process.env.ANTHROPIC_BASE_URL || process.env.CLAUDE_BASE_URL || '';
    const apiKey = process.env.HOLD_AI_KEY || process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '';

    if (!baseUrl) {
        return { taskId: '', r2Url: '', svgContent: '', model, tokensUsed: 0, duration: 0, errorMessage: 'Missing ANTHROPIC_BASE_URL', status: 'error' };
    }
    if (!apiKey) {
        return { taskId: '', r2Url: '', svgContent: '', model, tokensUsed: 0, duration: 0, errorMessage: 'Missing ANTHROPIC_API_KEY', status: 'error' };
    }

    try {
        const cardSize = CARD_SIZES[size || 'portrait'];
        const systemPrompt = generatePrompt(cardType as any, cardSize);

        const body = {
            model,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: userPrompt }
                    ]
                }
            ],
            max_tokens: 4096,
            temperature: 0.85
        } as const;

        const resp = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) {
            const err = await resp.text();
            throw new Error(`Anthropic Messages error ${resp.status}: ${err}`);
        }

        const data: MessagesResponse = await resp.json();
        const duration = Date.now() - startTime;

        const contentText = (data.content?.find(c => c.type === 'text')?.text) || '';
        const svgContent = extractSvgContent(contentText);
        if (!svgContent) throw new Error('No valid SVG content found');

        const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

        return {
            taskId: '',
            r2Url: '',
            svgContent,
            model: data.model || model,
            tokensUsed,
            duration,
            errorMessage: ''
        };
    } catch (e: any) {
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model,
            tokensUsed: 0,
            duration: 0,
            errorMessage: e?.message || 'Unknown error',
            status: 'error'
        };
    }
}


