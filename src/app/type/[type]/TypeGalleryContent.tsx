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
}

export default function TypeGalleryContent({ params }: Props) {
  const searchParams = useSearchParams()
  const type = decodeURIComponent(params.type) as CardType
  
  const [selectedRelationship, setSelectedRelationship] = useState<string | null>(
    searchParams.get('relationship') 
  )
  const [cardsData, setCardsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    const fetchCards = async () => {
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
  }, [type, selectedRelationship])

  if (!cardsData && !isLoading) {
    notFound()
  }

  const relationshipOptions = RELATIONSHIPS.map(r => r.label)

  return (
    <article className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {type} Cards
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-6">
            Create your perfect {type.toLowerCase()} card with our AI-powered collection ✨
          </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="px-3 py-1 bg-purple-50 rounded-full">💝 Personalized Messages</span>
              <span className="px-3 py-1 bg-purple-50 rounded-full">🎨 Unique Designs</span>
              <span className="px-3 py-1 bg-purple-50 rounded-full">✨ AI-Powered</span>
              <span className="px-3 py-1 bg-purple-50 rounded-full">❤️ From the Heart</span>
            </div>
        </header>

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
      </div>
    </article>
  )
} 