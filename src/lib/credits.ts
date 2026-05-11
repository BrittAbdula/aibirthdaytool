export const HIGH_VALUE_COUNTRY_CODES = [
  'US',
  'CA',
  'GB',
  'IE',
  'AU',
  'NZ',
  'DE',
  'FR',
  'NL',
  'BE',
  'LU',
  'CH',
  'AT',
  'DK',
  'SE',
  'NO',
  'FI',
  'IS',
  'JP',
  'KR',
  'SG',
  'HK',
  'TW',
] as const;

const COUNTRY_HEADER_NAMES = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'cloudfront-viewer-country',
] as const;

export interface DailyCreditAllowanceParams {
  planType: string;
  isFirstDay: boolean;
  countryCode: string | null;
}

function normalizeCountryCode(value: string | null): string | null {
  if (!value) return null;

  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized) || normalized === 'XX') {
    return null;
  }

  return normalized;
}

export function getCountryCodeFromHeaders(headers: Headers): string | null {
  for (const headerName of COUNTRY_HEADER_NAMES) {
    const countryCode = normalizeCountryCode(headers.get(headerName));
    if (countryCode) return countryCode;
  }

  return null;
}

export function isHighValueCountry(countryCode: string | null): boolean {
  const normalized = normalizeCountryCode(countryCode);
  return !!normalized && HIGH_VALUE_COUNTRY_CODES.includes(normalized as typeof HIGH_VALUE_COUNTRY_CODES[number]);
}

export function getDailyCreditAllowance({
  planType,
  isFirstDay,
  countryCode,
}: DailyCreditAllowanceParams): number {
  if (planType === 'PREMIUM') {
    return Infinity;
  }

  if (isFirstDay) {
    return isHighValueCountry(countryCode) ? 8 : 4;
  }

  return 5;
}
