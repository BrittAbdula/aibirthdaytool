import { getCheckoutQuantity, normalizeCheckoutReturnPath } from './pricing/checkout';
import { isSkuKey, type SkuKey } from './pricing/plans';

export const PENDING_CHECKOUT_STORAGE_KEY = 'mewtrucard.pendingCheckout';

export interface PendingCheckout {
  sku: SkuKey;
  source: string;
  returnUrl: string;
  taskSize?: number;
  quantity?: number;
  createdAt: number;
}

interface BuildPendingCheckoutInput {
  sku: SkuKey;
  source: string;
  returnUrl: string;
  taskSize?: number;
  quantity?: number;
}

function normalizeSource(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : 'unknown';
}

function normalizeTaskSize(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(1, Math.min(50, Math.floor(value)))
    : undefined;
}

export function buildPendingCheckout({
  sku,
  source,
  returnUrl,
  taskSize,
  quantity,
}: BuildPendingCheckoutInput): PendingCheckout {
  return {
    sku,
    source: normalizeSource(source),
    returnUrl: normalizeCheckoutReturnPath(returnUrl),
    taskSize: normalizeTaskSize(taskSize),
    quantity,
    createdAt: Date.now(),
  };
}

export function parsePendingCheckout(raw: string | null | undefined): PendingCheckout | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PendingCheckout>;
    if (!isSkuKey(parsed.sku)) return null;
    if (typeof parsed.createdAt !== 'number' || !Number.isFinite(parsed.createdAt)) return null;

    const quantity = getCheckoutQuantity(parsed.sku, parsed.quantity);
    if (quantity === null) return null;

    const returnUrl = normalizeCheckoutReturnPath(parsed.returnUrl);
    if (returnUrl !== parsed.returnUrl) return null;

    return {
      sku: parsed.sku,
      source: normalizeSource(parsed.source),
      returnUrl,
      taskSize: normalizeTaskSize(parsed.taskSize),
      quantity: parsed.quantity === undefined ? undefined : quantity,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}
