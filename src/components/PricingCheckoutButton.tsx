"use client"

import { useState } from "react"
import type { MouseEvent } from "react"
import { signIn, useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
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

    if (!session) {
      await signIn("google", { callbackUrl: window.location.href })
      return
    }

    try {
      setIsLoading(true)
      const returnUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

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
