import { NextResponse } from 'next/server';
import { generateCardContent } from '@/lib/gpt';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateCardImage } from '@/lib/image';
import { uploadToCloudflareImages } from '@/lib/r2';
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
      format,
      ...(isModification && { 
        modificationFeedback, 
        previousCardId 
      }),
      ...otherFields
    };

    // Generate card based on format
    let result;
    if (format === 'image') {
      // Use image generator
      result = await generateCardImage(cardData);
      const cf_url = await uploadToCloudflareImages(result.r2Url);
      result = {
        cardId: result.cardId,
        r2Url: cf_url,
        svgContent: result.svgContent
      }
    } else {
      // Use SVG generator (default)
      result = await generateCardContent(cardData);
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating card:', error);
    return NextResponse.json({ 
      error: 'Failed to generate card',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}