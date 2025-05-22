import { CardType } from './card-config';
import { prisma } from './prisma';
import { CARD_SIZES, CardSize } from './card-config';
import OpenAI from 'openai';
import { uploadToCloudflareImages, uploadBase64ToCloudflareImages, uploadCloudinaryFromBase64 } from '@/lib/r2';
import { GoogleGenAI, Modality } from "@google/genai";
import { nanoid } from 'nanoid';
import { v2 as cloudinary } from 'cloudinary';

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

export async function generateCardImageWithGrok(params: CardContentParams, userPlan: string): Promise<{ r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string }> {
    const { userId, modelTier, format, variationIndex, cardType, version, templateId, size, style, modificationFeedback, previousCardId, ...otherParams } = params;

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
            duration: Date.now() - startTime,
            errorMessage: ''
        };

    } catch (error) {
        throw error;
    }
}


export async function generateCardImageWithGenAI(params: CardContentParams, userPlan: string): Promise<{ r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string }> {
    const { userId, modelTier, format, variationIndex, cardType, version, templateId, size, style, modificationFeedback, previousCardId, ...otherParams } = params;

    const startTime = Date.now();
    const formattedTime = new Date(startTime).toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-');
    console.log('<----Using model : ' + 'Google Gemini' + '---->');

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
                    userPrompt = `Modify the previous design for a ${cardType} card based on these parameters: ${JSON.stringify(previousCard.userInputs)}. Apply these specific modifications: ${modificationFeedback}.` +
                        `\nDesign instructions: Match the event tone with a fitting theme (e.g., magical for Elsa, safari for kids). Use a central illustration, cohesive colors, handwritten font for the main message, sans-serif for details, and small accents to frame. Be creative for a polished look.` +
                        `\nCard dimensions: ${cardSize.width}x${cardSize.height} pixels (aspect ratio guidance).`;
                }
            } catch (error) {
                console.error("Error fetching previous card content for Gemini:", error);
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
                `Card dimensions: ${cardSize.width}x${cardSize.height} pixels (aspect ratio guidance).\n\n` +
                `Design instructions: Match the event tone with a fitting theme (e.g., magical for Elsa, safari for kids). Use a central illustration, cohesive colors, handwritten font for the main message, sans-serif for details, and small accents to frame. Be creative for a polished look.`;
        }

        console.log('<----User prompt for Gemini: ' + userPrompt + '---->');

        // Check prompt length
        if (userPrompt.length >= 5000) {
            throw new Error("User prompt too long for Gemini");
        }

        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Use the recommended Gemini model for image generation
        // Reference: https://ai.google.dev/gemini-api/docs/image-generation
        // const model = genAI.getGenerativeModel({ // Removed this line
        //     model: "gemini-2.0-flash-preview-image-generation", // Removed this line
        //     generationConfig: { // Removed this line
        //         responseMimeType: "image/png", // Specify desired output format // Removed this line
        //     }, // Removed this line
        // }); // Removed this line


        const result = await genAI.models.generateContent({ // Modified this line
            model: "gemini-2.0-flash-preview-image-generation", // Added model here
            contents: [{
                role: "user",
                parts: [{ text: userPrompt }]
            }],
            config: { // Changed from generationConfig to config
                 responseMimeType: "image/png", // Specify desired output format
                 responseModalities: [Modality.TEXT, Modality.IMAGE], // Include image in response
            }
        });

        const response = result; // Assigned result directly to response
        const imagePart = response.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData?.mimeType?.startsWith('image/')); // Added type 'any' to part

        if (!imagePart?.inlineData?.data) {
             console.error('Gemini response:', JSON.stringify(response, null, 2)); // Log full response for debugging
             throw new Error("No image data returned from Gemini");
        }

        const base64Image = imagePart.inlineData.data;

        // Upload base64 image to Cloudflare Images
        const cf_url = await uploadBase64ToCloudflareImages(base64Image);
        console.log('<----Gemini response image URL : ' + cf_url + '---->');


        return {
            r2Url: cf_url || '',
            svgContent: '', // Gemini generates raster images, not SVG
            model: 'gemini-2.0-flash-preview-image-generation',
            tokensUsed: 0, // Gemini image generation doesn't return token usage directly in this manner
            duration: Date.now() - startTime,
            errorMessage: ''
        };

    } catch (error: any) {
        console.error("Error generating image with Gemini:", error);
        return {
            r2Url: '',
            svgContent: '',
            model: 'gemini-2.0-flash-preview-image-generation',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error.message || "An unknown error occurred during Gemini image generation."
        };
    }
}