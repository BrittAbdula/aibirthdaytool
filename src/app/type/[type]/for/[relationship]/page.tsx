import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ScrollToTop } from '@/components/ScrollToTop'
import GalleryComboLinkSection from '@/components/gallery/GalleryComboLinkSection'
import { CardType } from '@/lib/card-config'
import { Card, getLikedCardsServer, getPopularCardsServer, getRecentCardsServer, TabType } from '@/lib/cards'
import {
  getCardTypeLabel,
  getGalleryComboHref,
  getGalleryComboStaticParams,
  getRelationshipLabel,
  getRelationshipValue,
  getSeoRelationshipsForType,
} from '@/lib/gallery-combos'
import TypeRelationshipGalleryContent from './TypeRelationshipGalleryContent'

interface Props {
  params: { type: CardType; relationship: string }
  searchParams: { tab?: string }
}

export const revalidate = 3600
export const dynamicParams = false

export async function generateStaticParams() {
  return getGalleryComboStaticParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const type = decodeURIComponent(params.type) as CardType
  const relationshipLabel = getRelationshipLabel(params.relationship)
  const cardTypeLabel = getCardTypeLabel(type)
  const title = `${cardTypeLabel} Cards for ${relationshipLabel} | Free AI Templates - MewTruCard`
  const description = `Browse AI-generated ${cardTypeLabel.toLowerCase()} card ideas for your ${relationshipLabel.toLowerCase()}, then create, edit, download, or share your own card link with MewTruCard.`
  const canonical = getGalleryComboHref(type, params.relationship)

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
          alt: `${cardTypeLabel} cards for ${relationshipLabel}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://mewtrucard.com/mewtrucard-generator.jpg'],
    },
  }
}

export default async function TypeRelationshipPage({ params, searchParams }: Props) {
  const type = decodeURIComponent(params.type) as CardType
  const relationshipValue = getRelationshipValue(params.relationship)
  const relationshipLabel = getRelationshipLabel(relationshipValue)
  const cardTypeLabel = getCardTypeLabel(type)
  const activeTab = (searchParams.tab as TabType) || 'recent'

  let recentCardsData: { cards: Card[]; totalPages: number } = { cards: [], totalPages: 0 }
  let popularCardsData: { cards: Card[]; totalPages: number } = { cards: [], totalPages: 0 }
  let likedCardsData: { cards: Card[]; totalPages: number } = { cards: [], totalPages: 0 }

  try {
    recentCardsData = await getRecentCardsServer(1, 24, type, relationshipLabel)
    popularCardsData = await getPopularCardsServer(1, 24, type, relationshipLabel)
    likedCardsData = await getLikedCardsServer(1, 24, type, relationshipLabel)
  } catch (error) {
    console.error(`Failed to load combo gallery for ${type} / ${relationshipValue}`, error)
  }

  let initialCardsData
  switch (activeTab) {
    case 'popular':
      initialCardsData = popularCardsData
      break
    case 'liked':
      initialCardsData = likedCardsData
      break
    default:
      initialCardsData = recentCardsData
  }

  const relatedRelationshipLinks = getSeoRelationshipsForType(type)
    .filter((relationship) => relationship !== relationshipValue)
    .slice(0, 6)
    .map((relationship) => ({
      href: getGalleryComboHref(type, relationship),
      title: `${cardTypeLabel} Cards for ${getRelationshipLabel(relationship)}`,
      description: `Browse public ${cardTypeLabel.toLowerCase()} card ideas for your ${getRelationshipLabel(relationship).toLowerCase()}.`,
    }))

  const generatorHref = `/${type}/?to=${relationshipValue}&relationship=${relationshipValue}`

  return (
    <article className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {cardTypeLabel} Cards for {relationshipLabel}
            </span>
          </h1>
          <p className="mx-auto mb-6 max-w-3xl px-4 text-lg text-gray-600 sm:text-xl">
            Explore public AI {cardTypeLabel.toLowerCase()} card ideas for your {relationshipLabel.toLowerCase()}, then create your own shareable {cardTypeLabel.toLowerCase()} card link in a few steps.
          </p>
          <div className="mb-8 flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full bg-purple-50 px-3 py-1">Filtered for {relationshipLabel}</span>
            <span className="rounded-full bg-purple-50 px-3 py-1">Public gallery ideas</span>
            <span className="rounded-full bg-purple-50 px-3 py-1">Shareable card links</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={generatorHref}
              className="w-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] sm:w-auto"
            >
              Make a {cardTypeLabel} Card for {relationshipLabel}
            </Link>
            <Link
              href={`/type/${type}/`}
              className="w-full rounded-full border border-purple-200 bg-white/80 px-8 py-3 text-center text-sm font-semibold text-purple-700 transition hover:bg-purple-50 sm:w-auto"
            >
              View All {cardTypeLabel} Cards
            </Link>
          </div>
        </header>

        <GalleryComboLinkSection
          title={`More ${cardTypeLabel} Galleries by Relationship`}
          description={`Use these high-intent gallery combinations to browse stronger examples before you generate a card of your own.`}
          links={relatedRelationshipLinks}
        />

        <section aria-label={`${cardTypeLabel} cards for ${relationshipLabel}`}>
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                <p className="text-gray-500">Loading your personalized gallery...</p>
              </div>
            }
          >
            <TypeRelationshipGalleryContent
              params={params}
              initialCardsData={initialCardsData}
              activeTab={activeTab}
            />
          </Suspense>
        </section>
      </div>
      <ScrollToTop />
    </article>
  )
}
