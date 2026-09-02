import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { normalizeCheckoutReturnPath } from './pricing/checkout';
import { isSkuKey, type SkuKey } from './pricing/plans';

export const MONETIZATION_EVENT_TYPES = [
  'premium_modal_view',
  'pricing_page_view',
  'pricing_cta_click',
  'checkout_session_create_attempt',
  'checkout_session_created',
  'checkout_session_create_failed',
  'checkout_cancelled',
  'checkout_success_return',
  'subscription_activated',
  'creator_landing_view',
  'creator_workspace_view',
  'creator_roster_created',
  'creator_batch_preview_started',
  'creator_batch_preview_completed',
  'creator_batch_started',
  'creator_batch_completed',
  'creator_paywall_view',
  'creator_week_2_active',
  'creator_day_30_retained',
  'offer_view',
  'offer_click',
  'pack_purchase_completed',
  'quota_exhausted',
  'ad_reward_offered',
  'ad_reward_earned',
] as const;

export type MonetizationEventType = typeof MONETIZATION_EVENT_TYPES[number];

export interface MonetizationEventInput {
  eventType: string;
  plan?: string | null;
  source?: string | null;
  path?: string | null;
  stripeSessionId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  metadata?: unknown;
}

export interface NormalizedMonetizationEventInput {
  eventType: MonetizationEventType;
  plan: SkuKey | LegacyPlanKey | null;
  source: string | null;
  path: string | null;
  stripeSessionId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
}

function isMonetizationEventType(value: string): value is MonetizationEventType {
  return MONETIZATION_EVENT_TYPES.includes(value as MonetizationEventType);
}

function normalizeOptionalString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

/** Values written before the Plus / Creator Pro split; still present in old rows. */
type LegacyPlanKey = 'monthly' | 'yearly';

function normalizePlan(value: unknown): SkuKey | LegacyPlanKey | null {
  if (value === null || value === undefined || value === '') return null;
  if (value === 'monthly' || value === 'yearly') return value;
  if (isSkuKey(value)) return value;
  throw new Error('Invalid monetization plan');
}

function normalizePath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return normalizeCheckoutReturnPath(value);
}

function normalizeMetadata(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const blockedKeys = new Set(['name', 'recipientName', 'message', 'notes', 'returnUrl', 'content', 'userInputs']);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !blockedKeys.has(key))
      .slice(0, 20)
      .map(([key, entry]) => {
        if (typeof entry === 'string') return [key, entry.slice(0, 200)];
        if (typeof entry === 'number' || typeof entry === 'boolean' || entry === null) return [key, entry];
        return [key, undefined];
      })
      .filter(([, entry]) => entry !== undefined)
  );
}

export function normalizeMonetizationEventInput(
  input: MonetizationEventInput
): NormalizedMonetizationEventInput {
  if (!isMonetizationEventType(input.eventType)) {
    throw new Error('Invalid monetization event type');
  }

  return {
    eventType: input.eventType,
    plan: normalizePlan(input.plan),
    source: normalizeOptionalString(input.source, 120),
    path: normalizePath(input.path),
    stripeSessionId: normalizeOptionalString(input.stripeSessionId, 180),
    errorCode: normalizeOptionalString(input.errorCode, 80),
    errorMessage: normalizeOptionalString(input.errorMessage, 500),
    metadata: normalizeMetadata(input.metadata),
  };
}

export async function recordMonetizationEvent(
  input: MonetizationEventInput & { userId?: string | null }
) {
  try {
    const normalized = normalizeMonetizationEventInput(input);
    return await prisma.monetizationEvent.create({
      data: {
        eventType: normalized.eventType,
        userId: input.userId || null,
        plan: normalized.plan,
        source: normalized.source,
        path: normalized.path,
        stripeSessionId: normalized.stripeSessionId,
        errorCode: normalized.errorCode,
        errorMessage: normalized.errorMessage,
        metadata: normalized.metadata as Prisma.InputJsonObject | undefined,
      },
    });
  } catch (error) {
    console.error('Failed to record monetization event:', error);
    return null;
  }
}

export async function recordCreatorRetentionMilestones(userId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, startDate: true },
    });
    if (subscription?.plan !== 'PREMIUM') return;

    const activeDays = Math.floor((Date.now() - subscription.startDate.getTime()) / 86_400_000);
    const milestones = [
      { days: 14, eventType: 'creator_week_2_active' as const },
      { days: 30, eventType: 'creator_day_30_retained' as const },
    ];

    for (const milestone of milestones) {
      if (activeDays < milestone.days) continue;
      const existing = await prisma.monetizationEvent.findFirst({
        where: { userId, eventType: milestone.eventType },
        select: { id: true },
      });
      if (existing) continue;
      await prisma.monetizationEvent.create({
        data: {
          userId,
          eventType: milestone.eventType,
          source: 'creator_workspace',
          path: '/creator',
          metadata: { activeDays },
        },
      });
    }
  } catch (error) {
    console.error('Failed to record Creator Pro retention milestone:', error);
  }
}
