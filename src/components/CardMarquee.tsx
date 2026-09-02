'use client'

import React from 'react'
import { Card, GalleryCardsResult } from '@/lib/cards'
import { cn } from '@/lib/utils'
import Marquee from '@/components/ui/marquee'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { buildCardPreviewAlt, getSeoCardTypeLabel } from '@/lib/seo'

interface CardMarqueeProps {
  initialCardsData: GalleryCardsResult;
  wishCardType: string | null;
  className?: string;
}

const CardItem = ({ card }: { card: Card }) => {
  const typeLabel = getSeoCardTypeLabel(card.cardType)

  return (
    <Link
      href={`/type/${card.cardType}/`}
      aria-label={`Browse ${typeLabel.toLowerCase()} card ideas`}
      className={cn(
        "group/card relative mx-2.5 block w-44 overflow-hidden rounded-xl",
        "bg-white p-2 ring-1 ring-[#F1D6DF] shadow-[0_10px_20px_-12px_rgba(32,42,61,0.25)]",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_32px_-14px_rgba(180,55,95,0.35)]"
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-[#FFF8F6]">
        <Image
          src={card.r2Url || '/card/christmas.svg'}
          alt={buildCardPreviewAlt(card.cardType, card.relationship)}
          width={240}
          height={360}
          sizes="176px"
          className="h-full w-full object-cover"
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/card:opacity-100">
          {typeLabel}
        </span>
      </div>
    </Link>
  )
}

export default function CardMarquee({ wishCardType, initialCardsData, className }: CardMarqueeProps) {
  // Dedupe by preview image so the strip never shows the same card twice
  const seen = new Set<string>()
  const sortedCards = initialCardsData.cards.filter((card) => {
    const key = card.r2Url || String(card.id)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const firstRow = sortedCards.slice(0, Math.ceil(sortedCards.length / 2))
  const secondRow = sortedCards.slice(Math.ceil(sortedCards.length / 2))

  return (
    <div className="space-y-10">
      <div className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden py-2",
        className
      )}>
        <Marquee pauseOnHover className="[--duration:50s]">
          {firstRow.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:50s] mt-5">
          {secondRow.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </Marquee>

        {/* Edge fades matched to the section background */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-warm-cream to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-warm-cream to-transparent sm:w-20" />
      </div>

      {/* More link */}
      <div className="flex justify-center">
        <Link
          href={wishCardType ? `/type/${wishCardType}/` : "/cards/"}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold",
            "border border-[#F1D6DF] bg-white text-primary transition-all duration-300",
            "hover:-translate-y-0.5 hover:border-primary/35 hover:bg-[#FFF1F5] hover:shadow-sm",
            "group"
          )}
        >
          View more designs
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}
