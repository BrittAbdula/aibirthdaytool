import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateCardImage } from '@/lib/image';
import { generateCardVideo, generateCardImageWithGptImage2Edit } from '@/lib/image-and-video';
import { nanoid } from 'nanoid';
import { getModelConfig } from '@/lib/model-config';
import { uploadSvgToR2 } from '@/lib/r2';
import { stylePresets } from '@/lib/style-presets';
import { getCountryCodeFromHeaders, getDailyCreditAllowance, isHighValueCountry } from '@/lib/credits';
import { buildReferenceEditPrompt, createNaturalPrompt } from '@/lib/personalization-prompt';
import { generateCardContentWithKieClaude } from '@/lib/kie-claude-svg';
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

    // 检查是否是修改请求
    const isModification = modificationFeedback && previousCardId;

    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    // 优化：并行查询用户权限和使用情况
    const [user, usage] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, createdAt: true },
      }),
      prisma.apiUsage.findUnique({
        where: {
          userId_date: {
            userId,
            date: todayStart,
          },
        },
      })
    ]);

    // 从modelId解析模型配置
    const modelConfig = getModelConfig(modelId);
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model ID' }, { status: 400 });
    }

    const format = (outputFormat as 'image' | 'svg' | 'video') || modelConfig.format;
    const modelTier = modelConfig.tier;

    // 获取用户计划类型
    const planType = user?.plan || 'FREE';

    if (format === 'video' && modelConfig.format !== 'video') {
      return NextResponse.json({ error: 'Invalid video model' }, { status: 400 });
    }

    if (format === 'video' && planType !== 'PREMIUM') {
      return NextResponse.json({
        error: 'premium_required',
        message: 'Video cards are available for Premium members.'
      }, { status: 403 });
    }

    // Compute style surcharge (only applies to static images per product rule)
    const styleCost = (() => {
      if (!styleId || format !== 'image') return 0;
      const preset = stylePresets.find(p => p.id === styleId);
      return preset?.cost ?? 0;
    })();

    // Credits: static image baseline = 6, plus style cost; SVG/Video use model credits
    let creditsUsed = (format === 'image' ? 6 : modelConfig.credits) + styleCost;
    // Reference image edit special case: using reference images costs 6 (ignore style surcharge)
    if (format === 'image' && Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0) {
      creditsUsed = 6;
    }
    const modelLevel = modelTier === 'Premium' && planType === 'PREMIUM' ? 'PREMIUM' : 'FREE';

    // Check if user is on their first day (registration day)
    const isFirstDay = !!user?.createdAt && user.createdAt >= todayStart;
    const countryCode = getCountryCodeFromHeaders(request.headers);
    const dailyCredits = getDailyCreditAllowance({ planType, isFirstDay, countryCode });
    const usedCredits = usage?.count || 0;
    const availableCredits = dailyCredits === Infinity ? Infinity : Math.max(0, dailyCredits - usedCredits);
    const hasHighValueWelcomeCredits = planType === 'FREE' && isFirstDay && isHighValueCountry(countryCode);

    // First-day FREE users outside high-value regions can only generate SVG cards.
    if (isFirstDay && planType === 'FREE' && !hasHighValueWelcomeCredits && format !== 'svg') {
      return NextResponse.json({
        error: 'first_day_svg_only',
        message: '✨ Welcome to your creative journey! On your first day, you can create 2 magical animated cards. Static images and videos unlock tomorrow — trust us, the wait will be worth it!'
      }, { status: 403 });
    }

    // Check if user has enough credits
    if (availableCredits < creditsUsed) {
      return NextResponse.json({
        error: 'rate_limit',
        message: isFirstDay
          ? `🎨 You've used your ${dailyCredits} welcome credits for today. Come back tomorrow to claim more credits or upgrade to Premium for unlimited creations!`
          : 'Daily limit reached. Claim your credits tomorrow or upgrade to Premium for unlimited creations!'
      }, { status: 429 });
    }

    // 处理用户使用情况（保留用于统计）
    let currentUsage = usage?.count || 0;
    if (!usage) {
      // 创建新的使用记录 - 这将在生成后异步完成
      // 使用 catch 语句避免因数据库原因阻塞主流程
      Promise.resolve().then(async () => {
        try {
          await prisma.apiUsage.create({
            data: {
              userId,
              date: todayStart,
              count: creditsUsed,
            },
          });
        } catch (error) {
          console.error('Error creating usage record:', error);
        }
      });
    } else {
      await prisma.apiUsage.update({
        where: { id: usage.id },
        data: { count: currentUsage + creditsUsed },
      });
    }

    // Generate a new cardId
    const cardId = nanoid(10);
    const startTime = Date.now();

    // Create initial API log entry with pending status
    await prisma.apiLog.create({
      data: {
        userId,
        cardId,
        cardType: defaultFields.cardType,
        userInputs: requestData,
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
      // Only apply style presets to static images; SVG/video keep backend-driven phrasing
      if (format !== 'image') return '';

      let targetStyleId = styleId;
      // Random style logic: if no style selected for image, pick one randomly
      if (!targetStyleId) {
        const availableStyles = stylePresets.filter(p => p.formats.includes('image') && p.prompts.image);
        if (availableStyles.length > 0) {
          const randomStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)];
          targetStyleId = randomStyle.id;
          // output log for debugging
          // console.log(`[Auto-Style] Selected random style: ${randomStyle.name} (${randomStyle.id})`);
        }
      }

      if (!targetStyleId) return '';

      const preset = stylePresets.find(p => p.id === targetStyleId);
      if (!preset) return '';
      const promptForFmt = preset.prompts?.image;

      // If random, we might want to tell the prompt it was an artistic choice, or just treat it normally.
      // Treating it normally works best.
      return promptForFmt ? ` Style preset: ${promptForFmt}.` : '';
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
      : createNaturalPrompt(requestData, defaultFields.cardType, { size: defaultFields.size || 'portrait', medium: format });

    const finalPrompt = `${basePrompt}${styleSegment}${advancedSegment}`.trim();

    const cardParams = {
      cardType: defaultFields.cardType,
      size: defaultFields.size || 'portrait', // Add a default size if not provided
      userPrompt: finalPrompt,
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
        const basePromptRef = createNaturalPrompt(requestData, defaultFields.cardType, { size: defaultFields.size || 'portrait', medium: 'image' });
        const likeness = buildReferenceEditPrompt(requestData, defaultFields.cardType, { size: defaultFields.size || 'portrait' });
        const prompt = `${basePromptRef}${styleSegment}${advancedSegment} ${likeness}`.slice(0, 5000);
        result = await generateCardImageWithGptImage2Edit({ size: defaultFields.size || 'portrait', userPrompt: prompt, imageUrls: referenceImageUrls });
      } else if (format === 'image') {
        result = await generateCardImage(cardParams, modelLevel);
      } else if (format === 'video') {
        result = await generateCardVideo(cardParams, modelLevel);
      } else {
        result = await generateCardContentWithKieClaude(cardParams, getSvgGenerationModel(modelLevel));
      }

      // console.log('result', result);

      // Update status to completed with results
      let resolvedR2Url = result.r2Url || '';
      if (format === 'svg' && result.svgContent) {
        resolvedR2Url = await uploadSvgToR2(result.svgContent, cardId, new Date());
      }

      const nextStatus = result.status || 'completed';

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
