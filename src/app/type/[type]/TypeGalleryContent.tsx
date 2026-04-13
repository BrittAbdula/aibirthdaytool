'use client'

import { useState, useEffect } from 'react'
import { SimpleFilter } from '@/components/SimpleFilter'
import { notFound, useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import CardGallery from '@/app/card-gallery/CardGallery'
import { CardType } from '@/lib/card-config'
import { RELATIONSHIPS } from '@/lib/card-constants'
import { TabType } from '@/lib/cards'
import { getGalleryComboHref, getRelationshipLabel, getRelationshipValue, hasSeoGalleryCombo } from '@/lib/gallery-combos'

interface Props {
  params: { type: CardType }
  initialCardsData: {
    cards: any[]
    totalPages: number
  }
  defaultRelationship: string | null
  activeTab?: TabType
}

export default function TypeGalleryContent({ 
  params, 
  initialCardsData, 
  defaultRelationship,
  activeTab = 'recent'
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = decodeURIComponent(params.type) as CardType
  const relationshipFromQuery = searchParams.get('relationship')
  
  const [selectedRelationship, setSelectedRelationship] = useState<string | null>(
    defaultRelationship || (relationshipFromQuery ? getRelationshipLabel(relationshipFromQuery) : null)
  )
  const [cardsData, setCardsData] = useState(initialCardsData)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState<TabType>(
    (searchParams.get('tab') as TabType) || activeTab
  )

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab)
    
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'recent') params.delete('tab')
    else params.set('tab', tab)
    const query = params.toString()
    router.push(query ? `/type/${type}?${query}` : `/type/${type}/`)
  }

  const handleRelationshipChange = (value: string | null) => {
    setSelectedRelationship(value)

    const params = new URLSearchParams(searchParams.toString())
    if (currentTab === 'recent') params.delete('tab')
    else params.set('tab', currentTab)

    if (!value) {
      params.delete('relationship')
      const query = params.toString()
      router.push(query ? `/type/${type}?${query}` : `/type/${type}/`)
      return
    }

    const relationshipValue = getRelationshipValue(value)
    if (hasSeoGalleryCombo(type, relationshipValue)) {
      const query = params.toString()
      const href = getGalleryComboHref(type, relationshipValue)
      router.push(query ? `${href}?${query}` : href)
      return
    }

    params.set('relationship', value)
    router.push(`/type/${type}?${params.toString()}`)
  }

  useEffect(() => {
    const isDefaultState =
      currentTab === activeTab &&
      (selectedRelationship ?? null) === (defaultRelationship ?? null)

    if (isDefaultState) {
      setCardsData(initialCardsData)
      setIsLoading(false)
      return
    }

    const fetchCards = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: '1',
          pageSize: '12',
          wishCardType: type,
          tab: currentTab,
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
  }, [activeTab, currentTab, defaultRelationship, initialCardsData, selectedRelationship, type])

  if (!cardsData && !isLoading) {
    notFound()
  }

  const relationshipOptions = RELATIONSHIPS.map(r => r.label)

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
            <button
              onClick={() => handleTabChange('liked')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                currentTab === 'liked'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              Most Liked
            </button>
          </div>
        </div>
      </div>

      <SimpleFilter
        options={relationshipOptions}
        currentValue={selectedRelationship}
        type="relationship"
        onFilterChange={handleRelationshipChange}
      />

      <section aria-label={`${type} Card Gallery`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-500">Loading your personalized gallery...</p>
          </div>
        ) : (
          cardsData && <CardGallery 
            initialCardsData={cardsData} 
            wishCardType={type} 
            relationship={selectedRelationship}
            tabType={currentTab}
          />
        )}
      </section>
    </article>
  )
} 
