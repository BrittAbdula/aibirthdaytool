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
      "relative w-48 mx-2 cursor-pointer overflow-hidden rounded-xl",
      // light styles
      "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
      // dark styles
      "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
    )}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <a href={`/${card.cardType}/edit/${card.cardId}/`}>
          <img
            src={card.r2Url || '/card/christmas.svg'}
            alt={`${card.cardType} card`}
            width={240}
            height={360}
            className="max-w-full max-h-full"
          />
        </a>
        {card.usageCount > 0 && (
          <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
            {card.usageCount}x
          </div>
        )}
      </div>
    </div>
  )
}

export default function CardMarquee({ wishCardType, initialCardsData, className }: CardMarqueeProps) {
  const sortedCards = [...initialCardsData.cards].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
  const firstRow = sortedCards.slice(0, Math.ceil(sortedCards.length / 2))
  const secondRow = sortedCards.slice(Math.ceil(sortedCards.length / 2))

  return (
    <div className="space-y-4">
      <div className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background",
        className
      )}>
        <Marquee pauseOnHover className="[--duration:40s]">
          {firstRow.map((card) => (
            <CardItem key={card.cardId} card={card} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:40s]">
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
          href={`/card-gallery/?type=${wishCardType}`} 
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