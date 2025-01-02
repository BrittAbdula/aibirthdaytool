import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's usage
    const usage = await prisma.apiUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    // Get user's plan type
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    // Default to FREE plan if not found
    const planType = user?.plan || 'FREE';
    const dailyLimit = planType === 'FREE' ? 4 : Infinity;
    const currentUsage = usage?.count || 0;
    const remainingUsage = dailyLimit - currentUsage;

    return NextResponse.json({ 
      remainingUsage,
      dailyLimit,
      currentUsage,
      planType
    });
  } catch (error) {
    console.error('Error checking usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
