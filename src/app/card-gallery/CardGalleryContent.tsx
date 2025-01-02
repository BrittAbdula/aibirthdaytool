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
}

export default function CardGalleryContent({ initialCardsData, defaultType }: CardGalleryContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedType, setSelectedType] = useState<CardType | null>(defaultType)
  const [cardsData, setCardsData] = useState(initialCardsData)
  const [isLoading, setIsLoading] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const handleTypeChange = (type: CardType | null) => {
    setSelectedType(type)
    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    if (type) {
      params.set('type', type)
    } else {
      params.delete('type')
    }
    router.push(`/card-gallery?${params.toString()}`)
  }

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/cards?page=1&pageSize=12&wishCardType=${selectedType || ''}`)
        if (!response.ok) throw new Error('Failed to fetch cards')
        const data = await response.json()
        setCardsData(data)
      } catch (error) {
        console.error('Error fetching cards:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedType !== null) {
      fetchCards()
    } else {
      setCardsData(initialCardsData)
    }
  }, [selectedType, initialCardsData])

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 -left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Section */}
        <header className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Card Templates
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Create your own mewtru card with our collection of ai generated cards ✨
          </p>
        </header>

        {/* Filter Section */}
        <section className="mb-4">
          <CardTypeFilter selectedType={selectedType} onTypeChange={handleTypeChange} />
        </section>

        {/* Gallery Section */}
        <section className="mb-16">
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

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 z-50`}
        aria-label="Back to top"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </main>
  )
}
