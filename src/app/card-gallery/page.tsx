import { Suspense } from 'react'
import { Metadata } from 'next'
import { getRecentCardsServer } from '@/lib/cards'
import CardGalleryContent from './CardGalleryContent'
import { toAbsoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Card Gallery Ideas | MewTruCard',
  description: 'Browse public card ideas by occasion, compare examples, and open the right generator once you know the tone you want.',
  alternates: {
    canonical: toAbsoluteUrl('/card-gallery/'),
  },
  openGraph: {
    title: 'Card Gallery Ideas | MewTruCard',
    description: 'Browse public card ideas by occasion, compare examples, and open the right generator once you know the tone you want.',
    type: 'website',
    url: toAbsoluteUrl('/card-gallery/'),
    images: [
      {
        url: 'https://mewtrucard.com/mewtrucard-generator.jpg',
        width: 1200,
        height: 630,
        alt: 'MewTruCard gallery preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Card Gallery Ideas | MewTruCard',
    description: 'Browse public card ideas by occasion, compare examples, and open the right generator once you know the tone you want.',
    images: ['https://mewtrucard.com/mewtrucard-generator.jpg'],
  },
}

// Set revalidation period to 1 hours (3600 seconds)
export const dynamic = 'force-static'
export const revalidate = 3600

// Server Component
export default async function CardGalleryPage() {
  const initialCardsData = await getRecentCardsServer(1, 24, null)
  
  return (
    <article className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Card Gallery Ideas
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 ">
            Browse public card ideas by occasion, compare examples, and open the right generator once you know the tone you want.
          </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="px-3 py-1 bg-purple-50 rounded-full">Public examples</span>
              <span className="px-3 py-1 bg-purple-50 rounded-full">Filter by occasion</span>
              <span className="px-3 py-1 bg-purple-50 rounded-full">Recent by default</span>
              <span className="px-3 py-1 bg-purple-50 rounded-full">Open a generator next</span>
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
              defaultType={null} 
              activeTab="recent" 
            />
          </Suspense>
        </section>
      </div>
    </article>
  )
}
