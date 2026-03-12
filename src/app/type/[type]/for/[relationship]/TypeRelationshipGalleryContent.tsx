'use client'

import { useEffect, useState } from 'react'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import CardGallery from '@/app/card-gallery/CardGallery'
import { SimpleFilter } from '@/components/SimpleFilter'
import { CardType } from '@/lib/card-config'
import { TabType } from '@/lib/cards'
import {
  getGalleryComboHref,
  getRelationshipLabel,
  getRelationshipValue,
  getSeoRelationshipsForType,
  hasSeoGalleryCombo,
} from '@/lib/gallery-combos'

interface Props {
  params: { type: CardType; relationship: string }
  initialCardsData: {
    cards: any[]
    totalPages: number
  }
  activeTab?: TabType
}

export default function TypeRelationshipGalleryContent({
  params,
  initialCardsData,
  activeTab = 'recent',
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = decodeURIComponent(params.type) as CardType
  const relationshipValue = getRelationshipValue(params.relationship)
  const relationshipLabel = getRelationshipLabel(relationshipValue)

  const [cardsData, setCardsData] = useState(initialCardsData)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState<TabType>(activeTab)

  useEffect(() => {
    setCardsData(initialCardsData)
    setCurrentTab(activeTab)
  }, [activeTab, initialCardsData])

  const buildQuery = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'recent') params.delete('tab')
    else params.set('tab', tab)
    return params.toString()
  }

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab)
    const query = buildQuery(tab)
    router.push(query ? `${getGalleryComboHref(type, relationshipValue)}?${query}` : getGalleryComboHref(type, relationshipValue))
  }

  const handleRelationshipChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentTab === 'recent') params.delete('tab')
    else params.set('tab', currentTab)

    if (!value) {
      const query = params.toString()
      router.push(query ? `/type/${type}/?${query}` : `/type/${type}/`)
      return
    }

    const nextRelationship = getRelationshipValue(value)
    if (hasSeoGalleryCombo(type, nextRelationship)) {
      const query = params.toString()
      const href = getGalleryComboHref(type, nextRelationship)
      router.push(query ? `${href}?${query}` : href)
      return
    }

    params.set('relationship', getRelationshipLabel(nextRelationship))
    router.push(`/type/${type}/?${params.toString()}`)
  }

  useEffect(() => {
    if (currentTab === activeTab) return

    const fetchCards = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: '1',
          pageSize: '12',
          wishCardType: type,
          relationship: relationshipLabel,
          tab: currentTab,
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
  }, [activeTab, currentTab, relationshipLabel, type])

  if (!cardsData && !isLoading) {
    notFound()
  }

  const relationshipOptions = getSeoRelationshipsForType(type).map((relationship) =>
    getRelationshipLabel(relationship)
  )

  return (
    <article className="min-h-screen">
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
        currentValue={relationshipLabel}
        type="relationship"
        onFilterChange={handleRelationshipChange}
      />

      <section aria-label={`${type} cards for ${relationshipLabel}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-500">Loading your personalized gallery...</p>
          </div>
        ) : (
          cardsData && (
            <CardGallery
              initialCardsData={cardsData}
              wishCardType={type}
              relationship={relationshipLabel}
              tabType={currentTab}
            />
          )
        )}
      </section>
    </article>
  )
}
