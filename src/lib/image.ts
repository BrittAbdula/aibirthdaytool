import { CardType } from './card-config';
import { prisma } from './prisma';
import { nanoid } from 'nanoid';
import { CARD_SIZES, CardSize } from './card-config';
import OpenAI from 'openai';
import { uploadToCloudflareImages } from '@/lib/r2';

interface ApiLogParams {
    userId?: string;
    cardId: string;
    cardType: CardType;
    userInputs: Record<string, any>;
    promptVersion: string;
    responseContent: string;
    r2Url: string;
    tokensUsed: number; 
    duration: number;
    isError?: boolean;
    errorMessage?: string;
}

async function logApiRequest(params: ApiLogParams): Promise<string | undefined> {
    try {
        let r2Url: string = '';
        const createdAt = new Date();

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
                r2Url: params.r2Url,
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


export async function generateCardImage(params: CardContentParams, userPlan: string): Promise<{ r2Url: string, cardId: string, svgContent: string }> {
    const { userId, cardType, version, templateId, size, style, modificationFeedback, previousCardId, ...otherParams } = params;
    const cardId = nanoid(10);
    const startTime = Date.now();

    const formattedTime = new Date(startTime).toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-');

    try {
        // Get card size
        const cardSize = CARD_SIZES[size || 'portrait'];

        // Prepare user prompt
        let userPrompt = '';
        
        // If this is a modification request, add the feedback to the user prompt
        if (modificationFeedback && previousCardId) {
            // Get the previous card content
            try {
                const previousCard = await prisma.apiLog.findUnique({
                    where: { cardId: previousCardId },
                    select: { userInputs: true }
                });

                if (previousCard) {
                    userPrompt = `Create a ${cardType} card with these modifications: ${modificationFeedback}. 
Based on previous design with parameters: ${JSON.stringify(previousCard.userInputs)}` +
                `Design: Match the event tone with a fitting theme (e.g., magical for Elsa, safari for kids). Use a central illustration, cohesive colors, handwritten font for the main message, sans-serif for details, and small accents to frame. Be creative for a polished look.`;
                }
            } catch (error) {
                console.error("Error fetching previous card content:", error);
                // Continue without the previous content if there's an error
            }
        }

        // If not a modification or previous fetch failed, create standard prompt
        if (!userPrompt) {
            const userPromptFields = Object.entries({
                ...otherParams,
                cardType,
                style,
                currentTime: formattedTime
            })
                .filter(([_, value]) => value !== '' && value !== undefined)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');

                userPrompt = `Create a ${cardType} card that feels personal and festive, using these details to inspire a unique design:\n${userPromptFields}\n` +
                `Card dimensions: ${cardSize.width}x${cardSize.height}\n\n` +
                `Design: Match the event tone with a fitting theme (e.g., magical for Elsa, safari for kids). Use a central illustration, cohesive colors, handwritten font for the main message, sans-serif for details, and small accents to frame. Be creative for a polished look.`;
        }

        console.log('<----User prompt : ' + userPrompt + '---->')

        // Check prompt length
        if (userPrompt.length >= 5000) {
            await logApiRequest({
                userId,
                cardId,
                cardType,
                userInputs: otherParams,
                promptVersion: 'grok-2-image',
                responseContent: 'userPrompt is too long',
                tokensUsed: 0,
                r2Url: '',
                duration: Date.now() - startTime,
                isError: true,
                errorMessage: "User prompt too long"
            });
            return { r2Url: '', cardId, svgContent: '' };
        }

        const openai = new OpenAI({
            apiKey: process.env.X_AI_API_KEY,
            baseURL: "https://api.x.ai/v1",
        });


        const response = await openai.images.generate({
            model: "grok-2-image",
            prompt: userPrompt,
        });
        console.log(response);

        // if (!response) {
        //     const errorData = await response.json().catch(() => ({}));
        //     console.error('API Error:', errorData);
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }

        const duration = Date.now() - startTime;
        const imageUrl = response?.data?.[0]?.url || '';
        const cf_url = await uploadToCloudflareImages(imageUrl);
        console.log('<----Response image URL : ' + imageUrl + '---->')
        
        // Log the request
        const r2Url = await logApiRequest({
            userId,
            cardId,
            cardType,
            userInputs: otherParams,
            promptVersion: 'grok-2-image',
            responseContent: "",
            r2Url: cf_url,
            tokensUsed: 0, // No tokens for image generation
            duration,
            isError: !imageUrl,
            errorMessage: imageUrl ? undefined : "No image URL returned"
        });

        // Return the image URL as r2Url and empty svgContent
        return {
            r2Url: imageUrl || '',
            cardId,
            svgContent: ''
        };

    } catch (error) {
        // Log error
        await logApiRequest({
            userId,
            cardId,
            cardType,
            userInputs: otherParams,
            promptVersion: 'grok-2-image',
            responseContent: "error",
            tokensUsed: 0,
            r2Url: '',
            duration: Date.now() - startTime,
            isError: true,
            errorMessage: error instanceof Error ? error.message : String(error)
        });

        throw error;
    }
}

