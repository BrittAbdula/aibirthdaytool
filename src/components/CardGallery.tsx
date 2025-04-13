'use client'

import React, { useState, useEffect } from 'react'
import { ImageViewer } from './ImageViewer'
import { Card } from '@/lib/cards'
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'

interface CardGalleryProps {
  initialCardsData: {
    cards: Card[];
    totalPages: number;
  };
  wishCardType: string | null;
}

const CARDS_PER_PAGE = 12

export default function CardGallery({ initialCardsData, wishCardType }: CardGalleryProps) {
  const [cards, setCards] = useState<Card[]>(initialCardsData.cards)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialCardsData.totalPages)
  const [isLoading, setIsLoading] = useState(false)

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
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="bg-purple-100 rounded-lg p-2 sm:p-4 transition-all duration-300 hover:shadow-lg">
            <div className="relative w-full pb-[133.33%] mb-2">
              <div className="absolute inset-0 transition-transform duration-300 ease-in-out hover:scale-105">
                <ImageViewer
                  alt={`${card.cardType} card`}
                  cardId={card.id}
                  cardType={card.cardType}
                  isNewCard={false}
                  imgUrl={card.r2Url || ''}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center space-x-4 mt-8">
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <span className="text-[#4A4A4A]">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors"
        >
          Next
          <ChevronRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}