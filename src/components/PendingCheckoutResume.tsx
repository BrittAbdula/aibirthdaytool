"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import {
  PENDING_CHECKOUT_STORAGE_KEY,
  parsePendingCheckout,
} from "@/lib/checkout-pending"

export function PendingCheckoutResume() {
  const { status } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isProcessingRef = useRef(false)

  useEffect(() => {
    if (status !== "authenticated" || isProcessingRef.current) return
    if (searchParams.get("status")) return

    const pending = parsePendingCheckout(window.localStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY))
    if (!pending) return

    isProcessingRef.current = true
    window.localStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY)

    fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: pending.sku,
        returnUrl: pending.returnUrl || pathname,
        source: pending.source,
        taskSize: pending.taskSize,
      }),
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to create checkout session")
        }
        if (!data.url) {
          throw new Error("No checkout URL returned")
        }
        window.location.href = data.url
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Checkout unavailable",
          description: error instanceof Error ? error.message : "Please try again.",
        })
        isProcessingRef.current = false
      })
  }, [pathname, searchParams, status])

  return null
}
