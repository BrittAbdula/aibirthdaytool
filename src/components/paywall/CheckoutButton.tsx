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
import type { SkuKey } from "@/lib/pricing/plans"

interface CheckoutButtonProps extends ButtonProps {
  sku: SkuKey
  source: string
  loadingLabel?: string
  taskSize?: number
}

export function CheckoutButton({
  sku,
  source,
  loadingLabel = "Opening checkout...",
  taskSize,
  children,
  disabled,
  onClick,
  ...props
}: CheckoutButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return

    if (status === "loading") return

    const returnUrl = window.location.pathname

    trackMonetizationEvent({
      eventType: "offer_click",
      plan: sku,
      source,
      path: returnUrl,
      metadata: taskSize ? { taskSize } : undefined,
    })

    // Signing in navigates away, so the intent is parked in storage and picked
    // up by PendingCheckoutResume once the user lands back here.
    if (!session) {
      const pendingCheckout = buildPendingCheckout({ sku, source, returnUrl, taskSize })
      window.localStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, JSON.stringify(pendingCheckout))
      await signIn("google", { callbackUrl: returnUrl })
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, returnUrl, source, taskSize }),
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
      {isLoading || status === "loading" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {isLoading ? loadingLabel : "Getting checkout ready..."}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
