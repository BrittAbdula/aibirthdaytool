import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import RelationshipGalleryContent from './RelationshipGalleryContent'
import GalleryComboLinkSection from '@/components/gallery/GalleryComboLinkSection'
import { Card, getRecentCardsServer } from '@/lib/cards'
import { getCardTypeLabel, getGalleryComboHref, getRelationshipLabel, getRelationshipValue, getSeoTypesForRelationship } from '@/lib/gallery-combos'
import { toAbsoluteUrl } from '@/lib/seo'

interface Props {
  params: Promise<{ relationship: string }>
}

// Set revalidation period to 1 hour (3600 seconds)
export const dynamic = 'force-static'
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
  const relationship = getRelationshipLabel(resolvedParams.relationship)
  const title = `${relationship} Card Ideas | MewTruCard`
  const description = `Browse card ideas for your ${relationship.toLowerCase()}, compare public examples, and open the right generator once you know the tone you want.`
  const canonical = toAbsoluteUrl(`/relationship/${resolvedParams.relationship}/`)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      images: [
        {
          url: 'https://mewtrucard.com/mewtrucard-generator.jpg',
          width: 1200,
          height: 630,
          alt: `${relationship} cards preview`
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

export default async function RelationshipPage({ params }: Props) {
  const resolvedParams = await params
  const relationshipValue = getRelationshipValue(resolvedParams.relationship)
  const relationship = getRelationshipLabel(relationshipValue)
  let initialCardsData: { cards: Card[]; totalPages: number } = { cards: [], totalPages: 0 }

  try {
    initialCardsData = await getRecentCardsServer(1, 24, null, relationship)
  } catch (error) {
    console.error(`Failed to load relationship gallery for ${relationshipValue}`, error)
  }

  const comboLinks = getSeoTypesForRelationship(relationshipValue).slice(0, 6).map((type) => ({
    href: getGalleryComboHref(type, relationshipValue),
    title: `${getCardTypeLabel(type)} Card Ideas for ${relationship}`,
    description: `Browse public ${getCardTypeLabel(type).toLowerCase()} card ideas for your ${relationship.toLowerCase()}.`,
  }))

  return (
    <article className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {relationship} Card Ideas
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-6">
            Browse public card ideas for your {relationship.toLowerCase()}, compare tone and message direction,
            then open the best generator once you know the occasion you want.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-purple-50 rounded-full">Public examples</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">Filter by occasion</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">Relationship-first browsing</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">Jump to a generator next</span>
          </div>
        </header>

        <GalleryComboLinkSection
          title={`Popular card types for ${relationship}`}
          description={`These combination pages turn the broad ${relationship.toLowerCase()} gallery into stronger occasion-led landing pages with clearer search intent.`}
          links={comboLinks}
        />

        <section className="mb-12 rounded-[28px] border border-orange-100 bg-gradient-to-r from-orange-50 to-pink-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-800">Ready to make a card for {relationship}?</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
                Use the examples below to choose the tone first, then open the generator that best matches the occasion you want to send.
              </p>
            </div>
            <Link
              href="/cards/"
              className="inline-flex rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Open the card library
            </Link>
          </div>
        </section>

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
              defaultType={null}
              activeTab="recent"
            />
          </Suspense>
        </section>
      </div>
    </article>
  )
}
