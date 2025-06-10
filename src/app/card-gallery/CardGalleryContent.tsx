'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CardGallery from '@/app/card-gallery/CardGallery'
import CardTypeFilter from '@/app/card-gallery/CardTypeFilter'
import { CardType } from '@/lib/card-config'
import { Card, TabType } from '@/lib/cards'

interface CardGalleryContentProps {
  initialCardsData: {
    cards: Card[];
    totalPages: number;
  };
  defaultType: CardType | null;
  defaultRelationship?: string | null;
  activeTab: TabType;
}

export default function CardGalleryContent({ 
  initialCardsData, 
  defaultType, 
  defaultRelationship,
  activeTab
}: CardGalleryContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedType, setSelectedType] = useState<CardType | null>(defaultType)
  const [selectedRelationship, setSelectedRelationship] = useState<string | null>(defaultRelationship || null)
  const [cardsData, setCardsData] = useState(initialCardsData)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState<TabType>(activeTab)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const handleFilterChange = ({ cardType, relationship }: { cardType: CardType | null, relationship: string | null }) => {
    setSelectedType(cardType)
    setSelectedRelationship(relationship ? relationship.charAt(0).toUpperCase() + relationship.slice(1) : null)
    
    const params = new URLSearchParams(searchParams.toString())
    if (cardType) {
      params.set('type', cardType)
    } else {
      params.delete('type')
    }
    if (relationship) {
      params.set('relationship', relationship)
    } else {
      params.delete('relationship')
    }
    router.push(`/card-gallery?${params.toString()}`)
  }

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab)
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`/card-gallery?${params.toString()}`)
  }

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: '1',
          pageSize: '12',
          tab: currentTab,
          ...(selectedType && { wishCardType: selectedType }),
          ...(selectedRelationship && { relationship: selectedRelationship })
        })
        const response = await fetch(`/api/cards?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch cards')
        const data = await response.json()
        setCardsData(data)
      } catch (error) {
        console.error('Error fetching cards:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCards()
  }, [selectedType, selectedRelationship, currentTab])

  return (
    <main className="min-h-screen">
      <div className="relative py-8 sm:py-12">
        {/* Tab Selection */}
        <div className="mb-8 flex justify-center">
          <div className="border border-purple-200 rounded-full p-1 bg-white shadow-sm">
            <div className="flex space-x-1">
              <button
                onClick={() => handleTabChange('premium')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  currentTab === 'premium'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                Premium
              </button>
              <button
                onClick={() => handleTabChange('recent')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  currentTab === 'recent'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => handleTabChange('liked')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  currentTab === 'liked'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                Weekly Liked
              </button>
              <button
                onClick={() => handleTabChange('popular')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  currentTab === 'popular'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                Popular
              </button>
            </div>
          </div>
        </div>

        <section className="mb-8">
          <CardTypeFilter 
            selectedType={selectedType}
            selectedRelationship={selectedRelationship}
            onChange={handleFilterChange}
          />
        </section>

        <section>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-gray-500">Loading cards...</p>
            </div>
          ) : (
            <CardGallery 
              initialCardsData={cardsData} 
              wishCardType={selectedType}
              tabType={currentTab}
            />
          )}
        </section>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all duration-300 z-50 flex items-center justify-center"
            aria-label="Back to top"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 10l7-7m0 0l7 7m-7-7v18" 
              />
            </svg>
          </button>
        )}
      </div>
    </main>
  )
}
