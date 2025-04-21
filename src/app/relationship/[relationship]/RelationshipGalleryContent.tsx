'use client'

import { useState, useEffect } from 'react'
import { SimpleFilter } from '@/components/SimpleFilter'
import { notFound, useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import CardGallery from '@/app/card-gallery/CardGallery'
import { CardType } from '@/lib/card-config'
import { CARD_TYPES } from '@/lib/card-constants'
import { TabType } from '@/lib/cards'

interface Props {
  params: { relationship: string }
  initialCardsData: {
    cards: any[]
    totalPages: number
  }
  defaultType: CardType | null
  activeTab?: TabType
}

export default function RelationshipGalleryContent({ 
  params, 
  initialCardsData, 
  defaultType,
  activeTab = 'recent'
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const relationship = decodeURIComponent(params.relationship)
    .charAt(0).toUpperCase() + decodeURIComponent(params.relationship).slice(1)
  
  const [selectedType, setSelectedType] = useState<CardType | null>(
    defaultType || (searchParams.get('type') as CardType | null)
  )
  const [cardsData, setCardsData] = useState(initialCardsData)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState<TabType>(
    (searchParams.get('tab') as TabType) || activeTab
  )

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab)
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`/relationship/${relationship.toLowerCase()}?${params.toString()}`)
  }

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: '1',
          pageSize: '12',
          relationship: relationship,
          tab: currentTab,
          ...(selectedType && { wishCardType: selectedType })
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
  }, [relationship, selectedType, currentTab])

  if (!cardsData && !isLoading) {
    notFound()
  }

  const typeOptions = CARD_TYPES.map(t => t.label)

  return (
    <article className="min-h-screen">
      {/* Tab Selection */}
      <div className="mb-8 flex justify-center">
        <div className="border border-purple-200 rounded-full p-1 bg-white shadow-sm">
          <div className="flex space-x-1">
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

      <SimpleFilter
        options={typeOptions}
        currentValue={selectedType}
        type="type"
        onFilterChange={setSelectedType}
      />

      <section aria-label={`${relationship} Card Gallery`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-500">Loading your personalized gallery...</p>
          </div>
        ) : (
          cardsData && <CardGallery 
            initialCardsData={cardsData} 
            wishCardType={selectedType} 
            tabType={currentTab}
          />
        )}
      </section>
    </article>
  )
} 