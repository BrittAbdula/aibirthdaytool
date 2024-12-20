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

    const logs = await prisma.editedCard.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        originalCard: {
          select: {
            id: true,
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
          }
        }
      }
    });

    return NextResponse.json(logs.map(card => ({
      id: card.originalCard.id,
      cardId: card.originalCardId,
      cardType: card.cardType,
      userInputs: card.originalCard.userInputs,
      promptVersion: card.originalCard.promptVersion,
      responseContent: card.originalCard.responseContent,
      tokensUsed: card.originalCard.tokensUsed,
      duration: card.originalCard.duration,
      timestamp: card.originalCard.timestamp,
      isError: card.originalCard.isError,
      errorMessage: card.originalCard.errorMessage,
      r2Url: card.r2Url,
      createdAt: card.createdAt
    })));
  } catch (error) {
    console.error('Error fetching daily details:', error);
    return NextResponse.json({ error: 'Failed to fetch daily details' }, { status: 500 });
  }
}
