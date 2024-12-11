'use client'

import { CardType, getAllCardTypes } from '@/lib/card-config'
import { useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'

interface CardTypeFilterProps {
  selectedType: CardType | null
  onTypeChange: (type: CardType | null) => void
}

export default function CardTypeFilter({ selectedType, onTypeChange }: CardTypeFilterProps) {
  const cardTypes = getAllCardTypes()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8
      const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative group max-w-full">
      {/* Desktop Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:group-hover:flex
                 h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md
                 text-gray-700 hover:bg-white hover:text-purple-600 transition-all duration-200"
        aria-label="Scroll left"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:group-hover:flex
                 h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md
                 text-gray-700 hover:bg-white hover:text-purple-600 transition-all duration-200"
        aria-label="Scroll right"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>

      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory
                 flex gap-2 px-4 py-2 -mx-4 md:px-8 md:-mx-8"
      >
        <div className="flex gap-2 md:px-4">
          <button
            onClick={() => onTypeChange(null)}
            className={cn(
              "shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              "hover:bg-purple-50 hover:text-purple-700",
              selectedType === null
                ? "bg-purple-100 text-purple-700 shadow-sm"
                : "bg-white/80 text-gray-600"
            )}
          >
            All Cards
          </button>
          {cardTypes.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={cn(
                "shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "hover:bg-purple-50 hover:text-purple-700",
                selectedType === type
                  ? "bg-purple-100 text-purple-700 shadow-sm"
                  : "bg-white/80 text-gray-600"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
