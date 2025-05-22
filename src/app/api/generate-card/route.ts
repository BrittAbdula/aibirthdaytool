import { NextResponse } from 'next/server';
import { generateCardContent } from '@/lib/gpt';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateCardImageWith4o } from '@/lib/image';
import { nanoid } from 'nanoid';
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
      cardType,
      recipientName,
      sender,
      senderName,
      message,
      modificationFeedback,
      previousCardId,
      format = 'svg', // Default to svg if not specified
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
    const creditsUsed = format === 'image' ? 6 : 1;

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
    }else{
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
        cardType,
        userInputs: requestData,
        promptVersion: format === 'image' ? 'gpt4o-image' : 'svg',
        responseContent: '',
        tokensUsed: 0,
        duration: 0,
        status: 'pending',
        modificationFeedback,
      },
    });

    // Start async processing
    const cardData = {
      userId,
      cardType,
      recipientName,
      sender,
      senderName,
      message,
      format,
      ...(isModification && {
        modificationFeedback,
        previousCardId
      }),
      ...otherFields
    };

    // Start async processing without awaiting
    Promise.resolve().then(async () => {
      try {
        // Update status to processing
        await prisma.apiLog.update({
          where: { cardId },
          data: { status: 'processing' },
        });

        // Generate card
        const result = format === 'image'
          ? await generateCardImageWith4o(cardData, planType)
          : await generateCardContent(cardData, planType);

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
            promptVersion: format === 'image' ? 'gpt4o-image' : 'svg', // Fallback
            tokensUsed: 0,
            duration: Date.now() - startTime, // Need to capture startTime in the outer scope or recalculate
          },
        });
      }
    });

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