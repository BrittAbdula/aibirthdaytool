'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ImageViewer } from '../../components/ImageViewer'
import { Card, TabType } from '@/lib/cards'
import { CardType } from '@/lib/card-config'
import { motion } from 'framer-motion'

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
  <div className="aspect-[3/4] rounded-lg bg-gray-200 animate-pulse mb-4" />
)

export default function CardGallery({ initialCardsData, wishCardType, tabType }: CardGalleryProps) {
  const [cards, setCards] = useState<Card[]>(initialCardsData.cards)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialCardsData.totalPages)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(currentPage < totalPages)
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const observerTarget = useRef<HTMLDivElement>(null)

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

  // 将卡片分配到不同的列中
  const getColumnCards = (columnIndex: number, totalColumns: number) => {
    return cards.filter((_, index) => index % totalColumns === columnIndex)
  }

  // 根据屏幕宽度决定列数
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 2
    const width = window.innerWidth
    if (width >= 1536) return 6 // 2xl
    if (width >= 1280) return 5 // xl
    if (width >= 1024) return 4 // lg
    if (width >= 768) return 3  // md
    return 2                    // sm and default
  }

  const columnCount = getColumnCount()

  return (
    <div className="min-h-screen px-2">
      <div className="flex gap-4">
        {Array.from({ length: columnCount }).map((_, columnIndex) => (
          <div key={columnIndex} className="flex-1 flex flex-col gap-4">
            {getColumnCards(columnIndex, columnCount).map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className="w-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
                    premium={card.premium}
                  />
                </div>
              </motion.div>
            ))}
            
            {/* 加载时的骨架屏 */}
            {isLoading && columnIndex < (CARDS_PER_PAGE / columnCount) && (
              <SkeletonCard />
            )}
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