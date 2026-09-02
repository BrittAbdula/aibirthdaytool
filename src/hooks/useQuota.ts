"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export interface QuotaSnapshot {
  signedIn: boolean
  tier?: string
  /** True for subscribers and for anyone holding pack credits. */
  hasPaidAccess: boolean
  unlimited: boolean
  cardsRemaining: number | null
  dailyRemaining?: number | null
  dailyAllowance: number | null
  packRemaining: number
  canEarnAdReward: boolean
  adRewardsLeftToday?: number
  label: string
}

/**
 * The user's card balance, kept in sync with the server.
 *
 * The server is the authority — this only mirrors it — so every action that
 * spends or earns cards calls `refresh()` rather than adjusting a local number.
 */
export function useQuota() {
  const { status } = useSession()
  const [quota, setQuota] = useState<QuotaSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async (): Promise<QuotaSnapshot | null> => {
    try {
      const response = await fetch("/api/quota", { cache: "no-store" })
      if (!response.ok) return null
      const snapshot: QuotaSnapshot = await response.json()
      setQuota(snapshot)
      return snapshot
    } catch (error) {
      console.error("Failed to load quota:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "loading") return
    void refresh()
  }, [refresh, status])

  const earnAdReward = useCallback(async (): Promise<
    { ok: true; cardsEarned: number } | { ok: false; message: string }
  > => {
    try {
      const response = await fetch("/api/ad-reward", { method: "POST" })
      const data = await response.json()
      if (!response.ok) {
        return { ok: false, message: data.message || "Could not add a card right now." }
      }
      await refresh()
      return { ok: true, cardsEarned: data.cardsEarned }
    } catch {
      return { ok: false, message: "Could not add a card right now." }
    }
  }, [refresh])

  return { quota, isLoading, refresh, earnAdReward }
}
