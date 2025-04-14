import { NextResponse } from 'next/server';
import { generateCardContent } from '@/lib/gpt';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30; // This function can run for a maximum of 30 seconds
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    // const userId = 'cm56ic66y000110jijyw2ir8r';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create today's usage record
    let usage = await prisma.apiUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (!usage) {
      usage = await prisma.apiUsage.create({
        data: {
          userId,
          date: today,
          count: 0,
        },
      });
    }

    // Get user's plan type
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    // Check usage limits
    const planType = user?.plan || 'FREE';
    const dailyLimit = planType === 'FREE' ? 10 : Infinity;
    
    if (usage.count >= dailyLimit) {
      return NextResponse.json({ 
        error: "You've reached your daily limit. Please try again tomorrow or visit our Card Gallery." 
      }, { status: 429 });
    }

    const requestData = await request.json();
    const {
      cardType,
      recipientName,
      sender,
      senderName,
      message,
      modificationFeedback,
      previousCardId,
      ...otherFields
    } = requestData;

    if (!cardType) {
      return NextResponse.json({ error: 'Missing required field: cardType' }, { status: 400 });
    }

    // Check if this is a modification request
    const isModification = modificationFeedback && previousCardId;

    // Combine all fields into a single object
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

    const { r2Url, cardId, svgContent } = await generateCardContent(cardData);

    // Increment usage count for new generations but not for modifications
    // to encourage users to refine their cards
    if (!isModification) {
      await prisma.apiUsage.update({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        data: {
          count: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({ r2Url, cardId, svgContent });
  } catch (error) {
    console.error('Error generating card:', error);
    return NextResponse.json({ error: 'Failed to generate card' }, { status: 500 });
  }
}