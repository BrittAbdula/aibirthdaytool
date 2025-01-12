'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ImageViewer } from '../../components/ImageViewer'
import { Card } from '@/lib/cards'
import { CardType } from '@/lib/card-config'

interface CardGalleryProps {
  initialCardsData: {
    cards: Card[];
    totalPages: number;
  };
  wishCardType: CardType | null;
}

const CARDS_PER_PAGE = 12

export default function CardGallery({ initialCardsData, wishCardType }: CardGalleryProps) {
  const [cards, setCards] = useState<Card[]>(initialCardsData.cards)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialCardsData.totalPages)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(currentPage < totalPages)

  useEffect(() => {
    setCurrentPage(1)
    setCards(initialCardsData.cards)
    setTotalPages(initialCardsData.totalPages)
    setHasMore(initialCardsData.totalPages > 1)
  }, [wishCardType, initialCardsData])

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  useEffect(() => {
    if (currentPage > 1) {
      fetchCards(currentPage)
    }
  }, [currentPage, wishCardType])

  const fetchCards = async (page: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/cards?page=${page}&pageSize=${CARDS_PER_PAGE}&wishCardType=${wishCardType || ''}`)
      if (!response.ok) {
        throw new Error('Failed to fetch cards')
      }
      const data = await response.json()
      setCards(prev => [...prev, ...data.cards])
      setTotalPages(data.totalPages)
      setHasMore(page < data.totalPages)
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div 
            key={card.cardId} 
            className="group"
          >
            <div className="aspect-[2/3] relative">
              <ImageViewer
                svgContent={card.responseContent}
                alt={`Card ${card.cardId}`}
                cardId={card.cardId}
                cardType={card.cardType}
                isNewCard={false}
                imgUrl={card.r2Url}
              />
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center my-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="bg-[#FFC0CB] text-white px-8 py-3 rounded-full hover:bg-pink-400 transition"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                loading...
              </div>
            ) : (
              'More'
            )}
          </button>
        </div>
      )}
    </div>
  )
}