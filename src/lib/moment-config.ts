import { z } from 'zod'

// A "Moment" is the interactive layer on top of a shared card:
// card + staged message reveal + a playful ask ("Forgive me?") + resolution.
// Config lives on EditedCard.momentConfig; the recipient's answer on momentResponse.

export const MOMENT_TYPES = ['forgive-me', 'will-you'] as const
export type MomentType = (typeof MOMENT_TYPES)[number]

export const momentConfigSchema = z.object({
  type: z.enum(MOMENT_TYPES),
  askText: z.string().min(1).max(120),
  yesLabel: z.string().min(1).max(40),
  noLabel: z.string().min(1).max(40),
  // Lines the dodging "no" button cycles through on each escape attempt
  dodgePhrases: z.array(z.string().min(1).max(120)).min(1).max(8),
  // Shown after the recipient taps yes; {name} is replaced with recipientName
  resolutionText: z.string().min(1).max(160),
})

export type MomentConfig = z.infer<typeof momentConfigSchema>

export const momentResponseSchema = z.object({
  answer: z.literal('yes'),
  attempts: z.number().int().min(0).max(99),
  answeredAt: z.string(),
})

export type MomentResponse = z.infer<typeof momentResponseSchema>

const defaultConfigs: Partial<Record<string, MomentConfig>> = {
  sorry: {
    type: 'forgive-me',
    askText: 'Forgive me?',
    yesLabel: 'Yes, I forgive you',
    noLabel: 'Not yet',
    dodgePhrases: [
      'Please? 🥺',
      'I really mean it...',
      'I promise to do better',
      "You know you can't stay mad at me",
      'My heart is waiting...',
    ],
    resolutionText: 'Thank you, {name} 🤍 You just made everything right again.',
    },
  love: {
    type: 'will-you',
    askText: 'Will you be mine?',
    yesLabel: 'Yes! 💖',
    noLabel: 'Hmm...',
    dodgePhrases: [
      'Are you sure? 🥺',
      'Take another look at the card...',
      'My heart says try again',
      'Destiny is dodging with me',
    ],
    resolutionText: '{name}, you just made someone the happiest person alive 💞',
  },
}

const typeAliases: Record<string, string> = {
  valentine: 'love',
  apology: 'sorry',
  'forgive-me': 'sorry',
}

/** Default Moment config for a card type, or null if the type has no playful ask. */
export function getDefaultMomentConfig(cardType: string | null | undefined): MomentConfig | null {
  if (!cardType) return null
  const normalized = cardType.toLowerCase()
  const key = defaultConfigs[normalized] ? normalized : typeAliases[normalized]
  const config = key ? defaultConfigs[key] : undefined
  return config ? { ...config, dodgePhrases: [...config.dodgePhrases] } : null
}

/** Card types where the Moment toggle defaults to ON. */
export function isMomentDefaultEnabled(cardType: string | null | undefined): boolean {
  return getDefaultMomentConfig(cardType)?.type === 'forgive-me'
}

/** Safe parse for Json columns coming back from Prisma. */
export function parseMomentConfig(value: unknown): MomentConfig | null {
  const result = momentConfigSchema.safeParse(value)
  return result.success ? result.data : null
}

export function parseMomentResponse(value: unknown): MomentResponse | null {
  const result = momentResponseSchema.safeParse(value)
  return result.success ? result.data : null
}

export function renderResolutionText(config: MomentConfig, recipientName?: string | null): string {
  const name = recipientName?.trim()
  if (name) return config.resolutionText.replace('{name}', name)
  // Drop the placeholder (and any awkward spacing) when we don't know the name
  return config.resolutionText.replace(/,?\s*\{name\}\s*,?/, ' ').replace(/\s{2,}/g, ' ').trim()
}
