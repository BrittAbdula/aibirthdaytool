'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CardGallery from '@/app/card-gallery/CardGallery'
import CardTypeFilter from '@/app/card-gallery/CardTypeFilter'
import { CardType } from '@/lib/card-config'
import { Card } from '@/lib/cards'

interface CardGalleryContentProps {
  initialCardsData: {
    cards: Card[];
    totalPages: number;
  };
  defaultType: CardType | null;
  defaultRelationship?: string | null;
}

export default function CardGalleryContent({ initialCardsData, defaultType, defaultRelationship}: CardGalleryContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedType, setSelectedType] = useState<CardType | null>(defaultType)
  const [selectedRelationship, setSelectedRelationship] = useState<string | null>(defaultRelationship || null)
  const [cardsData, setCardsData] = useState(initialCardsData)
  const [isLoading, setIsLoading] = useState(false)

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

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: '1',
          pageSize: '12',
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
  }, [selectedType, selectedRelationship])

  return (
    <main className="min-h-screen">
      <div className="relative  py-8 sm:py-12">
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
            <CardGallery initialCardsData={cardsData} wishCardType={selectedType} />
          )}
        </section>
      </div>
    </main>
  )
}
