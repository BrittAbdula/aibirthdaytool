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

export async function generateCardImageWithGrok(params: CardContentParams, userPlan: string): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string  }> {
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

        const userPromptFields = Object.entries({
            ...otherParams,
            cardType,
            style,
            currentTime: formattedTime
        })
            .filter(([_, value]) => value !== '' && value !== undefined)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        const userPrompt = `Create a ${cardType} card that feels personal and festive, using these details to inspire a unique design:\n${userPromptFields}\n` +
            `Card dimensions: ${cardSize.width}x${cardSize.height}\n\n` +
            `Design: Match the event tone with a fitting theme (e.g., magical for Elsa, safari for kids). Use a central illustration, cohesive colors, handwritten font for the main message, sans-serif for details, and small accents to frame. Be creative for a polished look.`;



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
            taskId: '',
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


export async function generateCardImageWithGenAI(params: CardContentParams, userPlan: string): Promise<{taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string  }> {
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

        const userPromptFields = Object.entries({
            ...otherParams,
            cardType,
            style,
            currentTime: formattedTime
        })
            .filter(([_, value]) => value !== '' && value !== undefined)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        const userPrompt = `Create a ${cardType} card that feels personal and festive, using these details to inspire a unique design:\n${userPromptFields}\n` +
            `Card dimensions: ${cardSize.width}x${cardSize.height} pixels (aspect ratio guidance).\n\n` +
            `Design instructions: Match the event tone with a fitting theme (e.g., magical for Elsa, safari for kids). Use a central illustration, cohesive colors, handwritten font for the main message, sans-serif for details, and small accents to frame. Be creative for a polished look.`;


        console.log('<----User prompt for Gemini: ' + userPrompt + '---->');

        // Check prompt length
        if (userPrompt.length >= 5000) {
            throw new Error("User prompt too long for Gemini");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: 'Why is the sky blue?',
        });
        console.log(response.text);

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
            taskId: '',
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
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: 'gemini-2.0-flash-preview-image-generation',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error.message || "An unknown error occurred during Gemini image generation."
        };
    }
}

export async function generateCardImageWith4o(params: CardContentParams, userPlan: string): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const { userId, modelTier, format, variationIndex, cardType, version, templateId, size, style, modificationFeedback, previousCardId, ...otherParams } = params;

    const startTime = Date.now();
    const formattedTime = new Date(startTime).toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-');
    console.log('<----Using model : ' + 'GPT-4o Image' + '---->');

    try {
        // Get card size
        const userPromptFields = Object.entries({
            ...otherParams,
            cardType,
            style,
            currentTime: formattedTime
        })
            .filter(([_, value]) => value !== '' && value !== undefined)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        const userPrompt = `Create a ${cardType} card that feels personal and festive, using these details to inspire a unique design:\n${userPromptFields}\n` +
            `Design: Match the event tone with a fitting theme. Use a central illustration, cohesive colors, handwritten font for the main message, sans-serif for details, and small accents to frame. Be creative for a polished look.`;

        console.log('<----User prompt : ' + userPrompt + '---->');

        if (userPrompt.length >= 5000) {
            throw new Error("User prompt too long");
        }

        const apiKey = process.env.KIE_API_KEY;
        if (!apiKey) {
            throw new Error("KIE_API_KEY is not configured");
        }

        // Step 1: Generate the image
        console.log('<---- Initiating 4o Image generation ---->');

        // Determine aspect ratio based on card size
        const aspectRatio = size === 'portrait' || size === 'story' ? "2:3" :
            size === 'landscape' ? "3:2" : "1:1";
        const callBackUrl = process.env.NEXT_PUBLIC_BASE_URL + 'api/webhook/4o';
        console.log('<---- CallBack URL : ' + callBackUrl + '---->');

        const generateResponse = await fetch('https://kieai.erweima.ai/api/v1/gpt4o-image/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: userPrompt,
                n: 1,
                size: aspectRatio,
                uploadCn: false,
                callBackUrl: callBackUrl
            })
        });

        if (!generateResponse.ok) {
            const errorData = await generateResponse.text();
            throw new Error(`Failed to initiate image generation: ${generateResponse.status} ${errorData}`);
        }

        const generateData = await generateResponse.json();
        const taskId = generateData.data?.taskId;

        if (!taskId) {
            throw new Error("No taskId returned from image generation request");
        }

        console.log(`<---- Image generation task initiated with ID: ${taskId} ---->`);

        return {
            taskId: taskId,
            r2Url: '',
            svgContent: '',
            model: 'gpt4o-image',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'processing'
        };

    } catch (error) {
        console.error('Error in generateCardImageWith4o:', error);
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: 'gpt4o-image',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
        }
    }
}