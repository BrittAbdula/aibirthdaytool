import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { CreatorLandingPage } from '@/components/creator/CreatorLandingPage';
import { creatorLandingPages } from '@/lib/creator-landing';
import { buildWebPageSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Employee Birthday Card Generator for Teams | MewTruCard',
  description: 'Manage employee birthdays, save your team brand style, and create personalized birthday cards in batches with MewTruCard Creator Pro.',
  alternates: { canonical: '/for/employee-birthday-cards' },
  openGraph: {
    title: 'Employee Birthday Cards for Teams | MewTruCard',
    description: 'A repeatable birthday card workflow for HR and office managers.',
    url: 'https://mewtrucard.com/for/employee-birthday-cards',
    images: [{ url: 'https://mewtrucard.com/og-cover.jpg', width: 1200, height: 630, alt: 'MewTruCard employee birthday cards' }],
  },
};

export default function EmployeeBirthdayCardsPage() {
  return (
    <>
      <JsonLd data={buildWebPageSchema({
        name: 'Employee Birthday Card Generator for Teams',
        description: metadata.description as string,
        path: '/for/employee-birthday-cards',
        about: ['employee birthday cards', 'HR birthday reminders', 'team greeting cards'],
      })} />
      <CreatorLandingPage content={creatorLandingPages.employeeBirthday} />
    </>
  );
}
