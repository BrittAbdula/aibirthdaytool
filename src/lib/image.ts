import { CardType } from './card-config';
import { prisma } from './prisma';
import { CARD_SIZES, CardSize } from './card-config';
import OpenAI from 'openai';
import { uploadToCloudflareImages, uploadBase64ToCloudflareImages, uploadCloudinaryFromBase64 } from '@/lib/r2';
import { GoogleGenAI, Modality } from "@google/genai";
import { nanoid } from 'nanoid';
import { v2 as cloudinary } from 'cloudinary';

interface CardContentParams {
    cardType: CardType;
    size: string;
    userPrompt: string;
    modificationFeedback?: string;
    previousCardId?: string;
}

export async function generateCardImageWith4o(params: CardContentParams, userPlan: string): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const { cardType, size, userPrompt, modificationFeedback, previousCardId } = params;

    const startTime = Date.now();
    const formattedTime = new Date(startTime).toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-');
    console.log('<----Using model : ' + 'GPT-4o Image' + '---->');

    try {
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
        // const callBackUrl = process.env.NEXT_PUBLIC_BASE_URL + 'api/callback';
        // console.log('<---- CallBack URL : ' + callBackUrl + '---->');

        const generateResponse = await fetch('https://kieai.erweima.ai/api/v1/gpt4o-image/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                "prompt": userPrompt +  `that feels personal and festive, using these details to inspire a unique design. Match the event tone with a fitting theme (e.g., magical for Elsa, safari for kids). Use a central illustration, cohesive colors, handwritten font for the main message, sans-serif for details, and small accents to frame. Be creative for a polished look.`,
                "nVariants":  1,
                "size": aspectRatio,
                "uploadCn": false,
                "callBackUrl": "https://mewtrucard.com/api/callback"
            })
        });

        if (!generateResponse.ok) {
            const errorData = await generateResponse.text();
            console.error('Error in generateCardImageWith4o:', errorData);
            throw new Error(`Failed to initiate image generation: ${generateResponse.status} ${errorData}`);
        }

        const generateData = await generateResponse.json();
        const taskId = generateData.data?.taskId;

        if (!taskId) {
            console.error('No taskId returned from image generation request');
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