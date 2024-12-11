import { Suspense } from 'react'
import { Metadata } from 'next'
import { getRecentCardsServer } from '@/lib/cards'
import CardGalleryContent from './CardGalleryContent'
import { CardType } from '@/lib/card-config'

export const metadata: Metadata = {
  title: 'MewtruCard Gallery',
  description: 'Browse our collection of AI-generated MewtruCards',
  alternates: {
    canonical: '/card-gallery/',
  },
}

export const revalidate = 300 // 每5分钟重新验证页面

interface PageProps {
  searchParams: { type?: CardType }
}

// Server Component
export default async function CardGalleryPage({ searchParams }: PageProps) {
  const defaultType = searchParams.type || null
  const initialCardsData = await getRecentCardsServer(1, 12, defaultType)
  
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-500">Loading gallery...</p>
        </div>
      }
    >
      <CardGalleryContent initialCardsData={initialCardsData} defaultType={defaultType} />
    </Suspense>
  )
}
