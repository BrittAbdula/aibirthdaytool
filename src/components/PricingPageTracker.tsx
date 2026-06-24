"use client"

import { useEffect } from "react"
import { trackMonetizationEvent } from "@/lib/monetization-client"

export function PricingPageTracker() {
  useEffect(() => {
    trackMonetizationEvent({
      eventType: "pricing_page_view",
      path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      source: "pricing_page",
    })
  }, [])

  return null
}
