'use client'

import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CARD_TYPES, RELATIONSHIPS } from '@/lib/card-constants'
import { GALLERY_TABS, PRIMARY_GALLERY_TYPES, type GalleryTab } from '@/lib/gallery-navigation'
import { cn } from '@/lib/utils'

interface GalleryFiltersProps {
  tab: GalleryTab
  type: string | null
  relationship: string | null
  onTabChange: (tab: GalleryTab) => void
  onTypeChange: (type: string | null) => void
  onRelationshipChange: (relationship: string | null) => void
}

const ANYONE = 'anyone'

const chipClass =
  'inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
const chipIdle = 'border-[#F1D6DF] bg-white text-[#47536B] hover:border-primary/40 hover:text-[#202A3D]'
const chipActive = 'border-[#202A3D] bg-[#202A3D] text-white'

const primaryTypes = PRIMARY_GALLERY_TYPES.map((type) => CARD_TYPES.find((cardType) => cardType.type === type)).filter(
  (cardType): cardType is (typeof CARD_TYPES)[number] => Boolean(cardType)
)
const moreTypes = CARD_TYPES.filter((cardType) => !PRIMARY_GALLERY_TYPES.includes(cardType.type))

function relationshipOptionLabel(value: string, label: string) {
  if (value === 'myself') return 'For myself'
  if (value === 'other') return 'For someone else'
  return `For ${label.toLowerCase()}`
}

export function GalleryFilters({
  tab,
  type,
  relationship,
  onTabChange,
  onTypeChange,
  onRelationshipChange,
}: GalleryFiltersProps) {
  const selectedMoreType = moreTypes.find((cardType) => cardType.type === type)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div
          role="tablist"
          aria-label="Sort cards"
          className="inline-flex w-full rounded-full border border-[#F1D6DF] bg-white p-1 md:w-auto"
        >
          {GALLERY_TABS.map((item) => {
            const selected = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'min-h-9 flex-1 rounded-full px-3 text-sm font-semibold transition-colors md:flex-none md:px-5',
                  selected ? 'bg-[#202A3D] text-white shadow-sm' : 'text-[#47536B] hover:bg-[#FFF1F5] hover:text-[#202A3D]'
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <Select value={relationship ?? ANYONE} onValueChange={(value) => onRelationshipChange(value === ANYONE ? null : value)}>
          <SelectTrigger
            aria-label="Filter by recipient"
            className="h-10 w-full rounded-full border-[#F1D6DF] bg-white px-4 text-sm font-semibold text-[#202A3D] shadow-none focus:ring-2 focus:ring-primary/40 md:w-56"
          >
            <SelectValue placeholder="For anyone" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-[#F1D6DF] bg-white">
            <SelectItem value={ANYONE}>For anyone</SelectItem>
            {RELATIONSHIPS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {relationshipOptionLabel(item.value, item.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        role="group"
        aria-label="Filter by occasion"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:px-0"
      >
        <button
          type="button"
          onClick={() => onTypeChange(null)}
          aria-pressed={type === null}
          className={cn(chipClass, type === null ? chipActive : chipIdle)}
        >
          All occasions
        </button>
        {primaryTypes.map((cardType) => {
          const selected = type === cardType.type
          return (
            <button
              key={cardType.type}
              type="button"
              onClick={() => onTypeChange(cardType.type)}
              aria-pressed={selected}
              className={cn(chipClass, selected ? chipActive : chipIdle)}
            >
              {cardType.label}
            </button>
          )
        })}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            aria-label="More occasions"
            className={cn(chipClass, 'gap-1', selectedMoreType ? chipActive : chipIdle)}
          >
            {selectedMoreType ? selectedMoreType.label : 'More'}
            <ChevronDown className="h-4 w-4" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="grid w-64 grid-cols-2 gap-0.5 rounded-xl border-[#F1D6DF] bg-white p-2">
            {moreTypes.map((cardType) => (
              <DropdownMenuItem
                key={cardType.type}
                onSelect={() => onTypeChange(cardType.type)}
                className={cn(
                  'rounded-lg px-2 py-2 text-sm text-[#202A3D] focus:bg-[#FFF1F5]',
                  type === cardType.type && 'bg-[#FFF1F5] font-semibold text-primary'
                )}
              >
                {cardType.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
