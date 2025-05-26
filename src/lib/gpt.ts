import { CardType } from './card-config';
import { prisma } from './prisma';
import { getTemplateByCardType } from './template-config';
import { defaultPrompt, generatePrompt } from './prompt';
import { CARD_SIZES } from './card-config';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const YOUR_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://MewTruCard.COM';
const YOUR_SITE_NAME = 'MewTruCard';

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

function getRandomModel(modelLevel: string): string {
    if (modelLevel === 'PREMIUM') {
        return 'anthropic/claude-sonnet-4';
    }
    
    const models = [
        { name: "anthropic/claude-3.5-haiku", weight: 5 },
        // { name: "anthropic/claude-3.7-sonnet", weight: 1 },
        { name: "anthropic/claude-sonnet-4", weight: 1 },
        { name: "deepseek/deepseek-chat-v3-0324:free", weight: 20 },
        // { name: "deepseek/deepseek-chat", weight: 100 }
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

interface CardContentParams {
    cardType: CardType;
    size: string;
    userPrompt: string;
    modificationFeedback?: string;
    previousCardId?: string;
}

export async function generateCardContent(params: CardContentParams, modelLevel: string): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string , status?: string }> {
    const { cardType, size, userPrompt, modificationFeedback, previousCardId } = params;

    const startTime = Date.now();
    const model = getRandomModel(modelLevel);
    console.log('<----Using model : ' + model + '---->')
    console.log('<----modelLevel : ' + modelLevel + '---->')

    try {
        // Get card size
        const cardSize = CARD_SIZES[size || 'portrait'];

        // Generate dynamic prompt
        const systemPrompt = generatePrompt(cardType, cardSize);

        // If this is a modification request, add the feedback to the user prompt
        let userPromptPrefixText = '';
        let previousSvgContent = '';

        if (modificationFeedback && previousCardId) {
            // Get the previous card content from the database
            try {
                const previousCard = await prisma.apiLog.findUnique({
                    where: { cardId: previousCardId },
                    select: { responseContent: true }
                });

                if (previousCard) {
                    previousSvgContent = previousCard.responseContent;
                    userPromptPrefixText = `
I want to modify the previous card design with this feedback: ${modificationFeedback}

Here is the previous SVG content:
${previousSvgContent}

IMPORTANT: return SVG code only. Do not include any explanation, commentary, or other text.
`;
                }
            } catch (error) {
                console.error("Error fetching previous card content:", error);
                // Continue without the previous content if there's an error
            }
        }


        const finalUserPrompt = userPromptPrefixText ? userPromptPrefixText : userPrompt;
        console.log('<----User prompt : ' + finalUserPrompt + '---->')

        // Check prompt length
        if (finalUserPrompt.length >= 5000) {
            throw new Error("User prompt too long");
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
                "model": model,
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
                                "text": finalUserPrompt
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
        const tokensUsed = data.usage?.total_tokens || 0;

        console.log('<----Response content : ' + content + '---->')
        const svgContent = extractSvgContent(content);

        if (!svgContent) {
            throw new Error("No valid SVG content found");
        }

        return {
            taskId: '',
            r2Url: '',
            svgContent,
            model,
            tokensUsed,
            duration,
            errorMessage: ''
        };

    } catch (error) {
        console.error('Error in generateCardContent:', error);
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model,
            tokensUsed: 0,
            duration: 0,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

  