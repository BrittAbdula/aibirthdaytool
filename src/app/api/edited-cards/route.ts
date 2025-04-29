import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadSvgToR2 } from '@/lib/r2'
import { auth } from '@/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id || null

    const { editedCardId, cardType, originalCardId, editedContent, spotifyTrackId, customUrl, relationship, message, r2Url } = await request.json()
    console.log('-------------:', editedCardId, cardType, originalCardId, editedContent, spotifyTrackId)
    console.log('r2UrlImage:', r2Url)

    const createdAt = new Date()
    
    if (editedCardId) {
      // Upload edited content to R2, overwriting the existing file
      const r2UrlImage = editedContent? await uploadSvgToR2(editedContent, editedCardId, createdAt) : r2Url

      await prisma.editedCard.update({
        where: { id: editedCardId },
        data: {
          editedContent,
          spotifyTrackId,
          r2Url: r2UrlImage,
          userId,
          customUrl,
          relationship,
          message
        },
      })
      return NextResponse.json({ id: editedCardId, customUrl: customUrl }, { status: 200 })
    } else {
      // Generate a new ID for the edited card
      const newCardId = crypto.randomUUID()
      
      // Upload edited content to R2
      const r2UrlImage = editedContent? await uploadSvgToR2(editedContent, newCardId, createdAt) : r2Url

      const editedCard = await prisma.editedCard.create({
        data: {
          id: newCardId,
          cardType,
          originalCardId,
          editedContent,
          spotifyTrackId,
          r2Url: r2UrlImage,
          userId,
          createdAt,
          customUrl,
          relationship,
          message
        },
      })
      return NextResponse.json({ id: editedCard.id, customUrl: customUrl }, { status: 201 })
    }
  } catch (error) {
    console.error('Error saving edited card:', error)
    return NextResponse.json({ error: 'Failed to save edited card' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ cards: [], totalPages: 0 }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')
    const skip = (page - 1) * pageSize

    const cards = await prisma.editedCard.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: pageSize,
    })

    const total = await prisma.editedCard.count({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({
      cards,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (error) {
    console.error('Error fetching edited cards:', error)
    return NextResponse.json({ error: 'Failed to fetch edited cards' }, { status: 500 })
  }
}
