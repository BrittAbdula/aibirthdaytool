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
