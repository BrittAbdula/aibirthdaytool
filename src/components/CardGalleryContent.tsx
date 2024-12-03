'use client'

import { Suspense } from 'react'
import CardGallery from '@/components/CardGallery'
import CardTypeFilter from '@/components/CardTypeFilter'
import { CardType } from '@/lib/card-config'
import { useState } from 'react'

interface CardGalleryContentProps {
  initialCardsData: any
}

export default function CardGalleryContent({ initialCardsData }: CardGalleryContentProps) {
  const [selectedType, setSelectedType] = useState<CardType | null>(null)

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
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Card Gallery
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Discover beautiful cards created with AI magic. Customize and share with your loved ones ✨
          </p>
        </header>

        {/* Filter Section */}
        <CardTypeFilter selectedType={selectedType} onTypeChange={setSelectedType} />

        {/* Gallery Section */}
        <section className="mb-16">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-8">
            <Suspense 
              fallback={
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  <p className="text-gray-500">Loading gallery...</p>
                </div>
              }
            >
              <CardGallery initialCardsData={initialCardsData} wishCardType={selectedType} />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  )
}
