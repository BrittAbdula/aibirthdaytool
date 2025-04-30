import { Metadata } from 'next'
import { Suspense } from 'react'
import { CardType } from '@/lib/card-config'
import TypeGalleryContent from './TypeGalleryContent'
import { ScrollToTop } from '@/components/ScrollToTop'
import { getRecentCardsServer, getPopularCardsServer, TabType } from '@/lib/cards'

interface Props {
  params: { type: CardType }
  searchParams: { relationship?: string; tab?: string }
}

// Set revalidation period to 1 hour (3600 seconds)
export const revalidate = 3600

// Generate static params for common card types
export async function generateStaticParams() {
  return [
    { type: 'birthday' },
    { type: 'love' },
    { type: 'anniversary' },
    { type: 'wedding' },
    { type: 'sorry' },
    // Add more common card types as needed
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const type = decodeURIComponent(params.type)
  const title = `AI ${type.charAt(0).toUpperCase() + type.slice(1)} Cards |  Free & Animated Templates - MewtruCard`
  const description = `Explore hundreds of free, animated, AI‑generated ${type.toLowerCase()} card designs. Personalise, download, and share unique e‑cards in seconds—no design skills needed.`

  return {
    title,
    description,
    alternates: {
      canonical: `/type/${params.type}/`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/type/${params.type}/`,
      images: [
        {
          url: 'https://mewtrucard.com/mewtrucard-generator.jpg',
          width: 1200,
          height: 630,
          alt: `${type} Cards Preview`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://mewtrucard.com/mewtrucard-generator.jpg']
    },
  }
}

export default async function TypePage({ params, searchParams }: Props) {
  const type = decodeURIComponent(params.type) as CardType
  const relationship = searchParams.relationship || null
  const activeTab = (searchParams.tab as TabType) || 'recent'
  
  // Fetch all card data at build time or during revalidation
  const recentCardsData = await getRecentCardsServer(1, 24, type, relationship)
  const popularCardsData = await getPopularCardsServer(1, 24, type, relationship)
  
  // Select the appropriate data based on active tab
  const initialCardsData = activeTab === 'recent' ? recentCardsData : popularCardsData

  return (
    <article className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              AI {type.charAt(0).toUpperCase() + type.slice(1)} Card Templates
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-6">
          Design animated, personalised {type.toLowerCase()} cards in seconds —
          edit, download, share for free with MewTruCard&apos;s AI collection. ✨
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-purple-50 rounded-full">💝 Personalized Messages</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">🎨 Unique Designs</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">✨ AI-Powered</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">❤️ From the Heart</span>
          </div>
        </header>

        <section aria-label={`${type} Card Gallery`}>
          <Suspense 
            fallback={
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                <p className="text-gray-500">Loading your personalized gallery...</p>
              </div>
            }
          >
            <TypeGalleryContent 
              params={params} 
              initialCardsData={initialCardsData}
              defaultRelationship={relationship}
              activeTab={activeTab}
            />
          </Suspense>
        </section>
      </div>
      <ScrollToTop />
    </article>
  )
} 