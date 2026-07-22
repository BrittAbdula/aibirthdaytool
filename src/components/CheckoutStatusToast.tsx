"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import { trackMonetizationEvent } from "@/lib/monetization-client"

export function CheckoutStatusToast() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { update: updateSession } = useSession()
  const handledStatusRef = useRef<string | null>(null)

  useEffect(() => {
    const status = searchParams.get("status")
    if (!status || handledStatusRef.current === status) return

    handledStatusRef.current = status

    if (status === "success") {
      const stripeSessionId = searchParams.get("session_id")
      trackMonetizationEvent({
        eventType: "checkout_success_return",
        path: `${pathname}?${searchParams.toString()}`,
        stripeSessionId,
      })
      toast({
        title: "Checkout complete",
        description: "Confirming Creator Pro access with Stripe.",
      })
      if (stripeSessionId) {
        fetch('/api/subscription/reconcile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: stripeSessionId }),
        })
          .then(async (response) => {
            if (!response.ok) return
            await updateSession()
            toast({ title: 'Creator Pro is active', description: 'Your roster and complete batch workflow are unlocked.' })
          })
          .catch(() => {
            // The webhook remains authoritative and will finish activation if reconciliation is delayed.
          })
      }
    }

    if (status === "cancelled") {
      trackMonetizationEvent({
        eventType: "checkout_cancelled",
        path: `${pathname}?${searchParams.toString()}`,
      })
      toast({
        title: "Checkout canceled",
        description: "No charge was made. You can return to pricing whenever you are ready.",
      })
    }

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete("status")
    nextParams.delete("session_id")

    const nextQuery = nextParams.toString()
    const hash = window.location.hash
    router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}${hash}`, { scroll: false })
  }, [pathname, router, searchParams, updateSession])

  return null
}
