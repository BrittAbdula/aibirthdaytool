import { isPackSkuKey, type SkuKey } from './plans';

export const MAX_PACK_QUANTITY = 99;

/** Missing quantities preserve the single-item checkout contract. */
export function getCheckoutQuantity(sku: SkuKey, value: unknown): number | null {
  if (!isPackSkuKey(sku)) return 1;
  if (value === undefined) return 1;
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_PACK_QUANTITY
    ? value
    : null;
}

export function normalizeCheckoutReturnPath(returnPath: string | null | undefined): string {
  if (!returnPath || !returnPath.startsWith('/') || returnPath.startsWith('//')) {
    return '/';
  }

  try {
    const url = new URL(returnPath, 'https://mewtrucard.local');
    return url.pathname || '/';
  } catch {
    return '/';
  }
}

export function buildCheckoutRedirectUrls(origin: string, returnPath: string | null | undefined) {
  const normalizedOrigin = (origin || 'http://localhost:3000').replace(/\/+$/, '');
  const normalizedReturnPath = normalizeCheckoutReturnPath(returnPath);

  return {
    successUrl: `${normalizedOrigin}${normalizedReturnPath}?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${normalizedOrigin}${normalizedReturnPath}?status=cancelled`,
  };
}
