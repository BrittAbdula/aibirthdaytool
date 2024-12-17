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

    const details = await prisma.apiLog.findMany({
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
      },
    });

    return NextResponse.json(details);
  } catch (error) {
    console.error('Error fetching daily details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily details' },
      { status: 500 }
    );
  }
}
