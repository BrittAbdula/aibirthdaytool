import { NextResponse } from 'next/server';
import { generateCardContent } from '@/lib/gpt';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateCardImageWith4o, generateCardImageGeminiFlash, generateCardImage } from '@/lib/image';
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
        promptVersion: format === 'image' ? 'image' : 'svg',
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
      userPrompt: isModification ? modificationFeedback : createNaturalPrompt(requestData, defaultFields.cardType),
      // Only include these if it's a modification request
      ...(isModification && {
        modificationFeedback,
        previousCardId
      })
    };

    // Start async processing
    try {
      // Then use the params object when calling generateCardContent
      const result = format === 'image'
        ? await generateCardImage(cardParams, modelLevel)
        : await generateCardContent(cardParams, modelLevel);

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
          promptVersion: format === 'image' ? 'image' : 'svg', // Fallback
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



const createNaturalPrompt = (formData: any, cardType: string) => {
  const { to, recipientName, message, signed, design, yearsTogether, age,tone, cardRequirements } = formData;

  let prompt = '';

  // 主句
  if (to && recipientName) {
    const relationship = to.toLowerCase() === 'myself' ? 'myself' : `my ${to.toLowerCase()}`;
    prompt += `A ${cardType} card to ${relationship} ${recipientName}. `;
  }

  // 根据卡片类型动态添加消息描述
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
    };

    const context = messageContext[cardType as keyof typeof messageContext] || 'Message';
    prompt += `${context}: "${message}". `;
  }

  // 签名
  if (signed) {
    prompt += `Signed by: ${signed}. `;
  }

  if (yearsTogether) {
    prompt += `Years together: ${yearsTogether}. `;
  }

  if(age){
    prompt += `Age: ${age}. `;
  }

  if(tone){
    prompt += `Tone: ${tone}. `;
  }

  // 设计要求
  if (design) {
    if (design === 'custom') {
      // 如果是自定义设计，需要获取用户的自定义输入
      const customDesign = formData.customDesign || formData.design_custom;
      if (customDesign) {
        prompt += `Design requirements: ${customDesign}. `;
      }
    } else {
      // 预设颜色
      prompt += `Color scheme: ${design}. `;
    }
  }


  if(cardRequirements){
    prompt += `Requirements: ${cardRequirements}. `;
  }

  return prompt.trim();
};