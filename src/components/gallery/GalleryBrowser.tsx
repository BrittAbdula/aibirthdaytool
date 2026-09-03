'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Card, GalleryCardsResult } from '@/lib/cards'
import { getCardTypeLabel } from '@/lib/gallery-combos'
import {
  buildGalleryApiUrl,
  buildGalleryHref,
  getHrefPath,
  isSamePath,
  normalizeGalleryRelationship,
  normalizeGalleryType,
  parseGalleryTab,
  type GalleryFilterState,
  type GalleryScope,
} from '@/lib/gallery-navigation'
import { GALLERY_PAGE_SIZE } from '@/lib/gallery-pagination'
import { cn } from '@/lib/utils'
import { GALLERY_GRID_CLASS, GalleryCard, GallerySkeletonCard } from './GalleryCard'
import { GalleryFilters } from './GalleryFilters'
import { GalleryPreviewDialog } from './GalleryPreviewDialog'
import { useLikedCards } from './useLikedCards'

/** Pages loaded on scroll before a "Show more" button takes over, so the footer stays reachable. */
const AUTO_LOAD_PAGES = 4
const EAGER_IMAGE_COUNT = 6

interface GalleryBrowserProps {
  initialCards: GalleryCardsResult
  scope: GalleryScope
  label?: string
}

interface Feed {
  key: string
  cards: Card[]
  page: number
  hasMore: boolean
}

function dedupeCards(cards: Card[]) {
  const seen = new Set<string>()
  return cards.filter((card) => {
    if (seen.has(card.id)) return false
    seen.add(card.id)
    return true
  })
}

async function fetchGalleryPage(url: string): Promise<GalleryCardsResult> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Gallery request failed (${response.status})`)
  return (await response.json()) as GalleryCardsResult
}

function EmptyState({ type }: { type: string | null }) {
  const typeLabel = type ? getCardTypeLabel(type).toLowerCase() : null
  return (
    <div className="rounded-2xl border border-dashed border-[#E8CDD6] bg-white/70 px-6 py-14 text-center">
      <p className="font-serif text-2xl font-semibold text-[#202A3D]">No public cards here yet.</p>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">
        {typeLabel ? `Make the first ${typeLabel} card and share it.` : 'Try another occasion, or make the first one.'}
      </p>
      <Link
        href={type ? `/${type}/` : '/birthday/'}
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
      >
        Make a card
      </Link>
    </div>
  )
}

/**
 * Shared gallery UI for /card-gallery/, /type/x/, /relationship/y/ and /type/x/for/y/.
 * The URL is the single source of truth: filters that have a static route navigate to
 * it, everything else lives in query params. The grid is never unmounted while data
 * loads, and every card reserves its frame, so nothing reflows.
 */
export function GalleryBrowser({ initialCards, scope, label = 'Card gallery' }: GalleryBrowserProps) {
  const router = useRouter()
  const pathname = usePathname() || '/'
  const searchParams = useSearchParams()

  const tab = parseGalleryTab(searchParams.get('tab'))
  const type = scope.type ?? normalizeGalleryType(searchParams.get('type'))
  const relationship = scope.relationship ?? normalizeGalleryRelationship(searchParams.get('relationship'))
  const isDefaultView = tab === 'featured' && type === scope.type && relationship === scope.relationship
  const feedKey = `${tab}|${type ?? ''}|${relationship ?? ''}`

  const [feed, setFeed] = useState<Feed>({
    key: feedKey,
    cards: initialCards.cards,
    page: 1,
    hasMore: initialCards.hasMore,
  })
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)
  const [autoLoads, setAutoLoads] = useState(0)
  const [previewCard, setPreviewCard] = useState<Card | null>(null)
  const { isLiked, toggle, delta } = useLikedCards()

  const requestId = useRef(0)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<() => Promise<boolean>>(async () => false)
  const autoLoadsRef = useRef(0)

  // Page 1: the default view uses server-rendered data; any other view fetches while
  // the previous grid stays visible.
  useEffect(() => {
    const id = ++requestId.current
    autoLoadsRef.current = 0
    setAutoLoads(0)
    setError(null)

    if (isDefaultView) {
      setFeed({ key: feedKey, cards: initialCards.cards, page: 1, hasMore: initialCards.hasMore })
      setRefreshing(false)
      return
    }

    let cancelled = false
    setRefreshing(true)
    fetchGalleryPage(buildGalleryApiUrl({ page: 1, tab, type, relationship }))
      .then((data) => {
        if (cancelled || id !== requestId.current) return
        setFeed({ key: feedKey, cards: data.cards, page: 1, hasMore: data.hasMore })
      })
      .catch((fetchError) => {
        if (cancelled || id !== requestId.current) return
        console.error('Error loading gallery:', fetchError)
        setError('Could not load cards.')
      })
      .finally(() => {
        if (!cancelled && id === requestId.current) setRefreshing(false)
      })

    return () => {
      cancelled = true
    }
  }, [feedKey, isDefaultView, initialCards, tab, type, relationship, retryToken])

  const loadMore = useCallback(async () => {
    if (loadingMore || refreshing || !feed.hasMore || feed.key !== feedKey) return false
    const id = requestId.current
    const nextPage = feed.page + 1
    setLoadingMore(true)
    setError(null)
    try {
      const data = await fetchGalleryPage(buildGalleryApiUrl({ page: nextPage, tab, type, relationship }))
      if (id !== requestId.current) return false
      setFeed((previous) =>
        previous.key !== feedKey
          ? previous
          : { ...previous, cards: dedupeCards([...previous.cards, ...data.cards]), page: nextPage, hasMore: data.hasMore }
      )
    } catch (fetchError) {
      if (id === requestId.current) {
        console.error('Error loading more cards:', fetchError)
        setError('Could not load more cards.')
      }
    } finally {
      setLoadingMore(false)
    }
    return true
  }, [feed.hasMore, feed.key, feed.page, feedKey, loadingMore, refreshing, tab, type, relationship])

  useEffect(() => {
    loadMoreRef.current = loadMore
  }, [loadMore])

  // One observer for the life of the component; it reads the latest loader through a ref.
  useEffect(() => {
    const node = sentinelRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        if (autoLoadsRef.current >= AUTO_LOAD_PAGES) return
        void loadMoreRef.current().then((started) => {
          if (!started) return
          autoLoadsRef.current += 1
          setAutoLoads(autoLoadsRef.current)
        })
      },
      { rootMargin: '900px 0px' }
    )
    observer.observe(node)
    observerRef.current = observer
    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [])

  // After cards are appended the sentinel may still sit inside the margin without a new
  // intersection event; re-observing asks the browser for a fresh entry.
  useEffect(() => {
    const observer = observerRef.current
    const node = sentinelRef.current
    if (!observer || !node || loadingMore) return
    observer.unobserve(node)
    observer.observe(node)
  }, [feed.cards.length, loadingMore])

  const navigate = useCallback(
    (next: GalleryFilterState) => {
      const href = buildGalleryHref(next)
      if (isSamePath(getHrefPath(href), pathname)) {
        // Same route: update the URL in place. Next syncs useSearchParams with the
        // History API, so tab and query filters skip the server round trip.
        window.history.replaceState(null, '', href)
      } else {
        router.push(href)
      }
    },
    [pathname, router]
  )

  const retry = () => {
    if (feed.key !== feedKey) setRetryToken((token) => token + 1)
    else void loadMore()
  }

  const showSkeletonGrid = refreshing && feed.cards.length === 0
  const showEmpty = !refreshing && feed.cards.length === 0
  const showMoreButton = feed.hasMore && !loadingMore && !refreshing && autoLoads >= AUTO_LOAD_PAGES

  return (
    <section aria-label={label} className="flex flex-col gap-5">
      <GalleryFilters
        tab={tab}
        type={type}
        relationship={relationship}
        onTabChange={(nextTab) => navigate({ type, relationship, tab: nextTab })}
        onTypeChange={(nextType) => navigate({ type: nextType, relationship, tab })}
        onRelationshipChange={(nextRelationship) => navigate({ type, relationship: nextRelationship, tab })}
      />

      <div aria-busy={refreshing || loadingMore} className="relative">
        {showSkeletonGrid ? (
          <ul className={GALLERY_GRID_CLASS} aria-label="Loading cards">
            {Array.from({ length: GALLERY_PAGE_SIZE }, (_, index) => (
              <li key={`skeleton-${index}`}>
                <GallerySkeletonCard />
              </li>
            ))}
          </ul>
        ) : showEmpty ? (
          <EmptyState type={type} />
        ) : (
          <ul
            className={cn(
              GALLERY_GRID_CLASS,
              'transition-opacity duration-200',
              refreshing && 'pointer-events-none opacity-50'
            )}
          >
            {feed.cards.map((card, index) => (
              <li key={card.id}>
                <GalleryCard
                  card={card}
                  priority={index < EAGER_IMAGE_COUNT}
                  liked={isLiked(card.id)}
                  likeCount={(card.like_count ?? 0) + (delta[card.id] ?? 0)}
                  onToggleLike={toggle}
                  onOpen={setPreviewCard}
                />
              </li>
            ))}
            {loadingMore &&
              Array.from({ length: GALLERY_PAGE_SIZE }, (_, index) => (
                <li key={`skeleton-${index}`}>
                  <GallerySkeletonCard />
                </li>
              ))}
          </ul>
        )}
        <div ref={sentinelRef} aria-hidden className="h-px" />
      </div>

      <div className="flex min-h-11 flex-col items-center justify-center gap-2 text-center" aria-live="polite">
        {error && (
          <p role="alert" className="text-sm text-[#9E405E]">
            {error}{' '}
            <button type="button" onClick={retry} className="font-semibold underline underline-offset-4">
              Try again
            </button>
          </p>
        )}
        {showMoreButton && (
          <button
            type="button"
            onClick={() => void loadMore()}
            className="inline-flex min-h-11 items-center rounded-full border border-[#F1D6DF] bg-white px-6 text-sm font-semibold text-[#202A3D] transition-colors hover:border-primary/40 hover:bg-[#FFF1F5]"
          >
            Show more cards
          </button>
        )}
        {!feed.hasMore && feed.cards.length > 0 && !refreshing && (
          <p className="text-sm text-[#8A93A6]">That is every public card here.</p>
        )}
      </div>

      <GalleryPreviewDialog
        card={previewCard}
        open={previewCard !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewCard(null)
        }}
      />
    </section>
  )
}
