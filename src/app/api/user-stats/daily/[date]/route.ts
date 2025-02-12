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

    // Query API logs directly instead of edited cards
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
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    // Transform the data to include user information
    return NextResponse.json(logs.map(log => ({
      id: log.id,
      cardId: log.cardId,
      cardType: log.cardType,
      userInputs: log.userInputs,
      promptVersion: log.promptVersion,
      tokensUsed: log.tokensUsed,
      duration: log.duration,
      timestamp: log.timestamp,
      isError: log.isError,
      errorMessage: log.errorMessage,
      r2Url: log.r2Url,
      user: log.user ? {
        name: log.user.name,
        email: log.user.email,
      } : null,
      // Calculate response size
      responseSizeKB: Math.round((log.responseContent?.length || 0) / 1024),
    })));
  } catch (error) {
    console.error('Error fetching daily API details:', error);
    return NextResponse.json({ error: 'Failed to fetch daily API details' }, { status: 500 });
  }
}
