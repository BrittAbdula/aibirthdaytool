import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SimpleFilterProps {
  options: string[]
  currentValue: string | null
  type: 'relationship' | 'type'
  onFilterChange: (value: string | null) => void
}

export function SimpleFilter({ options, currentValue, type, onFilterChange }: SimpleFilterProps) {
  return (
    <div className="w-full mb-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            key="all"
            variant="outline"
            className={cn(
              "rounded-full hover:bg-[#a786ff]/10",
              !currentValue && "bg-[#a786ff]/20"
            )}
            onClick={() => onFilterChange(null)}
          >
            All {type === 'relationship' ? 'Relationships' : 'Types'}
          </Button>
          {options.map((option) => (
            <Button
              key={option}
              variant="outline"
              className={cn(
                "rounded-full hover:bg-[#a786ff]/10",
                currentValue === option && "bg-[#a786ff]/20"
              )}
              onClick={() => onFilterChange(option.charAt(0).toUpperCase() + option.slice(1))}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
} 