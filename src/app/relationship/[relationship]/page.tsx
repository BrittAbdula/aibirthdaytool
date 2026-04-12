import { Metadata } from 'next'
import { Suspense } from 'react'
import RelationshipGalleryContent from './RelationshipGalleryContent'
import GalleryComboLinkSection from '@/components/gallery/GalleryComboLinkSection'
import { Card, getRecentCardsServer, getPopularCardsServer, getLikedCardsServer, TabType } from '@/lib/cards'
import { CardType } from '@/lib/card-config'
import { getCardTypeLabel, getGalleryComboHref, getRelationshipLabel, getRelationshipValue, getSeoTypesForRelationship } from '@/lib/gallery-combos'

interface Props {
  params: Promise<{ relationship: string }>
  searchParams: Promise<{ type?: CardType; tab?: string }>
}

// Set revalidation period to 1 hour (3600 seconds)
export const revalidate = 3600

// Generate static params for common relationship types
export async function generateStaticParams() {
  return [
    { relationship: 'mother' },
    { relationship: 'father' },
    { relationship: 'sister' },
    { relationship: 'brother' },
    { relationship: 'friend' },
    { relationship: 'boyfriend' },
    { relationship: 'girlfriend' },
    { relationship: 'husband' },
    { relationship: 'wife' },
    { relationship: 'son' },
    { relationship: 'daughter' },
    // Add more common relationships as needed
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const relationship = decodeURIComponent(resolvedParams.relationship)
  const formattedRelationship = relationship.charAt(0).toUpperCase() + relationship.slice(1)
  const title = `Best ${formattedRelationship} Cards | Animated AI‑Generated Designs – MewTruCard`
  const description = `Create heartfelt cards for your best ${relationship.toLowerCase()} with our animated AI card maker. Customise artwork & text, then download or share instantly—free to start.`

  return {
    title,
    description,
    alternates: {
      canonical: `/relationship/${resolvedParams.relationship}/`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/relationship/${resolvedParams.relationship}/`,
      images: [
        {
          url: 'https://mewtrucard.com/mewtrucard-generator.jpg',
          width: 1200,
          height: 630,
          alt: `${formattedRelationship} Cards Preview`
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

export default async function RelationshipPage({ params, searchParams }: Props) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const relationshipValue = getRelationshipValue(resolvedParams.relationship)
  const relationship = getRelationshipLabel(relationshipValue)
  const cardType = resolvedSearchParams.type || null
  const activeTab = (resolvedSearchParams.tab as TabType) || 'recent'
  
  let recentCardsData: { cards: Card[]; totalPages: number } = { cards: [], totalPages: 0 }
  let popularCardsData: { cards: Card[]; totalPages: number } = { cards: [], totalPages: 0 }
  let likedCardsData: { cards: Card[]; totalPages: number } = { cards: [], totalPages: 0 }

  try {
    recentCardsData = await getRecentCardsServer(1, 24, cardType, relationship)
    popularCardsData = await getPopularCardsServer(1, 24, cardType, relationship)
    likedCardsData = await getLikedCardsServer(1, 24, cardType, relationship)
  } catch (error) {
    console.error(`Failed to load relationship gallery for ${relationshipValue}`, error)
  }
  
  // Select the appropriate data based on active tab
  let initialCardsData;
  switch (activeTab) {
    case 'popular':
      initialCardsData = popularCardsData;
      break;
    case 'liked':
      initialCardsData = likedCardsData;
      break;
    default:
      initialCardsData = recentCardsData;
  }

  const comboLinks = getSeoTypesForRelationship(relationshipValue).slice(0, 6).map((type) => ({
    href: getGalleryComboHref(type, relationshipValue),
    title: `${getCardTypeLabel(type)} Cards for ${relationship}`,
    description: `Browse public ${getCardTypeLabel(type).toLowerCase()} card examples for your ${relationship.toLowerCase()}.`,
  }))

  return (
    <article className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              AI {relationship} Card Templates
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-6">
          Design animated, personalised {relationship.toLowerCase()} cards in seconds —
          edit, download, share for free with MewTruCard&apos;s AI collection. ✨
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-purple-50 rounded-full">💝 Personalized Messages</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">🎨 Unique Designs</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">✨ AI-Powered</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">❤️ From the Heart</span>
          </div>
        </header>

        <GalleryComboLinkSection
          title={`Popular Card Types for ${relationship}`}
          description={`These combination pages turn the broad ${relationship.toLowerCase()} gallery into stronger occasion-led landing pages with clearer search intent.`}
          links={comboLinks}
        />

        <section aria-label={`${relationship} Card Gallery`}>
          <Suspense 
            fallback={
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                <p className="text-gray-500">Loading your personalized gallery...</p>
              </div>
            }
          >
            <RelationshipGalleryContent 
              params={resolvedParams}
              initialCardsData={initialCardsData}
              defaultType={cardType}
              activeTab={activeTab}
            />
          </Suspense>
        </section>
      </div>
    </article>
  )
}
