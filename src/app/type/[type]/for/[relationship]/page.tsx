import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { GalleryBrowser } from '@/components/gallery/GalleryBrowser'
import { GalleryBrowserSkeleton } from '@/components/gallery/GalleryBrowserSkeleton'
import GalleryComboLinkSection from '@/components/gallery/GalleryComboLinkSection'
import { CardType } from '@/lib/card-config'
import GuidanceGridSection from '@/components/eeat/GuidanceGridSection'
import TrustSignalsSection from '@/components/eeat/TrustSignalsSection'
import JsonLd from '@/components/JsonLd'
import { GalleryCardsResult, getFeaturedCardsServer } from '@/lib/cards'
import { GALLERY_PAGE_SIZE } from '@/lib/gallery-pagination'
import {
  getCardTypeLabel,
  getGalleryComboHref,
  getGalleryComboStaticParams,
  getRelationshipLabel,
  getRelationshipValue,
  getSeoRelationshipsForType,
} from '@/lib/gallery-combos'
import {
  getRelationshipGalleryTrustGuide,
  getTrustHubRelatedLinks,
} from '@/lib/eeat-content'
import { buildBreadcrumbSchema, buildItemListSchema, buildWebPageSchema, toAbsoluteUrl } from '@/lib/seo'

interface Props {
  params: Promise<{ type: CardType; relationship: string }>
}

export const revalidate = 3600
export const dynamic = 'force-static'
export const dynamicParams = false

export async function generateStaticParams() {
  return getGalleryComboStaticParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const type = decodeURIComponent(resolvedParams.type) as CardType
  const relationshipLabel = getRelationshipLabel(resolvedParams.relationship)
  const cardTypeLabel = getCardTypeLabel(type)
  const title = `${cardTypeLabel} Card Ideas for ${relationshipLabel} | MewTruCard`
  const description = `Browse ${cardTypeLabel.toLowerCase()} card ideas for your ${relationshipLabel.toLowerCase()}, compare public examples, then make your own personalized card with MewTruCard.`
  const canonical = toAbsoluteUrl(getGalleryComboHref(type, resolvedParams.relationship))

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

export default async function TypeRelationshipPage({ params }: Props) {
  const resolvedParams = await params
  const type = decodeURIComponent(resolvedParams.type) as CardType
  const relationshipValue = getRelationshipValue(resolvedParams.relationship)
  const relationshipLabel = getRelationshipLabel(relationshipValue)
  const cardTypeLabel = getCardTypeLabel(type)

  let initialCardsData: GalleryCardsResult = { cards: [], hasMore: false, totalPages: 0 }

  try {
    initialCardsData = await getFeaturedCardsServer(1, GALLERY_PAGE_SIZE, type, relationshipLabel)
  } catch (error) {
    console.error(`Failed to load combo gallery for ${type} / ${relationshipValue}`, error)
  }

  const relatedRelationshipLinks = getSeoRelationshipsForType(type)
    .filter((relationship) => relationship !== relationshipValue)
    .slice(0, 6)
    .map((relationship) => ({
      href: getGalleryComboHref(type, relationship),
      title: `${cardTypeLabel} Card Ideas for ${getRelationshipLabel(relationship)}`,
      description: `Browse public ${cardTypeLabel.toLowerCase()} card ideas for your ${getRelationshipLabel(relationship).toLowerCase()}.`,
    }))

  const generatorHref = `/${type}/?to=${relationshipValue}&relationship=${relationshipValue}`
  const trustGuide = getRelationshipGalleryTrustGuide(type, cardTypeLabel, relationshipLabel)
  const trustLinks = getTrustHubRelatedLinks(type)
  const relatedSchemaLinks = relatedRelationshipLinks.map((link) => ({
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
          { name: `${cardTypeLabel} for ${relationshipLabel}`, href: getGalleryComboHref(type, relationshipValue) },
        ])}
      />
      <JsonLd
        data={buildWebPageSchema({
          name: `${cardTypeLabel} Cards for ${relationshipLabel}`,
          description: `Compare public ${cardTypeLabel.toLowerCase()} card examples for ${relationshipLabel.toLowerCase()}, then open the generator with a clearer tone and message direction.`,
          path: getGalleryComboHref(type, relationshipValue),
          reviewedBy: trustGuide.reviewedBy,
          lastReviewed: trustGuide.lastReviewed,
          about: [cardTypeLabel, relationshipLabel, 'relationship-specific card examples'],
        })}
      />
      {relatedSchemaLinks.length > 0 && (
        <JsonLd data={buildItemListSchema(`More ${cardTypeLabel} galleries`, relatedSchemaLinks)} />
      )}

      <header className="border-b border-[#F1D6DF]/70 bg-[#FFF8F6]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Gallery</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            {cardTypeLabel} cards for {relationshipLabel.toLowerCase()}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#596174] sm:text-lg">
            Public {cardTypeLabel.toLowerCase()} card ideas made for a {relationshipLabel.toLowerCase()}. Pick the tone
            you like, then make your own shareable card in a few steps.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={generatorHref}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
            >
              Make a {cardTypeLabel.toLowerCase()} card for {relationshipLabel.toLowerCase()}
            </Link>
            <Link
              href={`/type/${type}/`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#F1D6DF] bg-white px-6 text-sm font-semibold text-[#202A3D] transition-colors hover:border-primary/40 hover:bg-[#FFF1F5]"
            >
              All {cardTypeLabel.toLowerCase()} cards
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Suspense fallback={<GalleryBrowserSkeleton />}>
          <GalleryBrowser
            initialCards={initialCardsData}
            scope={{ type, relationship: relationshipValue }}
            label={`${cardTypeLabel} cards for ${relationshipLabel}`}
          />
        </Suspense>

        <div className="mt-14 flex flex-col gap-10">
          <GalleryComboLinkSection
            title={`More ${cardTypeLabel} galleries by relationship`}
            description={`Other relationship-specific ${cardTypeLabel.toLowerCase()} galleries worth a look before you generate a card of your own.`}
            links={relatedRelationshipLinks}
          />

          <TrustSignalsSection
            title={`How to use these ${cardTypeLabel} examples for ${relationshipLabel}`}
            description={`This page is meant to narrow the writing tone and visual direction for a ${relationshipLabel.toLowerCase()} relationship before you open the generator.`}
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
        </div>
      </div>
    </article>
  )
}
