import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { auth } from '@/auth';

const LEGACY_ADMIN_USER_IDS = ['cm56ic66y000110jijyw2ir8r'];

function parseAllowList(value?: string | null) {
  return (value ?? '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminSession(session: Session | null) {
  const userId = session?.user?.id?.trim();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!userId) {
    return false;
  }

  const configuredIds = new Set([
    ...LEGACY_ADMIN_USER_IDS,
    ...parseAllowList(process.env.ADMIN_USER_IDS),
  ]);
  const configuredEmails = new Set(parseAllowList(process.env.ADMIN_EMAILS));

  if (configuredIds.has(userId)) {
    return true;
  }

  if (email && configuredEmails.has(email)) {
    return true;
  }

  // Local development often runs against different auth seeds.
  if (
    process.env.NODE_ENV !== 'production' &&
    configuredIds.size === LEGACY_ADMIN_USER_IDS.length &&
    configuredEmails.size === 0
  ) {
    return true;
  }

  return false;
}

export async function requireAdminRequest() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Sign in required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    };
  }

  if (!isAdminSession(session)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
    session,
  };
}
