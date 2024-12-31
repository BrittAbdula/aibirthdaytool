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
  const observer = useRef<IntersectionObserver | null>(null)
  const lastCardElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1)
      }
    }, { threshold: 0.5 })
    if (node) observer.current.observe(node)
  }, [isLoading, hasMore])

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
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {cards.map((card, index) => (
            <div 
              key={card.cardId} 
              ref={index === cards.length - 1 ? lastCardElementRef : undefined}
              className="group"
            >
              {/* <div className="bg-white rounded-xl overflow-hidden transform transition duration-300 hover:scale-[1.02] hover:shadow-lg"> */}
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
              {/* </div> */}
            </div>
          ))}
        {/* </div> */}

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  )
}