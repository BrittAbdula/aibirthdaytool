import { NextResponse } from 'next/server';
import { generateCardContent } from '@/lib/gpt';
import { generateCardContentWithAnthropic } from '@/lib/anthropic-messages';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateCardImage } from '@/lib/image';
import { generateCardVideo, generateCardImageWithBananaEdit } from '@/lib/image-and-video';
import { nanoid } from 'nanoid';
import { getModelConfig, createModelTierMap } from '@/lib/model-config';
import { uploadSvgToR2 } from '@/lib/r2';
import { stylePresets } from '@/lib/style-presets';

// 获取用户可用积分
async function getUserCredits(userId: string, planType: string, isFirstDay: boolean): Promise<number> {
  // 根据计划类型确定每日积分限制（FREE 首日 10 分，每日 5 分）
  const dailyCredits = planType === 'FREE' ? (isFirstDay ? 10 : 5) : Infinity;
  
  if (dailyCredits === Infinity) {
    return Infinity; // PREMIUM 用户无限制
  }
  
  // 查询今日已使用的积分
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const usage = await prisma.apiUsage.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });
  
  const usedCredits = usage?.count || 0;
  return Math.max(0, dailyCredits - usedCredits);
}
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

    const format = (outputFormat as 'image'|'svg'|'video') || modelConfig.format;
    const modelTier = modelConfig.tier;

    // 获取用户计划类型
    const planType = user?.plan || 'FREE';
    // Compute style surcharge (only applies to static images per product rule)
    const styleCost = (() => {
      if (!styleId || format !== 'image') return 0;
      const preset = stylePresets.find(p => p.id === styleId);
      return preset?.cost ?? 0;
    })();

    // Credits: static image baseline = 6, plus style cost; SVG/Video use model credits
    let creditsUsed = (format === 'image' ? 6 : modelConfig.credits) + styleCost;
    // Banana Edit special case: using reference images costs 6 (ignore style surcharge)
    if (Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0) {
      creditsUsed = 6;
    }
    const modelLevel = modelTier === 'Premium' && planType === 'PREMIUM' ? 'PREMIUM' : 'FREE';

    // 查询用户可用积分（FREE 用户首日 10 分）
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const isFirstDay = !!user?.createdAt && user.createdAt >= todayStart;
    const availableCredits = await getUserCredits(userId, planType, isFirstDay);
    
    // 检查积分是否足够
    if (availableCredits < creditsUsed) {
      return NextResponse.json({
        error: 'rate_limit',
        message: 'Daily limit reached. Free users can generate 1 card per day. Please try again tomorrow or upgrade to Premium for unlimited generations.'
      }, { status: 429 }); // 429 Too Many Requests
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
              date: new Date(new Date().setHours(0, 0, 0, 0)),
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

    // Before generating card, create the proper params object
    // Build style segment
    const styleSegment = (() => {
      // Only apply style presets to static images; SVG/video keep backend-driven phrasing
      if (!styleId || format !== 'image') return '';
      const preset = stylePresets.find(p => p.id === styleId);
      if (!preset) return '';
      const promptForFmt = preset.prompts.image;
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
      // If reference images are provided, use Banana Edit API
      if (Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0) {
        const basePromptRef = createNaturalPrompt(requestData, defaultFields.cardType, { size: defaultFields.size || 'portrait', medium: 'image' });
        const likeness = buildReferenceEditPrompt(requestData, defaultFields.cardType, { size: defaultFields.size || 'portrait' });
        const prompt = `${basePromptRef}${styleSegment}${advancedSegment} ${likeness}`.slice(0, 5000);
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
            ? 'claude-sonnet-4-5-20250929'
            : (Math.random() < 0.2 ? 'claude-sonnet-4-5-20250929' : 'claude-haiku-4-5-20251001');
          // const model = 'claude-sonnet-4-5-20250929';
          result = await generateCardContentWithAnthropic(cardParams, model);
        } else {
          result = await generateCardContent(cardParams, modelLevel);
        }
      }

      // console.log('result', result);

      // Update status to completed with results
      let resolvedR2Url = result.r2Url || '';
      if (format === 'svg' && result.svgContent) {
        resolvedR2Url = await uploadSvgToR2(result.svgContent, cardId, new Date());
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
  const { to, recipientName, message, signed, design, yearsTogether, age, cardRequirements } = (formData?.formData ?? formData);
  const size = opts?.size || 'portrait';
  const medium = opts?.medium || 'image';
  const base = (formData?.formData ?? formData) as any;
  // Aliases and normalized fields
  const toResolved = (base?.to || base?.relationship || '').toString();
  const signedResolved = (base?.signed || base?.senderName || '').toString();
  const toneRaw = (base?.tone || '').toString().toLowerCase();
  const customDesign = (base?.customDesign || base?.design_custom || '').toString();
  const toneStyle = toneRaw.includes('humor')
    ? 'playful, light-hearted mood'
    : toneRaw.includes('surprise')
      ? 'vibrant, energetic, celebratory mood'
      : toneRaw.includes('touching')
        ? 'warm, tender, heartfelt mood'
        : toneRaw ? `${toneRaw} mood` : '';

  let prompt = '';

  // Goal & audience
  prompt += `Create a heartfelt ${cardType} greeting-card visual that authentically reflects the sender's feelings. `;

  // Recipient context
  if (toResolved && recipientName) {
    const relationship = toResolved.toLowerCase() === 'myself' ? 'myself' : `my ${toResolved.toLowerCase()}`;
    prompt += `It is for ${relationship} ${recipientName}. `;
  }

  // Message context (use the message to drive the overall emotional direction without rendering text)
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
    prompt += `Interpret this message as visual emotion and symbolism (not literal text). `;
  }

  // Signature & other simple facts
  if (signedResolved && medium !== 'image') {
    // For non-image media, influence tone without instructing text rendering
    prompt += `Personal touch from sender (${signedResolved}); convey warmth and authenticity. `;
  }
  if (yearsTogether) prompt += `Years together: ${yearsTogether}. `;
  if (age) prompt += `Age: ${age}. `;
  if (toneStyle) {
    prompt += `Overall mood: ${toneStyle}. `;
  }

  // Color / design
  if (design) {
    if (design === 'custom') {
      if (customDesign) prompt += `Color palette: ${customDesign}. `;
    } else {
      prompt += `Color palette: ${design}. `;
    }
  }

  if (cardRequirements) {
    prompt += `Other requirements: ${cardRequirements}. `;
  }

  // Include additional simple user inputs as natural-language context (avoid tag soup)
  try {
    const excluded = new Set([
      'to','relationship','recipientName','message','signed','senderName','design','customDesign','design_custom',
      'yearsTogether','age','cardRequirements','tone',
      'size','modelId','styleId','outputFormat','imageCount','referenceImageUrls','animationSpeed','loop','styleStrength','duration'
    ]);
    const extras: string[] = [];
    Object.entries(base || {}).forEach(([k, v]) => {
      if (excluded.has(k)) return;
      if (v === null || v === undefined) return;
      if (typeof v === 'string' && v.trim() === '') return;
      if (typeof v === 'object') return;
      const human = k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').toLowerCase();
      if (typeof v === 'boolean') {
        if (v) extras.push(`Include ${human} if relevant.`);
      } else {
        extras.push(`${human}: ${v}.`);
      }
    });
    if (extras.length) {
      prompt += `Consider these user details: ${extras.join(' ')} `;
    }
  } catch {}

  // Motifs per card type to guide scene building
  const motifsMap: Record<string, string> = {
    birthday: 'balloons, confetti, candles, colorful streamers',
    anniversary: 'warm lights, roses, soft sparkles',
    valentine: 'hearts, rose petals, delicate ribbons',
    love: 'soft hearts, gentle glow',
    'thank-you': 'subtle florals, ribbons, soft gradients',
    congratulations: 'confetti, stars, celebratory ribbons',
    'get-well': 'calming shapes, soothing colors',
    graduation: 'mortarboard, scroll, confetti',
    wedding: 'floral arch, rings, lace patterns',
    holiday: 'seasonal ornaments, cozy lights',
    baby: 'pastel toys, clouds, stars',
    sorry: 'calm tones, soft bokeh'
  };
  const motifs = motifsMap[cardType] || 'festive, thematic elements that match the occasion';
  prompt += `Use tasteful motifs for ${cardType}: ${motifs}. `;

  // Size & composition guidance
  if (size === 'portrait' || size === 'story') {
    prompt += `Composition: portrait orientation; balanced vertical layout. `;
  } else if (size === 'landscape') {
    prompt += `Composition: landscape orientation; cinematic horizontal layout. `;
  } else {
    prompt += `Composition: square layout; centered, balanced. `;
  }

  // Medium-aware framing rules to eliminate white blanks
  if (medium === 'image') {
    prompt += `Full-bleed, edge-to-edge composition; no borders, frames, or white margins; avoid letterboxing/pillarboxing; fill the canvas with scene and background; use an opaque (non-transparent) background. `;
    prompt += `Frame the main subject to occupy ~65–85% of the canvas; avoid excessive headroom or footroom. `;
    // Handwritten inscription for who-to-who if provided
    const parts: string[] = [];
    if (recipientName) parts.push(`To ${recipientName}`);
    if (signedResolved) parts.push(`from ${signedResolved}`);
    if (parts.length > 0) {
      const inscription = parts.join(', ');
      prompt += `Add one small, tasteful handwritten-style inscription reading "${inscription}"; place subtly near a corner or the lower area; integrate naturally; keep it short, legible, and not dominant. Avoid any other text. `;
    } else {
      prompt += `Avoid including any text or captions; translate emotional intent into color, light, and symbolic props. `;
    }
  } else if (medium === 'svg') {
    // For SVG, still avoid empty white slabs while keeping vector cleanliness
    prompt += `Use a cohesive colored or gradient background that reaches the canvas edges (no plain white slabs); avoid transparent backgrounds. `;
  } else if (medium === 'video') {
    prompt += `Ensure smooth, coherent motion with clear subject focus; avoid jittery or disorienting camera moves. `;
  }

  // Visual style seed: keep for SVG; Static/Video rely primarily on style preset
  if (medium === 'svg') {
    prompt += `Style: clean vector aesthetic with playful charm; add 1–2 thematic props (confetti, balloons, streamers) that interact with the scene; cohesive palette, soft lighting, gentle depth. `;
  }

  // Cleanliness
  prompt += `Avoid watermarks and logos. Keep the subject clear and appealing. `;

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
    `Scale the subject so it fills roughly 65–85% of the canvas; avoid excessive headroom or footroom. ` +
    `${orientationLine}` +
    `Background: ${motifs} that match the theme and ${toneStyle}; extend background colors/patterns all the way to the canvas edges (full-bleed); background should be opaque (non-transparent). ` +
    `${paletteLine}` +
    `Do not render any text; do not reserve blank areas—avoid large white or empty regions; no borders or frames; avoid letterboxing/pillarboxing. ` +
    `Render as a polished 2D illustration with cohesive palette, soft lighting, gentle shadows, and subtle depth. ` +
    `Respect the reference pose and proportions; avoid adding or removing glasses, hats, or facial hair unless already present. ` +
    `No watermarks or logos. `
  );
}
