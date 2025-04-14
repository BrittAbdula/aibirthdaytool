import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma';
import { fetchSvgContent } from '@/lib/utils';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { cardId: string } }
) {
  const cardType = request.url.split('cardType=')[1]
  try {
    const card = await prisma.editedCard.findUnique({
      where: { id: params.cardId },
    })

    if (!card) {
      // return NextResponse.json({ error: 'Card not found' }, { status: 404 })
      const originalCard = await prisma.apiLog.findUnique({
        where: { cardId: params.cardId },
        select: {
          responseContent: true,
          cardId: true,
          cardType: true,
          id: true,
          userInputs: true
        }
      })
      if (originalCard) {
        // Extract values from userInputs
        const userInputs = originalCard.userInputs as Prisma.JsonObject;

        // Since userInputs is stored as a Record<string, any> and not an array
        let relationshipValue = "Unknown";
        
        // Check if userInputs is an object with direct key-value pairs
        if (userInputs) {
          relationshipValue = 
            (userInputs.relationship as string) || 
            (userInputs.sender as string) || 
            "Unknown";
        }
        
        return NextResponse.json({
          id: null,
          originalCardId: originalCard.cardId,
          editedContent: originalCard.responseContent,
          cardType: originalCard.cardType,
          relationship: relationshipValue
        })
      } else {
        const responseContent = await fetchSvgContent(`https://store.celeprime.com/${cardType}.svg`)
        return NextResponse.json({ responseContent })
      }
    } else {
      card.editedContent = await fetchSvgContent(card.r2Url)

      return NextResponse.json(card)
    }
  } catch (error) {
    console.error('Error fetching card:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { cardId: string } }
) {
  const { responseContent } = await request.json()

  try {
    const updatedCard = await prisma.apiLog.update({
      where: { cardId: params.cardId },
      data: { responseContent },
    })

    return NextResponse.json(updatedCard)
  } catch (error) {
    console.error('Error updating card:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
