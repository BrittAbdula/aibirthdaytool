'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Download, Gift, Link2 } from 'lucide-react'
import { BalloonsArt, PaperGrain } from '@/components/home/card-art'
import { cn } from '@/lib/utils'

const RECIPIENTS = [
  { name: 'June', subline: 'turning 30' },
  { name: 'Mom', subline: 'from all of us' },
  { name: 'Alex', subline: 'the big one' },
  { name: 'Priya', subline: 'happy 25th' },
]

const TONES = [
  {
    label: 'Heartfelt',
    message: () =>
      `Every year is better with you in it. Today the candles finally get to say so.`,
  },
  {
    label: 'Playful',
    message: () =>
      `You're basically 21 with better judgment now. Cake first, wisdom later.`,
  },
  {
    label: 'Simple',
    message: () => `So glad you were born.`,
  },
]

const ARRIVALS = [
  { label: 'A link', icon: Link2 },
  { label: 'A download', icon: Download },
  { label: 'A surprise page', icon: Gift },
] as const

export default function CardStudioDemo() {
  const [recipient, setRecipient] = useState(2)
  const [tone, setTone] = useState(0)
  const [arrival, setArrival] = useState(0)

  const person = RECIPIENTS[recipient]
  const slug = person.name.toLowerCase()

  return (
    <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-10">
      {/* the three questions */}
      <div>
        <h2 className="max-w-xl font-serif text-4xl font-semibold leading-tight text-[#202A3D] sm:text-5xl [text-wrap:balance]">
          Three questions, then a card
        </h2>
        <p className="mt-4 max-w-md text-base leading-7 text-[#525B70]">
          This is the whole idea. Try it. The card on the right listens.
        </p>

        <div className="mt-10 space-y-8">
          <fieldset>
            <legend className="flex items-baseline gap-3">
              <span className="font-serif text-sm font-semibold tracking-[0.2em] text-primary">01</span>
              <span className="font-serif text-xl font-semibold text-[#202A3D]">Who is it for?</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2 pl-8">
              {RECIPIENTS.map((r, i) => (
                <Chip key={r.name} active={i === recipient} onClick={() => setRecipient(i)}>
                  {r.name}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="flex items-baseline gap-3">
              <span className="font-serif text-sm font-semibold tracking-[0.2em] text-primary">02</span>
              <span className="font-serif text-xl font-semibold text-[#202A3D]">What should it sound like?</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2 pl-8">
              {TONES.map((t, i) => (
                <Chip key={t.label} active={i === tone} onClick={() => setTone(i)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="flex items-baseline gap-3">
              <span className="font-serif text-sm font-semibold tracking-[0.2em] text-primary">03</span>
              <span className="font-serif text-xl font-semibold text-[#202A3D]">How should it arrive?</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2 pl-8">
              {ARRIVALS.map((a, i) => (
                <Chip key={a.label} active={i === arrival} onClick={() => setArrival(i)}>
                  {a.label}
                </Chip>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-10 pl-8">
          <Link
            href="/birthday/"
            className="inline-flex items-center gap-2 text-base font-semibold text-primary transition-colors hover:text-[#8C2247]"
          >
            Open the real maker. It writes with you
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* the listening card */}
      <div className="relative mx-auto w-full max-w-[400px]">
        <div
          aria-hidden
          className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,232,240,0.8)_0%,transparent_72%)]"
        />
        <div className="relative rounded-xl bg-[#FFFEFB] p-6 shadow-[10px_18px_40px_-16px_rgba(32,42,61,0.4)] ring-1 ring-[#F1D6DF] sm:p-7">
          <PaperGrain id="grain-demo" className="absolute inset-0 rounded-xl opacity-[0.4]" />
          <div className="relative rounded-lg border border-[#EFDFC8] px-6 pb-8 pt-9 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(180,140,90,0.12)]">
            <p
              key={`sub-${recipient}`}
              className="animate-in fade-in duration-500 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#76819A] sm:text-[11px]"
            >
              A card for{" "}
              <span className="rounded bg-[#FFE8F0] px-1.5 py-0.5 text-primary">
                {person.name}
              </span>{" "}
              · {person.subline}
            </p>
            <BalloonsArt className="mtc-bob-slow mx-auto mt-5 w-24" />
            <p
              key={`greet-${recipient}`}
              className="animate-in fade-in duration-500 mt-5 font-serif text-2xl font-semibold leading-[1.15] text-[#202A3D] [text-shadow:0_1px_0_rgba(255,255,255,0.9)] sm:text-3xl"
            >
              Happy birthday,
              <br />
              <em className="italic text-primary">{person.name}.</em>
            </p>
            <p
              key={`msg-${tone}-${recipient}`}
              className="animate-in fade-in duration-500 mx-auto mt-5 max-w-[260px] font-hand text-xl leading-7 text-[#3E4A5F]"
            >
              &ldquo;{TONES[tone].message()}&rdquo;
            </p>
            <p className="mt-5 font-hand text-lg text-[#8A93A6]">— from you</p>
          </div>
        </div>

        {/* how it arrives */}
        <div
          key={`arr-${arrival}-${recipient}`}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500 absolute -bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white py-2 pl-3 pr-4 shadow-[0_12px_24px_-10px_rgba(32,42,61,0.4)] ring-1 ring-[#F1D6DF]"
        >
          {arrival === 0 && (
            <>
              <Link2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold tracking-tight text-[#202A3D]">
                mewtrucard.com/c/{slug}
              </span>
            </>
          )}
          {arrival === 1 && (
            <>
              <Download className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold tracking-tight text-[#202A3D]">
                {slug}-birthday.png · saved
              </span>
            </>
          )}
          {arrival === 2 && (
            <>
              <Gift className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold tracking-tight text-[#202A3D]">
                A page that asks: &ldquo;Open it?&rdquo;
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
        active
          ? 'bg-primary text-white shadow-sm'
          : 'border border-[#F1D6DF] bg-white text-[#525B70] hover:border-primary/35 hover:text-primary'
      )}
    >
      {children}
    </button>
  )
}
