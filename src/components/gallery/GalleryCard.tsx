'use client'

import { Heart, Play } from 'lucide-react'
import type { Card } from '@/lib/cards'
import { buildCardPreviewAlt, buildCardPreviewTitle } from '@/lib/seo'
import { cn } from '@/lib/utils'

/**
 * Every card sits in a fixed 5:7 frame (the classic greeting card size). The frame
 * reserves space before the image loads, so appending cards never shifts the grid.
 */
export const GALLERY_GRID_CLASS = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5'

const FRAME_CLASS = 'relative aspect-[5/7] w-full overflow-hidden bg-[#FFF8F6]'

export function isVideoUrl(url?: string | null) {
  if (!url) return false
  const lowered = url.toLowerCase()
  return ['.mp4', '.mov', '.webm', '.ogg'].some((extension) => lowered.includes(extension))
}

interface CardArtworkProps {
  card: Pick<Card, 'cardType' | 'relationship' | 'r2Url'>
  priority?: boolean
  interactive?: boolean
  className?: string
}

export function CardArtwork({ card, priority, interactive, className }: CardArtworkProps) {
  const alt = buildCardPreviewAlt(card.cardType, card.relationship)
  const mediaClass = cn(
    'h-full w-full object-contain',
    interactive && 'transition-transform duration-500 group-hover:scale-[1.02]'
  )

  if (!card.r2Url) {
    return (
      <div className={cn(FRAME_CLASS, 'flex items-center justify-center text-sm text-[#8A93A6]', className)}>
        Preview unavailable
      </div>
    )
  }

  if (isVideoUrl(card.r2Url)) {
    return (
      <div className={cn(FRAME_CLASS, className)}>
        <video
          src={card.r2Url}
          muted
          loop
          playsInline
          autoPlay
          preload={priority ? 'auto' : 'metadata'}
          aria-label={alt}
          className={mediaClass}
        />
      </div>
    )
  }

  return (
    <div className={cn(FRAME_CLASS, className)}>
      {/* Card images come from several storage hosts, so next/image is not used here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.r2Url}
        alt={alt}
        width={500}
        height={700}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={mediaClass}
      />
    </div>
  )
}

interface GalleryCardProps {
  card: Card
  priority?: boolean
  liked: boolean
  likeCount: number
  onToggleLike: (cardId: string) => void
  onOpen: (card: Card) => void
}

export function GalleryCard({ card, priority, liked, likeCount, onToggleLike, onOpen }: GalleryCardProps) {
  const title = buildCardPreviewTitle(card.cardType, card.relationship)

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[#F1D6DF] bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={() => onOpen(card)}
        aria-label={`Preview: ${title}`}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
      >
        <CardArtwork card={card} priority={priority} interactive />
      </button>

      {card.premium && (
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-[#202A3D]/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          Pro
        </span>
      )}
      {isVideoUrl(card.r2Url) && (
        <span
          className="pointer-events-none absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#202A3D]/70 text-white"
          aria-hidden
        >
          <Play className="h-3 w-3 fill-current" />
        </span>
      )}

      <div className="flex items-start justify-between gap-2 px-3 pb-2.5 pt-2.5">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[#202A3D]">{title}</p>
        <button
          type="button"
          onClick={() => onToggleLike(card.id)}
          aria-pressed={liked}
          aria-label={liked ? 'Remove like' : 'Like this card'}
          className="-mr-1.5 -mt-1 flex min-h-9 shrink-0 items-center gap-1 rounded-full px-2 text-xs text-[#8A93A6] transition-colors hover:bg-[#FFF1F5] hover:text-primary"
        >
          <Heart
            className={cn('h-4 w-4 transition-transform duration-200', liked && 'scale-110 fill-primary text-primary')}
            aria-hidden
          />
          {likeCount > 0 && <span className={cn(liked && 'text-primary')}>{likeCount}</span>}
        </button>
      </div>
    </article>
  )
}

export function GallerySkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#F1D6DF]/70 bg-white" aria-hidden>
      <div className="aspect-[5/7] animate-pulse bg-[#F6E4EA]/60" />
      <div className="space-y-2 px-3 py-3">
        <div className="h-3 w-4/5 animate-pulse rounded bg-[#F6E4EA]/70" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#F6E4EA]/70" />
      </div>
    </div>
  )
}
