// Card-type-aware theming for the recipient page (/to/[cardId]).
// Server-safe: plain data, no client code.

export type RecipientParticle = 'petals' | 'confetti' | 'rain-to-light' | 'sparkles' | 'hearts'

export interface RecipientTheme {
  key: string
  /** Base radial gradient layers behind everything */
  baseGradient: string
  /** Three soft bokeh orb colors (rgba) */
  orbs: [string, string, string]
  /** Ambient particle style */
  particle: RecipientParticle
  /** Primary text color for messages/footer */
  textColor: string
  /** Accent color for secondary buttons/borders */
  accent: string
  /** Gradient for the primary reply CTA */
  buttonGradient: string
  loadingMessage: string
  reply: { label: string; href: string; emoji: string }
  footerEmoji: string
}

const themes: Record<string, RecipientTheme> = {
  sorry: {
    key: 'sorry',
    baseGradient: `
      radial-gradient(ellipse at 30% 20%, rgba(96, 139, 152, 0.10) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 80%, rgba(244, 200, 168, 0.14) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(248, 251, 251, 1) 0%, rgba(240, 246, 246, 1) 100%)
    `,
    orbs: ['rgba(126, 168, 168, 0.14)', 'rgba(250, 214, 178, 0.18)', 'rgba(177, 160, 255, 0.10)'],
    particle: 'rain-to-light',
    textColor: '#3d5a5a',
    accent: '#5b8a8a',
    buttonGradient: 'linear-gradient(135deg, #5b8a8a 0%, #3d6b6b 50%, #5b8a8a 100%)',
    loadingMessage: 'Opening something heartfelt...',
    reply: { label: 'Reply: I forgive you', href: '/thankyou/', emoji: '🤍' },
    footerEmoji: '🕊️',
  },
  birthday: {
    key: 'birthday',
    baseGradient: `
      radial-gradient(ellipse at 30% 20%, rgba(180, 55, 95, 0.07) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 80%, rgba(229, 183, 46, 0.09) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(255, 248, 246, 1) 0%, rgba(255, 243, 238, 1) 100%)
    `,
    orbs: ['rgba(180, 55, 95, 0.12)', 'rgba(229, 183, 46, 0.13)', 'rgba(177, 160, 255, 0.12)'],
    particle: 'confetti',
    textColor: '#7a4a5a',
    accent: '#b4375f',
    buttonGradient: 'linear-gradient(135deg, #b4375f 0%, #8a2a49 50%, #b4375f 100%)',
    loadingMessage: 'Unwrapping your birthday surprise...',
    reply: { label: 'Send a Thank You Card Back', href: '/thankyou/', emoji: '🎁' },
    footerEmoji: '🎂',
  },
  love: {
    key: 'love',
    baseGradient: `
      radial-gradient(ellipse at 30% 20%, rgba(225, 95, 125, 0.10) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 80%, rgba(255, 182, 193, 0.14) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(255, 247, 248, 1) 0%, rgba(255, 238, 242, 1) 100%)
    `,
    orbs: ['rgba(225, 95, 125, 0.14)', 'rgba(255, 182, 193, 0.18)', 'rgba(229, 183, 46, 0.08)'],
    particle: 'hearts',
    textColor: '#8a3a4f',
    accent: '#d14a6e',
    buttonGradient: 'linear-gradient(135deg, #d14a6e 0%, #a32f50 50%, #d14a6e 100%)',
    loadingMessage: 'Opening something made with love...',
    reply: { label: 'Send a Love Card Back', href: '/love/', emoji: '💞' },
    footerEmoji: '💝',
  },
  anniversary: {
    key: 'anniversary',
    baseGradient: `
      radial-gradient(ellipse at 30% 20%, rgba(229, 183, 46, 0.10) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 80%, rgba(225, 95, 125, 0.10) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(255, 250, 244, 1) 0%, rgba(253, 243, 235, 1) 100%)
    `,
    orbs: ['rgba(229, 183, 46, 0.14)', 'rgba(225, 95, 125, 0.12)', 'rgba(177, 160, 255, 0.10)'],
    particle: 'sparkles',
    textColor: '#7a5a3a',
    accent: '#b08a3e',
    buttonGradient: 'linear-gradient(135deg, #b08a3e 0%, #8a6a2a 50%, #b08a3e 100%)',
    loadingMessage: 'Opening a celebration of you two...',
    reply: { label: 'Send a Love Card Back', href: '/love/', emoji: '💕' },
    footerEmoji: '💍',
  },
  default: {
    key: 'default',
    baseGradient: `
      radial-gradient(ellipse at 30% 20%, rgba(180, 55, 95, 0.07) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 80%, rgba(177, 160, 255, 0.10) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(255, 248, 246, 1) 0%, rgba(254, 243, 240, 1) 100%)
    `,
    orbs: ['rgba(180, 55, 95, 0.10)', 'rgba(177, 160, 255, 0.13)', 'rgba(229, 183, 46, 0.09)'],
    particle: 'petals',
    textColor: '#6b5560',
    accent: '#b4375f',
    buttonGradient: 'linear-gradient(135deg, #b4375f 0%, #8a2a49 50%, #b4375f 100%)',
    loadingMessage: 'Unwrapping your special card...',
    reply: { label: 'Send a Card Back', href: '/thankyou/', emoji: '💌' },
    footerEmoji: '💌',
  },
}

const aliasMap: Record<string, string> = {
  valentine: 'love',
  'marriage-anniversary': 'anniversary',
  wedding: 'anniversary',
  apology: 'sorry',
  'forgive-me': 'sorry',
  'happy-birthday': 'birthday',
}

export function getRecipientTheme(cardType: string | null | undefined): RecipientTheme {
  if (!cardType) return themes.default
  const normalized = cardType.toLowerCase()
  if (themes[normalized]) return themes[normalized]
  if (aliasMap[normalized]) return themes[aliasMap[normalized]]
  return themes.default
}
