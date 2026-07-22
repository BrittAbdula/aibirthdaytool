'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { renderResolutionText, type MomentConfig, type MomentResponse } from '@/lib/moment-config'

// The interactive layer of a shared card: the sender's words type out,
// then a playful ask appears ("Forgive me?") whose "no" button dodges away.
// Mounted below CardDisplay on /to/[cardId]; waits for the envelope reveal.

export const CARD_REVEALED_EVENT = 'mtc:card-revealed'

interface MomentTheme {
  accent: string
  textColor: string
  buttonGradient: string
}

interface MomentExperienceProps {
  editedCardId: string
  recipientName?: string | null
  message?: string | null
  config: MomentConfig
  existingResponse: MomentResponse | null
  theme: MomentTheme
}

type Phase = 'waiting' | 'typing' | 'ask' | 'resolved'

const REVEAL_FALLBACK_MS = 12000
const TYPE_INTERVAL_MS = 45
// Taps the "no" button tolerates in place before it starts fleeing
const INLINE_TAPS = 2

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function MomentExperience({
  editedCardId,
  recipientName,
  message,
  config,
  existingResponse,
  theme,
}: MomentExperienceProps) {
  const [phase, setPhase] = useState<Phase>(existingResponse ? 'resolved' : 'waiting')
  const [typedChars, setTypedChars] = useState(0)
  const [noClicks, setNoClicks] = useState(0)
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null)
  const noButtonRef = useRef<HTMLButtonElement>(null)
  const askRef = useRef<HTMLDivElement>(null)

  const fullMessage = message?.trim() || ''

  // Stage 1: wait for the envelope to open (CardDisplay dispatches the event)
  useEffect(() => {
    if (phase !== 'waiting') return
    const advance = () => setPhase(fullMessage ? 'typing' : 'ask')
    window.addEventListener(CARD_REVEALED_EVENT, advance)
    const fallback = window.setTimeout(advance, REVEAL_FALLBACK_MS)
    return () => {
      window.removeEventListener(CARD_REVEALED_EVENT, advance)
      window.clearTimeout(fallback)
    }
  }, [phase, fullMessage])

  // Stage 2: type the sender's words line by line
  useEffect(() => {
    if (phase !== 'typing') return
    if (prefersReducedMotion()) {
      setTypedChars(fullMessage.length)
      const t = window.setTimeout(() => setPhase('ask'), 900)
      return () => window.clearTimeout(t)
    }
    if (typedChars >= fullMessage.length) {
      const t = window.setTimeout(() => setPhase('ask'), 700)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setTypedChars((c) => c + 1), TYPE_INTERVAL_MS)
    return () => window.clearTimeout(t)
  }, [phase, typedChars, fullMessage])

  // Bring the ask into view when it appears
  useEffect(() => {
    if (phase === 'ask') {
      askRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [phase])

  const computeNextPosition = useCallback((): { x: number; y: number } => {
    const btn = noButtonRef.current
    const w = btn?.offsetWidth ?? 120
    const h = btn?.offsetHeight ?? 48
    const margin = 24
    const maxX = Math.max(margin, window.innerWidth - w - margin)
    const maxY = Math.max(margin, window.innerHeight - h - margin)
    return {
      x: margin + Math.random() * (maxX - margin),
      y: margin + Math.random() * (maxY - margin),
    }
  }, [])

  const dodge = useCallback(() => {
    setNoClicks((clicks) => {
      const next = clicks + 1
      if (next > INLINE_TAPS && !prefersReducedMotion()) {
        setNoPos(computeNextPosition())
      }
      return next
    })
  }, [computeNextPosition])

  const recordAnswer = useCallback(
    (attempts: number) => {
      fetch('/api/moment-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: editedCardId, answer: 'yes', attempts }),
      }).catch(() => {
        // the recipient's moment matters more than our bookkeeping
      })
    },
    [editedCardId]
  )

  const handleYes = useCallback(() => {
    setPhase('resolved')
    setNoPos(null)
    recordAnswer(noClicks)
    confetti({
      particleCount: 90,
      spread: 100,
      origin: { x: 0.5, y: 0.55 },
      colors: [theme.accent, '#ffffff', '#e5b72e', '#f8b7c7'],
      scalar: 0.9,
      ticks: 240,
    })
  }, [noClicks, recordAnswer, theme.accent])

  if (phase === 'waiting') return null

  const yesScale = 1 + Math.min(noClicks, 8) * 0.12
  const noScale = Math.max(0.45, 1 - noClicks * 0.08)
  const dodgePhrase = config.dodgePhrases[Math.min(Math.max(noClicks - 1, 0), config.dodgePhrases.length - 1)]
  const resolution = renderResolutionText(config, recipientName)

  return (
    <div className="mt-4 sm:mt-6">
      {/* Typed message */}
      {fullMessage && phase !== 'resolved' && (
        <div className="p-4">
          <div className="relative">
            <div className="absolute -left-2 -top-2 text-lg opacity-60">❝</div>
            <p
              className="italic text-center font-serif text-lg px-4 whitespace-pre-wrap"
              style={{ color: theme.textColor }}
            >
              {phase === 'typing' ? fullMessage.slice(0, typedChars) : fullMessage}
              {phase === 'typing' && typedChars < fullMessage.length && (
                <span className="animate-pulse" style={{ color: theme.accent }}>▍</span>
              )}
            </p>
            {phase !== 'typing' && <div className="absolute -right-2 -bottom-2 text-lg opacity-60">❞</div>}
          </div>
        </div>
      )}

      {/* The Ask */}
      {phase === 'ask' && (
        <div ref={askRef} className="mt-6 text-center animate-[fadeUp_0.8s_ease-out_forwards]">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-6" style={{ color: theme.textColor }}>
            {config.askText}
          </h2>
          <div className="flex items-center justify-center gap-4 min-h-[64px]">
            <button
              onClick={handleYes}
              className="rounded-full px-8 py-3.5 font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
              style={{ background: theme.buttonGradient, transform: `scale(${yesScale})` }}
            >
              {config.yesLabel}
            </button>
            <button
              ref={noButtonRef}
              onClick={dodge}
              onMouseEnter={noClicks > INLINE_TAPS ? dodge : undefined}
              onTouchStart={noClicks > INLINE_TAPS ? dodge : undefined}
              className="rounded-full border-2 px-6 py-3 font-medium bg-white/70 backdrop-blur-sm transition-all duration-300"
              style={{
                borderColor: `${theme.accent}55`,
                color: theme.accent,
                transform: `scale(${noScale})`,
                opacity: Math.max(0.55, 1 - noClicks * 0.05),
                ...(noPos
                  ? { position: 'fixed', left: noPos.x, top: noPos.y, zIndex: 50 }
                  : {}),
              }}
            >
              {noClicks === 0 ? config.noLabel : dodgePhrase}
            </button>
          </div>
        </div>
      )}

      {/* Resolution */}
      {phase === 'resolved' && (
        <div className="mt-6 text-center animate-[fadeUp_0.8s_ease-out_forwards]">
          <div
            className="inline-block px-8 py-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/70 shadow-sm"
          >
            <p className="font-serif text-xl sm:text-2xl" style={{ color: theme.textColor }}>
              {resolution}
            </p>
            {existingResponse && (
              <p className="mt-2 text-xs opacity-70" style={{ color: theme.textColor }}>
                Answered {new Date(existingResponse.answeredAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
