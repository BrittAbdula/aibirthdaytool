'use client'

import React from 'react'
import Link from 'next/link'
import { ImageViewer } from '../../components/ImageViewer'
import { Card, TabType } from '@/lib/cards'
import { CardType } from '@/lib/card-config'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from '@radix-ui/react-icons'

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

  return (
    <div>
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4 p-2">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className="break-inside-avoid mb-4 group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-full relative">
              <ImageViewer
                alt={
                  `MewTruCard ${card.cardType} card for ${card.relationship}` +
                  (card.message ? `: ${card.message}` : '')
                }
                cardId={card.id}
                cardType={card.cardType}
                isNewCard={false}
                imgUrl={card.r2Url || ''}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-12">
        <Link href={`/type/${wishCardType}/`}>
          <Button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-2 rounded-full flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
            Find more AI {wishCardType} cards
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
} 