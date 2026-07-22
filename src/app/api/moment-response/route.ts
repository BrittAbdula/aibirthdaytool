import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseMomentConfig } from '@/lib/moment-config'

const requestSchema = z.object({
  cardId: z.string().min(1).max(128),
  answer: z.literal('yes'),
  attempts: z.number().int().min(0).max(99),
})

// Recipients are anonymous — no auth. First answer wins; later posts are no-ops.
export async function POST(request: Request) {
  try {
    const body = requestSchema.safeParse(await request.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { cardId, answer, attempts } = body.data

    const card = await prisma.editedCard.findFirst({
      where: {
        OR: [{ id: cardId }, { customUrl: cardId }],
        deleted: false,
      },
      select: { id: true, originalCardId: true, momentConfig: true, momentResponse: true },
    })

    if (!card || !parseMomentConfig(card.momentConfig)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (card.momentResponse) {
      return NextResponse.json({ ok: true, alreadyAnswered: true })
    }

    await prisma.editedCard.update({
      where: { id: card.id },
      data: {
        momentResponse: {
          answer,
          attempts,
          answeredAt: new Date().toISOString(),
        },
      },
    })

    // Funnel signal for the sender's "they said yes" moment; never block the response
    try {
      await prisma.userAction.create({
        data: { cardId: card.originalCardId, action: 'moment_answer' },
      })
    } catch (error) {
      console.error('Failed to record moment_answer action:', error)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error recording moment response:', error)
    return NextResponse.json({ error: 'Failed to record response' }, { status: 500 })
  }
}
