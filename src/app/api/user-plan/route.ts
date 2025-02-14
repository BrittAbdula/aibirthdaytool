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

    // Get user's subscription and plan details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        apiUsages: {
          where: {
            date: today
          }
        },
        bonusCredits: {
          where: {
            isUsed: false,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get plan features and limits
    const planLimits = await prisma.planLimit.findMany({
      where: {
        planType: user.plan
      },
      include: {
        feature: true
      }
    });

    // Calculate remaining credits
    const bonusCredits = user.bonusCredits.reduce((sum, credit) => sum + credit.amount, 0);
    const dailyUsage = user.apiUsages[0]?.count || 0;

    // Get base daily limit from plan limits
    const dailyGenerationLimit = planLimits.find(
      limit => limit.feature.featureKey === 'daily_generations'
    )?.limitValue || 3; // Default to 3 for FREE plan

    const response = {
      plan: {
        type: user.plan,
        subscription: user.subscription ? {
          status: user.subscription.status,
          billingPeriod: user.subscription.billingPeriod,
          startDate: user.subscription.startDate,
          endDate: user.subscription.endDate,
          cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
          nextBillingAt: user.subscription.nextBillingAt
        } : null
      },
      usage: {
        dailyLimit: dailyGenerationLimit,
        dailyUsage,
        remainingToday: Math.max(0, dailyGenerationLimit - dailyUsage),
        bonusCredits
      },
      features: planLimits.map(limit => ({
        name: limit.feature.name,
        description: limit.feature.description,
        limit: limit.limitValue,
        limitType: limit.limitType
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 