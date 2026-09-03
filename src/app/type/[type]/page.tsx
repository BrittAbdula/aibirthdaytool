import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { CardType } from '@/lib/card-config'
import { GalleryBrowser } from '@/components/gallery/GalleryBrowser'
import { GalleryBrowserSkeleton } from '@/components/gallery/GalleryBrowserSkeleton'
import GalleryComboLinkSection from '@/components/gallery/GalleryComboLinkSection'
import GuidanceGridSection from '@/components/eeat/GuidanceGridSection'
import TrustSignalsSection from '@/components/eeat/TrustSignalsSection'
import JsonLd from '@/components/JsonLd'
import { GalleryCardsResult, getFeaturedCardsServer } from '@/lib/cards'
import { GALLERY_PAGE_SIZE } from '@/lib/gallery-pagination'
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
  let initialCardsData: GalleryCardsResult = { cards: [], hasMore: false, totalPages: 0 }

  try {
    initialCardsData = await getFeaturedCardsServer(1, GALLERY_PAGE_SIZE, type, null)
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
    <article className="min-h-screen bg-warm-cream text-[#202A3D]">
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

      <header className="border-b border-[#F1D6DF]/70 bg-[#FFF8F6]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Gallery</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            {isBirthdayType ? 'Birthday card ideas' : `${cardTypeLabel} card ideas`}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#596174] sm:text-lg">
            Browse public {cardTypeLabel.toLowerCase()} cards and templates, compare tone and layout, then open the
            generator when you are ready to make your own.
          </p>
          <div className="mt-6">
            <Link
              href={`/${type}/`}
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
            >
              Make a {cardTypeLabel.toLowerCase()} card
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Suspense fallback={<GalleryBrowserSkeleton />}>
          <GalleryBrowser
            initialCards={initialCardsData}
            scope={{ type, relationship: null }}
            label={`${cardTypeLabel} card gallery`}
          />
        </Suspense>

        <div className="mt-14 flex flex-col gap-10">
          <GalleryComboLinkSection
            title={isBirthdayType ? 'Birthday cards by relationship' : `${cardTypeLabel} cards by relationship`}
            description={`Relationship-specific ${cardTypeLabel.toLowerCase()} galleries, when the person matters more than the occasion.`}
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

          <div>
            {trustGuide.sections.map((section) => (
              <GuidanceGridSection
                key={section.title}
                title={section.title}
                description={section.description}
                cards={section.cards}
              />
            ))}
          </div>

          <section className="rounded-2xl border border-[#F1D6DF] bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-serif text-2xl font-semibold text-[#202A3D] sm:text-3xl">Ready to turn a direction into a real card?</h2>
                <p className="mt-2 text-sm leading-6 text-[#6B7280] sm:text-base">
                  Use the examples above to choose the tone, then open the generator and personalize the result with your own recipient details and message.
                </p>
              </div>
              <Link
                href={`/${type}/`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                Open the {cardTypeLabel} generator
              </Link>
            </div>
          </section>
        </div>
      </div>
    </article>
  )
}
