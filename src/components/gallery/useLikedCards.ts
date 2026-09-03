'use client'

import { useCallback, useEffect, useState } from 'react'
import { recordUserAction } from '@/lib/action'

const STORAGE_KEY = 'likedCards'

function readLikedCards(): Record<string, true> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Likes are stored per browser. `delta` tracks likes toggled in this session so the
 * displayed count moves without double counting likes already in the server total.
 */
export function useLikedCards() {
  const [liked, setLiked] = useState<Record<string, true>>({})
  const [delta, setDelta] = useState<Record<string, number>>({})

  useEffect(() => {
    setLiked(readLikedCards())
  }, [])

  const toggle = useCallback((cardId: string) => {
    const next = readLikedCards()
    const willLike = !next[cardId]
    if (willLike) next[cardId] = true
    else delete next[cardId]
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
    setLiked(next)
    setDelta((previous) => ({ ...previous, [cardId]: (previous[cardId] ?? 0) + (willLike ? 1 : -1) }))
    if (willLike) {
      recordUserAction(cardId, 'up').catch(() => {})
    }
  }, [])

  const isLiked = useCallback((cardId: string) => Boolean(liked[cardId]), [liked])

  return { isLiked, toggle, delta }
}
