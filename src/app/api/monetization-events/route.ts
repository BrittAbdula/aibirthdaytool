import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { normalizeMonetizationEventInput, recordMonetizationEvent } from '@/lib/monetization';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    normalizeMonetizationEventInput(body);

    const session = await auth();
    await recordMonetizationEvent({
      ...body,
      userId: session?.user?.id || null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid monetization event' },
      { status: 400 }
    );
  }
}
