import { CardType } from './card-config';
import {
    GPT_IMAGE_2_MODEL,
    requestGptImage2Generation,
} from './gpt-image-2';
import { uploadImageToR2 } from '@/lib/r2';
import { nanoid } from 'nanoid';

interface CardContentParams {
    cardType: CardType;
    size: string;
    userPrompt: string;
    modificationFeedback?: string;
    previousCardId?: string;
}

type CardImageResult = {
    taskId: string;
    r2Url: string;
    svgContent: string;
    model: string;
    tokensUsed: number;
    duration: number;
    errorMessage?: string;
    status?: string;
};

export async function generateCardImage(params: CardContentParams, _modelLevel: string): Promise<CardImageResult> {
    const quality = _modelLevel === 'PREMIUM' ? 'high' : 'medium';
    return generateCardImageWithGptImage2(params, quality);
}

export async function generateCardImageWithGptImage2(params: CardContentParams, quality: 'medium' | 'high' | 'auto' = 'auto'): Promise<CardImageResult> {
    const { size, userPrompt } = params;
    const startTime = Date.now();
    const taskId = `gpt_image_2_${nanoid(12)}`;

    try {
        if (userPrompt.length >= 5000) {
            throw new Error('User prompt too long');
        }

        const result = await requestGptImage2Generation({
            prompt: userPrompt,
            size,
            quality,
        });

        const r2Url = result.imageBase64
            ? await uploadImageToR2(Buffer.from(result.imageBase64, 'base64'), taskId)
            : result.imageUrl || '';

        if (!r2Url) {
            throw new Error('No image URL returned from gpt-image-2');
        }

        return {
            taskId,
            r2Url,
            svgContent: '',
            model: GPT_IMAGE_2_MODEL,
            tokensUsed: result.tokensUsed,
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'completed',
        };
    } catch (error) {
        return {
            taskId: '',
            r2Url: '',
            svgContent: '',
            model: GPT_IMAGE_2_MODEL,
            tokensUsed: 0,
            duration: Date.now() - startTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed',
        };
    }
}
