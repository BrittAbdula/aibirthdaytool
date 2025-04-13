import { CardType } from './card-config';
import { prisma } from './prisma';
import { getTemplateByCardType } from './template-config';
import { nanoid } from 'nanoid';
import { uploadSvgToR2 } from './r2';
import { defaultPrompt, generatePrompt } from './prompt';
import { CARD_SIZES, CardSize } from './card-config';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const YOUR_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://MewTruCard.COM';
const YOUR_SITE_NAME = 'MewTruCard';

// Helper function to escape content
function escapeContent(content: string): string {
    return content
        .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Helper function to extract SVG content
function extractSvgContent(content: string): string | null {
    const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
    if (!svgMatch) return null;
    
    // Clean and escape the SVG content
    let svgContent = svgMatch[0]
        // Remove any invalid XML characters
        .replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, '')
        // Ensure proper entity escaping
        .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');
    
    return svgContent;
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

async function logApiRequest(params: ApiLogParams): Promise<string | undefined> {
    try {
        let r2Url: string = '';
        const createdAt = new Date();
        
        // Only attempt R2 upload for successful SVG responses
        // if (!params.isError && params.responseContent.includes('<svg')) {
        //     try {
        //         r2Url = await uploadSvgToR2(params.responseContent, params.cardId, createdAt);
        //         console.log('<----Uploaded to R2---->')
        //     } catch (error) {
        //         console.error("Error uploading to R2:", error);
        //     }
        // }

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
        return r2Url;
    } catch (error) {
        console.error("Error logging API request to database:", error);
    }
}

interface CardContentParams {
    userId?: string;
    cardType: CardType;
    version?: string;
    templateId?: string;
    size?: string;
    style?: string;
    modificationFeedback?: string;
    previousCardId?: string;
    [key: string]: any;
}

function getRandomModel(): string {
    const models = [
        { name: "anthropic/claude-3.5-haiku", weight: 1 },
        // { name: "anthropic/claude-3.7-sonnet", weight: 1 },
        { name: "deepseek/deepseek-chat-v3-0324:free", weight: 2 }
    ];

    const totalWeight = models.reduce((sum, model) => sum + model.weight, 0);
    const random = Math.random() * totalWeight;

    let cumulativeWeight = 0;
    for (const model of models) {
        cumulativeWeight += model.weight;
        if (random < cumulativeWeight) {
            return model.name;
        }
    }

    return models[0].name; // Fallback, should not reach here
}

export async function generateCardContent(params: CardContentParams): Promise<{ r2Url: string, cardId: string, svgContent: string }> {
    const { userId, cardType, version, templateId, size, modificationFeedback, previousCardId, ...otherParams } = params;
    const cardId = nanoid(10);
    const startTime = Date.now();

    const model = getRandomModel();
    console.log('<----Using model : ' + model + '---->')
    const formattedTime = new Date(startTime).toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-');

    try {
        // Get card size
        const cardSize = CARD_SIZES[size || 'portrait'];

        // Generate dynamic prompt
        const systemPrompt = generatePrompt(cardType, cardSize);

        // If this is a modification request, add the feedback to the user prompt
        let userPromptPrefixText = '';
        let previousSvgContent = '';
        
        if (modificationFeedback && previousCardId) {
            // Get the previous card content
            try {
                const previousCard = await prisma.apiLog.findUnique({
                    where: { cardId: previousCardId },
                    select: { responseContent: true }
                });
                
                if (previousCard && previousCard.responseContent !== 'success' && previousCard.responseContent !== 'error') {
                    previousSvgContent = previousCard.responseContent;
                    userPromptPrefixText = `
I want to modify the previous card design with this feedback: ${modificationFeedback}

Here is the previous SVG content:
${previousSvgContent}

Please create a new version based on this feedback while maintaining the overall design. Make ONLY the requested changes.

`;
                }
            } catch (error) {
                console.error("Error fetching previous card content:", error);
                // Continue without the previous content if there's an error
            }
        }

        // Prepare user prompt
        const userPromptFields = Object.entries({
            ...otherParams,
            currentTime: formattedTime
        })
            .filter(([_, value]) => value !== '' && value !== undefined)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        const userPrompt = userPromptPrefixText + userPromptFields;
        console.log('<----User prompt : ' + userPrompt + '---->')

        // Check prompt length
        if (userPrompt.length >= 4000) {
            await logApiRequest({
                userId,
                cardId,
                cardType,
                userInputs: otherParams,
                promptVersion: model || '',
                responseContent: 'userPrompt is too long',
                tokensUsed: 0,
                duration: Date.now() - startTime,
                isError: true,
                errorMessage: "User prompt too long"
            });
            return { r2Url: '', cardId, svgContent: '' };
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
                "model":  model,
                "messages": [
                    { 
                        "role": "system", 
                        "content": systemPrompt 
                    },
                    { 
                        "role": "user", 
                        "content": [
                            {
                                "type": "text",
                                "text": userPrompt
                            }
                        ]
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 4096,
                'provider': {
                  'order': [
                    'OpenAI',
                    'Together'
                  ]
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
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
        const r2Url = await logApiRequest({
            userId,
            cardId,
            cardType,
            userInputs: otherParams,
            promptVersion: model || '',
            responseContent: svgContent || content,
            tokensUsed: data.usage?.total_tokens || 0,
            duration,
            isError: !svgContent,
            errorMessage: svgContent ? undefined : "No valid SVG content found"
        });

        // Make sure to return the SVG content
        return {
            r2Url: r2Url || '',
            cardId,
            svgContent: svgContent || ''
        };

    } catch (error) {
        // Log error
        await logApiRequest({
            userId,
            cardId,
            cardType,
            userInputs: otherParams,
            promptVersion: model || '',
            responseContent: "error",
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