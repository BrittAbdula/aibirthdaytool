import { Suspense } from 'react';
import CardGallery from '@/components/CardGallery';
import { Metadata } from 'next';
import { getRecentCardsServer } from '@/lib/cards';
export const metadata: Metadata = {
  title: 'Birthday MewtruCard Gallery',
  description: 'Browse our collection of AI-generated birthday MewtruCards',
  alternates: {
    canonical: '/birthday-card-gallery/',
  },
};

export const revalidate = 300; // 每5分钟重新验证页面

export default async function CardGalleryPage() {
  const initialCardsData = await getRecentCardsServer(1, 12, "birthday");
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Birthday MewtruCard Gallery</h1>
      <h2 className="text-xl mb-6 text-center">Find the Birthday MewtruCard you like, personalize it with your own text and images, and send it to someone on their birthday.</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <CardGallery wishCardType="birthday" initialCardsData={initialCardsData} />
      </Suspense>
    </div>
  );
}
