'use client'

import React, { useState, useEffect } from 'react'
import { ImageViewer } from '../../components/ImageViewer'
import { Card } from '@/lib/cards'
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
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

  // Reset to first page when card type changes
  useEffect(() => {
    setCurrentPage(1)
    setCards(initialCardsData.cards)
    setTotalPages(initialCardsData.totalPages)
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
      setCards(data.cards)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.cardId} className="relative group">
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <ImageViewer
                svgContent={card.responseContent}
                alt={`Card ${card.cardId}`}
                cardId={card.cardId}
                cardType={card.cardType}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            variant="outline"
            size="icon"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            variant="outline"
            size="icon"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}