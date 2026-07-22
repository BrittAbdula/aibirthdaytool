import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getDaysUntil, getNextOccurrence } from '@/lib/creator-pro';
import { CreatorWorkspace } from '@/components/creator/CreatorWorkspace';
import { CreatorSignInButton } from '@/components/creator/CreatorSignInButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Creator Workspace | MewTruCard',
  description: 'Manage recurring employee birthdays and work anniversaries, then create personalized cards in batches.',
  alternates: { canonical: '/creator' },
  robots: { index: false, follow: false },
};

export default async function CreatorPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="min-h-[calc(100svh-4rem)] bg-[#FFF8F6] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl border-y border-[#E8CDD6] py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Creator workspace</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-[#202A3D] sm:text-6xl">
            Your team occasions, ready before they become urgent.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#596174]">
            Sign in to build a recipient roster, see the next 30 days, save your brand style, and generate a free batch preview.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CreatorSignInButton />
            <Link href="/for/employee-birthday-cards/" className="text-sm font-semibold text-primary hover:underline">
              See how it works
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [user, recipients, preset, batches] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } }),
    prisma.creatorRecipient.findMany({
      where: { userId: session.user.id },
      orderBy: [{ occasionDate: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, occasionType: true, occasionDate: true, notes: true },
    }),
    prisma.creatorBrandPreset.findUnique({
      where: { userId: session.user.id },
      select: { id: true, organizationName: true, primaryColor: true, tone: true, logoUrl: true },
    }),
    prisma.creatorBatch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        brandPreset: { select: { organizationName: true, primaryColor: true, tone: true, logoUrl: true } },
        items: {
          orderBy: { createdAt: 'asc' },
          include: { card: { select: { r2Url: true, status: true, cardType: true } } },
        },
      },
    }),
  ]);

  const serializedRecipients = recipients
    .map((recipient) => ({
      ...recipient,
      occasionDate: recipient.occasionDate.toISOString().slice(0, 10),
      nextOccasionDate: getNextOccurrence(recipient.occasionDate).toISOString().slice(0, 10),
      daysUntil: getDaysUntil(recipient.occasionDate),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const serializedBatches = batches.map((batch) => ({
    ...batch,
    createdAt: batch.createdAt.toISOString(),
    updatedAt: batch.updatedAt.toISOString(),
    items: batch.items.map((item) => ({
      ...item,
      occasionDate: item.occasionDate.toISOString().slice(0, 10),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  }));

  return (
    <CreatorWorkspace
      initialPlan={user?.plan || 'FREE'}
      initialRecipients={serializedRecipients}
      initialPreset={preset}
      initialBatches={serializedBatches}
      userName={session.user.name || 'Creator'}
    />
  );
}
