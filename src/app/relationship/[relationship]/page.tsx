import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { GalleryBrowser } from '@/components/gallery/GalleryBrowser'
import { GalleryBrowserSkeleton } from '@/components/gallery/GalleryBrowserSkeleton'
import GalleryComboLinkSection from '@/components/gallery/GalleryComboLinkSection'
import { GalleryCardsResult, getFeaturedCardsServer } from '@/lib/cards'
import { GALLERY_PAGE_SIZE } from '@/lib/gallery-pagination'
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
  let initialCardsData: GalleryCardsResult = { cards: [], hasMore: false, totalPages: 0 }

  try {
    initialCardsData = await getFeaturedCardsServer(1, GALLERY_PAGE_SIZE, null, relationship)
  } catch (error) {
    console.error(`Failed to load relationship gallery for ${relationshipValue}`, error)
  }

  const comboLinks = getSeoTypesForRelationship(relationshipValue).slice(0, 6).map((type) => ({
    href: getGalleryComboHref(type, relationshipValue),
    title: `${getCardTypeLabel(type)} Card Ideas for ${relationship}`,
    description: `Browse public ${getCardTypeLabel(type).toLowerCase()} card ideas for your ${relationship.toLowerCase()}.`,
  }))

  return (
    <article className="min-h-screen bg-warm-cream text-[#202A3D]">
      <header className="border-b border-[#F1D6DF]/70 bg-[#FFF8F6]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Gallery</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Cards for {relationship.toLowerCase()}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#596174] sm:text-lg">
            Public card ideas made for a {relationship.toLowerCase()}. Compare tone and message direction, then open
            the generator for the occasion you need.
          </p>
          <div className="mt-6">
            <Link
              href="/cards/"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
            >
              Choose an occasion
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Suspense fallback={<GalleryBrowserSkeleton />}>
          <GalleryBrowser
            initialCards={initialCardsData}
            scope={{ type: null, relationship: relationshipValue }}
            label={`${relationship} card gallery`}
          />
        </Suspense>

        <div className="mt-14">
          <GalleryComboLinkSection
            title={`Popular card types for ${relationship.toLowerCase()}`}
            description={`Occasion-specific galleries for your ${relationship.toLowerCase()}, when you already know the moment.`}
            links={comboLinks}
          />
        </div>
      </div>
    </article>
  )
}
