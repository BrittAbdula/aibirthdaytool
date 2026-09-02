const COUNTRY_HEADER_NAMES = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'cloudfront-viewer-country',
] as const;

function normalizeCountryCode(value: string | null): string | null {
  if (!value) return null;

  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized) || normalized === 'XX') {
    return null;
  }

  return normalized;
}

/**
 * Best-effort viewer country from CDN headers, used to segment monetization
 * analytics. It no longer affects anyone's allowance: the free tier used to
 * hand out fewer cards outside a list of "high value" countries, which
 * penalised the markets that turned out to be most of our actual traffic.
 */
export function getCountryCodeFromHeaders(headers: Headers): string | null {
  for (const headerName of COUNTRY_HEADER_NAMES) {
    const countryCode = normalizeCountryCode(headers.get(headerName));
    if (countryCode) return countryCode;
  }

  return null;
}
