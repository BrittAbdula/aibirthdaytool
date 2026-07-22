import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { creatorBrandPresetInputSchema } from '@/lib/creator-pro';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const preset = await prisma.creatorBrandPreset.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      organizationName: true,
      primaryColor: true,
      tone: true,
      logoUrl: true,
    },
  });
  return NextResponse.json({ preset });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const input = creatorBrandPresetInputSchema.parse(await request.json());
    const preset = await prisma.creatorBrandPreset.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        organizationName: input.organizationName,
        primaryColor: input.primaryColor.toUpperCase(),
        tone: input.tone,
        logoUrl: input.logoUrl || null,
      },
      update: {
        organizationName: input.organizationName,
        primaryColor: input.primaryColor.toUpperCase(),
        tone: input.tone,
        logoUrl: input.logoUrl || null,
      },
      select: {
        id: true,
        organizationName: true,
        primaryColor: true,
        tone: true,
        logoUrl: true,
      },
    });
    return NextResponse.json({ preset });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid brand preset' }, { status: 400 });
  }
}
