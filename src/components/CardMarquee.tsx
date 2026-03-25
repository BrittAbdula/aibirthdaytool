'use client'

import React from 'react'
import { Card } from '@/lib/cards'
import { cn } from '@/lib/utils'
import Marquee from '@/components/ui/marquee'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { buildCardPreviewAlt, buildCardPreviewTitle, getSeoCardTypeLabel } from '@/lib/seo'

interface CardMarqueeProps {
  initialCardsData: {
    cards: Card[];
    totalPages: number;
  };
  wishCardType: string | null;
  className?: string;
}

const CardItem = ({ card }: { card: Card }) => {
  const previewTitle = buildCardPreviewTitle(card.cardType, card.relationship)

  return (
    <div className={cn(
      "relative w-48 mx-3 cursor-pointer overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-105",
      "bg-white/80 backdrop-blur-sm border border-orange-50 shadow-sm hover:shadow-warm hover:border-orange-200"
    )}>
      <div className="p-2">
        <div className="relative rounded-xl overflow-hidden bg-white aspect-[2/3]">
          <Link
            href={`/type/${card.cardType}/`}
            aria-label={`Browse ${getSeoCardTypeLabel(card.cardType).toLowerCase()} card ideas`}
            className="block h-full w-full"
          >
            <Image
              src={card.r2Url || '/card/christmas.svg'}
              alt={buildCardPreviewAlt(card.cardType, card.relationship)}
              width={240}
              height={360}
              sizes="192px"
              className="w-full h-full object-contain"
            />
          </Link>
        </div>
        <div className="px-2 pb-2 pt-3">
          <p className="line-clamp-2 text-sm font-medium leading-5 text-gray-700">
            {previewTitle}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CardMarquee({ wishCardType, initialCardsData, className }: CardMarqueeProps) {
  // const sortedCards = [...initialCardsData.cards].sort((a, b) => (b. || 0) - (a.usageCount || 0))
  const sortedCards = [ ...initialCardsData.cards ]

  const firstRow = sortedCards.slice(0, Math.ceil(sortedCards.length / 2))
  const secondRow = sortedCards.slice(Math.ceil(sortedCards.length / 2))

  return (
    <div className="space-y-8">
      <div className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden py-4",
        className
      )}>
        <Marquee pauseOnHover className="[--duration:50s]">
          {firstRow.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:50s] mt-4">
          {secondRow.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </Marquee>
        
        {/* Gradient overlays for seamless fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-warm-cream to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-warm-cream to-transparent" />
      </div>

      {/* More link */}
      <div className="flex justify-center">
        <Link 
          href={wishCardType ? `/type/${wishCardType}/` : "/cards/"} 
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-full text-base font-medium font-quicksand",
            "text-primary border border-primary/20 bg-white/50 hover:bg-orange-50 hover:shadow-warm transition-all duration-300",
            "group"
          )}
        >
          View More Designs
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
