import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadSvgToR2 } from '@/lib/r2'

export async function POST(request: Request) {
  try {
    const { editedCardId, cardType, originalCardId, editedContent, spotifyTrackId } = await request.json()
    console.log('-------------:', editedCardId, cardType, originalCardId, editedContent, spotifyTrackId)

    const createdAt = new Date()
    
    if (editedCardId) {
      // Upload edited content to R2, overwriting the existing file
      const r2Url = await uploadSvgToR2(editedContent, editedCardId, createdAt)

      await prisma.editedCard.update({
        where: { id: editedCardId },
        data: {
          editedContent,
          spotifyTrackId,
          r2Url,
        },
      })
      return NextResponse.json({ id: editedCardId }, { status: 200 })
    } else {
      // Generate a new ID for the edited card
      const newCardId = crypto.randomUUID()
      
      // Upload edited content to R2
      const r2Url = await uploadSvgToR2(editedContent, newCardId, createdAt)

      const editedCard = await prisma.editedCard.create({
        data: {
          id: newCardId,
          cardType,
          originalCardId,
          editedContent,
          spotifyTrackId,
          r2Url,
          createdAt,
        },
      })
      return NextResponse.json({ id: editedCard.id }, { status: 201 })
    }
  } catch (error) {
    console.error('Error saving edited card:', error)
    return NextResponse.json({ error: 'Failed to save edited card' }, { status: 500 })
  }
}
