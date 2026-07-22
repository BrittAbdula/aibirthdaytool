'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { recordUserAction } from '@/lib/action'
import type { RecipientTheme } from '@/lib/recipient-themes'

interface RecipientActionsProps {
  /** EditedCard.id — used for share/ref attribution */
  editedCardId: string
  /** ApiLog.cardId — UserAction rows must reference this */
  originalCardId: string
  cardType: string
  theme: Pick<RecipientTheme, 'accent' | 'textColor' | 'buttonGradient' | 'reply'>
}

const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function track(originalCardId: string, action: 'recipient_view' | 'recipient_reply_click' | 'recipient_create_click') {
  recordUserAction(originalCardId, action).catch(() => {
    // tracking must never break the recipient experience
  })
}

export default function RecipientActions({ editedCardId, originalCardId, cardType, theme }: RecipientActionsProps) {
  useEffect(() => {
    const key = `mtc_viewed_${editedCardId}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // private mode — still record the view
    }
    track(originalCardId, 'recipient_view')
  }, [editedCardId, originalCardId])

  const handleCreateClick = () => {
    try {
      document.cookie = `mtc_ref=${encodeURIComponent(editedCardId)};path=/;max-age=${REF_COOKIE_MAX_AGE};samesite=lax`
    } catch {
      // cookie write is best-effort
    }
    track(originalCardId, 'recipient_create_click')
  }

  return (
    <>
      {/* Reply CTA — completes the emotional arc */}
      <div className="mt-6 sm:mt-8 flex justify-center animate-[fadeUp_0.8s_ease-out_0.8s_forwards] opacity-0">
        <Link
          href={theme.reply.href}
          onClick={() => track(originalCardId, 'recipient_reply_click')}
          className="group relative inline-flex items-center justify-center px-8 py-3.5 overflow-hidden font-medium text-white transition-all duration-500 ease-out rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
          style={{ background: theme.buttonGradient, backgroundSize: '200% 200%' }}
        >
          <span className="absolute top-0 left-0 w-full bg-gradient-to-b from-white/30 to-transparent h-1/2 rounded-full"></span>
          <span className="relative flex items-center space-x-3">
            <span className="text-sm sm:text-base font-semibold tracking-wide">{theme.reply.label}</span>
            <span className="inline-block text-lg group-hover:animate-[wiggle_0.5s_ease-in-out_infinite]">
              {theme.reply.emoji}
            </span>
          </span>
        </Link>
      </div>

      {/* Secondary actions */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 animate-[fadeUp_0.8s_ease-out_0.9s_forwards] opacity-0">
        <Link
          href={`/?ref=${encodeURIComponent(editedCardId)}&via=recipient`}
          onClick={handleCreateClick}
          className="inline-flex items-center justify-center rounded-full border-2 px-6 py-2.5 text-sm sm:text-base font-semibold transition-all duration-300 backdrop-blur-sm bg-white/40 hover:bg-white/60"
          style={{ borderColor: `${theme.accent}4d`, color: theme.accent }}
        >
          <span className="mr-2">✨</span>
          Create your own card — free
        </Link>
        <a
          href={`/${cardType}/edit/${editedCardId}/`}
          className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition-colors duration-300 hover:underline"
          style={{ color: theme.textColor }}
        >
          Customize this card
        </a>
      </div>
    </>
  )
}
