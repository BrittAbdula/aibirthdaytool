"use client"

import { useState } from "react"
import type { MouseEvent } from "react"
import { signIn, useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import {
  PENDING_CHECKOUT_STORAGE_KEY,
  buildPendingCheckout,
} from "@/lib/checkout-pending"
import { trackMonetizationEvent } from "@/lib/monetization-client"
import type { PremiumPlanKey } from "@/lib/pricing"

interface PricingCheckoutButtonProps extends ButtonProps {
  plan: PremiumPlanKey
  source: string
  loadingLabel?: string
}

export function PricingCheckoutButton({
  plan,
  source,
  loadingLabel = "Opening checkout...",
  children,
  disabled,
  onClick,
  ...props
}: PricingCheckoutButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return

    if (status === "loading") return

    const returnUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

    trackMonetizationEvent({
      eventType: "pricing_cta_click",
      plan,
      source,
      path: returnUrl,
    })

    if (!session) {
      const pendingCheckout = buildPendingCheckout({ plan, source, returnUrl })
      window.localStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, JSON.stringify(pendingCheckout))
      await signIn("google", { callbackUrl: returnUrl })
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, returnUrl, source }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }
      if (!data.url) {
        throw new Error("No checkout URL returned")
      }

      window.location.href = data.url
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        variant: "destructive",
        title: "Checkout unavailable",
        description: error instanceof Error ? error.message : "Please try again.",
      })
      setIsLoading(false)
    }
  }

  return (
    <Button {...props} disabled={disabled || isLoading || status === "loading"} onClick={handleClick}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
