'use client'

import React from 'react'
import Link from 'next/link'
import { ImageViewer } from '../../components/ImageViewer'
import { Card, TabType } from '@/lib/cards'
import { CardType } from '@/lib/card-config'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, CopyIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { buildCardPreviewAlt } from '@/lib/seo'

interface SimpleCardGalleryProps {
  initialCardsData: {
    cards: Card[];
    totalPages: number;
  };
  wishCardType: CardType | null;
  tabType: TabType;
}

export default function SimpleCardGallery({ initialCardsData, wishCardType, tabType }: SimpleCardGalleryProps) {
  const { cards } = initialCardsData;

  const buildInspirationHref = (card: Card) => {
    const params = new URLSearchParams({
      ...(card.relationship ? { relationship: card.relationship } : {}),
      ...(card.message ? { message: card.message } : {}),
    })
    const query = params.toString()
    return `/${card.cardType}/${query ? `?${query}` : ''}`
  }

  const handleCopyMessage = async (message?: string | null) => {
    if (!message) return
    await navigator.clipboard.writeText(message)
  }

  return (
    <div>
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4 p-2">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className="group mb-4 break-inside-avoid overflow-hidden rounded-xl border border-[#F1D6DF] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="w-full relative">
              <ImageViewer
                alt={buildCardPreviewAlt(card.cardType, card.relationship)}
                cardId={card.id}
                cardType={card.cardType}
                isNewCard={false}
                imgUrl={card.r2Url || ''}
              />
            </div>
            <div className="grid gap-2 p-3">
              <Link
                href={buildInspirationHref(card)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Use as inspiration
                <ArrowRightIcon className="ml-1.5 h-4 w-4" />
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/${card.cardType}/edit/${card.id}/`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#F1D6DF] px-2 text-xs font-semibold text-[#202A3D] transition-colors hover:bg-[#FFF8F6]"
                >
                  <Pencil1Icon className="mr-1.5 h-4 w-4" />
                  Edit idea
                </Link>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(card.message)}
                  disabled={!card.message}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#F1D6DF] px-2 text-xs font-semibold text-[#202A3D] transition-colors hover:bg-[#FFF8F6] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CopyIcon className="mr-1.5 h-4 w-4" />
                  Copy style
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-12">
        <Link href={`/type/${wishCardType}/`}>
          <Button className="bg-gradient-to-r from-warm-coral to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-8 py-2 rounded-full flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
            Find more AI {wishCardType} cards
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
} 
