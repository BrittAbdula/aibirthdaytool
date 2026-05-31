"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Crown, ShieldCheck } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PricingCheckoutButton } from "@/components/PricingCheckoutButton"
import {
  getYearlySavingsPercent,
  premiumFeatureRows,
  premiumHighlights,
  premiumModalCopy,
  premiumPlanOrder,
  premiumPlans,
  type PremiumModalContext,
  type PremiumPlanKey,
} from "@/lib/pricing"
import { cn } from "@/lib/utils"

interface PremiumPlanProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  context?: PremiumModalContext
  source?: string
}

export function PremiumModal({
  isOpen,
  onOpenChange,
  context = "default",
  source,
}: PremiumPlanProps) {
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlanKey>("yearly")
  const copy = premiumModalCopy[context]
  const plan = premiumPlans[selectedPlan]
  const checkoutSource = source || `premium_modal_${context}`

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto rounded-lg border-[#F1D6DF] bg-white p-0 sm:max-w-[920px]">
        <div className="grid md:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-[#F1D6DF] bg-[#FFF8F6] p-6 md:border-b-0 md:border-r">
            <DialogHeader>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                {copy.eyebrow}
              </p>
              <DialogTitle className="mt-2 font-serif text-3xl font-semibold leading-tight text-[#202A3D]">
                {copy.title}
              </DialogTitle>
            </DialogHeader>
            <p className="mt-4 text-sm leading-6 text-[#525B70]">{copy.description}</p>

            <div className="mt-6 space-y-3">
              {premiumHighlights.map((highlight) => (
                <div key={highlight} className="flex gap-3 text-sm font-semibold text-[#202A3D]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-lg border border-[#F1D6DF] bg-white">
              {premiumFeatureRows.slice(0, 5).map((row) => (
                <div key={row.feature} className="grid grid-cols-[1fr_0.85fr] border-b border-[#F1D6DF]/70 last:border-b-0 text-sm">
                  <div className="p-3 font-semibold text-[#202A3D]">{row.feature}</div>
                  <div className="p-3 text-right font-semibold text-primary">{row.premium}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-[#202A3D]">Premium</h3>
                <p className="mt-1 text-sm text-[#6B7280]">Secure checkout through Stripe.</p>
              </div>
              <div className="rounded-full bg-[#FFF1F5] p-3 text-primary">
                <Crown className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {premiumPlanOrder.map((planKey) => {
                const option = premiumPlans[planKey]
                const isSelected = selectedPlan === option.key

                return (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedPlan(option.key)}
                    className={cn(
                      "relative rounded-lg border p-4 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-[#FFF8F6] ring-2 ring-primary/15"
                        : "border-[#F1D6DF] bg-white hover:bg-[#FFF8F6]"
                  )}
                  >
                    {option.badge && (
                      <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-white">
                        {option.badge}
                      </span>
                    )}
                    <div className="flex items-start justify-between gap-5 pr-20">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border",
                            isSelected ? "border-primary bg-primary" : "border-[#D7B8C3]"
                          )}>
                            {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                          </span>
                          <span className="font-semibold text-[#202A3D]">{option.label}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#6B7280]">{option.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-lg font-bold text-[#202A3D]">{option.price}</div>
                        <div className="text-xs text-[#6B7280]">
                          {option.monthlyEquivalent || option.billingLabel}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <PricingCheckoutButton
              plan={selectedPlan}
              source={checkoutSource}
              className="mt-5 h-12 w-full bg-primary text-white hover:bg-primary/90"
            >
              Continue with {plan.label.toLowerCase()}
              <ArrowRight className="h-4 w-4" />
            </PricingCheckoutButton>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#6B7280]">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Cancel anytime. Yearly saves {getYearlySavingsPercent()}%.
            </div>

            <Link
              href="/pricing"
              className="mt-4 block text-center text-sm font-semibold text-primary hover:underline"
            >
              See full pricing details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PremiumButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-1 border-primary bg-primary text-white hover:bg-primary/90 hover:text-white"
      >
        <Crown className="h-4 w-4" />
        <span>Premium</span>
      </Button>
      <PremiumModal isOpen={isOpen} onOpenChange={setIsOpen} source="premium_button" />
    </>
  )
}
