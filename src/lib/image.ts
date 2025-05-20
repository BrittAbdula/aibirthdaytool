import { CardType } from './card-config';
import { prisma } from './prisma';
import { CARD_SIZES, CardSize } from './card-config';
import OpenAI from 'openai';
import { uploadToCloudflareImages } from '@/lib/r2';

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

export async function generateCardImageWithOpenAI(params: CardContentParams, userPlan: string): Promise<{ r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number }> {
    const { userId, cardType, version, templateId, size, style, modificationFeedback, previousCardId, ...otherParams } = params;

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
            throw new Error("User prompt too long");
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

        if (!response?.data?.[0]?.url) {
            throw new Error("No image URL returned");
        }

        const imageUrl = response.data[0].url;
        const cf_url = await uploadToCloudflareImages(imageUrl);
        console.log('<----Response image URL : ' + imageUrl + '---->')

        return {
            r2Url: cf_url || '',
            svgContent: '',
            model: 'grok-2-image',
            tokensUsed: 0, // Image generation doesn't return token usage
            duration: Date.now() - startTime
        };

    } catch (error) {
        throw error;
    }
}