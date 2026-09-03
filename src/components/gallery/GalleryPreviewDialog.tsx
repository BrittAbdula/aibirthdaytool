'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Copy, ExternalLink, PenLine, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { Card } from '@/lib/cards'
import { buildInspirationHref } from '@/lib/gallery-navigation'
import { buildCardPreviewAlt, buildCardPreviewTitle } from '@/lib/seo'
import { isVideoUrl } from './GalleryCard'

interface GalleryPreviewDialogProps {
  card: Card | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const secondaryActionClass =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[#F1D6DF] px-3 text-xs font-semibold text-[#202A3D] transition-colors hover:bg-[#FFF1F5]'

export function GalleryPreviewDialog({ card, open, onOpenChange }: GalleryPreviewDialogProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timeout)
  }, [copied])

  const copyMessage = async () => {
    if (!card?.message) return
    try {
      await navigator.clipboard.writeText(card.message)
      setCopied(true)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto rounded-2xl border-[#F1D6DF] bg-white p-0 sm:rounded-2xl">
        {card && (
          <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
            <div className="flex items-center justify-center bg-[#FFF8F6] p-4 md:p-6">
              {card.r2Url ? (
                isVideoUrl(card.r2Url) ? (
                  <video
                    src={card.r2Url}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-label={buildCardPreviewAlt(card.cardType, card.relationship)}
                    className="max-h-[52svh] w-auto max-w-full rounded-lg border border-[#F1D6DF] bg-white md:max-h-[72svh]"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.r2Url}
                    alt={buildCardPreviewAlt(card.cardType, card.relationship)}
                    className="max-h-[52svh] w-auto max-w-full rounded-lg border border-[#F1D6DF] bg-white md:max-h-[72svh]"
                  />
                )
              ) : (
                <p className="text-sm text-[#8A93A6]">Preview unavailable</p>
              )}
            </div>

            <div className="flex flex-col gap-4 p-5 pr-12 md:p-6 md:pr-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Public card</p>
                <DialogTitle className="mt-2 font-serif text-2xl font-semibold leading-tight text-[#202A3D]">
                  {buildCardPreviewTitle(card.cardType, card.relationship)}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Start from this card, or open the page a recipient would see.
                </DialogDescription>
              </div>

              {card.message && (
                <blockquote className="rounded-lg border border-[#F1D6DF] bg-[#FFF8F6] p-3">
                  <p className="line-clamp-6 whitespace-pre-line text-sm leading-6 text-[#47536B]">{card.message}</p>
                  <button
                    type="button"
                    onClick={() => void copyMessage()}
                    className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                    {copied ? 'Copied' : 'Copy message'}
                  </button>
                </blockquote>
              )}

              <div className="mt-auto grid gap-2">
                <Link
                  href={buildInspirationHref(card)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Make one like this
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/${card.cardType}/edit/${card.id}/`} className={secondaryActionClass}>
                    <PenLine className="h-4 w-4" aria-hidden />
                    Edit this card
                  </Link>
                  <a href={`/to/${card.id}/`} target="_blank" rel="noopener noreferrer" className={secondaryActionClass}>
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Open card page
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
