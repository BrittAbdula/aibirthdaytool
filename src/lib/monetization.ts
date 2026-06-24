import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { normalizeCheckoutReturnPath, type PremiumPlanKey } from './pricing';

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
  plan: PremiumPlanKey | null;
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

function normalizePlan(value: unknown): PremiumPlanKey | null {
  if (value === null || value === undefined || value === '') return null;
  if (value === 'monthly' || value === 'yearly') return value;
  throw new Error('Invalid monetization plan');
}

function normalizePath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = normalizeCheckoutReturnPath(value);
  return normalized === value ? normalized : null;
}

function normalizeMetadata(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
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
