'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { VIRAL_MICROSITES } from '@/lib/viral-microsites'
import {
  BirthdayCakeArt,
  HeartArt,
  OliveBranchArt,
  RingsArt,
} from '@/components/home/card-art'
import { cn } from '@/lib/utils'

const TAB_LABELS = ['Valentine ask', 'Birthday surprise', 'Apology', 'Bestie ask']

const STAGE_MOTIFS = [
  <HeartArt key="heart" className="mtc-breathe mx-auto w-16" />,
  <BirthdayCakeArt key="cake" className="mx-auto w-16" />,
  <OliveBranchArt key="olive" className="mtc-breathe mx-auto w-16" />,
  <RingsArt key="rings" className="mx-auto w-16" />,
]

export default function SurpriseTheater() {
  const [active, setActive] = useState(0)
  const [dodges, setDodges] = useState(0)
  // the "No" button starts mid-escape — the joke is visible before you touch it
  const [pos, setPos] = useState({ x: 30, y: -10, r: -9 })

  const site = VIRAL_MICROSITES[active]
  const phrase =
    dodges === 0
      ? site.secondaryLabel
      : site.secondaryPhrases[Math.min(dodges, site.secondaryPhrases.length - 1)]

  const dodge = () => {
    setDodges((d) => d + 1)
    setPos({
      x: Math.round(Math.random() * 200 - 100),
      y: Math.round(Math.random() * 70 - 35),
      r: Math.round(Math.random() * 24 - 12),
    })
  }

  const selectTab = (index: number) => {
    setActive(index)
    setDodges(0)
    setPos({ x: 30, y: -10, r: -9 })
  }

  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl [text-wrap:balance]">
          And some moments deserve a little theater
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#B9C1D4] sm:text-lg">
          A surprise link is a tiny page you send before the card. Its
          &ldquo;{site.secondaryLabel}&rdquo; button refuses to be clicked. Go
          on, try it.
        </p>
      </div>

      {/* variant tabs */}
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Surprise link variants">
        {VIRAL_MICROSITES.map((microsite, index) => (
          <button
            key={microsite.slug}
            role="tab"
            aria-selected={index === active}
            onClick={() => selectTab(index)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
              index === active
                ? 'bg-primary text-white shadow-md'
                : 'text-[#B9C1D4] ring-1 ring-white/15 hover:text-white hover:ring-white/35'
            )}
          >
            {TAB_LABELS[index]}
          </button>
        ))}
      </div>

      {/* the stage */}
      <div className="relative mx-auto max-w-2xl">
        <div
          aria-hidden
          className="absolute -inset-x-16 -inset-y-10 rounded-full bg-[radial-gradient(closest-side,rgba(248,183,199,0.16)_0%,transparent_70%)]"
        />
        <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_50%_30%,#FFFDFB_0%,#FFF3EF_55%,#F7E3DC_100%)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)]">
          {/* mock browser bar — this thing is a link you send */}
          <div className="flex items-center gap-3 border-b border-[#F1D6DF] bg-white px-5 py-3">
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-[#F1D6DF]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#F1D6DF]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#F1D6DF]" />
            </div>
            <span className="truncate rounded-full bg-[#FFF8F6] px-3 py-1 text-xs font-medium text-[#8A93A6]">
              mewtrucard.com/{site.slug}
            </span>
          </div>

          <div className="relative px-6 pb-10 pt-10 text-center sm:px-12">
            <div key={`motif-${active}`} className="animate-in fade-in duration-500">
              {STAGE_MOTIFS[active]}
            </div>
            <p className="mt-5 font-serif text-3xl font-semibold leading-tight text-[#202A3D] sm:text-4xl [text-wrap:balance]">
              {site.prompt}
            </p>

            <div className="relative mt-8 flex h-24 items-center justify-center gap-4">
              {/* motion dashes where the No button used to be */}
              <svg
                aria-hidden
                viewBox="0 0 34 24"
                fill="none"
                className="pointer-events-none absolute right-[24%] top-[58%] h-5 w-7 text-[#C9A6B4] sm:right-[30%]"
              >
                <path d="M2 4c6 2 10 2 15 0M4 12c6 2 10 2 15 0M2 20c6 2 10 2 15 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <Link
                href={`/${site.slug}/`}
                className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-md transition-transform duration-300 hover:bg-primary/90"
                style={{ transform: `scale(${1 + Math.min(dodges * 0.07, 0.5)})` }}
              >
                {site.primaryLabel}
              </Link>
              <button
                type="button"
                onMouseEnter={dodge}
                onClick={dodge}
                aria-label={`${site.secondaryLabel} — this button dodges`}
                className="rounded-full border border-[#D8DDE6] bg-white px-6 py-3 text-sm font-semibold text-[#8A93A6] transition-transform duration-200 ease-out"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.r}deg)`,
                }}
              >
                {phrase}
              </button>
            </div>

            <p className="mt-2 min-h-[1.5rem] text-sm text-[#8A93A6]" aria-live="polite">
              {dodges === 0
                ? 'Hover the second button. It knows what you’re thinking.'
                : dodges < 3
                  ? 'See? It refuses.'
                  : `Escape attempts: ${dodges}. The answer is still ${site.primaryLabel.toLowerCase()}.`}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2 text-center">
        <Link
          href={`/${site.slug}/`}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C24169]"
        >
          Get this surprise link
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
