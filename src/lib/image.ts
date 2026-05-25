import { CardType } from './card-config';
import {
    GPT_IMAGE_2_MODEL,
    requestGptImage2Generation,
} from './gpt-image-2';

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

    try {
        if (userPrompt.length >= 5000) {
            throw new Error('User prompt too long');
        }

        const result = await requestGptImage2Generation({
            prompt: userPrompt,
            size,
            quality,
        });

        return {
            taskId: result.taskId,
            r2Url: '',
            svgContent: '',
            model: GPT_IMAGE_2_MODEL,
            tokensUsed: result.tokensUsed,
            duration: Date.now() - startTime,
            errorMessage: '',
            status: 'processing',
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
