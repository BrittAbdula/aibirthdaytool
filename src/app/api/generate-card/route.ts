import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateCardImage } from '@/lib/image';
import { generateCardVideo, generateCardImageWithGptImage2Edit } from '@/lib/image-and-video';
import { nanoid } from 'nanoid';
import { getModelConfig } from '@/lib/model-config';
import { uploadSvgToR2 } from '@/lib/r2';
import { stylePresets } from '@/lib/style-presets';
import { getEntitlements, consumeCards, refundCards } from '@/lib/pricing/entitlements';
import { getCardCost, type CardFormat } from '@/lib/pricing/quota';
import { buildReferenceEditPrompt, createNaturalPrompt } from '@/lib/personalization-prompt';
import { buildPersonalizationBrief } from '@/lib/card-brief';
import { directCard, hashSeed, type CardDirection } from '@/lib/emotion-director';
import { generateCardSvg } from '@/lib/svg-generation';
import { getSvgGenerationModel } from '@/lib/svg-models';

// 增加超时限制到最大值
export const maxDuration = 60; // 增加到 60 秒

// 使用边缘运行时，提高性能
// export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // const userId = 'cm56ic66y000110jijyw2ir8r';
    const requestData = await request.json();
    const {
      modificationFeedback,
      previousCardId,
      modelId = 'Free_SVG', // Default to Free_SVG if not specified
      referenceImageUrls,
      styleId,
      outputFormat,
      ...defaultFields
    } = requestData;

    if (!defaultFields.cardType) {
      return NextResponse.json({ error: 'Missing required field: cardType' }, { status: 400 });
    }

    if (modelId === 'gpt-image-2') {
      return NextResponse.json({
        error: 'legacy_model_disabled',
        message: 'The legacy gpt-image-2 path is disabled. Please use the current Image model or Animated SVG.'
      }, { status: 410 });
    }

    // 检查是否是修改请求
    const isModification = modificationFeedback && previousCardId;

    // 从modelId解析模型配置
    const modelConfig = getModelConfig(modelId);
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model ID' }, { status: 400 });
    }

    const format = (outputFormat as CardFormat) || modelConfig.format;
    const svgBillingModelConfig = getModelConfig('Free_SVG') || modelConfig;
    const billingModelConfig = format === 'svg' ? svgBillingModelConfig : modelConfig;
    const modelTier = format === 'svg' ? 'Free' : modelConfig.tier;

    if (format === 'video' && modelConfig.format !== 'video') {
      return NextResponse.json({ error: 'Invalid video model' }, { status: 400 });
    }

    const entitlements = await getEntitlements(userId);

    if (format === 'video' && !entitlements.canUseVideo) {
      return NextResponse.json({
        error: 'premium_required',
        intent: 'video',
        message: 'Video cards need a card pack or a subscription.'
      }, { status: 403 });
    }

    const stylePreset = styleId ? stylePresets.find(p => p.id === styleId) : undefined;
    const styleCost = format === 'image' ? (stylePreset?.cost ?? 0) : 0;

    if (styleCost > 0 && !entitlements.canUsePremiumStyles) {
      return NextResponse.json({
        error: 'premium_required',
        intent: 'premium_style',
        message: 'This style needs a card pack or a subscription.'
      }, { status: 403 });
    }

    // Paid access — a subscription or a pack balance — also buys the better model.
    const modelLevel = format === 'svg'
      ? 'FREE'
      : modelTier === 'Premium' && entitlements.hasPaidAccess ? 'PREMIUM' : 'FREE';

    // One generation costs one card; a video costs five, because it costs us an
    // order of magnitude more to produce.
    const cardCost = getCardCost(format);

    // The pre-refactor credit value, recorded for the admin usage chart only.
    const legacyCredits = format === 'image' && Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0
      ? 6
      : (format === 'image' ? 6 : billingModelConfig.credits) + styleCost;

    const consumption = await consumeCards(userId, cardCost, legacyCredits);

    if (!consumption.ok) {
      const { quota } = entitlements;
      return NextResponse.json({
        error: 'rate_limit',
        intent: 'daily_limit',
        cardsRequired: cardCost,
        cardsRemaining: quota.totalRemaining,
        canEarnAdReward: quota.adCardsAvailableToEarn > 0,
        // The cost comes out of one balance, so quoting the combined total here
        // would read as "you have 6, this costs 5" right after a refusal.
        message: cardCost > 1
          ? `A video takes ${cardCost} cards from a single balance, and neither today's free cards (${quota.dailyRemaining}) nor your pack (${quota.packRemaining}) covers that yet. A card pack keeps it simple.`
          : "That's today's free cards. Watch a short ad for one more, or get a card pack."
      }, { status: 429 });
    }


    // Generate a new cardId
    const cardId = nanoid(10);
    const startTime = Date.now();

    // Read the brief before designing anything: which emotional register is
    // this sender in, and what exactly should the card say and look like?
    // A modification keeps the previous card's read; the feedback is the brief.
    const variationIndex = Number(defaultFields.variationIndex) || 0;
    const seed = (hashSeed(cardId) + variationIndex * 97) % 1000;
    const direction: CardDirection | undefined = isModification
      ? undefined
      : await directCard({
          brief: buildPersonalizationBrief(requestData, defaultFields.cardType),
          medium: format,
          seed,
        });

    // Create initial API log entry with pending status. The read is stored
    // beside the inputs so the stats page shows why a card looks the way it does.
    await prisma.apiLog.create({
      data: {
        userId,
        cardId,
        cardType: defaultFields.cardType,
        userInputs: direction ? { ...requestData, _direction: direction } : requestData,
        promptVersion: format === 'image' ? 'image' : format === 'video' ? 'video' : 'svg',
        responseContent: '',
        tokensUsed: 0,
        duration: 0,
        status: 'pending',
        modificationFeedback,
      },
    });

    // Before generating card, create the proper params object.
    const styleSegment = (() => {
      // Only apply style presets to static images; SVG/video keep backend-driven phrasing.
      // With no explicit choice the register's own style family leads — a random
      // preset would fight the read (pixel art on a pleading apology).
      if (format !== 'image' || !styleId) return '';

      const preset = stylePresets.find(p => p.id === styleId);
      if (!preset) return '';
      const promptForFmt = preset.prompts?.image;
      return promptForFmt ? ` Style preset requested by the sender (blend it into the read's palette and world): ${promptForFmt}.` : '';
    })();

    // Advanced options segment (optional)
    const advancedSegment = (() => {
      const f = defaultFields as any;
      let seg = '';
      if (format === 'svg') {
        if (f.animationSpeed) seg += ` Animation speed: ${f.animationSpeed}.`;
        if (f.loop) seg += ` Loop animation: ${String(f.loop)}.`;
      } else if (format === 'image') {
        // Keep minimal guidance; rely on style preset for rendering details
        if (f.styleStrength) seg += ` Style intensity: ${f.styleStrength}.`;
      } else if (format === 'video') {
        // Keep only duration as a minimal controllable parameter
        if (f.duration) seg += ` Target duration: ${f.duration} seconds.`;
      }
      return seg;
    })();

    const basePrompt = isModification
      ? modificationFeedback
      : createNaturalPrompt(requestData, defaultFields.cardType, { size: defaultFields.size || 'portrait', medium: format, direction, seed });

    const finalPrompt = `${basePrompt}${styleSegment}${advancedSegment}`.trim();

    const cardParams = {
      cardType: defaultFields.cardType,
      size: defaultFields.size || 'portrait', // Add a default size if not provided
      userPrompt: finalPrompt,
      direction,
      // Only include these if it's a modification request
      ...(isModification && {
        modificationFeedback,
        previousCardId
      })
    };

    // Start async processing
    try {
      // Select generation function based on format
      let result;
      // If reference images are provided, use gpt-image-2 edits API.
      if (format === 'image' && Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0) {
        const basePromptRef = createNaturalPrompt(requestData, defaultFields.cardType, { size: defaultFields.size || 'portrait', medium: 'image', direction, seed });
        const likeness = buildReferenceEditPrompt(requestData, defaultFields.cardType, { size: defaultFields.size || 'portrait', direction });
        const prompt = `${basePromptRef}${styleSegment}${advancedSegment} ${likeness}`.slice(0, 5000);
        result = await generateCardImageWithGptImage2Edit({ size: defaultFields.size || 'portrait', userPrompt: prompt, imageUrls: referenceImageUrls });
      } else if (format === 'image') {
        result = await generateCardImage(cardParams, modelLevel);
      } else if (format === 'video') {
        result = await generateCardVideo(cardParams, modelLevel);
      } else {
        result = await generateCardSvg(cardParams, getSvgGenerationModel(modelLevel));
      }

      // console.log('result', result);

      // Update status to completed with results
      let resolvedR2Url = result.r2Url || '';
      if (format === 'svg' && result.svgContent) {
        resolvedR2Url = await uploadSvgToR2(result.svgContent, cardId, new Date());
      }

      const nextStatus = result.status || 'completed';

      if (nextStatus === 'failed') {
        await refundCards(userId, consumption.consumedFromDaily, consumption.consumedFromPack, legacyCredits);
      }

      await prisma.apiLog.update({
        where: { cardId },
        data: {
          taskId: result.taskId,
          r2Url: resolvedR2Url,
          responseContent: '',
          promptVersion: result.model,
          tokensUsed: result.tokensUsed,
          duration: result.duration,
          errorMessage: result.errorMessage,
          status: nextStatus,
          isError: nextStatus === 'failed',
        },
      });
    } catch (error) {
      console.error('Error in async card generation:', error);
      await refundCards(userId, consumption.consumedFromDaily, consumption.consumedFromPack, legacyCredits);
      // Update status to failed
      await prisma.apiLog.update({
        where: { cardId },
        data: {
          status: 'failed',
          isError: true,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          promptVersion: format === 'image' ? 'image' : format === 'video' ? 'video' : 'svg', // Fallback
          tokensUsed: 0,
          duration: Date.now() - startTime, // Need to capture startTime in the outer scope or recalculate
        },
      });
    }

    // Return immediately with cardId
    return NextResponse.json({ cardId });
  } catch (error) {
    console.error('Error in card generation request:', error);
    return NextResponse.json({
      error: 'Failed to initiate card generation',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
