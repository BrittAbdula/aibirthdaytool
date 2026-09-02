"use client"

import { Infinity as InfinityIcon, Sparkles } from "lucide-react"
import type { QuotaSnapshot } from "@/hooks/useQuota"
import { cn } from "@/lib/utils"

interface QuotaMeterProps {
  quota: QuotaSnapshot | null
  onUpgradeClick?: () => void
  className?: string
}

/**
 * The visible card balance.
 *
 * The previous build enforced a limit nobody could see, so the wall arrived as
 * a surprise after a user had already filled in the form. Showing the count up
 * front turns the same limit into something they can plan around.
 */
export function QuotaMeter({ quota, onUpgradeClick, className }: QuotaMeterProps) {
  if (!quota || !quota.signedIn) return null

  if (quota.unlimited) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-[#FFF1F5] px-3 py-1.5 text-sm font-semibold text-primary",
          className
        )}
      >
        <InfinityIcon className="h-4 w-4" />
        Unlimited cards
      </div>
    )
  }

  const remaining = quota.cardsRemaining ?? 0
  const isEmpty = remaining <= 0
  const isLow = remaining > 0 && remaining <= 1

  return (
    <div className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold",
          isEmpty
            ? "bg-[#FDEBEF] text-[#B4375F]"
            : isLow
              ? "bg-[#FFF3E6] text-[#9A5B1F]"
              : "bg-[#F4F6F9] text-[#4C5568]"
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {quota.label}
      </span>
      {onUpgradeClick && (isEmpty || isLow) && (
        <button
          type="button"
          onClick={onUpgradeClick}
          className="font-semibold text-primary hover:underline"
        >
          Get more
        </button>
      )}
    </div>
  )
}
