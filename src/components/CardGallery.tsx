'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ImageViewer } from './ImageViewer'
import { Card } from '@/lib/cards'
import { Heart, Crown } from 'lucide-react'
import { recordUserAction } from '@/lib/action'

interface CardGalleryProps {
  initialCardsData: {
    cards: Card[];
    totalPages: number;
  };
  wishCardType: string | null;
}

const CARDS_PER_PAGE = 20

// Card type to display name mapping
const cardTypeLabels: Record<string, string> = {
  birthday: 'Birthday Card',
  anniversary: 'Anniversary',
  love: 'Love Card',
  newyear: 'New Year',
  thankyou: 'Thank You',
  congratulations: 'Congrats',
  wedding: 'Wedding',
  baby: 'Baby Shower',
  graduation: 'Graduation',
  goodluck: 'Good Luck',
  sorry: 'Sorry',
  christmas: 'Christmas',
  valentine: 'Valentine',
  goodmorning: 'Good Morning',
  goodnight: 'Good Night',
  teacher: 'Teacher',
  easter: 'Easter',
}

function CardItem({ card }: { card: Card }) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(card.like_count || 0)
  const [animateLike, setAnimateLike] = useState(false)

  useEffect(() => {
    const likedCards = JSON.parse(localStorage.getItem('likedCards') || '{}')
    if (likedCards[card.id]) {
      setIsLiked(true)
    }
  }, [card.id])

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    const likedCards = JSON.parse(localStorage.getItem('likedCards') || '{}')
    const newLikedStatus = !isLiked

    setIsLiked(newLikedStatus)
    setAnimateLike(true)
    setTimeout(() => setAnimateLike(false), 300)

    if (newLikedStatus) {
      recordUserAction(card.id, 'up')
      likedCards[card.id] = true
      setLikeCount(prev => prev + 1)
    } else {
      delete likedCards[card.id]
      setLikeCount(prev => Math.max(0, prev - 1))
    }

    localStorage.setItem('likedCards', JSON.stringify(likedCards))
  }

  const displayLabel = cardTypeLabels[card.cardType] || card.cardType

  return (
    <div className="group break-inside-avoid mb-4">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <ImageViewer
            alt={`${card.cardType} card`}
            cardId={card.id}
            cardType={card.cardType}
            isNewCard={false}
            imgUrl={card.r2Url || ''}
            premium={card.premium}
          />
          
          {/* Premium Badge */}
          {card.premium && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center gap-1 shadow-md">
              <Crown className="h-3 w-3 text-white" />
              <span className="text-[10px] text-white font-medium">PRO</span>
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="p-3">
          {/* Title / Message */}
          <p className="text-sm text-gray-800 font-medium line-clamp-2 mb-2 leading-snug">
            {card.message || `Beautiful ${displayLabel} ✨`}
          </p>

          {/* Bottom Row: Type Tag + Like */}
          <div className="flex items-center justify-between">
            {/* Type Tag */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">
                  {displayLabel.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-500 truncate max-w-[80px]">
                {displayLabel}
              </span>
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className="flex items-center gap-1 group/like"
            >
              <Heart
                className={`h-4 w-4 transition-all duration-200 ${
                  isLiked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400 group-hover/like:text-red-400'
                } ${animateLike ? 'scale-125' : 'scale-100'}`}
              />
              <span className={`text-xs ${isLiked ? 'text-red-500' : 'text-gray-400'}`}>
                {likeCount > 0 ? likeCount : ''}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CardGallery({ initialCardsData, wishCardType }: CardGalleryProps) {
  const [cards, setCards] = useState<Card[]>(initialCardsData.cards)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialCardsData.totalPages)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialCardsData.totalPages > 1)

  const fetchCards = useCallback(async (page: number, append = false) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/cards?page=${page}&pageSize=${CARDS_PER_PAGE}&wishCardType=${wishCardType || ''}`
      )
      if (!response.ok) throw new Error('Failed to fetch cards')
      
      const data = await response.json()
      
      if (append) {
        setCards(prev => [...prev, ...data.cards])
      } else {
        setCards(data.cards)
      }
      setTotalPages(data.totalPages)
      setHasMore(page < data.totalPages)
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setIsLoading(false)
    }
  }, [wishCardType])

  useEffect(() => {
    if (currentPage > 1) {
      fetchCards(currentPage, true)
    }
  }, [currentPage, fetchCards])

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return
      
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      if (scrollTop + windowHeight >= documentHeight - 500) {
        setCurrentPage(prev => prev + 1)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoading, hasMore])

  return (
    <div className="w-full">
      {/* Masonry Grid - Xiaohongshu Style */}
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}

      {/* End Message */}
      {!hasMore && cards.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <p className="text-sm text-gray-400">— You've seen it all —</p>
        </div>
      )}

      {/* Empty State */}
      {cards.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <span className="text-3xl">🎨</span>
          </div>
          <p className="text-gray-500">No cards found</p>
        </div>
      )}
    </div>
  )
}
