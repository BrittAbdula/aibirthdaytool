"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, Loader2, PlayCircle, ShieldCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckoutButton } from "@/components/paywall/CheckoutButton"
import { toast } from "@/hooks/use-toast"
import { useQuota } from "@/hooks/useQuota"
import {
  SKUS,
  formatBillingLabel,
  formatPerCardPrice,
  formatPrice,
  type SkuKey,
} from "@/lib/pricing/plans"
import { resolvePaywallOffer, type PaywallIntent } from "@/lib/pricing/paywall"
import { trackMonetizationEvent } from "@/lib/monetization-client"
import { cn } from "@/lib/utils"

interface PaywallProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  intent?: PaywallIntent
  source?: string
  /** The card being worked on, shown so the offer is about something concrete. */
  cardPreviewUrl?: string
  taskSize?: number
  /** Called after a rewarded ad adds a card, so the caller can retry. */
  onCardsEarned?: () => void
}

export function Paywall({
  isOpen,
  onOpenChange,
  intent = "default",
  source,
  cardPreviewUrl,
  taskSize,
  onCardsEarned,
}: PaywallProps) {
  const offer = resolvePaywallOffer(intent)
  const [selectedSku, setSelectedSku] = useState<SkuKey>(offer.primary)
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  const trackedOpenRef = useRef(false)
  const { quota, earnAdReward } = useQuota()

  const checkoutSource = source || `paywall_${intent}`
  const skuKeys: SkuKey[] = [offer.primary, ...offer.secondary]
  const selected = SKUS[selectedSku]

  // A rewarded ad only makes sense when the wall is a quota wall and the user
  // has not already taken every reward today.
  const canWatchAd = offer.intent === "daily_limit" && !!quota?.canEarnAdReward

  useEffect(() => {
    setSelectedSku(offer.primary)
  }, [offer.primary])

  useEffect(() => {
    if (!isOpen) {
      trackedOpenRef.current = false
      return
    }
    if (trackedOpenRef.current) return
    trackedOpenRef.current = true

    trackMonetizationEvent({
      eventType: "offer_view",
      plan: offer.primary,
      source: checkoutSource,
      path: `${window.location.pathname}${window.location.search}`,
      metadata: { intent, audience: offer.audience },
    })
  }, [checkoutSource, intent, isOpen, offer.audience, offer.primary])

  const handleWatchAd = async () => {
    setIsWatchingAd(true)
    trackMonetizationEvent({
      eventType: "ad_reward_offered",
      source: checkoutSource,
      metadata: { intent },
    })

    const result = await earnAdReward()
    setIsWatchingAd(false)

    if (!result.ok) {
      toast({ variant: "destructive", description: result.message })
      return
    }

    toast({ description: `Added ${result.cardsEarned} card. Keep going.` })
    onOpenChange?.(false)
    onCardsEarned?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto rounded-lg border-[#F1D6DF] bg-white p-0 sm:max-w-[860px]">
        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-[#F1D6DF] bg-[#FFF8F6] p-6 md:border-b-0 md:border-r">
            <DialogHeader>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                {offer.eyebrow}
              </p>
              <DialogTitle className="mt-2 font-serif text-2xl font-semibold leading-tight text-[#202A3D] sm:text-3xl">
                {offer.title}
              </DialogTitle>
            </DialogHeader>
            <p className="mt-4 text-sm leading-6 text-[#525B70]">{offer.description}</p>

            {cardPreviewUrl && (
              <div className="mt-5 overflow-hidden rounded-lg border border-[#F1D6DF] bg-white p-2">
                <Image
                  src={cardPreviewUrl}
                  alt="The card you are working on"
                  width={320}
                  height={480}
                  className="h-auto w-full rounded"
                />
              </div>
            )}

            <div className="mt-6 space-y-3">
              {offer.highlights.map((highlight) => (
                <div key={highlight} className="flex gap-3 text-sm font-medium text-[#202A3D]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-3">
              {skuKeys.map((key) => {
                const sku = SKUS[key]
                const isSelected = selectedSku === key
                const perCard = formatPerCardPrice(sku)

                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedSku(key)}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-[#FFF8F6] ring-2 ring-primary/15"
                        : "border-[#F1D6DF] bg-white hover:bg-[#FFF8F6]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full border",
                              isSelected ? "border-primary bg-primary" : "border-[#D7B8C3]"
                            )}
                          >
                            {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                          </span>
                          <span className="font-semibold text-[#202A3D]">{sku.label}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#6B7280]">{sku.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-lg font-bold text-[#202A3D]">
                          {formatPrice(sku.amountCents)}
                        </div>
                        <div className="text-xs text-[#6B7280]">
                          {perCard || formatBillingLabel(sku)}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <CheckoutButton
              sku={selectedSku}
              source={checkoutSource}
              taskSize={taskSize}
              className="mt-5 h-12 w-full bg-primary text-white hover:bg-primary/90"
            >
              {selected.kind === "pack" ? `Get ${selected.label}` : `Continue with ${selected.label}`}
              <ArrowRight className="h-4 w-4" />
            </CheckoutButton>

            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-[#6B7280]">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {selected.kind === "pack"
                ? "One payment. Cards never expire."
                : `${formatPrice(selected.amountCents)} ${formatBillingLabel(selected)}. Cancel anytime.`}
            </div>

            {canWatchAd && (
              <div className="mt-5 border-t border-[#F1D6DF] pt-5">
                <p className="text-sm text-[#6B7280]">Not ready to pay?</p>
                <Button
                  variant="outline"
                  onClick={handleWatchAd}
                  disabled={isWatchingAd}
                  className="mt-2 h-11 w-full border-[#D7B8C3] text-[#202A3D] hover:bg-[#FFF8F6]"
                >
                  {isWatchingAd ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding your card...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 text-primary" />
                      Watch a short ad for 1 more card
                    </>
                  )}
                </Button>
                {typeof quota?.adRewardsLeftToday === "number" && (
                  <p className="mt-2 text-center text-xs text-[#9AA1AF]">
                    {quota.adRewardsLeftToday} left today
                  </p>
                )}
              </div>
            )}

            <Link
              href="/pricing/"
              className="mt-4 block text-center text-sm font-semibold text-primary hover:underline"
            >
              Compare everything
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
