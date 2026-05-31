"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export function CheckoutStatusToast() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const handledStatusRef = useRef<string | null>(null)

  useEffect(() => {
    const status = searchParams.get("status")
    if (!status || handledStatusRef.current === status) return

    handledStatusRef.current = status

    if (status === "success") {
      toast({
        title: "Checkout complete",
        description: "Premium will unlock as soon as Stripe confirms the subscription.",
      })
    }

    if (status === "cancelled") {
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
  }, [pathname, router, searchParams])

  return null
}
