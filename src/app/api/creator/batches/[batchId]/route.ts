import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { creatorBatchItemUpdateSchema } from '@/lib/creator-pro';
import { recordMonetizationEvent } from '@/lib/monetization';

interface RouteContext {
  params: Promise<{ batchId: string }>;
}

const batchInclude = {
  items: {
    orderBy: { createdAt: 'asc' as const },
    include: { card: { select: { r2Url: true, status: true, cardType: true } } },
  },
  brandPreset: {
    select: { organizationName: true, primaryColor: true, tone: true, logoUrl: true },
  },
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { batchId } = await context.params;
  const batch = await prisma.creatorBatch.findFirst({
    where: { id: batchId, userId: session.user.id },
    include: batchInclude,
  });
  if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
  return NextResponse.json({ batch });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { batchId } = await context.params;
    const input = creatorBatchItemUpdateSchema.parse(await request.json());
    const batch = await prisma.creatorBatch.findFirst({
      where: { id: batchId, userId: session.user.id },
      select: { id: true, status: true, isPreview: true, items: { select: { id: true, status: true } } },
    });
    if (!batch || !batch.items.some((item) => item.id === input.itemId)) {
      return NextResponse.json({ error: 'Batch item not found' }, { status: 404 });
    }

    if (input.status === 'completed') {
      if (!input.cardId) return NextResponse.json({ error: 'Completed items require a cardId.' }, { status: 400 });
      const ownedCard = await prisma.apiLog.findFirst({
        where: { cardId: input.cardId, userId: session.user.id },
        select: { cardId: true },
      });
      if (!ownedCard) return NextResponse.json({ error: 'Generated card not found.' }, { status: 404 });
    }

    await prisma.creatorBatchItem.update({
      where: { id: input.itemId },
      data: {
        status: input.status,
        cardId: input.cardId || (input.status === 'pending' ? null : undefined),
        errorMessage: input.status === 'failed' ? input.errorMessage || 'Generation failed' : null,
      },
    });

    const items = await prisma.creatorBatchItem.findMany({
      where: { batchId },
      select: { status: true },
    });
    const activeItems = items.filter((item) => item.status !== 'locked');
    const completedCount = activeItems.filter((item) => item.status === 'completed').length;
    const failedCount = activeItems.filter((item) => item.status === 'failed').length;
    const hasInProgress = activeItems.some((item) => ['pending', 'generating'].includes(item.status));
    let nextStatus = hasInProgress ? 'generating' : 'pending';
    if (!hasInProgress && failedCount === 0 && completedCount === activeItems.length) {
      nextStatus = batch.isPreview ? 'preview_ready' : 'completed';
    } else if (!hasInProgress && failedCount > 0) {
      nextStatus = completedCount > 0 ? 'partial_failure' : 'failed';
    }

    const updatedBatch = await prisma.creatorBatch.update({
      where: { id: batchId },
      data: { status: nextStatus },
      include: batchInclude,
    });

    if (batch.status !== nextStatus && ['preview_ready', 'completed'].includes(nextStatus)) {
      await recordMonetizationEvent({
        eventType: batch.isPreview ? 'creator_batch_preview_completed' : 'creator_batch_completed',
        userId: session.user.id,
        source: 'creator_workspace',
        path: '/creator',
        metadata: { batchId, taskSize: items.length, completedCount },
      });
    }

    return NextResponse.json({ batch: updatedBatch });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid batch item update' }, { status: 400 });
  }
}
