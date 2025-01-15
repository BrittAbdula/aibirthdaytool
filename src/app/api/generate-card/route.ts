import { NextResponse } from 'next/server';
import { generateCardContent } from '@/lib/gpt';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30; // This function can run for a maximum of 30 seconds
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const userId = session?.user?.id || 'anonymous';
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
    const dailyLimit = planType === 'FREE' ? 4 : Infinity;
    
    // if (usage.count >= dailyLimit) {
    //   return NextResponse.json({ 
    //     error: "You've reached your daily limit. Please try again tomorrow or visit our Card Gallery." 
    //   }, { status: 429 });
    // }

    const {
      cardType,
      recipientName,
      relationship,
      senderName,
      message,
      ...otherFields
    } = await request.json();

    if (!cardType) {
      return NextResponse.json({ error: 'Missing required field: cardType' }, { status: 400 });
    }

    // Combine all fields into a single object
    const cardData = {
      userId,
      cardType,
      recipientName,
      relationship,
      senderName,
      message,
      ...otherFields
    };

    const { svgContent, cardId } = await generateCardContent(cardData);

    // Increment usage count
    // await prisma.apiUsage.update({
    //   where: {
    //     userId_date: {
    //       userId,
    //       date: today,
    //     },
    //   },
    //   data: {
    //     count: {
    //       increment: 1,
    //     },
    //   },
    // });

    return NextResponse.json({ svgContent, cardId });
  } catch (error) {
    console.error('Error generating card:', error);
    return NextResponse.json({ error: 'Failed to generate card' }, { status: 500 });
  }
}