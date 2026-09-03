'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2, Plus, Search, SendHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ALL_MAKERS_HREF, matchCardMakers, type CardMaker } from '@/lib/nav-config'
import { cn } from '@/lib/utils'

// Unmatched searches are reported so new makers can be prioritised.
async function reportMissingGenerator(searchTerm: string) {
  try {
    const response = await fetch('/api/report-missing-generator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchTerm }),
    })
    return response.ok
  } catch (error) {
    console.error('Error reporting missing generator:', error)
    return false
  }
}

function useGeneratorSearch(cardMakers: CardMaker[]) {
  const [term, setTerm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requested, setRequested] = useState(false)
  const reportTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const matches = useMemo(() => matchCardMakers(cardMakers, term), [cardMakers, term])

  // Report a miss once the user has paused typing for a few seconds.
  useEffect(() => {
    if (reportTimeout.current) clearTimeout(reportTimeout.current)
    const query = term.trim()
    if (matches.length === 0 && query.length >= 3) {
      reportTimeout.current = setTimeout(() => {
        void reportMissingGenerator(query)
      }, 3000)
    }
    return () => {
      if (reportTimeout.current) clearTimeout(reportTimeout.current)
    }
  }, [term, matches.length])

  const updateTerm = (value: string) => {
    setTerm(value)
    setRequested(false)
  }

  const request = async () => {
    const query = term.trim()
    if (query.length < 2 || submitting) return
    setSubmitting(true)
    try {
      await reportMissingGenerator(query)
      setRequested(true)
    } finally {
      setSubmitting(false)
    }
  }

  return { term, updateTerm, matches, submitting, requested, request }
}

interface SearchPanelProps {
  onNavigate?: () => void
  autoFocus?: boolean
  className?: string
  /** Popover mode lists every maker before typing; the inline drawer stays compact. */
  listWhenEmpty?: boolean
  cardMakers: CardMaker[]
}

function SearchPanel({ onNavigate, autoFocus, className, listWhenEmpty = true, cardMakers }: SearchPanelProps) {
  const router = useRouter()
  const search = useGeneratorSearch(cardMakers)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (search.matches.length > 0) {
      onNavigate?.()
      router.push(`/${search.matches[0].slug}/`)
      return
    }
    void search.request()
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="relative" role="search">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A93A6]"
          aria-hidden
        />
        <Input
          type="search"
          value={search.term}
          onChange={(event) => search.updateTerm(event.target.value)}
          placeholder="Search occasions: birthday, sorry, wedding"
          aria-label="Search card makers"
          autoFocus={autoFocus}
          autoComplete="off"
          className="h-11 rounded-xl border-[#F1D6DF] bg-white pl-9 pr-11 text-base focus-visible:ring-primary/30"
        />
        <button
          type="submit"
          aria-label="Open the first matching maker"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-primary transition-colors hover:bg-[#FFF1F5]"
        >
          <SendHorizontal className="h-4 w-4" aria-hidden />
        </button>
      </form>

      {(listWhenEmpty || search.term.trim().length > 0) && (
      <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-[#F1D6DF]/70 bg-white">
        {search.requested ? (
          <div className="px-4 py-6 text-center">
            <p className="font-serif text-lg text-[#202A3D]">Thanks, noted.</p>
            <p className="mt-1 text-sm text-[#6B7280]">A &ldquo;{search.term.trim()}&rdquo; maker is on the list.</p>
          </div>
        ) : search.matches.length > 0 ? (
          <ul className="py-1">
            {search.matches.map((generator) => (
              <li key={generator.slug}>
                <Link
                  href={`/${generator.slug}/`}
                  onClick={onNavigate}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#202A3D] transition-colors hover:bg-[#FFF1F5]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F1D6DF]" aria-hidden />
                  {generator.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-[#6B7280]">No maker for &ldquo;{search.term.trim()}&rdquo; yet.</p>
            <button
              type="button"
              onClick={() => void search.request()}
              disabled={search.submitting || search.term.trim().length < 2}
              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/30 px-4 text-sm font-semibold text-primary transition-colors hover:bg-[#FFF1F5] disabled:opacity-50"
            >
              {search.submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
              Request this maker
            </button>
          </div>
        )}
      </div>
      )}

      <Link
        href={ALL_MAKERS_HREF}
        onClick={onNavigate}
        className="mt-2 block text-center text-sm font-semibold text-primary hover:underline"
      >
        All card makers
      </Link>
    </div>
  )
}

/** Desktop: icon button that opens the search in a popover. */
export function GeneratorSearchButton({ className, cardMakers }: { className?: string; cardMakers: CardMaker[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Search card makers"
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-full text-[#47536B] transition-colors hover:bg-[#FFF1F5] hover:text-[#202A3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
            className
          )}
        >
          <Search className="h-5 w-5" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[22rem] rounded-2xl border-[#F1D6DF] bg-white p-3 shadow-xl"
      >
        <SearchPanel autoFocus onNavigate={() => setOpen(false)} cardMakers={cardMakers} />
      </PopoverContent>
    </Popover>
  )
}

/** Mobile: rendered inline at the top of the menu drawer. */
export function GeneratorSearchInline({ onNavigate, cardMakers }: { onNavigate?: () => void; cardMakers: CardMaker[] }) {
  return <SearchPanel onNavigate={onNavigate} listWhenEmpty={false} cardMakers={cardMakers} />
}
