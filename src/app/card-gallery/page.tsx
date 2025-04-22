import { Suspense } from 'react'
import { Metadata } from 'next'
import { getRecentCardsServer, getPopularCardsServer } from '@/lib/cards'
import CardGalleryContent from './CardGalleryContent'
import { CardType } from '@/lib/card-config'
import { TabType } from '@/lib/cards'

export const metadata: Metadata = {
  title: 'AI Greeting Card Gallery | Free & Animated Templates – MewTruCard',
  description: 'Browse hundreds of free, AI‑generated greeting card templates. Download or personalize animated birthday, love, anniversary cards and more.',
  alternates: {
    canonical: '/card-gallery/',
  },
  openGraph: {
    title: 'AI Card Gallery | MewtruCard',
    description: 'Discover unique AI-generated digital cards for every occasion',
    type: 'website',
    url: '/card-gallery/',
    images: [
      {
        url: 'https://mewtrucard.com/mewtrucard-generator.jpg',
        width: 1200,
        height: 630,
        alt: 'MewtruCard Gallery Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Card Gallery | MewtruCard',
    description: 'Discover unique AI-generated digital cards for every occasion',
    images: ['https://mewtrucard.com/mewtrucard-generator.jpg'],
  },
}

export const revalidate = 300 // 每5分钟重新验证页面

interface PageProps {
  searchParams: { 
    type?: CardType;
    tab?: TabType;
  }
}

// Server Component
export default async function CardGalleryPage({ searchParams }: PageProps) {
  const defaultType = searchParams.type || null
  const activeTab = (searchParams.tab as TabType) || 'recent'
  
  // Fetch cards based on active tab
  const recentCardsData = activeTab === 'recent' 
    ? await getRecentCardsServer(1, 12, defaultType)
    : null
    
  const popularCardsData = activeTab === 'popular'
    ? await getPopularCardsServer(1, 12, defaultType)
    : null
    
  const initialCardsData = activeTab === 'recent' ? recentCardsData : popularCardsData
  
  return (
    <article className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            AI Greeting Card Gallery
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 ">
            Browse hundreds of free, AI‑generated greeting card templates. Download or personalize animated birthday, love, anniversary cards and more.
          </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="px-3 py-1 bg-purple-50 rounded-full">✨ AI-Generated Designs</span>
              <span className="px-3 py-1 bg-purple-50 rounded-full">🎨 Customizable Templates</span>
              <span className="px-3 py-1 bg-purple-50 rounded-full">💝 Multiple Occasions</span>
              <span className="px-3 py-1 bg-purple-50 rounded-full">🚀 Instant Creation</span>
            </div>
        </header>

        <section aria-label="Card Gallery">
          <Suspense 
            fallback={
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                <p className="text-gray-500">Loading your personalized gallery...</p>
              </div>
            }
          >
            <CardGalleryContent 
              initialCardsData={initialCardsData!} 
              defaultType={defaultType} 
              activeTab={activeTab} 
            />
          </Suspense>
        </section>
      </div>
    </article>
  )
}
