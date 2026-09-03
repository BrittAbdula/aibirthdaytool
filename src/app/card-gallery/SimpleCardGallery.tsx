'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { GALLERY_GRID_CLASS, GalleryCard } from '@/components/gallery/GalleryCard'
import { GalleryPreviewDialog } from '@/components/gallery/GalleryPreviewDialog'
import { useLikedCards } from '@/components/gallery/useLikedCards'
import type { Card, GalleryCardsResult, TabType } from '@/lib/cards'
import { getCardTypeLabel } from '@/lib/gallery-combos'

interface SimpleCardGalleryProps {
  initialCardsData: GalleryCardsResult
  wishCardType: string | null
  tabType?: TabType
}

/** Static strip of public cards shown under a generator, linking out to the full type gallery. */
export default function SimpleCardGallery({ initialCardsData, wishCardType }: SimpleCardGalleryProps) {
  const [previewCard, setPreviewCard] = useState<Card | null>(null)
  const { isLiked, toggle, delta } = useLikedCards()
  const cards = initialCardsData.cards

  if (cards.length === 0) return null

  return (
    <div className="text-left">
      <ul className={GALLERY_GRID_CLASS}>
        {cards.map((card, index) => (
          <li key={card.id}>
            <GalleryCard
              card={card}
              priority={index < 4}
              liked={isLiked(card.id)}
              likeCount={(card.like_count ?? 0) + (delta[card.id] ?? 0)}
              onToggleLike={toggle}
              onOpen={setPreviewCard}
            />
          </li>
        ))}
      </ul>

      {wishCardType && (
        <div className="mt-10 flex justify-center">
          <Link
            href={`/type/${wishCardType}/`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#F1D6DF] bg-white px-6 text-sm font-semibold text-[#202A3D] transition-colors hover:border-primary/40 hover:bg-[#FFF1F5]"
          >
            More {getCardTypeLabel(wishCardType).toLowerCase()} cards
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      )}

      <GalleryPreviewDialog
        card={previewCard}
        open={previewCard !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewCard(null)
        }}
      />
    </div>
  )
}
