'use client'

import { useState, useEffect } from 'react'
import { SimpleFilter } from '@/components/SimpleFilter'
import { notFound } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import CardGallery from '@/app/card-gallery/CardGallery'
import { CardType } from '@/lib/card-config'
import { RELATIONSHIPS } from '@/lib/card-constants'

interface Props {
  params: { type: CardType }
  initialCardsData: {
    cards: any[]
    totalPages: number
  }
  defaultRelationship: string | null
}

export default function TypeGalleryContent({ params, initialCardsData, defaultRelationship }: Props) {
  const searchParams = useSearchParams()
  const type = decodeURIComponent(params.type) as CardType
  
  const [selectedRelationship, setSelectedRelationship] = useState<string | null>(
    defaultRelationship || searchParams.get('relationship')
  )
  const [cardsData, setCardsData] = useState(initialCardsData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCards = async () => {
      if (!selectedRelationship) {
        setCardsData(initialCardsData)
        return
      }

      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: '1',
          pageSize: '12',
          wishCardType: type,
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
  }, [type, selectedRelationship, initialCardsData])

  if (!cardsData && !isLoading) {
    notFound()
  }

  const relationshipOptions = RELATIONSHIPS.map(r => r.label)

  return (
    <article className="min-h-screen ">

        <SimpleFilter
          options={relationshipOptions}
          currentValue={selectedRelationship}
          type="relationship"
          onFilterChange={setSelectedRelationship}
        />

        <section aria-label={`${type} Card Gallery`}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-gray-500">Loading your personalized gallery...</p>
            </div>
          ) : (
            cardsData && <CardGallery initialCardsData={cardsData} wishCardType={type} />
          )}
        </section>
    </article>
  )
} 