'use client'

import { useState, useEffect } from 'react'
import { SimpleFilter } from '@/components/SimpleFilter'
import { notFound } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import CardGallery from '@/app/card-gallery/CardGallery'
import { CardType } from '@/lib/card-config'
import { CARD_TYPES } from '@/lib/card-constants'

interface Props {
  params: { relationship: string }
  initialCardsData: {
    cards: any[]
    totalPages: number
  }
  defaultType: CardType | null
}

export default function RelationshipGalleryContent({ params, initialCardsData, defaultType }: Props) {
  const searchParams = useSearchParams()
  const relationship = decodeURIComponent(params.relationship)
    .charAt(0).toUpperCase() + decodeURIComponent(params.relationship).slice(1)
  
  const [selectedType, setSelectedType] = useState<CardType | null>(
    defaultType || (searchParams.get('type') as CardType | null)
  )
  const [cardsData, setCardsData] = useState(initialCardsData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCards = async () => {
      if (!selectedType) {
        setCardsData(initialCardsData)
        return
      }

      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: '1',
          pageSize: '12',
          relationship: relationship,
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
  }, [relationship, selectedType, initialCardsData])

  if (!cardsData && !isLoading) {
    notFound()
  }

  const typeOptions = CARD_TYPES.map(t => t.label)

  return (
    <article className="min-h-screen ">

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
            cardsData && <CardGallery initialCardsData={cardsData} wishCardType={selectedType} />
          )}
        </section>
    </article>
  )
} 