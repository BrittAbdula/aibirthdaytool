'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Card, TabType } from '@/lib/cards'
import { CardType } from '@/lib/card-config'
import { Crown, Heart } from 'lucide-react'
import { CARD_TYPES, RELATIONSHIPS } from '@/lib/card-constants'
import { recordUserAction } from '@/lib/action'

interface CardGalleryProps {
  initialCardsData: {
    cards: Card[];
    totalPages: number;
  };
  wishCardType: CardType | null;
  tabType: TabType;
}

const CARDS_PER_PAGE = 12

const SkeletonCard = () => (
  <div className="break-inside-avoid mb-3 sm:mb-4">
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  </div>
)

const isVideoUrl = (url?: string | null) => {
  if (!url) return false
  const lowered = url.toLowerCase()
  return ['.mp4', '.mov', '.avi', '.webm', '.ogg'].some(ext => lowered.includes(ext))
}

// Type emoji mapping for visual appeal
const typeEmojis: Record<string, string> = {
  birthday: '🎂',
  anniversary: '💍',
  love: '❤️',
  newyear: '🎆',
  thankyou: '🙏',
  congratulations: '🎉',
  wedding: '💒',
  baby: '👶',
  graduation: '🎓',
  goodluck: '🍀',
  sorry: '💐',
  christmas: '🎄',
  valentine: '💕',
  goodmorning: '🌅',
  goodnight: '🌙',
  teacher: '📚',
  easter: '🐰',
}

export default function CardGallery({ initialCardsData, wishCardType, tabType }: CardGalleryProps) {
  const [cards, setCards] = useState<Card[]>(initialCardsData.cards)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialCardsData.totalPages)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(currentPage < totalPages)
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const observerTarget = useRef<HTMLDivElement>(null)
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})

  const preloadImage = (url: string) => {
    if (!url || preloadedImages.has(url)) return
    const img = new Image()
    img.src = url
    setPreloadedImages(prev => new Set(prev).add(url))
  }

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
    try {
      const local = JSON.parse(localStorage.getItem('likedCards') || '{}')
      if (local && typeof local === 'object') {
        setLikedMap(local)
      }
    } catch {}
  }, [wishCardType, initialCardsData, tabType])

  useEffect(() => {
    if (currentPage > 1) {
      fetchCards(currentPage)
    }
  }, [currentPage, wishCardType, tabType])

  useEffect(() => {
    cards.forEach(card => {
      if (card.r2Url) {
        preloadImage(card.r2Url)
      }
    })
  }, [cards])

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

  const getTypeLabel = (type: string | undefined) =>
    CARD_TYPES.find(t => t.type === type)?.label || (type ? String(type) : 'Card')

  const getRelationshipLabel = (rel: string | null | undefined) =>
    RELATIONSHIPS.find(r => r.value.toLowerCase() === (rel || '').toLowerCase())?.label || null

  const toggleLike = (e: React.MouseEvent, cardId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    setLikedMap(prev => {
      const next = { ...prev, [cardId]: !prev[cardId] }
      try {
        localStorage.setItem('likedCards', JSON.stringify(next))
      } catch {}
      if (next[cardId]) {
        try { recordUserAction(cardId, 'up') } catch {}
      }
      return next
    })
  }

  return (
    <div className="min-h-screen px-2 sm:px-4">
      {/* Xiaohongshu-style Masonry Grid */}
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4 max-w-7xl mx-auto">
        {cards.map((card, index) => {
          const typeLabel = getTypeLabel(card.cardType)
          const relationshipLabel = getRelationshipLabel(card.relationship)
          const emoji = typeEmojis[card.cardType] || '✨'
          
          return (
            <div
              key={card.id}
              className="break-inside-avoid mb-3 sm:mb-4 group"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <Link
                href={`/to/${card.id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden bg-gray-50">
                  {card.r2Url ? (
                    isVideoUrl(card.r2Url) ? (
                      <video
                        src={card.r2Url}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    ) : (
                      <img
                        src={card.r2Url}
                        alt={`${typeLabel} card`}
                        loading="lazy"
                        className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    )
                  ) : (
                    <div className="w-full aspect-[3/4] flex items-center justify-center text-sm text-gray-400 bg-gradient-to-br from-purple-50 to-pink-50">
                      <span className="text-4xl">{emoji}</span>
                    </div>
                  )}
                  
                  {/* Premium Badge - Xiaohongshu style "置顶" badge */}
                  {card.premium && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-rose-500 to-orange-500 rounded text-[10px] font-medium text-white shadow-sm">
                      PRO
                    </div>
                  )}
                  
                  {/* Video indicator */}
                  {isVideoUrl(card.r2Url) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Card Info - Xiaohongshu style */}
                <div className="p-3">
                  {/* Title/Message - 2 lines max */}
                  <p className="text-[13px] text-gray-800 font-medium leading-[1.4] line-clamp-2 mb-2.5">
                    {card.message || `${emoji} ${typeLabel} Card`}
                  </p>

                  {/* Bottom Row: Avatar + Name | Heart + Count */}
                  <div className="flex items-center justify-between">
                    {/* Left: Type Avatar + Label */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0 text-[10px]">
                        {emoji}
                      </div>
                      <span className="text-[11px] text-gray-500 truncate">
                        {relationshipLabel ? `${typeLabel} · ${relationshipLabel}` : typeLabel}
                      </span>
                    </div>

                    {/* Right: Like Button + Count */}
                    <button
                      onClick={(e) => toggleLike(e, card.id)}
                      className="flex items-center gap-1 flex-shrink-0 pl-2"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-all ${
                          likedMap[card.id]
                            ? 'fill-rose-500 text-rose-500 scale-110'
                            : 'text-gray-400 group-hover:text-rose-400'
                        }`}
                      />
                      {(typeof card.like_count === 'number' && card.like_count > 0) && (
                        <span className={`text-[11px] ${likedMap[card.id] ? 'text-rose-500' : 'text-gray-400'}`}>
                          {card.like_count}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
        
        {/* Loading Skeletons */}
        {isLoading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={`skeleton-${idx}`} />
          ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}

      {/* End Message */}
      {!hasMore && cards.length > 0 && (
        <div className="flex justify-center py-8">
          <span className="text-sm text-gray-400">— end of list —</span>
        </div>
      )}

      {/* Empty State */}
      {cards.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <span className="text-2xl">🎨</span>
          </div>
          <p className="text-gray-500 text-sm">No content available</p>
        </div>
      )}
    </div>
  )
}
