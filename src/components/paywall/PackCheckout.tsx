"use client"

import { useId, useState } from "react"
import { ArrowRight, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckoutButton } from "./CheckoutButton"
import { getCheckoutQuantity, MAX_PACK_QUANTITY } from "@/lib/pricing/checkout"
import { formatPrice, type Sku } from "@/lib/pricing/plans"

interface PackCheckoutProps {
  pack: Sku
  className?: string
}

export function PackCheckout({ pack, className }: PackCheckoutProps) {
  const id = useId()
  const [input, setInput] = useState("1")
  const quantity = /^\d+$/.test(input) ? getCheckoutQuantity(pack.key, Number(input)) : null
  const valid = quantity !== null

  return (
    <div className="mt-7 flex flex-col gap-3">
      <Label htmlFor={id}>Number of packs</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="size-11 shrink-0"
          aria-label={`Remove one ${pack.label} pack`}
          disabled={!valid || quantity <= 1}
          onClick={() => setInput(String((quantity ?? 1) - 1))}
        >
          <Minus aria-hidden="true" />
        </Button>
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          aria-invalid={!valid}
          aria-describedby={`${id}-summary`}
          className="h-11 min-w-0 text-center"
        />
        <Button
          type="button"
          variant="outline"
          className="size-11 shrink-0"
          aria-label={`Add one ${pack.label} pack`}
          disabled={!valid || quantity >= MAX_PACK_QUANTITY}
          onClick={() => setInput(String((quantity ?? 1) + 1))}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
      <p id={`${id}-summary`} aria-live="polite" className="text-sm">
        {valid
          ? `${(pack.cards ?? 0) * quantity} card credits · ${formatPrice(pack.amountCents * quantity)} total before discounts`
          : `Enter a whole number from 1 to ${MAX_PACK_QUANTITY}.`}
      </p>
      <CheckoutButton
        sku={pack.key}
        source={`pricing_page_${pack.key}`}
        quantity={quantity ?? 1}
        disabled={!valid}
        className={className}
      >
        {valid ? `Get ${(pack.cards ?? 0) * quantity} card credits` : "Choose quantity"}
        <ArrowRight aria-hidden="true" />
      </CheckoutButton>
    </div>
  )
}
