'use client'

import { CardType, getAllCardTypes } from '@/lib/card-config'
import { useCallback } from 'react'

interface CardTypeFilterProps {
  selectedType: CardType | null
  onTypeChange: (type: CardType | null) => void
}

export default function CardTypeFilter({ selectedType, onTypeChange }: CardTypeFilterProps) {
  const cardTypes = getAllCardTypes()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === 'all') {
      onTypeChange(null)
    } else {
      onTypeChange(value as CardType)
    }
  }, [onTypeChange])

  return (
    <div className="flex items-center justify-center mb-8">
      <select
        value={selectedType === null ? 'all' : selectedType}
        onChange={handleChange}
        className="bg-white/80 backdrop-blur-sm border border-purple-200 text-gray-700 py-2 px-4 rounded-lg shadow-sm
                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                 hover:border-purple-300 transition-colors duration-200"
      >
        <option value="all">All Cards</option>
        {cardTypes.map(({ type, label }) => (
          <option key={type} value={type}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
