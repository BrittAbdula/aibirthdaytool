import { CardType } from './card-config';
import { GPT_IMAGE_2_EDIT_MODEL, requestGptImage2Edit } from './gpt-image-2';
import { WAN_VIDEO_MODEL, WAN_VIDEO_DURATION, requestWanVideoGeneration } from './wan-video';

interface CardContentParams {
    cardType: CardType;
    size: string;
    userPrompt: string;
    modificationFeedback?: string;
    previousCardId?: string;
}

export async function generateCardVideo(params: CardContentParams, modelLevel: string): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    if (modelLevel === 'PREMIUM') {
        return await generateCardVideoWithWan(params);
    } else {
        throw new Error('Video generation not supported for this model level');
    }
}

export async function generateCardVideoWithWan(params: CardContentParams): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const { userPrompt } = params;
    const startTime = Date.now();

    console.log(`<----Using model : ${WAN_VIDEO_MODEL}---->`);

    try {
        const prompt = [
            userPrompt,
            `Create a polished ${WAN_VIDEO_DURATION}-second vertical 9:16 greeting-card video with smooth cinematic motion.`,
            'Use full-bleed composition, no borders, no letterboxing, no overlaid text, no watermark.',
            'Focus on visual storytelling, warm lighting, cohesive colors, and one clear emotional motion idea.',
        ].join(' ');

        const result = await requestWanVideoGeneration({
            prompt,
        });

        return {
            taskId: result.taskId,
            r2Url: '',
            svgContent: '',
            model: WAN_VIDEO_MODEL,
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'processing',
        };
    } catch (error) {
        console.error('Error in generateCardVideoWithWan:', error);
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: WAN_VIDEO_MODEL,
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed',
        };
    }
}

export async function generateCardImageWithGptImage2Edit(params: { size: string; userPrompt: string; imageUrls: string[] }, modelLevel: string): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const startTime = Date.now();
    try {
        if (!params.imageUrls?.length) throw new Error('No reference images provided');

        const result = await requestGptImage2Edit({
            prompt: params.userPrompt,
            size: params.size,
            quality: modelLevel === 'PREMIUM' ? 'high' : 'medium',
            imageUrls: params.imageUrls,
        });

        return {
            taskId: result.taskId,
            r2Url: '',
            svgContent: '',
            model: GPT_IMAGE_2_EDIT_MODEL,
            tokensUsed: result.tokensUsed,
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'processing'
        };
    } catch (error) {
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: GPT_IMAGE_2_EDIT_MODEL,
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
        };
    }
}
