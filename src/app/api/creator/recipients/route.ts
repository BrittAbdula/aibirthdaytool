import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  FREE_CREATOR_RECIPIENT_LIMIT,
  creatorRecipientInputSchema,
  getDaysUntil,
  getNextOccurrence,
  toCreatorDate,
} from '@/lib/creator-pro';
import { recordMonetizationEvent } from '@/lib/monetization';

function serializeRecipient(recipient: {
  id: string;
  name: string;
  occasionType: string;
  occasionDate: Date;
  notes: string | null;
}) {
  return {
    ...recipient,
    occasionDate: recipient.occasionDate.toISOString().slice(0, 10),
    nextOccasionDate: getNextOccurrence(recipient.occasionDate).toISOString().slice(0, 10),
    daysUntil: getDaysUntil(recipient.occasionDate),
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [user, recipients] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } }),
    prisma.creatorRecipient.findMany({
      where: { userId: session.user.id },
      orderBy: [{ occasionDate: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, occasionType: true, occasionDate: true, notes: true },
    }),
  ]);

  return NextResponse.json({
    plan: user?.plan || 'FREE',
    recipientLimit: user?.plan === 'PREMIUM' ? null : FREE_CREATOR_RECIPIENT_LIMIT,
    recipients: recipients.map(serializeRecipient).sort((a, b) => a.daysUntil - b.daysUntil),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const input = creatorRecipientInputSchema.parse(await request.json());
    const [user, recipientCount] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } }),
      prisma.creatorRecipient.count({ where: { userId: session.user.id } }),
    ]);

    if (user?.plan !== 'PREMIUM' && recipientCount >= FREE_CREATOR_RECIPIENT_LIMIT) {
      await recordMonetizationEvent({
        eventType: 'creator_paywall_view',
        userId: session.user.id,
        source: 'creator_recipient_limit',
        path: '/creator',
        metadata: { recipientCount },
      });
      return NextResponse.json(
        { error: 'Creator Pro is required to save more than 3 recipients.', code: 'creator_pro_required' },
        { status: 403 }
      );
    }

    const recipient = await prisma.creatorRecipient.create({
      data: {
        userId: session.user.id,
        name: input.name,
        occasionType: input.occasionType,
        occasionDate: toCreatorDate(input.occasionDate),
        notes: input.notes || null,
      },
      select: { id: true, name: true, occasionType: true, occasionDate: true, notes: true },
    });

    if (recipientCount === 0) {
      await recordMonetizationEvent({
        eventType: 'creator_roster_created',
        userId: session.user.id,
        source: 'creator_workspace',
        path: '/creator',
      });
    }

    return NextResponse.json({ recipient: serializeRecipient(recipient) }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'That recipient and occasion already exists.' }, { status: 409 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid recipient' },
      { status: 400 }
    );
  }
}
