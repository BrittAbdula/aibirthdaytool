'use client'

import React from 'react'
import { Card } from '@/lib/cards'
import { cn } from '@/lib/utils'
import Marquee from '@/components/ui/marquee'
import Link from 'next/link'

interface CardMarqueeProps {
  initialCardsData: {
    cards: Card[];
    totalPages: number;
  };
  wishCardType: string | null;
  className?: string;
}

const CardItem = ({ card }: { card: Card }) => {
  return (
    <div className={cn(
      "relative w-72 mx-4 cursor-pointer overflow-hidden rounded-xl",
      // light styles
      "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
      // dark styles
      "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
    )}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <a href={`/${card.cardType}/edit/${card.cardId}/`}>
          <img
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(card.responseContent)}`}
            alt={`${card.cardType} card`}
            width={400}
            height={600}
            className="max-w-full max-h-full"
          />
        </a>
      </div>
    </div>
  )
}

export default function CardMarquee({ initialCardsData, className }: CardMarqueeProps) {
  const cards = initialCardsData.cards
  const firstRow = cards.slice(0, Math.ceil(cards.length / 2))
  const secondRow = cards.slice(Math.ceil(cards.length / 2))

  return (
    <div className="space-y-4">
      <div className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background",
        className
      )}>
        <Marquee pauseOnHover className="[--duration:30s]">
          {firstRow.map((card) => (
            <CardItem key={card.cardId} card={card} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:30s]">
          {secondRow.map((card) => (
            <CardItem key={card.cardId} card={card} />
          ))}
        </Marquee>
        
        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background" />
      </div>

      {/* More link */}
      <div className="flex justify-center">
        <Link 
          href="/card-gallery/" 
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium",
            "text-gray-600 hover:text-gray-900",
            "dark:text-gray-400 dark:hover:text-gray-100",
            "transition-colors duration-200"
          )}
        >
          More MewtruCard
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  )
}