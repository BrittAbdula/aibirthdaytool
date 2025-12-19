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

    const format = (outputFormat as 'image' | 'svg' | 'video') || modelConfig.format;
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
    // Build style segment
    const styleSegment = (() => {
      // Only apply style presets to static images; SVG/video keep backend-driven phrasing
      if (format !== 'image') return '';

      let targetStyleId = styleId;
      let isRandom = false;

      // Random style logic: if no style selected for image, pick one randomly
      if (!targetStyleId) {
        const availableStyles = stylePresets.filter(p => p.formats.includes('image') && p.prompts.image);
        if (availableStyles.length > 0) {
          const randomStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)];
          targetStyleId = randomStyle.id;
          isRandom = true;
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
            : (Math.random() < 0.2 ? 'claude-sonnet-4-5-20250929' : 'gemini-3-flash-preview');
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

  // Enhanced emotional and philosophical tone mappings
  const toneMapping: Record<string, { style: string; philosophy: string; animation: string }> = {
    'humor': {
      style: 'whimsical, playful, light-hearted yet sophisticated with delightful surprises',
      philosophy: 'Laughter connects souls — find the gentle humor that brings warmth',
      animation: 'bouncy, playful motion with unexpected delights'
    },
    'surprise': {
      style: 'dynamic, vibrant, celebratory with moments of wonder and discovery',
      philosophy: 'The best surprises reveal what we always hoped was true',
      animation: 'revealing animations, elements that emerge and delight'
    },
    'touching': {
      style: 'deeply emotional, tender, intimate with soft atmospheric quality',
      philosophy: 'True emotion needs no words — let the visuals speak to the heart',
      animation: 'breathing rhythms, gentle heartbeat pulses, slow graceful movements'
    },
    'romantic': {
      style: 'sensual, warm, intimate with dreamy soft-focus quality',
      philosophy: 'Love is seeing someone fully and choosing them — honor that sacred seeing',
      animation: 'intertwining elements, synchronized movements, magnetic attraction'
    },
    'nostalgic': {
      style: 'warm sepia-tinted, memory-like, bittersweet beauty',
      philosophy: 'Memories are how love defeats time — honor the past while celebrating now',
      animation: 'gentle fades, floating drift like memories surfacing'
    },
    'hopeful': {
      style: 'bright, ascending, dawn-like with emerging light',
      philosophy: 'Hope is courage in the face of uncertainty — show light breaking through',
      animation: 'upward motion, gradual brightening, unfurling growth'
    },
    'grateful': {
      style: 'warm, grounded, rich earth tones with golden light',
      philosophy: 'Gratitude transforms what we have into enough — show abundance in simplicity',
      animation: 'gentle blooming, warming glow, assembling elements'
    }
  };

  // Find matching tone or use default
  const toneKey = Object.keys(toneMapping).find(key => toneRaw.includes(key)) || '';
  const toneConfig = toneMapping[toneKey] || {
    style: 'elegant, heartfelt, and emotionally resonant',
    philosophy: 'Every card is a moment of connection between two souls',
    animation: 'subtle breathing motion, gentle presence'
  };

  let prompt = '';

  // Opening with emotional intent (different for SVG vs other media)
  if (medium === 'svg') {
    prompt += `Create a deeply moving ${cardType} card that touches the heart. `;
    prompt += `${toneConfig.philosophy}. `;
  } else {
    prompt += `Create a masterpiece ${cardType} greeting card visual of award-winning quality. `;
    prompt += `The image should evoke genuine emotion — not just beautiful, but meaningful. `;
  }

  // Recipient context with emotional depth
  if (toResolved && recipientName) {
    const relationship = toResolved.toLowerCase() === 'myself' ? 'myself' : `my ${toResolved.toLowerCase()}`;
    prompt += `This is for ${relationship}, ${recipientName}. `;
    
    // Add relationship-specific emotional context for SVG
    if (medium === 'svg') {
      const relationshipEmotions: Record<string, string> = {
        'mom': 'Honor the quiet sacrifices of maternal love — hands that held, arms that comforted',
        'mother': 'Honor the quiet sacrifices of maternal love — hands that held, arms that comforted',
        'dad': 'Celebrate steadfast presence — the silent strength that shapes who we become',
        'father': 'Celebrate steadfast presence — the silent strength that shapes who we become',
        'friend': 'True friendship is chosen family — souls that recognized each other',
        'partner': 'Two people choosing each other, again and again — love as a daily decision',
        'wife': 'The miracle of being truly known and loved anyway',
        'husband': 'The miracle of being truly known and loved anyway',
        'child': 'Each child rewrites possibility — pure potential wrapped in wonder',
        'grandparent': 'Living bridges to our history — wisdom and unconditional love',
        'sibling': 'Shared childhood, parallel journeys — the first friends we ever had',
        'colleague': 'We spend our days together — recognize the human behind the role',
        'myself': 'Self-compassion is the foundation of all love — you deserve celebration'
      };
      const relationshipKey = Object.keys(relationshipEmotions).find(key => 
        toResolved.toLowerCase().includes(key)
      );
      if (relationshipKey) {
        prompt += `${relationshipEmotions[relationshipKey]}. `;
      }
    }
  }

  // Message context with deeper emotional translation
  if (message) {
    const messageContextDeep: Record<string, { emotion: string; visual: string }> = {
      'sorry': {
        emotion: 'the courage of vulnerability, the hope for reconciliation, the weight of regret transformed into bridge-building',
        visual: 'mending, bridges forming, light returning after storm, hands reaching across gaps'
      },
      'birthday': {
        emotion: 'another year of existence is a miracle — celebrate not just age but the gift of being alive',
        visual: 'rising elements, life force glowing, cycles of renewal, wishes taking flight'
      },
      'thank-you': {
        emotion: 'gratitude as recognition of grace in others — seeing the gifts we often take for granted',
        visual: 'blooming flowers, light emerging, hands giving and receiving, seeds of kindness sprouting'
      },
      'congratulations': {
        emotion: 'achievement deserves witness — joy shared multiplies, pride earned through effort',
        visual: 'ascending paths, stars rising, doors opening, peaks reached, light bursting forth'
      },
      'love': {
        emotion: 'love as seeing someone fully and choosing them — vulnerability as strength, devotion as daily choice',
        visual: 'intertwining elements, hearts as vessels, magnetic attraction, two becoming constellation'
      },
      'get-well': {
        emotion: 'healing needs witness — being seen in suffering brings comfort, hope as medicine',
        visual: 'warm light breaking through, gentle embrace, new growth after rain, protective warmth'
      },
      'graduation': {
        emotion: 'threshold crossing — honoring effort while celebrating limitless possibility ahead',
        visual: 'doors opening, paths ascending, light at horizon, wings unfurling'
      },
      'wedding': {
        emotion: 'two people choosing to build a world together — sacred promise, leap of faith hand in hand',
        visual: 'rings interlinked, flames merging, roots intertwining, two paths becoming one'
      },
      'holiday': {
        emotion: 'traditions connect us across time — warmth of belonging, the comfort of ritual',
        visual: 'gathering lights, warm hearth, circles of connection, seasonal magic'
      },
      'anniversary': {
        emotion: 'love as a choice made every day — staying is bravery, growing together is miracle',
        visual: 'intertwined paths, tree rings marking years, two moons in eternal dance'
      },
      'baby': {
        emotion: 'new life as pure possibility — the awesome responsibility and wonder of beginning',
        visual: 'stars being born, dawn breaking, seeds sprouting, delicate new leaves'
      }
    };
    
    const context = messageContextDeep[cardType] || {
      emotion: 'heartfelt sentiment',
      visual: 'elegant thematic elements'
    };
    
    prompt += `Core message: "${message}". `;
    if (medium === 'svg') {
      prompt += `Emotional essence: ${context.emotion}. `;
      prompt += `Translate this into visual metaphor: ${context.visual}. `;
    } else {
      prompt += `Transform this sentiment into rich visual poetry with emotional depth. `;
    }
  }

  // SVG-specific: Animation guidance based on tone
  if (medium === 'svg') {
    prompt += `Animation spirit: ${toneConfig.animation}. `;
    prompt += `The animation should feel like breathing — natural, inevitable, meditative. `;
  }

  // Signature with warmth
  if (signedResolved && medium !== 'image') {
    prompt += `From ${signedResolved} — infuse personal warmth into the design. `;
  }
  
  // Milestone context with meaning
  if (yearsTogether) {
    const yearsNum = parseInt(yearsTogether);
    if (yearsNum >= 25) {
      prompt += `Celebrating ${yearsTogether} remarkable years together — a testament to enduring love. `;
    } else if (yearsNum >= 10) {
      prompt += `Honoring ${yearsTogether} years of choosing each other — a decade of shared life. `;
    } else {
      prompt += `Marking ${yearsTogether} years together — each year a chapter in an ongoing story. `;
    }
  }
  
  if (age) {
    const ageNum = parseInt(age);
    if (ageNum >= 80) {
      prompt += `A life of ${age} years — rich with wisdom, stories, and love given. `;
    } else if (ageNum >= 50) {
      prompt += `${age} years of living, learning, loving — a milestone worth celebrating deeply. `;
    } else if (ageNum <= 10) {
      prompt += `${age} years young — all of life's wonder still ahead. `;
    } else {
      prompt += `Celebrating ${age} years. `;
    }
  }

  // Tone/mood styling
  if (toneConfig.style) {
    prompt += `Overall mood: ${toneConfig.style}. `;
  }

  // Color palette
  if (design) {
    if (design === 'custom') {
      if (customDesign) prompt += `Color palette: ${customDesign}. `;
    } else {
      prompt += `Color palette: ${design}. `;
    }
  }

  if (cardRequirements) {
    prompt += `Specific requests: ${cardRequirements}. `;
  }

  // Include additional user inputs
  try {
    const excluded = new Set([
      'to', 'relationship', 'recipientName', 'message', 'signed', 'senderName', 'design', 'customDesign', 'design_custom',
      'yearsTogether', 'age', 'cardRequirements', 'tone',
      'size', 'modelId', 'styleId', 'outputFormat', 'imageCount', 'referenceImageUrls', 'animationSpeed', 'loop', 'styleStrength', 'duration'
    ]);
    const extras: string[] = [];
    Object.entries(base || {}).forEach(([k, v]) => {
      if (excluded.has(k)) return;
      if (v === null || v === undefined) return;
      if (typeof v === 'string' && v.trim() === '') return;
      if (typeof v === 'object') return;
      const human = k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').toLowerCase();
      if (typeof v === 'boolean') {
        if (v) extras.push(`Include ${human} element.`);
      } else {
        extras.push(`${human}: ${v}.`);
      }
    });
    if (extras.length) {
      prompt += `Additional details: ${extras.join(' ')} `;
    }
  } catch { }

  // Visual motifs with emotional depth
  const motifsMapEnhanced: Record<string, { motifs: string; mood: string }> = {
    birthday: {
      motifs: 'gentle candle flames as life force, floating wishes like stars, elegant balloons ascending, soft celebration particles',
      mood: 'joyful wonder with a touch of time\'s preciousness'
    },
    anniversary: {
      motifs: 'intertwined paths or ribbons, warm golden light, two elements in harmony (stars, flowers, flames), rings or circles of continuity',
      mood: 'deep gratitude, the comfort of being truly known'
    },
    valentine: {
      motifs: 'hearts as vessels not clichés, silk ribbons, soft rose petals drifting, warm intimate glow',
      mood: 'romantic intimacy, the vulnerability of love'
    },
    love: {
      motifs: 'two elements in gravitational dance, ethereal glow, intertwined forms, magnetic attraction visualized',
      mood: 'devotion, the miracle of choosing and being chosen'
    },
    'thank-you': {
      motifs: 'blooming florals, light emerging from darkness, hands in gesture of giving, seeds transforming',
      mood: 'humble gratitude, recognition of grace'
    },
    congratulations: {
      motifs: 'ascending elements, stars rising, paths reaching peaks, light bursting through, triumphant arcs',
      mood: 'earned pride, boundless possibility'
    },
    'get-well': {
      motifs: 'warm light breaking through clouds, gentle protective embrace, new growth, soothing natural elements',
      mood: 'tender care, quiet strength, gentle hope'
    },
    graduation: {
      motifs: 'doors opening, paths ascending toward light, wings unfurling, threshold symbols',
      mood: 'achievement honored, future embraced'
    },
    wedding: {
      motifs: 'two flames becoming one, interlinked rings, roots growing together, white florals with golden light',
      mood: 'sacred joy, eternal promise'
    },
    holiday: {
      motifs: 'gathering warm lights, cozy glowing elements, seasonal magic, circles of connection',
      mood: 'warmth of belonging, comfort of tradition'
    },
    baby: {
      motifs: 'soft clouds and stars, gentle dawn colors, tiny precious elements, nurturing embrace shapes',
      mood: 'pure wonder, tender new beginning'
    },
    sorry: {
      motifs: 'bridge forming across gap, light returning after storm, gentle rain washing clean, hands reaching',
      mood: 'humble hope, the courage of vulnerability'
    }
  };
  
  const motifsConfig = motifsMapEnhanced[cardType] || {
    motifs: 'tasteful, meaningful thematic elements that serve the emotional core',
    mood: 'elegant and heartfelt'
  };
  
  if (medium === 'svg') {
    prompt += `Visual metaphors to consider: ${motifsConfig.motifs}. `;
    prompt += `Emotional atmosphere: ${motifsConfig.mood}. `;
  } else {
    prompt += `Use elegant motifs: ${motifsConfig.motifs}. `;
  }

  // Size & composition
  if (size === 'portrait' || size === 'story') {
    prompt += `Composition: portrait orientation with clear focal point and visual breathing room. `;
  } else if (size === 'landscape') {
    prompt += `Composition: landscape orientation with cinematic depth and horizontal flow. `;
  } else {
    prompt += `Composition: square layout, centered with intentional balance. `;
  }

  // Medium-specific guidance
  if (medium === 'image') {
    prompt += `Full-bleed, edge-to-edge composition. No borders or white margins. `;
    prompt += `Rich, fully opaque background. Frame main subject at 65–85% of canvas. `;
    prompt += `Style: High-end digital art, soft cinematic lighting, 8k resolution, highly detailed. `;

    const parts: string[] = [];
    if (recipientName) parts.push(`To ${recipientName}`);
    if (signedResolved) parts.push(`from ${signedResolved}`);
    if (parts.length > 0) {
      const inscription = parts.join(', ');
      prompt += `Small elegant handwritten inscription: "${inscription}" in corner. `;
    } else {
      prompt += `Rely entirely on visual storytelling — no text. `;
    }
  } else if (medium === 'svg') {
    prompt += `Use rich gradient or textured background — no plain white. `;
    prompt += `Style: Modern vector aesthetic with soul — clean lines that carry emotional weight. `;
    prompt += `Include ONE signature animation that embodies the emotional core — breathing, floating, or gentle motion. `;
    prompt += `The animation should be meditative, not distracting — a gentle heartbeat of presence. `;
  } else if (medium === 'video') {
    prompt += `Smooth, cinematic motion with emotional pacing. `;
  }

  prompt += `Final quality: Pristine, no watermarks, no artifacts. A gift worth giving. `;

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
    ? 'whimsical, playful, light-hearted'
    : tone.includes('surprise')
      ? 'dynamic, vibrant, celebratory'
      : tone.includes('touching')
        ? 'deeply emotional, tender, heartwarming, atmospheric'
        : 'elegant, polished, and welcoming';

  const motifsMap: Record<string, string> = {
    birthday: 'elegant balloons, soft confetti, streamers, cake',
    anniversary: 'romantic lighting, roses, gold accents',
    valentine: 'hearts, petals, soft pinks/reds',
    love: 'warm glow, soft hearts',
    'thank-you': 'botanicals, fresh flowers',
    congratulations: 'stars, sparkles, confetti',
    'get-well': 'soothing nature elements',
    graduation: 'mortarboard, scroll, gold details',
    wedding: 'floral arrangements, lace, rings',
    holiday: 'seasonal decor, lights, cozy atmosphere',
    baby: 'soft toys, clouds, stars',
    sorry: 'peaceful, muted tones'
  };
  const motifs = motifsMap[cardType] || 'festive, elegant thematic elements';

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
    `Create a high-quality, elegant transformation. ` +
    `Keep the subject clearly recognizable (face geometry, hairstyle, skin tone, accessories). ` +
    `Preserve main clothing colors/patterns but refine them for a premium look. ` +
    `Make the subject the star; place on a subtle, aesthetic base if needed. ` +
    `Subject scale: 65–85% of canvas. ` +
    `${orientationLine}` +
    `Background: ${motifs} matching the ${toneStyle} mood. Extend background to edges (full-bleed, opaque). ` +
    `${paletteLine}` +
    `NO text. NO white borders. NO letterboxing. ` +
    `Render as a polished, high-definition 2D illustration (or photorealistic if appropriate) with cohesive color grading, soft cinematic lighting, and depth. ` +
    `Respect the reference pose. ` +
    `No watermarks/logos. Best quality, 8k, masterpiece.`
  );
}
