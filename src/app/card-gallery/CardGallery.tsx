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
  const observerTarget = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setCurrentPage(prev => prev + 1)
    }
  }, [isLoading, hasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [loadMore])

  useEffect(() => {
    setCurrentPage(1)
    setCards(initialCardsData.cards)
    setTotalPages(initialCardsData.totalPages)
    setHasMore(initialCardsData.totalPages > 1)
  }, [wishCardType, initialCardsData])

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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {cards.map((card) => (
          <div 
            key={card.cardId} 
            className="group"
          >
            <div className="aspect-[2/3] relative">
              <ImageViewer
                alt={card.cardType}
                cardId={card.cardId}
                cardType={card.cardType}
                isNewCard={false}
                imgUrl={card.r2Url || ''}
              />
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}