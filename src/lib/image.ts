import { CardType } from './card-config';
import { prisma } from './prisma';
import { CARD_SIZES, CardSize } from './card-config';
import OpenAI from 'openai';
import { uploadImageToR2} from '@/lib/r2';
import { nanoid } from 'nanoid';
import { v2 as cloudinary } from 'cloudinary';

interface CardContentParams {
    cardType: CardType;
    size: string;
    userPrompt: string;
    modificationFeedback?: string;
    previousCardId?: string;
}

export async function generateCardImage(params: CardContentParams, modelLevel: string): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    // Static image generation — use KIE for all tiers
    if (modelLevel === 'PREMIUM') {
        // Premium uses Nano Banana Pro
        return await generateCardImageWithBananaPro(params);
    } else {
        // Free uses Nano Banana
        return await generateCardImageWithBanana(params);
    }
}

// Static Image via Banana Pro (google/nano-banana-pro)
export async function generateCardImageWithBananaPro(params: CardContentParams): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const { size, userPrompt } = params;
    const startTime = Date.now();
    try {
        const apiKey = process.env.KIE_API_KEY;
        if (!apiKey) throw new Error('KIE_API_KEY is not configured');

        if (userPrompt.length >= 5000) throw new Error('User prompt too long');

        const sizeMap: Record<string, 'auto' | '1:1' | '3:4' | '9:16' | '4:3' | '16:9'> = {
            portrait: '3:4',
            landscape: '4:3',
            square: '1:1',
            instagram: '1:1',
            story: '9:16'
        };
        const image_size = sizeMap[size] || '3:4';

        const payload = {
            model: 'google/nano-banana-pro',
            input: {
                prompt: userPrompt,
                output_format: 'png',
                image_size
            }
        };

        const resp = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });
        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Banana Pro createTask failed: ${resp.status} ${text}`);
        }
        const data = await resp.json();
        const taskId = data?.data?.taskId;
        if (!taskId) throw new Error('No taskId from Banana Pro');

        return {
            taskId,
            r2Url: '',
            svgContent: '',
            model: 'google/nano-banana-pro',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'processing'
        };
    } catch (error) {
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: 'google/nano-banana-pro',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
        };
    }
}

// Static Image via Banana (google/nano-banana)
export async function generateCardImageWithBanana(params: CardContentParams): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const { size, userPrompt } = params;
    const startTime = Date.now();
    try {
        const apiKey = process.env.KIE_API_KEY;
        if (!apiKey) throw new Error('KIE_API_KEY is not configured');

        if (userPrompt.length >= 5000) throw new Error('User prompt too long');

        const sizeMap: Record<string, 'auto' | '1:1' | '3:4' | '9:16' | '4:3' | '16:9'> = {
            portrait: '3:4',
            landscape: '4:3',
            square: '1:1',
            instagram: '1:1',
            story: '9:16'
        };
        const image_size = sizeMap[size] || '3:4';

        const payload = {
            model: 'google/nano-banana',
            input: {
                prompt: userPrompt,
                output_format: 'png',
                image_size
            }
        };

        const resp = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });
        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Banana createTask failed: ${resp.status} ${text}`);
        }
        const data = await resp.json();
        const taskId = data?.data?.taskId;
        if (!taskId) throw new Error('No taskId from Banana');

        return {
            taskId,
            r2Url: '',
            svgContent: '',
            model: 'google/nano-banana',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'processing'
        };
    } catch (error) {
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: 'google/nano-banana',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
        };
    }
}


export async function generateCardImageWith4o(params: CardContentParams): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
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
                "prompt": userPrompt +  ` that feels personal and festive, using these details to inspire a unique design. Full-bleed, edge-to-edge composition; fill the canvas; no borders or frames; no white or empty margins; avoid letterboxing/pillarboxing. Do not include any text. Use a central, lively illustration with cohesive colors, soft lighting, gentle shadows, and 2–3 small thematic props for extra charm. Be creative for a polished look.`,
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

// Removed Gemini path; all static images now use KIE endpoints
