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

export async function generateCardImage(params: CardContentParams, modelLevel: string): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    if (modelLevel === 'PREMIUM') {
        return await generateCardImageWith4o(params);
    } else if (modelLevel === 'HM') {
        return await generateCardImageWithHM(params);
    } else {
        // return await generateCardImageGeminiFlash(params);
        return await generateCardImageWithHM(params);
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

export async function generateCardImageGeminiFlash(params: CardContentParams): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
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
        const fullPrompt = userPrompt + ` that feels personal and festive, using these details to inspire a unique design. Full-bleed, edge-to-edge composition; fill the canvas; no borders or frames; no white or empty margins; avoid letterboxing/pillarboxing. Do not include any text. Use a central, lively illustration with cohesive colors, soft lighting, gentle shadows, and 2–3 small thematic props for extra charm. Be creative for a polished look. Please generate an image based on this description.`;

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

export async function generateCardImageWithHM(params: CardContentParams): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const { cardType, size, userPrompt, modificationFeedback, previousCardId } = params;
    const startTime = Date.now();
    
    console.log('<----Using model : HM GPT-4o Image Generation---->');

    try {
        console.log('<----User prompt : ' + userPrompt + '---->');

        if (userPrompt.length >= 5000) {
            throw new Error("User prompt too long");
        }

        const apiKey = process.env.HM_API_KEY;
        const baseUrl = process.env.HM_BASE_URL;
        
        if (!apiKey) {
            throw new Error("HM_API_KEY is not configured");
        }
        
        if (!baseUrl) {
            throw new Error("HM_BASE_URL is not configured");
        }

        // 构建完整提示词
        const fullPrompt = userPrompt + ` that feels personal and festive, using these details to inspire a unique design. Full-bleed, edge-to-edge composition; fill the canvas; no borders or frames; no white or empty margins; avoid letterboxing/pillarboxing. Do not include any text. Use a central, lively illustration with cohesive colors, soft lighting, gentle shadows, and 2–3 small thematic props for extra charm. Be creative for a polished look. Please generate an image based on this description.`;

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

        // 调用 HM API
        const response = await fetch(`${baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'flux',
                stream: false,
                messages: [
                    {
                        role: 'user',
                        content: completePrompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorData}`);
        }

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
            throw new Error("No content returned from HM API");
        }

        // 生成任务ID
        const taskId = `hm_gpt4o_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 从响应中提取图像数据
        const messageContent = data.choices[0].message.content;
        let imageUrl = '';
        
        // 检查是否包含图像URL或base64数据
        if (typeof messageContent === 'string' && messageContent.includes('http')) {
            // 如果响应包含图像URL
            const urlMatch = messageContent.match(/https?:\/\/[^\s]+/);
            if (urlMatch) {
                imageUrl = urlMatch[0];
            }
        } else if (typeof messageContent === 'string' && messageContent.includes('data:image')) {
            // 如果响应包含base64图像数据
            const base64Match = messageContent.match(/data:image\/[^;]+;base64,([^"]+)/);
            if (base64Match) {
                const base64Data = base64Match[1];
                const imageBuffer = Buffer.from(base64Data, 'base64');
                imageUrl = await uploadImageToR2(imageBuffer, taskId);
            }
        }

        if (!imageUrl) {
            throw new Error("No valid image data found in response");
        }

        console.log(`<---- HM image generation completed: ${taskId} ---->`);

        return {
            taskId: taskId,
            r2Url: imageUrl,
            svgContent: '',
            model: 'hm-gpt4o-image',
            tokensUsed: data.usage?.total_tokens || 0,
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'completed'
        };

    } catch (error) {
        console.error('Error in generateCardImageWithHM:', error);
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: 'hm-gpt4o-image',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
        };
    }
}

export async function generateCardVideoWithHM(params: CardContentParams): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const { cardType, size, userPrompt, modificationFeedback, previousCardId, } = params;
    const startTime = Date.now();
    const model = 'veo3-fast';
    const enhancePrompt = true;
    
    console.log('<----Using model : HM Google-Veo Video Generation---->');

    try {
        console.log('<----User prompt : ' + userPrompt + '---->');

        if (userPrompt.length >= 5000) {
            throw new Error("User prompt too long");
        }

        const apiKey = process.env.HM_API_KEY;
        const baseUrl = process.env.HM_BASE_URL;
        
        if (!apiKey) {
            throw new Error("HM_API_KEY is not configured");
        }
        
        if (!baseUrl) {
            throw new Error("HM_BASE_URL is not configured");
        }

        // 构建完整提示词
        const fullPrompt = userPrompt + ` Create a personalized and festive video that brings this message to life with dynamic visuals and smooth animations. Full-bleed composition without borders or letterboxing. Do not include overlaid text; focus on visual storytelling with scene elements. Match the event tone with a fitting theme (e.g., magical sparkles for celebrations, warm colors for birthdays). Include engaging motion graphics and visual effects that enhance the emotional impact. The video should feel professional yet personal.`;

        // 添加尺寸和时长提示
        let formatPrompt = '';
        if (size === 'portrait' || size === 'story') {
            formatPrompt = ' Create the video in portrait orientation (9:16 aspect ratio) suitable for mobile viewing and social media stories.';
        } else if (size === 'landscape') {
            formatPrompt = ' Create the video in landscape orientation (16:9 aspect ratio) suitable for desktop and TV viewing.';
        } else {
            formatPrompt = ' Create the video in square format (1:1 aspect ratio) suitable for social media posts.';
        }

        const completePrompt = fullPrompt + formatPrompt + ' The video should be approximately 5-10 seconds long with smooth transitions and high-quality visuals.';

        // 调用 HM Google-Veo API
        const response = await fetch(`${baseUrl}/google/v1/models/veo/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: completePrompt,
                model: model,
                enhance_prompt: enhancePrompt
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorData}`);
        }

        const data = await response.json();
        
        if (data.code !== 'success' || !data.data) {
            throw new Error(`Video generation failed: ${data.message || 'Unknown error'}`);
        }

        // 生成任务ID使用API返回的任务ID
        const taskId = data.data;

        console.log(`<---- HM video generation task initiated: ${taskId} ---->`);

        return {
            taskId: taskId,
            r2Url: '', // 视频URL需要通过查询接口获取
            svgContent: '',
            model: `veo-${model}-video`,
            tokensUsed: 0, // Veo API 可能不返回token使用信息
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'processing'
        };

    } catch (error) {
        console.error('Error in generateCardVideoWithHM:', error);
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: `veo-${model}-video`,
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
        };
    }
}

export async function generateCardVideoWithLuma(params: CardContentParams): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const { cardType, size, userPrompt, modificationFeedback, previousCardId} = params;
    const startTime = Date.now();
    const model = 'ray-v2';
    const enhancePrompt = true;
    
    console.log('<----Using model : Luma Video Generation---->');

    try {
        console.log('<----User prompt : ' + userPrompt + '---->');

        if (userPrompt.length >= 5000) {
            throw new Error("User prompt too long");
        }

        const apiKey = process.env.HM_API_KEY;
        const baseUrl = process.env.HM_BASE_URL;
        
        if (!apiKey) {
            throw new Error("HM_API_KEY is not configured");
        }
        
        if (!baseUrl) {
            throw new Error("HM_BASE_URL is not configured");
        }

        // 构建完整提示词
        const fullPrompt = userPrompt + ` Create a personalized and festive video that brings this message to life with dynamic visuals and smooth animations. Match the event tone with a fitting theme (e.g., magical sparkles for celebrations, warm colors for birthdays). Include engaging motion graphics, text animations, and visual effects that enhance the emotional impact. The video should feel professional yet personal.`;

        // 根据尺寸参数确定分辨率
        let resolution = '720p';
        if (size === 'landscape') {
            resolution = '1080p'; // 横屏使用更高分辨率
        }

        // 调用 Luma API
        const response = await fetch(`${baseUrl}/luma/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                user_prompt: fullPrompt,
                expand_prompt: enhancePrompt,
                loop: false, // 不循环
                resolution: resolution,
                duration: '5s', // 5秒时长
                model_name: model // 使用传入的模型名
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorData}`);
        }

        const data = await response.json();
        
        if (!data.id) {
            throw new Error(`Video generation failed: ${data.message || 'No task ID returned'}`);
        }

        // 生成任务ID使用API返回的任务ID
        const taskId = data.id;

        console.log(`<---- Luma video generation task initiated: ${taskId} ---->`);

        return {
            taskId: taskId,
            r2Url: '', // 视频URL需要通过查询接口获取
            svgContent: '',
            model: `luma-${model}-video`,
            tokensUsed: 0, // Luma API 可能不返回token使用信息
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'processing'
        };

    } catch (error) {
        console.error('Error in generateCardVideoWithLuma:', error);
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: `luma-${model}-video`,
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
        };
    }
}

export async function generateCardVideo(params: CardContentParams, modelLevel: string): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    if (modelLevel === 'PREMIUM') {
        
        return await generateCardVideoWithLuma(params);
    } else {
        // 可以在这里添加其他视频生成服务
        throw new Error('Video generation not supported for this model level');
    }
}

// Reference-image edit via Banana Edit API (google/nano-banana-edit)
export async function generateCardImageWithBananaEdit(params: { size: string; userPrompt: string; imageUrls: string[] }): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const startTime = Date.now();
    try {
        const apiKey = process.env.KIE_API_KEY;
        if (!apiKey) throw new Error('KIE_API_KEY is not configured');

        if (!params.imageUrls?.length) throw new Error('No reference images provided');
        if (params.userPrompt.length >= 5000) throw new Error('User prompt too long');

        const sizeMap: Record<string, 'auto' | '1:1' | '3:4' | '9:16' | '4:3' | '16:9'> = {
            portrait: '3:4',
            landscape: '4:3',
            square: '1:1',
            instagram: '1:1',
            story: '9:16'
        };
        const image_size = sizeMap[params.size] || '9:16';

        const payload = {
            model: 'google/nano-banana-edit',
            input: {
                prompt: params.userPrompt,
                image_urls: params.imageUrls,
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
            model: 'google/nano-banana-edit',
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
            model: 'google/nano-banana-edit',
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
        };
    }
}
