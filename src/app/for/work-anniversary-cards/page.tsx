import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { CreatorLandingPage } from '@/components/creator/CreatorLandingPage';
import { creatorLandingPages } from '@/lib/creator-landing';
import { buildWebPageSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Work Anniversary Card Generator for Teams | MewTruCard',
  description: 'Track employee milestones and create branded, personalized work anniversary cards in a reusable monthly workflow.',
  alternates: { canonical: '/for/work-anniversary-cards' },
  openGraph: {
    title: 'Work Anniversary Cards for Teams | MewTruCard',
    description: 'Plan and personalize recurring employee milestone cards.',
    url: 'https://mewtrucard.com/for/work-anniversary-cards',
    images: [{ url: 'https://mewtrucard.com/og-cover.jpg', width: 1200, height: 630, alt: 'MewTruCard work anniversary cards' }],
  },
};

export default function WorkAnniversaryCardsPage() {
  return (
    <>
      <JsonLd data={buildWebPageSchema({
        name: 'Work Anniversary Card Generator for Teams',
        description: metadata.description as string,
        path: '/for/work-anniversary-cards',
        about: ['work anniversary cards', 'employee milestones', 'HR card workflow'],
      })} />
      <CreatorLandingPage content={creatorLandingPages.workAnniversary} />
    </>
  );
}
