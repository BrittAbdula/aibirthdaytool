'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ImageViewer } from '../../components/ImageViewer'
import { Card, TabType } from '@/lib/cards'
import { CardType } from '@/lib/card-config'

interface CardGalleryProps {
  initialCardsData: {
    cards: Card[];
    totalPages: number;
  };
  wishCardType: CardType | null;
  tabType: TabType;
}

const CARDS_PER_PAGE = 12

export default function CardGallery({ initialCardsData, wishCardType, tabType }: CardGalleryProps) {
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
  }, [wishCardType, initialCardsData, tabType])

  useEffect(() => {
    if (currentPage > 1) {
      fetchCards(currentPage)
    }
  }, [currentPage, wishCardType, tabType])

  const fetchCards = async (page: number) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: CARDS_PER_PAGE.toString(),
        tab: tabType,
        ...(wishCardType ? { wishCardType } : {})
      })
      
      const response = await fetch(`/api/cards?${params.toString()}`)
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
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4 p-2">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className="break-inside-avoid mb-4 group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-full relative">
              <ImageViewer
                alt={card.cardType + '-' + card.relationship + '-' + card.id} 
                cardId={card.id}
                cardType={card.cardType}
                isNewCard={false}
                imgUrl={card.r2Url || ''}
                svgContent={card.editedContent}
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