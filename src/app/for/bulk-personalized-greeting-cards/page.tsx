import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { CreatorLandingPage } from '@/components/creator/CreatorLandingPage';
import { creatorLandingPages } from '@/lib/creator-landing';
import { buildWebPageSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Bulk Personalized Greeting Card Generator | MewTruCard',
  description: 'Import recipients, reuse a brand preset, and generate personalized greeting cards in a reviewable batch.',
  alternates: { canonical: '/for/bulk-personalized-greeting-cards' },
  openGraph: {
    title: 'Bulk Personalized Greeting Cards | MewTruCard',
    description: 'Batch card creation that keeps every recipient personal.',
    url: 'https://mewtrucard.com/for/bulk-personalized-greeting-cards',
    images: [{ url: 'https://mewtrucard.com/og-cover.jpg', width: 1200, height: 630, alt: 'MewTruCard bulk personalized greeting cards' }],
  },
};

export default function BulkPersonalizedGreetingCardsPage() {
  return (
    <>
      <JsonLd data={buildWebPageSchema({
        name: 'Bulk Personalized Greeting Card Generator',
        description: metadata.description as string,
        path: '/for/bulk-personalized-greeting-cards',
        about: ['bulk greeting cards', 'personalized team cards', 'batch card generator'],
      })} />
      <CreatorLandingPage content={creatorLandingPages.bulkGreetingCards} />
    </>
  );
}
