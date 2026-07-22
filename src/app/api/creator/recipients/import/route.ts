import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  FREE_CREATOR_RECIPIENT_LIMIT,
  parseCreatorRecipientCsv,
  toCreatorDate,
} from '@/lib/creator-pro';
import { recordMonetizationEvent } from '@/lib/monetization';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (typeof body.csv !== 'string' || body.csv.length > 250_000) {
    return NextResponse.json({ error: 'Provide a CSV smaller than 250 KB.' }, { status: 400 });
  }

  const parsed = parseCreatorRecipientCsv(body.csv);
  if (parsed.records.length === 0) {
    return NextResponse.json({ error: 'No valid recipients found.', errors: parsed.errors }, { status: 400 });
  }

  const [user, existingCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } }),
    prisma.creatorRecipient.count({ where: { userId: session.user.id } }),
  ]);
  const availableSlots = user?.plan === 'PREMIUM'
    ? parsed.records.length
    : Math.max(0, FREE_CREATOR_RECIPIENT_LIMIT - existingCount);

  if (availableSlots === 0) {
    await recordMonetizationEvent({
      eventType: 'creator_paywall_view',
      userId: session.user.id,
      source: 'creator_csv_limit',
      path: '/creator',
      metadata: { requestedRows: parsed.records.length, existingCount },
    });
    return NextResponse.json(
      { error: 'Creator Pro is required to import more recipients.', code: 'creator_pro_required' },
      { status: 403 }
    );
  }

  const records = parsed.records.slice(0, availableSlots);
  const result = await prisma.creatorRecipient.createMany({
    data: records.map((record) => ({
      userId: session.user.id,
      name: record.name,
      occasionType: record.occasionType,
      occasionDate: toCreatorDate(record.occasionDate),
      notes: record.notes || null,
    })),
    skipDuplicates: true,
  });

  if (existingCount === 0 && result.count > 0) {
    await recordMonetizationEvent({
      eventType: 'creator_roster_created',
      userId: session.user.id,
      source: 'creator_csv_import',
      path: '/creator',
      metadata: { imported: result.count },
    });
  }

  return NextResponse.json({
    imported: result.count,
    skipped: parsed.records.length - result.count,
    limited: records.length < parsed.records.length,
    errors: parsed.errors,
  });
}
