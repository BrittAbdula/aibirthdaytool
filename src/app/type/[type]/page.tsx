import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { CardType } from '@/lib/card-config'
import TypeGalleryContent from './TypeGalleryContent'
import GalleryComboLinkSection from '@/components/gallery/GalleryComboLinkSection'
import GuidanceGridSection from '@/components/eeat/GuidanceGridSection'
import TrustSignalsSection from '@/components/eeat/TrustSignalsSection'
import JsonLd from '@/components/JsonLd'
import { Card, getRecentCardsServer } from '@/lib/cards'
import { getCardTypeLabel, getGalleryComboHref, getRelationshipLabel, getSeoRelationshipsForType } from '@/lib/gallery-combos'
import { getTrustHubRelatedLinks, getTypeGalleryTrustGuide } from '@/lib/eeat-content'
import { buildBreadcrumbSchema, buildItemListSchema, buildWebPageSchema, toAbsoluteUrl } from '@/lib/seo'

interface Props {
  params: Promise<{ type: CardType }>
}

// Set revalidation period to 1 hour (3600 seconds)
export const dynamic = 'force-static'
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
  const resolvedParams = await params
  const type = decodeURIComponent(resolvedParams.type)
  const cardTypeLabel = getCardTypeLabel(type)
  const title = `${cardTypeLabel} Card Ideas & Templates | MewTruCard`
  const description = `Browse ${cardTypeLabel.toLowerCase()} card ideas, templates, and public examples, then open the generator to make your own card with MewTruCard.`
  const canonical = toAbsoluteUrl(`/type/${resolvedParams.type}/`)

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

export default async function TypePage({ params }: Props) {
  const resolvedParams = await params
  const type = decodeURIComponent(resolvedParams.type) as CardType
  const cardTypeLabel = getCardTypeLabel(type)
  const isBirthdayType = type === 'birthday'
  let initialCardsData: { cards: Card[]; totalPages: number } = { cards: [], totalPages: 0 }

  try {
    initialCardsData = await getRecentCardsServer(1, 24, type, null)
  } catch (error) {
    console.error(`Failed to load type gallery for ${type}`, error)
  }

  const comboLinks = getSeoRelationshipsForType(type).slice(0, 6).map((comboRelationship) => ({
    href: getGalleryComboHref(type, comboRelationship),
    title: `${cardTypeLabel} Card Ideas for ${getRelationshipLabel(comboRelationship)}`,
    description: `Browse public ${cardTypeLabel.toLowerCase()} card ideas for your ${getRelationshipLabel(comboRelationship).toLowerCase()}.`,
  }))
  const trustGuide = getTypeGalleryTrustGuide(type, cardTypeLabel)
  const trustLinks = getTrustHubRelatedLinks(type)
  const comboSchemaLinks = comboLinks.map((link) => ({
    href: link.href,
    label: link.title,
    description: link.description,
  }))

  return (
    <article className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', href: '/' },
          { name: 'Cards', href: '/cards/' },
          { name: `${cardTypeLabel} examples`, href: `/type/${type}/` },
        ])}
      />
      <JsonLd
        data={buildWebPageSchema({
          name: `${cardTypeLabel} Card Templates`,
          description: `Explore public ${cardTypeLabel.toLowerCase()} card examples, compare tone and style, and move into the generator when you are ready to personalize your own card.`,
          path: `/type/${type}/`,
          reviewedBy: trustGuide.reviewedBy,
          lastReviewed: trustGuide.lastReviewed,
          about: [cardTypeLabel, 'card templates', 'public card gallery'],
        })}
      />
      {comboSchemaLinks.length > 0 && (
        <JsonLd data={buildItemListSchema(`${cardTypeLabel} relationship galleries`, comboSchemaLinks)} />
      )}
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {isBirthdayType ? 'Birthday Card Ideas' : `${cardTypeLabel} Card Ideas`}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-6">
            Browse public {cardTypeLabel.toLowerCase()} card ideas and templates, compare tone and layout,
            then open the generator when you are ready to make your own card.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-purple-50 rounded-full">Public examples</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">Templates and ideas</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">Relationship filters</span>
            <span className="px-3 py-1 bg-purple-50 rounded-full">Open the generator next</span>
          </div>
        </header>

        <GalleryComboLinkSection
          title={isBirthdayType ? 'Birthday cards by relationship' : `${cardTypeLabel} cards by relationship`}
          description={`These are the strongest relationship-led gallery pages for ${cardTypeLabel.toLowerCase()} intent, and they are better SEO landing pages than query-string filters.`}
          links={comboLinks}
        />

        <TrustSignalsSection
          title={`How to use this ${cardTypeLabel} gallery`}
          description={`This page is designed to help visitors compare public ${cardTypeLabel.toLowerCase()} examples, choose a tone faster, and move into the generator with a clearer plan.`}
          reviewedBy={trustGuide.reviewedBy}
          lastReviewed={trustGuide.lastReviewed}
          purpose={trustGuide.purpose}
          methodology={trustGuide.methodology}
          links={trustLinks}
        />

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
              params={resolvedParams}
              initialCardsData={initialCardsData}
              defaultRelationship={null}
              activeTab="recent"
            />
          </Suspense>
        </section>

        <div className="mt-12">
          {trustGuide.sections.map((section) => (
            <GuidanceGridSection
              key={section.title}
              title={section.title}
              description={section.description}
              cards={section.cards}
            />
          ))}
        </div>

        <section className="mb-12 rounded-[28px] border border-orange-100 bg-gradient-to-r from-orange-50 to-pink-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-800">Ready to turn a direction into a real card?</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
                Use the examples above to choose the tone, then open the generator and personalize the result with your own recipient details and message.
              </p>
            </div>
            <Link
              href={`/${type}/`}
              className="inline-flex rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Open the {cardTypeLabel} generator
            </Link>
          </div>
        </section>
      </div>
    </article>
  )
} 
