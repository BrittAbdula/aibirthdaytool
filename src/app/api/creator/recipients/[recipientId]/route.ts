import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { creatorRecipientInputSchema, toCreatorDate } from '@/lib/creator-pro';

interface RouteContext {
  params: Promise<{ recipientId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { recipientId } = await context.params;
    const input = creatorRecipientInputSchema.parse(await request.json());
    const result = await prisma.creatorRecipient.updateMany({
      where: { id: recipientId, userId: session.user.id },
      data: {
        name: input.name,
        occasionType: input.occasionType,
        occasionDate: toCreatorDate(input.occasionDate),
        notes: input.notes || null,
      },
    });
    if (result.count === 0) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid recipient' }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { recipientId } = await context.params;
  const result = await prisma.creatorRecipient.deleteMany({
    where: { id: recipientId, userId: session.user.id },
  });
  if (result.count === 0) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
