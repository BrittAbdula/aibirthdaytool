import { CardType, CARD_SIZES } from './card-config';
import { prisma } from './prisma';
import { generatePrompt } from './prompt';
import { fetchSvgContent } from './utils';
import {
  KIE_CLAUDE_OPUS_4_7_MODEL,
  extractSvgContentFromKieClaudeText,
  requestKieClaudeMessage,
} from './kie-claude';

interface CardContentParams {
  cardType: CardType;
  size: string;
  userPrompt: string;
  modificationFeedback?: string;
  previousCardId?: string;
}

type SvgGenerationResult = {
  taskId: string;
  r2Url: string;
  svgContent: string;
  model: string;
  tokensUsed: number;
  duration: number;
  errorMessage?: string;
  status?: string;
};

export async function generateCardContentWithKieClaude(params: CardContentParams): Promise<SvgGenerationResult> {
  const { cardType, size, userPrompt, modificationFeedback, previousCardId } = params;
  const startTime = Date.now();

  try {
    const cardSize = CARD_SIZES[size || 'portrait'];
    const systemPrompt = generatePrompt(cardType, cardSize);
    const finalUserPrompt = await buildFinalSvgUserPrompt(userPrompt, modificationFeedback, previousCardId);

    if (finalUserPrompt.length >= 12000) {
      throw new Error('User prompt too long');
    }

    const response = await requestKieClaudeMessage({
      messages: [
        {
          role: 'user',
          content: [
            'You are generating an animated greeting card SVG.',
            'Follow the complete SVG system instructions and user brief below.',
            'Return ONLY one complete SVG document. Do not wrap it in markdown.',
            '',
            'SVG system instructions:',
            systemPrompt,
            '',
            'User brief:',
            finalUserPrompt,
          ].join('\n'),
        },
      ],
      maxTokens: 4096,
    });

    const svgContent = extractSvgContentFromKieClaudeText(response.text);
    if (!svgContent) throw new Error('No valid SVG content found');

    return {
      taskId: '',
      r2Url: '',
      svgContent,
      model: response.model || KIE_CLAUDE_OPUS_4_7_MODEL,
      tokensUsed: response.tokensUsed,
      duration: Date.now() - startTime,
      errorMessage: '',
    };
  } catch (error) {
    return {
      taskId: '',
      r2Url: '',
      svgContent: '',
      model: KIE_CLAUDE_OPUS_4_7_MODEL,
      tokensUsed: 0,
      duration: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed',
    };
  }
}

async function buildFinalSvgUserPrompt(
  userPrompt: string,
  modificationFeedback?: string,
  previousCardId?: string
): Promise<string> {
  if (!modificationFeedback || !previousCardId) return userPrompt;

  try {
    const previousCard = await prisma.apiLog.findUnique({
      where: { cardId: previousCardId },
      select: { responseContent: true, r2Url: true },
    });

    if (!previousCard) return modificationFeedback;

    let previousSvgContent = previousCard.responseContent;
    if (!previousSvgContent && previousCard.r2Url?.toLowerCase().endsWith('.svg')) {
      previousSvgContent = await fetchSvgContent(previousCard.r2Url) || '';
    }

    if (!previousSvgContent) return modificationFeedback;

    return [
      `Modify the previous card design with this feedback: ${modificationFeedback}`,
      '',
      'Previous SVG content:',
      previousSvgContent,
      '',
      'Return SVG code only. Do not include explanation, commentary, or markdown.',
    ].join('\n');
  } catch {
    return modificationFeedback;
  }
}
