'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Card, TabType } from '@/lib/cards'
import { CardType } from '@/lib/card-config'
import { motion } from 'framer-motion'
import { Crown, Heart, ThumbsUp } from 'lucide-react'
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
  <div className="aspect-[3/4] w-full rounded-lg bg-gray-200 animate-pulse" />
)

const isVideoUrl = (url?: string | null) => {
  if (!url) return false
  const lowered = url.toLowerCase()
  return ['.mp4', '.mov', '.avi', '.webm', '.ogg'].some(ext => lowered.includes(ext))
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
    // hydrate likes from localStorage for visible cards
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

  const toggleLike = (cardId: string) => {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: "easeOut"
            }}
            className="group w-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-purple-100/40"
          >
            <div className="w-full relative">
              <Link
                href={`/to/${card.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                aria-label={`Open card ${card.id} in a new tab`}
              >
                <div className="aspect-[3/4] w-full relative overflow-hidden bg-gray-50">
                  {card.r2Url ? (
                    isVideoUrl(card.r2Url) ? (
                      <video
                        src={card.r2Url}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={card.r2Url}
                        alt={`MewTruCard ${card.cardType}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                      Preview unavailable
                    </div>
                  )}
                </div>
              </Link>

              {card.premium && (
                <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-purple-600/90 px-3 py-1 text-xs font-semibold text-white">
                  <Crown className="h-3.5 w-3.5" />
                  Premium
                </div>
              )}

            </div>

            {/* Metadata + actions */}
            <div className="px-4 pt-3 pb-4 space-y-2 border-t border-purple-50 bg-gradient-to-b from-white to-purple-50/30">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                  {getTypeLabel(card.cardType)}
                </span>
                {getRelationshipLabel(card.relationship) && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-pink-100 text-pink-700">
                    {getRelationshipLabel(card.relationship)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                {card.message ? (
                  <p className="text-xs text-gray-600 truncate" title={card.message || undefined}>
                    {card.message}
                  </p>
                ) : (
                  <span className="text-[11px] text-gray-400">Tap to preview</span>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleLike(card.id)}
                    aria-label={likedMap[card.id] ? 'Unlike' : 'Like'}
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
                      likedMap[card.id]
                        ? 'border-rose-200 bg-rose-50 text-rose-500'
                        : 'border-purple-100 bg-white/85 text-gray-500'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${likedMap[card.id] ? 'fill-rose-500' : ''}`} />
                  </button>
                  {typeof card.like_count === 'number' && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Heart className="w-3 h-3" />
                      {card.like_count}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={`skeleton-${idx}`} />
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
