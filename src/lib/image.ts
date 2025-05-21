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
    console.log('<----Using model : ' + 'Google Gemini' + '---->')

    try {
        // Get card size
        const cardSize = CARD_SIZES[size || 'portrait'];

        // Prepare user prompt
        let userPrompt = '';

        // If this is a modification request, add the feedback to the user prompt
        if (modificationFeedback && previousCardId) {
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
            }
        }

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

        if (userPrompt.length >= 5000) {
            throw new Error("User prompt too long");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not configured");
        }

        const ai = new GoogleGenAI({ apiKey });
        console.log('<---- Initialized GoogleGenAI ---->')

        // Log before making the API call
        console.log('<---- About to call Gemini API ---->')
        
        const contents = userPrompt;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash-preview-image-generation",
                contents,
                config: {
                    responseModalities: [Modality.TEXT, Modality.IMAGE],
                },
            });
            
            console.log('<---- Received Gemini API response ---->', JSON.stringify(response).substring(0, 200) + '...')

            if (!response?.candidates?.[0]?.content?.parts) {
                console.log('<----Response from Gemini API : ' + JSON.stringify(response) + '---->')
                throw new Error("Invalid response format from Gemini API");
            }

            // Process the response and save the image
            let imageUrl = '';
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    console.log('----Gemini response text:', part.text);
                } else if (part.inlineData?.data) {
                    console.log('----Found Gemini response image data')
                    const imageData = part.inlineData.data;
                    const imageMimeType = part.inlineData.mimeType || 'image/png';
                    
                    try {
                        // Upload generated image data (base64) to Cloudinary
                        console.log('----About to upload to Cloudinary')
                        const uploadResult = await uploadCloudinaryFromBase64(imageData, imageMimeType);
                        
                        if (!uploadResult || !uploadResult.url) {
                            throw new Error("Upload to Cloudinary failed - no URL returned");
                        }
                        
                        imageUrl = uploadResult.url; // Update the outer variable
                        console.log('----Uploaded generated image to Cloudinary', imageUrl);
                        break;
                    } catch (uploadError) {
                        console.error('----Error uploading to Cloudinary:', uploadError);
                        throw uploadError;
                    }
                }
            }

            if (!imageUrl) {
                console.log('----No image parts found in response');
                throw new Error("No image generated");
            }

            console.log('<----Response image URL : ' + imageUrl + '---->')

            return {
                r2Url: imageUrl,
                svgContent: '',
                model: 'gemini-2.0-flash-preview-image-generation',
                tokensUsed: 0,
                duration: Date.now() - startTime,
                errorMessage: ''
            };
        } catch (apiError) {
            console.error('<---- Error during Gemini API call ---->', apiError);
            throw apiError;
        }

    } catch (error) {
        console.error('Error in generateCardImageWithGenAI:', error);
        return {
            r2Url: '',
            svgContent: '',
            model: 'gemini-2.0-flash-preview-image-generation',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}
