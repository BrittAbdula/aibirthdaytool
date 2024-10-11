import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { editedCardId, cardType, originalCardId, editedContent } = await request.json()
    console.log('-------------:', editedCardId, cardType, originalCardId, editedContent)

    if (editedCardId) {
      await prisma.editedCard.update({
        where: { id: editedCardId },
        data: {
          editedContent,
        },
      })
      return NextResponse.json({ id: editedCardId }, { status: 200 })
    } else {
      const editedCard = await prisma.editedCard.create({
        data: {
          cardType,
          originalCardId,
          editedContent,
        },
      })
      return NextResponse.json({ id: editedCard.id }, { status: 201 })
    }
  } catch (error) {
    console.error('Error saving edited card:', error)
    return NextResponse.json({ error: 'Failed to save edited card' }, { status: 500 })
  }
}
