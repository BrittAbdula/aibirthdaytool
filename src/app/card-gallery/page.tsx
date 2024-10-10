import { Suspense } from 'react';
import CardGallery from '@/components/CardGallery';
import { Metadata } from 'next';
import { getRecentCardsServer } from '@/lib/cards';

export const metadata: Metadata = {
  title: 'MewtruCard Gallery',
  description: 'Browse our collection of AI-generated MewtruCards',
};

export const revalidate = 300; // 每5分钟重新验证页面

export default async function CardGalleryPage() {
  const initialCardsData = await getRecentCardsServer(1, 12, null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#4A4A4A]">MewtruCard Gallery</h1>
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <CardGallery initialCardsData={initialCardsData} wishCardType={null} />
      </Suspense>
    </div>
  );
}
