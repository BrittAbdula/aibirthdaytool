import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { requestKieGrokMessage, KIE_GROK_4_6_MODEL } from '@/lib/kie-grok'
import {
  getDefaultMomentConfig,
  momentConfigSchema,
  type MomentConfig,
} from '@/lib/moment-config'

const requestSchema = z.object({
  cardType: z.string().min(1).max(64),
  recipientName: z.string().max(80).optional(),
  message: z.string().max(2000).optional(),
  context: z.string().max(2000).optional(),
})

// Generates personalized Moment copy (the ask + dodge phrases) from the
// sender's own words. One Grok call; falls back to the type defaults.
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = requestSchema.safeParse(await request.json().catch(() => null))
  if (!body.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { cardType, recipientName, message, context } = body.data
  const defaults = getDefaultMomentConfig(cardType)
  if (!defaults) {
    return NextResponse.json({ error: 'This card type has no Moment template' }, { status: 400 })
  }

  const senderWords = [message, context].filter(Boolean).join('\n').trim()
  if (!senderWords) {
    return NextResponse.json({ momentConfig: defaults, personalized: false })
  }

  try {
    const response = await requestKieGrokMessage({
      model: KIE_GROK_4_6_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            `You are writing the interactive layer of a digital ${cardType} card.`,
            `The recipient sees a question with a Yes button and a "no" button that playfully dodges away.`,
            `Each time they try to tap "no", the button shows the next dodge phrase — these should escalate from playful to genuinely tender, and reference the sender's own words where it lands naturally. Keep it warm and a little funny, never guilt-trippy.`,
            recipientName ? `The recipient's name is ${recipientName}.` : '',
            '',
            `The sender wrote:`,
            senderWords,
            '',
            'Return ONLY a JSON object, no markdown, with exactly these keys:',
            '{',
            `  "askText": short question (max 60 chars), e.g. "${defaults.askText}",`,
            '  "yesLabel": the yes button (max 30 chars),',
            '  "noLabel": the initial no button (max 30 chars),',
            '  "dodgePhrases": array of 4-5 short lines (each max 90 chars),',
            '  "resolutionText": shown after they tap yes (max 140 chars, may use {name} as a placeholder)',
            '}',
          ]
            .filter(Boolean)
            .join('\n'),
        },
      ],
    })

    const personalized = extractMomentConfig(response.text, defaults)
    if (personalized) {
      return NextResponse.json({ momentConfig: personalized, personalized: true })
    }
  } catch (error) {
    console.error('Moment personalization failed, using defaults:', error)
  }

  return NextResponse.json({ momentConfig: defaults, personalized: false })
}

function extractMomentConfig(text: string, defaults: MomentConfig): MomentConfig | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    const candidate = { ...JSON.parse(jsonMatch[0]), type: defaults.type }
    const result = momentConfigSchema.safeParse(candidate)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
