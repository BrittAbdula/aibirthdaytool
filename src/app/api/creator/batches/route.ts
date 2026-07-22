import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { creatorBatchInputSchema, FREE_CREATOR_RECIPIENT_LIMIT } from '@/lib/creator-pro';
import { recordMonetizationEvent } from '@/lib/monetization';

const batchInclude = {
  items: {
    orderBy: { createdAt: 'asc' as const },
    include: { card: { select: { r2Url: true, status: true, cardType: true } } },
  },
  brandPreset: {
    select: { organizationName: true, primaryColor: true, tone: true, logoUrl: true },
  },
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const batches = await prisma.creatorBatch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: batchInclude,
  });
  return NextResponse.json({ batches });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const input = creatorBatchInputSchema.parse(await request.json());
    const uniqueRecipientIds = Array.from(new Set(input.recipientIds));
    const [user, recipients, brandPreset, previewCount] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } }),
      prisma.creatorRecipient.findMany({
        where: { userId: session.user.id, id: { in: uniqueRecipientIds } },
        select: { id: true, name: true, occasionType: true, occasionDate: true },
      }),
      prisma.creatorBrandPreset.findUnique({ where: { userId: session.user.id }, select: { id: true } }),
      prisma.creatorBatch.count({ where: { userId: session.user.id, isPreview: true } }),
    ]);

    if (recipients.length !== uniqueRecipientIds.length) {
      return NextResponse.json({ error: 'One or more recipients could not be found.' }, { status: 404 });
    }

    const isPremium = user?.plan === 'PREMIUM';
    if (!isPremium && uniqueRecipientIds.length > FREE_CREATOR_RECIPIENT_LIMIT) {
      await recordMonetizationEvent({
        eventType: 'creator_paywall_view',
        userId: session.user.id,
        source: 'creator_batch_size',
        path: '/creator',
        metadata: { taskSize: uniqueRecipientIds.length },
      });
      return NextResponse.json(
        { error: 'Creator Pro is required to generate more than 3 recipients.', code: 'creator_pro_required' },
        { status: 403 }
      );
    }

    if (!isPremium && previewCount >= 1) {
      await recordMonetizationEvent({
        eventType: 'creator_paywall_view',
        userId: session.user.id,
        source: 'creator_preview_used',
        path: '/creator',
        metadata: { taskSize: uniqueRecipientIds.length },
      });
      return NextResponse.json(
        { error: 'Your free batch preview has been used. Subscribe to continue.', code: 'creator_pro_required' },
        { status: 403 }
      );
    }

    const recipientMap = new Map(recipients.map((recipient) => [recipient.id, recipient]));
    const orderedRecipients = uniqueRecipientIds.map((id) => recipientMap.get(id)!);
    const batch = await prisma.creatorBatch.create({
      data: {
        userId: session.user.id,
        brandPresetId: brandPreset?.id || null,
        title: input.title,
        status: 'pending',
        isPreview: !isPremium,
        items: {
          create: orderedRecipients.map((recipient, index) => ({
            recipientId: recipient.id,
            recipientName: recipient.name,
            occasionType: recipient.occasionType,
            occasionDate: recipient.occasionDate,
            status: !isPremium && index > 0 ? 'locked' : 'pending',
          })),
        },
      },
      include: batchInclude,
    });

    await recordMonetizationEvent({
      eventType: isPremium ? 'creator_batch_started' : 'creator_batch_preview_started',
      userId: session.user.id,
      source: 'creator_workspace',
      path: '/creator',
      metadata: { batchId: batch.id, taskSize: uniqueRecipientIds.length },
    });
    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid batch' }, { status: 400 });
  }
}
