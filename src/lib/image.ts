import { CardType } from './card-config';
import { prisma } from './prisma';
import { CARD_SIZES, CardSize } from './card-config';
import OpenAI from 'openai';
import { uploadImageToR2} from '@/lib/r2';
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

export async function generateCardImageGeminiFlash(params: CardContentParams, userPlan: string): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const { cardType, size, userPrompt, modificationFeedback, previousCardId } = params;
    const startTime = Date.now();
    
    console.log('<----Using model : Gemini 2.0 Flash Image Generation---->');

    try {
        console.log('<----User prompt : ' + userPrompt + '---->');

        if (userPrompt.length >= 5000) {
            throw new Error("User prompt too long");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not configured");
        }

        // 构建完整提示词
        const fullPrompt = userPrompt + ` that feels personal and festive, using these details to inspire a unique design. Match the event tone with a fitting theme (e.g., magical for Elsa, safari for kids). Use a central illustration, cohesive colors, handwritten font for the main message, sans-serif for details, and small accents to frame. Be creative for a polished look. Please generate an image based on this description.`;

        // 添加尺寸提示
        let sizePrompt = '';
        if (size === 'portrait' || size === 'story') {
            sizePrompt = ' Create the image in portrait orientation (taller than wide).';
        } else if (size === 'landscape') {
            sizePrompt = ' Create the image in landscape orientation (wider than tall).';
        } else {
            sizePrompt = ' Create the image in square format.';
        }

        const completePrompt = fullPrompt + sizePrompt;

        // 调用Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: completePrompt }]
                }],
                generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"]
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorData}`);
        }

        const data = await response.json();
        
        if (!data.candidates?.[0]?.content?.parts) {
            throw new Error("No content returned from Gemini API");
        }

        // 提取图像数据
        let imageData: string | null = null;
        for (const part of data.candidates[0].content.parts) {
            if (part.inlineData?.data) {
                imageData = part.inlineData.data;
                break;
            }
        }

        if (!imageData) {
            throw new Error("No image data returned from Gemini API");
        }

        // 生成任务ID
        const taskId = `gemini_flash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 处理图像：转换为Buffer并上传
        const imageBuffer = Buffer.from(imageData, 'base64');
        const imageUrl = await uploadImageToR2(imageBuffer, taskId);

        console.log(`<---- Image generation completed: ${taskId} ---->`);

        return {
            taskId: taskId,
            r2Url: imageUrl, // 直接返回可用的URL
            svgContent: '',
            model: 'gemini-2.0-flash-image',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'completed'
        };

    } catch (error) {
        console.error('Error in generateCardImageGeminiFlash:', error);
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: 'gemini-2.0-flash-image',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
        };
    }
}