import { normalizeCheckoutReturnPath, type PremiumPlanKey } from './pricing';

export const PENDING_CHECKOUT_STORAGE_KEY = 'mewtrucard.pendingCheckout';

export interface PendingCheckout {
  plan: PremiumPlanKey;
  source: string;
  returnUrl: string;
  taskSize?: number;
  createdAt: number;
}

interface BuildPendingCheckoutInput {
  plan: PremiumPlanKey;
  source: string;
  returnUrl: string;
  taskSize?: number;
}

function isPremiumPlanKey(value: unknown): value is PremiumPlanKey {
  return value === 'monthly' || value === 'yearly';
}

function normalizeSource(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : 'unknown';
}

export function buildPendingCheckout({
  plan,
  source,
  returnUrl,
  taskSize,
}: BuildPendingCheckoutInput): PendingCheckout {
  return {
    plan,
    source: normalizeSource(source),
    returnUrl: normalizeCheckoutReturnPath(returnUrl),
    taskSize: typeof taskSize === 'number' && Number.isFinite(taskSize) ? Math.max(1, Math.min(50, Math.floor(taskSize))) : undefined,
    createdAt: Date.now(),
  };
}

export function parsePendingCheckout(raw: string | null | undefined): PendingCheckout | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PendingCheckout>;
    if (!isPremiumPlanKey(parsed.plan)) return null;
    if (typeof parsed.createdAt !== 'number' || !Number.isFinite(parsed.createdAt)) return null;

    const returnUrl = normalizeCheckoutReturnPath(parsed.returnUrl);
    if (returnUrl !== parsed.returnUrl) return null;

    return {
      plan: parsed.plan,
      source: normalizeSource(parsed.source),
      returnUrl,
      taskSize: typeof parsed.taskSize === 'number' && Number.isFinite(parsed.taskSize)
        ? Math.max(1, Math.min(50, Math.floor(parsed.taskSize)))
        : undefined,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}
