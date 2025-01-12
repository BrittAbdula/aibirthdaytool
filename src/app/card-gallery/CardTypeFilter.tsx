'use client'

import { CardType, getAllCardTypes } from '@/lib/card-config'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'

interface CardTypeFilterProps {
  selectedType: CardType | null
  selectedRelationship: string | null
  onChange: (type: { cardType: CardType | null, relationship: string | null }) => void
}

const RELATIONSHIPS = [
  { value: 'Friend', label: 'Friend' },           // 3362
  { value: 'Sister', label: 'Sister' },           // 946
  { value: 'Girlfriend', label: 'Girlfriend' },   // 690
  { value: 'Husband', label: 'Husband' },         // 687
  { value: 'Wife', label: 'Wife' },               // 658
  { value: 'Brother', label: 'Brother' },         // 545
  { value: 'Partner', label: 'Partner' },         // 520
  { value: 'Boyfriend', label: 'Boyfriend' },     // 419
  { value: 'Mother', label: 'Mother' },           // 333
  { value: 'Father', label: 'Father' },           // 304
  { value: 'Daughter', label: 'Daughter' },       // 262
  { value: 'Myself', label: 'Myself' },           // 216
  { value: 'Crush', label: 'Crush' },             // 74
  { value: 'Spouse', label: 'Spouse' },           // 46
  { value: 'Grandparent', label: 'Grandparent' }, // 36
  { value: 'Student', label: 'Student' },         // 7
  { value: 'Classmate', label: 'Classmate' },     // 3
  { value: 'Son', label: 'Son' },                 // 1
  { value: 'Other', label: 'Other' },             // 622
]
export default function CardTypeFilter({ 
  selectedType, 
  selectedRelationship,
  onChange 
}: CardTypeFilterProps) {
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
    <div className="space-y-2">
      {/* Card Types Filter */}
      <div className="relative group max-w-full">
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

        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory
                   flex gap-2 px-4 md:px-8 md:-mx-8"
        >
          <div className="flex gap-2 md:px-4">
            <button
              onClick={() => onChange({ cardType: null, relationship: selectedRelationship })}
              className={cn(
                "shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "hover:bg-purple-50 hover:text-purple-700",
                selectedType === null
                  ? "bg-purple-100 text-purple-700 shadow-sm"
                  : "bg-white/80 text-gray-600"
              )}
            >
              All Types
            </button>
            {cardTypes.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => onChange({ cardType: type, relationship: selectedRelationship })}
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

      {/* Relationship Filter */}
      <div className="flex gap-2 px-4 md:px-12 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onChange({ cardType: selectedType, relationship: null })}
          className={cn(
            "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            "hover:bg-purple-50 hover:text-purple-700",
            selectedRelationship === null
              ? "bg-purple-100 text-purple-700 shadow-sm"
              : "bg-white/80 text-gray-600"
          )}
        >
          All Relationships
        </button>
        {RELATIONSHIPS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange({ cardType: selectedType, relationship: value })}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              "hover:bg-purple-50 hover:text-purple-700",
              selectedRelationship === value
                ? "bg-purple-100 text-purple-700 shadow-sm"
                : "bg-white/80 text-gray-600"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
