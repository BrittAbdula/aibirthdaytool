import { CardType } from './card-config';
import { prisma } from './prisma';
import { getTemplateByCardType } from './template-config';
import { nanoid } from 'nanoid';
import { uploadSvgToR2 } from './r2';
import { defaultPrompt } from './prompt';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const YOUR_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://MewTruCard.COM';
const YOUR_SITE_NAME = 'MewTruCard';

// Helper function to escape content
function escapeContent(content: string): string {
    return content
        // .replace(/&/g, '&amp;')
        // .replace(/</g, '&lt;')
        // .replace(/>/g, '&gt;')
        // .replace(/"/g, '&quot;');
}

// Helper function to extract SVG content
function extractSvgContent(content: string): string | null {
    const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
    return svgMatch ? escapeContent(svgMatch[0]) : null;
}

interface ApiLogParams {
    userId?: string;
    cardId: string;
    cardType: CardType;
    userInputs: Record<string, any>;
    promptVersion: string;
    responseContent: string;
    tokensUsed: number;
    duration: number;
    isError?: boolean;
    errorMessage?: string;
}

async function logApiRequest(params: ApiLogParams) {
    try {
        let r2Url: string | undefined;
        const createdAt = new Date();
        
        // Only attempt R2 upload for successful SVG responses
        if (!params.isError && params.responseContent.includes('<svg')) {
            try {
                r2Url = await uploadSvgToR2(params.responseContent, params.cardId, createdAt);
                console.log('<----Uploaded to R2---->')
            } catch (error) {
                console.error("Error uploading to R2:", error);
            }
        }

        // Create API log entry
        await prisma.apiLog.create({
            data: {
                ...(params.userId && { userId: params.userId }),
                cardId: params.cardId,
                cardType: params.cardType,
                userInputs: params.userInputs,
                promptVersion: params.promptVersion,
                responseContent: params.responseContent,
                tokensUsed: params.tokensUsed,
                duration: params.duration,
                isError: params.isError,
                errorMessage: params.errorMessage ? params.errorMessage : undefined,
                r2Url: r2Url,
                timestamp: createdAt,
            },
        });
    } catch (error) {
        console.error("Error logging API request to database:", error);
    }
}

interface CardContentParams {
    userId?: string;
    cardType: CardType;
    version: string;
    templateId: string;
    [key: string]: any;
}

export async function generateCardContent(params: CardContentParams): Promise<{ svgContent: string, cardId: string }> {
    const { userId, cardType, version, templateId, ...otherParams } = params;
    const cardId = nanoid(10);
    const startTime = Date.now();
    const formattedTime = new Date(startTime).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(/\//g, '-');

    try {
        // Validate template
        // const template = await getTemplateByCardType(cardType);
        // console.log('<----template : ' + template + '---->')
        // if (!template) {
        //     throw new Error(`No template found for id: ${templateId}`);
        // }
        // console.log('<----Template templateId : ' + template.id + '---->')

        // Prepare user prompt
        const userPrompt = Object.entries({...otherParams, currentTime: formattedTime})
            .filter(([_, value]) => value !== '' && value !== undefined)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        console.log('<----User prompt : ' + userPrompt + '---->')

        // Check prompt length
        if (userPrompt.length >= 800) {
            await logApiRequest({
                userId,
                cardId,
                cardType,
                userInputs: otherParams,
                promptVersion: version || '',
                responseContent: defaultSVG,
                tokensUsed: 0,
                duration: Date.now() - startTime,
                isError: true,
                errorMessage: "User prompt too long"
            });
            return { svgContent: defaultSVG, cardId };
        }

        // Make API request
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": YOUR_SITE_URL,
                "X-Title": YOUR_SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "anthropic/claude-3.5-sonnet",
                "messages": [
                    { "role": "system", "content": defaultPrompt },
                    { "role": "user", "content": userPrompt },
                ],
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        interface OpenRouterResponse {
            choices: [{
                message: {
                    content: string;
                }
            }];
            usage?: {
                total_tokens: number;
            };
        }

        const data: OpenRouterResponse = await response.json();
        const duration = Date.now() - startTime;
        const content = data.choices[0].message.content;
        console.log('<----Response content : ' + content + '---->')
        const svgContent = extractSvgContent(content);

        // Log the request
        await logApiRequest({
            userId,
            cardId,
            cardType,
            userInputs: otherParams,
            promptVersion: version || '',
            responseContent: svgContent || content,
            tokensUsed: data.usage?.total_tokens || 0,
            duration,
            isError: !svgContent,
            errorMessage: svgContent ? undefined : "No valid SVG content found"
        });

        return {
            svgContent: svgContent || defaultSVG,
            cardId
        };

    } catch (error) {
        // Log error
        await logApiRequest({
            userId,
            cardId,
            cardType,
            userInputs: otherParams,
            promptVersion: version || '',
            responseContent: "",
            tokensUsed: 0,
            duration: Date.now() - startTime,
            isError: true,
            errorMessage: error instanceof Error ? error.message : String(error)
        });

        throw error;
    }
}

const defaultSVG = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Error content -->
</svg>`;