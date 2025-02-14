import { prisma } from './prisma';
import { PlanType } from '@prisma/client';

export interface PlanFeatureCheck {
  allowed: boolean;
  limit?: number;
  current?: number;
  remaining?: number;
  message?: string;
}

export async function checkPlanFeature(
  userId: string,
  featureKey: string
): Promise<PlanFeatureCheck> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true }
  });

  if (!user) {
    return {
      allowed: false,
      message: 'User not found'
    };
  }

  const planLimit = await prisma.planLimit.findFirst({
    where: {
      planType: user.plan,
      feature: {
        featureKey
      }
    },
    include: {
      feature: true
    }
  });

  if (!planLimit) {
    return {
      allowed: false,
      message: 'Feature not available in your plan'
    };
  }

  // For features that don't need usage tracking
  if (planLimit.limitType === 'boolean') {
    return {
      allowed: planLimit.limitValue > 0,
      message: planLimit.feature.description
    };
  }

  // For daily limits
  if (planLimit.limitType === 'daily') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await prisma.apiUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });

    const current = usage?.count || 0;
    const remaining = Math.max(0, planLimit.limitValue - current);

    return {
      allowed: remaining > 0,
      limit: planLimit.limitValue,
      current,
      remaining,
      message: remaining > 0 
        ? `You have ${remaining} generations remaining today`
        : 'You have reached your daily limit'
    };
  }

  // For monthly limits
  if (planLimit.limitType === 'monthly') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyUsage = await prisma.apiUsage.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth
        }
      },
      _sum: {
        count: true
      }
    });

    const current = monthlyUsage._sum.count || 0;
    const remaining = Math.max(0, planLimit.limitValue - current);

    return {
      allowed: remaining > 0,
      limit: planLimit.limitValue,
      current,
      remaining,
      message: remaining > 0
        ? `You have ${remaining} generations remaining this month`
        : 'You have reached your monthly limit'
    };
  }

  return {
    allowed: true,
    message: 'Feature available'
  };
}

export async function getPlanFeatures(planType: PlanType) {
  const planLimits = await prisma.planLimit.findMany({
    where: {
      planType
    },
    include: {
      feature: true
    }
  });

  return planLimits.map(limit => ({
    name: limit.feature.name,
    description: limit.feature.description,
    limit: limit.limitValue,
    limitType: limit.limitType
  }));
}

export const PLAN_PRICES = {
  [PlanType.FREE]: { monthly: 0, yearly: 0 },
  [PlanType.BASIC]: { monthly: 6.99, yearly: 69.99 },
  [PlanType.PREMIUM]: { monthly: 16.99, yearly: 169.99 }
} as const; 