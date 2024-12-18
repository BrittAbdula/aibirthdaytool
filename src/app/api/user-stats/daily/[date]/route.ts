import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    const date = params.date;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const logs = await prisma.apiLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        id: true,
        cardId: true,
        cardType: true,
        userInputs: true,
        promptVersion: true,
        responseContent: true,
        tokensUsed: true,
        duration: true,
        timestamp: true,
        isError: true,
        errorMessage: true,
        r2Url: true,
        _count: {
          select: {
            editedCards: true
          }
        }
      },
    });

    // 转换数据格式
    const formattedLogs = logs.map(log => ({
      ...log,
      usageCount: log._count.editedCards,
      _count: undefined
    }));

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error('Error fetching daily details:', error);
    return NextResponse.json({ error: 'Failed to fetch daily details' }, { status: 500 });
  }
}
