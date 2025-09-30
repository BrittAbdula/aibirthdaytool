import { NextResponse } from 'next/server';
import { generateCardContent } from '@/lib/gpt';
import { generateCardContentWithAnthropic } from '@/lib/anthropic-messages';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateCardImageWith4o, generateCardImageGeminiFlash, generateCardImage } from '@/lib/image';
import { generateCardVideo, generateCardImageWithBananaEdit } from '@/lib/image-and-video';
import { nanoid } from 'nanoid';
import { getModelConfig, createModelTierMap } from '@/lib/model-config';
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
      ...defaultFields
    } = requestData;

    if (!defaultFields.cardType) {
      return NextResponse.json({ error: 'Missing required field: cardType' }, { status: 400 });
    }

    // 检查是否是修改请求
    const isModification = modificationFeedback && previousCardId;

    // 优化：并行查询用户权限和使用情况
    const [user, usage] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      }),
      prisma.apiUsage.findUnique({
        where: {
          userId_date: {
            userId,
            date: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      })
    ]);

    // 从modelId解析模型配置
    const modelConfig = getModelConfig(modelId);
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model ID' }, { status: 400 });
    }

    const format = modelConfig.format;
    const modelTier = modelConfig.tier;

    // 获取用户计划类型
    const planType = user?.plan || 'FREE';
    const dailyLimit = planType === 'FREE' ? 10 : Infinity;
    const creditsUsed = modelConfig.credits;
    const modelLevel = modelTier === 'Premium' && planType === 'PREMIUM' ? 'PREMIUM' : 'FREE';

    // 处理用户使用情况
    let currentUsage = usage?.count || 0;
    if (!usage) {
      // 创建新的使用记录 - 这将在生成后异步完成
      // 使用 catch 语句避免因数据库原因阻塞主流程
      Promise.resolve().then(async () => {
        try {
          await prisma.apiUsage.create({
            data: {
              userId,
              date: new Date(new Date().setHours(0, 0, 0, 0)),
              count: creditsUsed,
            },
          });
        } catch (error) {
          console.error('Error creating usage record:', error);
        }
      });
    } else if (currentUsage >= dailyLimit) {
      return NextResponse.json({
        error: "You've reached your daily limit. Please try again tomorrow or visit our Card Gallery."
      }, { status: 429 });
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

    // Before generating card, create the proper params object
    const cardParams = {
      cardType: defaultFields.cardType,
      size: defaultFields.size || 'portrait', // Add a default size if not provided
      userPrompt: isModification
        ? modificationFeedback
        : createNaturalPrompt(requestData, defaultFields.cardType, { size: defaultFields.size || 'portrait', medium: format }),
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
      // If reference images are provided, use Banana Edit API
      if (Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0) {
        const basePrompt = createNaturalPrompt(requestData, defaultFields.cardType, { size: defaultFields.size || 'portrait', medium: 'image' });
        const likeness = buildReferenceEditPrompt(requestData, defaultFields.cardType, { size: defaultFields.size || 'portrait' });
        const prompt = `${basePrompt} ${likeness}`.slice(0, 5000);
        result = await generateCardImageWithBananaEdit({ size: defaultFields.size || 'portrait', userPrompt: prompt, imageUrls: referenceImageUrls });
      } else if (format === 'image') {
        result = await generateCardImage(cardParams, modelLevel);
      } else if (format === 'video') {
        result = await generateCardVideo(cardParams, modelLevel);
      } else {
        // SVG path: prefer Anthropic Messages via HOLD gateway if configured
        const holdBase = process.env.HOLD_AI_BASE_URL;
        const holdKey = process.env.HOLD_AI_KEY;
        if (holdBase && holdKey) {
          const model = (modelLevel === 'PREMIUM')
            ? 'claude-sonnet-4-20250514'
            : (Math.random() < 0.2 ? 'claude-sonnet-4-20250514' : 'claude-3-5-haiku-latest');
          result = await generateCardContentWithAnthropic(cardParams, model);
        } else {
          result = await generateCardContent(cardParams, modelLevel);
        }
      }

      // console.log('result', result);

      // Update status to completed with results
      await prisma.apiLog.update({
        where: { cardId },
        data: {
          taskId: result.taskId,
          r2Url: result.r2Url,
          responseContent: result.svgContent,
          promptVersion: result.model,
          tokensUsed: result.tokensUsed,
          duration: result.duration,
          errorMessage: result.errorMessage,
          status: result.status || 'completed',
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



const createNaturalPrompt = (
  formData: any,
  cardType: string,
  opts?: { size?: string, medium?: 'image' | 'svg' | 'video' }
) => {
  const { to, recipientName, message, signed, design, yearsTogether, age, tone, cardRequirements } = formData;
  const size = opts?.size || 'portrait';
  const medium = opts?.medium || 'image';

  let prompt = '';

  // Goal & audience
  prompt += `Design a playful, delightful ${cardType} greeting-card visual. `;

  // Recipient context
  if (to && recipientName) {
    const relationship = to.toLowerCase() === 'myself' ? 'myself' : `my ${to.toLowerCase()}`;
    prompt += `It is for ${relationship} ${recipientName}. `;
  }

  // Message context
  if (message) {
    const messageContext = {
      'sorry': 'Reason for apology',
      'birthday': 'Birthday message',
      'thank-you': 'Reason for gratitude',
      'congratulations': 'Celebration reason',
      'love': 'Love message',
      'get-well': 'Get well wishes',
      'graduation': 'Graduation message',
      'wedding': 'Wedding wishes',
      'holiday': 'Holiday message',
      'anniversary': 'Anniversary message',
      'baby': 'Baby shower message'
    } as const;
    const context = (messageContext as any)[cardType] || 'Message';
    prompt += `${context}: "${message}". `;
  }

  // Signature & other simple facts
  if (signed) prompt += `Signed by: ${signed}. `;
  if (yearsTogether) prompt += `Years together: ${yearsTogether}. `;
  if (age) prompt += `Age: ${age}. `;
  if (tone) prompt += `Desired tone: ${tone}. `;

  // Color / design
  if (design) {
    if (design === 'custom') {
      const customDesign = formData.customDesign || formData.design_custom;
      if (customDesign) prompt += `Color palette: ${customDesign}. `;
    } else {
      prompt += `Color palette: ${design}. `;
    }
  }

  if (cardRequirements) {
    prompt += `Other requirements: ${cardRequirements}. `;
  }

  // Size & composition guidance
  if (size === 'portrait' || size === 'story') {
    prompt += `Composition: portrait orientation; balanced vertical layout. `;
  } else if (size === 'landscape') {
    prompt += `Composition: landscape orientation; cinematic horizontal layout. `;
  } else {
    prompt += `Composition: square layout; centered, balanced. `;
  }

  // Fun visual style applicable to both image/SVG
  prompt += `Style: fun, whimsical, and charming; add witty details and celebratory props (confetti, balloons, streamers) where suitable. Use a bright cohesive palette, soft lighting, and gentle shadows. `;

  // SVG-only micro animation guidance
  if (medium === 'svg') {
    prompt += `Use 1–3 tasteful CSS keyframe animations (e.g., gentle shimmer, breathing, floating confetti). Keep them subtle and efficient; no external scripts or fonts. `;
  }

  // Text handling and cleanliness across mediums
  prompt += `Do not render large text; leave clean space for typography to be added later. Avoid watermarks and logos. Keep the subject clear and appealing.`;

  return prompt.trim();
};

function buildReferenceEditPrompt(
  formData: any,
  cardType: string,
  opts?: { size?: string }
) {
  const tone = (formData?.tone || '').toString().toLowerCase();
  const size = opts?.size || 'portrait';
  const design = formData?.design;
  const customDesign = formData?.customDesign || formData?.design_custom;

  const toneStyle = tone.includes('humor')
    ? 'playful, slightly cartoony, light-hearted'
    : tone.includes('surprise')
      ? 'vibrant, energetic, celebratory'
      : tone.includes('touching')
        ? 'warm, tender, soft gradients'
        : 'cheerful and welcoming';

  const motifsMap: Record<string, string> = {
    birthday: 'balloons, confetti, streamers, candles',
    anniversary: 'warm lights, roses, subtle sparkles',
    valentine: 'hearts, rose petals, ribbons',
    love: 'soft hearts, warm glows',
    'thank-you': 'gentle florals, ribbons',
    congratulations: 'ribbons, confetti, stars',
    'get-well': 'soft shapes, soothing colors',
    graduation: 'mortarboard, scroll, confetti',
    wedding: 'floral arch, rings, lace patterns',
    holiday: 'seasonal ornaments, cozy lights',
    baby: 'pastel toys, clouds, stars',
    sorry: 'calm tones, soft bokeh'
  };
  const motifs = motifsMap[cardType] || 'festive, clean, thematic elements';

  const paletteLine = design
    ? (design === 'custom' && customDesign
        ? `Color palette: ${customDesign}. `
        : `Color palette: ${design}. `)
    : '';

  const orientationLine = size === 'landscape'
    ? 'Use a balanced horizontal composition. '
    : size === 'square'
      ? 'Use a centered, balanced square composition. '
      : 'Use a balanced vertical composition. ';

  return (
    `Keep the subject clearly recognizable (face geometry, hairstyle, skin tone, key accessories). ` +
    `Preserve the main clothing colors and patterns; do not drastically change outfit design. ` +
    `Make the subject the primary character; place on a simple subtle base (e.g., round plinth) if helpful for presentation. ` +
    `${orientationLine}` +
    `Background: ${motifs} that match the theme and ${toneStyle}. ` +
    `${paletteLine}` +
    `Leave clean negative space for future text; do not render any text. ` +
    `Render as a polished 2D illustration with cohesive palette, soft lighting, and gentle shadows. ` +
    `Respect the reference pose and proportions; avoid adding or removing glasses, hats, or facial hair unless already present. ` +
    `No watermarks or logos. `
  );
}
