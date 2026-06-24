import type { PlanType } from '@prisma/client';

const ENTITLED_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);

export function isSubscriptionStatusEntitled(status: string | null | undefined): boolean {
  return !!status && ENTITLED_SUBSCRIPTION_STATUSES.has(status);
}

export function getUserPlanForSubscriptionStatus(status: string | null | undefined): PlanType {
  return isSubscriptionStatusEntitled(status) ? 'PREMIUM' : 'FREE';
}
