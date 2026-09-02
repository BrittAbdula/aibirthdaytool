import { CardType } from './card-config';
import { GPT_IMAGE_2_EDIT_MODEL, requestGptImage2Edit } from './gpt-image-2';
import { SEEDANCE_VIDEO_MODEL, requestSeedanceVideoGeneration } from './seedance-video';

interface CardContentParams {
    cardType: CardType;
    size: string;
    userPrompt: string;
    modificationFeedback?: string;
    previousCardId?: string;
}

export async function generateCardVideo(params: CardContentParams, modelLevel: string): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    if (modelLevel === 'PREMIUM') {
        return await generateCardVideoWithSeedance(params);
    } else {
        throw new Error('Video generation not supported for this model level');
    }
}

export async function generateCardVideoWithSeedance(params: CardContentParams): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const { size, userPrompt } = params;
    const startTime = Date.now();

    console.log(`<----Using model : ${SEEDANCE_VIDEO_MODEL}---->`);

    try {
        if (userPrompt.length >= 5000) {
            throw new Error('User prompt too long');
        }

        const prompt = [
            userPrompt,
            'Create a polished 5-second greeting-card video with smooth cinematic motion.',
            'Use full-bleed composition, no borders, no letterboxing, no overlaid text, no watermark.',
            'Focus on visual storytelling, warm lighting, cohesive colors, and one clear emotional motion idea.',
        ].join(' ');

        const result = await requestSeedanceVideoGeneration({
            prompt,
            size,
        });

        return {
            taskId: result.taskId,
            r2Url: '',
            svgContent: '',
            model: SEEDANCE_VIDEO_MODEL,
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'processing',
        };
    } catch (error) {
        console.error('Error in generateCardVideoWithSeedance:', error);
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: SEEDANCE_VIDEO_MODEL,
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed',
        };
    }
}

export async function generateCardImageWithGptImage2Edit(params: { size: string; userPrompt: string; imageUrls: string[] }): Promise<{ taskId: string, r2Url: string, svgContent: string, model: string, tokensUsed: number, duration: number, errorMessage?: string, status?: string }> {
    const startTime = Date.now();
    try {
        if (!params.imageUrls?.length) throw new Error('No reference images provided');
        if (params.userPrompt.length >= 5000) throw new Error('User prompt too long');

        const result = await requestGptImage2Edit({
            prompt: params.userPrompt,
            size: params.size,
            quality: 'high',
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
