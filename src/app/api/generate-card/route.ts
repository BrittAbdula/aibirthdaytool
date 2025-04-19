import { NextResponse } from 'next/server';
import { generateCardContent } from '@/lib/gpt';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// 增加超时限制到最大值
export const maxDuration = 60; // 增加到 60 秒

// 使用边缘运行时，提高性能
// export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// 创建 X.AI 客户端实例
const openai = new OpenAI({
  apiKey: process.env.X_AI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

// 使用 Grok 生成图像
async function generateGrokImage(promptData: Record<string, any>) {
  try {
    // 构建提示词
    const fields = Object.entries(promptData)
      .filter(([key, value]) => 
        value && 
        !['userId', 'cardType', 'size', 'generationMethod', 'previousCardId', 'modificationFeedback'].includes(key)
      )
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    
    const style = promptData.style || 'modern';
    const cardType = promptData.cardType || 'greeting';

    const prompt = `Generate a beautiful ${cardType} card with the following details: ${fields}. Style: ${style}. Make it look professional and artistic with appropriate text integration.`;

    console.log('Prompt:', prompt);
    // 调用 X.AI API
    const response = await openai.images.generate({
      model: "grok-2-image",
      prompt,
    });
    console.log('Response:', response);

    if (!response.data || !response.data[0]?.url) {
      console.log('Failed to generate image with Grok AI');
      throw new Error('Failed to generate image with Grok AI');
    }

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image with Grok:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const requestData = await request.json();
    const {
      cardType,
      recipientName,
      sender,
      senderName,
      message,
      modificationFeedback,
      previousCardId,
      generationMethod = 'standard',
      ...otherFields
    } = requestData;

    if (!cardType) {
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

    // 获取用户计划类型
    const planType = user?.plan || 'FREE';
    const dailyLimit = planType === 'FREE' ? 10 : Infinity;
    
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
              count: 1, 
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
    }

    // 组合所有字段到单个对象
    const cardData = {
      userId,
      cardType: cardType,
      recipientName,
      sender,
      senderName,
      message,
      ...(isModification && { 
        modificationFeedback, 
        previousCardId 
      }),
      ...otherFields
    };

    let r2Url = '';
    let cardId = '';
    let svgContent = '';

    // 根据生成方法生成卡片内容
    if (generationMethod === 'grok') {
      // 使用 Grok 生成图像
      r2Url = await generateGrokImage(cardData);
      
      // 保存生成记录到数据库
      const apiLog = await prisma.apiLog.create({
        data: {
          cardId: `grok_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          cardType,
          userInputs: cardData,
          promptVersion: 'grok-2-image',
          responseContent: '',  // Grok 不生成 SVG 内容
          tokensUsed: 0,        // 暂不计算 token
          duration: 0,          // 暂不计算时间
          r2Url: r2Url,
          userId,
        },
      });
      
      cardId = apiLog.cardId;
    } else {
      // 使用标准方法生成卡片
      const result = await generateCardContent(cardData);
      r2Url = result.r2Url;
      cardId = result.cardId;
      svgContent = result.svgContent;
    }

    // 增加使用计数 - 异步处理以避免阻塞响应
    if (usage) {
      Promise.resolve().then(async () => {
        try {
          await prisma.apiUsage.update({
            where: {
              userId_date: {
                userId,
                date: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
            data: {
              count: {
                increment: 1,
              },
            },
          });
        } catch (error) {
          console.error('Error updating usage count:', error);
        }
      });
    }

    return NextResponse.json({ r2Url, cardId, svgContent });
  } catch (error) {
    console.error('Error generating card:', error);
    return NextResponse.json({ 
      error: 'Failed to generate card',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}