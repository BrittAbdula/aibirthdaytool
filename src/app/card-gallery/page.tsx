import { Suspense } from 'react'
import { Metadata } from 'next'
import { GalleryBrowser } from '@/components/gallery/GalleryBrowser'
import { GalleryBrowserSkeleton } from '@/components/gallery/GalleryBrowserSkeleton'
import { getFeaturedCardsServer, type GalleryCardsResult } from '@/lib/cards'
import { GALLERY_PAGE_SIZE } from '@/lib/gallery-pagination'
import { toAbsoluteUrl } from '@/lib/seo'

const description =
  'Browse public card ideas by occasion and recipient, compare real examples, and open any card as a starting point for your own.'

export const metadata: Metadata = {
  title: 'Card Gallery Ideas | MewTruCard',
  description,
  alternates: {
    canonical: toAbsoluteUrl('/card-gallery/'),
  },
  openGraph: {
    title: 'Card Gallery Ideas | MewTruCard',
    description,
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
    description,
    images: ['https://mewtrucard.com/mewtrucard-generator.jpg'],
  },
}

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function CardGalleryPage() {
  let initialCards: GalleryCardsResult = { cards: [], hasMore: false, totalPages: 0 }

  try {
    initialCards = await getFeaturedCardsServer(1, GALLERY_PAGE_SIZE, null)
  } catch (error) {
    console.error('Failed to load the card gallery', error)
  }

  return (
    <main className="min-h-screen bg-warm-cream text-[#202A3D]">
      <section className="border-b border-[#F1D6DF]/70 bg-[#FFF8F6]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Gallery</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Card gallery</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#596174] sm:text-lg">
            Public cards people made and shared. Browse by occasion or recipient, then open any card as a
            starting point for your own.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Suspense fallback={<GalleryBrowserSkeleton />}>
          <GalleryBrowser initialCards={initialCards} scope={{ type: null, relationship: null }} />
        </Suspense>
      </div>
    </main>
  )
}
