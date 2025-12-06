import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma';
import { fetchSvgContent } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import { uploadSvgToR2 } from '@/lib/r2';

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
          r2Url: true,
          id: true,
          userInputs: true,
        }
      })
      if (originalCard) {
        let editedContent = originalCard.responseContent;
        const isSvgUrl = (url?: string | null) => !!url && url.toLowerCase().endsWith('.svg');

        if (!editedContent && isSvgUrl(originalCard.r2Url)) {
          editedContent = await fetchSvgContent(originalCard.r2Url) || '';
        }

        // Extract values from userInputs
        const userInputs = originalCard.userInputs as Prisma.JsonObject;

        // Since userInputs is stored as a Record<string, any> and not an array
        let relationshipValue = "";
        let messageValue = "";
        let recipientName = "";
        let senderName = "";
        let requirements = "";
        let isPublic = true;
        // Check if userInputs is an object with direct key-value pairs
        if (userInputs) {
          relationshipValue =
            (userInputs.relationship as string) ||
            (userInputs.to as string) ||
            "";
          messageValue = (userInputs.message as string) || "";
          recipientName = (userInputs.to as string) || "";
          senderName = (userInputs.signed as string) || "";
          requirements = (userInputs.cardRequirements as string) || "";
          const rawIsPublic = userInputs.isPublic;
          if (typeof rawIsPublic === 'boolean') {
            isPublic = rawIsPublic;
          }
        }

        return NextResponse.json({
          id: null,
          originalCardId: originalCard.cardId,
          editedContent: editedContent || '',
          cardType: originalCard.cardType,
          r2Url: originalCard.r2Url,
          relationship: relationshipValue,
          message: messageValue,
          recipientName: relationshipValue,
          senderName: relationshipValue,
          requirements: requirements,
          isPublic: isPublic
        })
      } else {
        const responseContent = await fetchSvgContent(`https://store.celeprime.com/${cardType}.svg`) || ''
        return NextResponse.json({ responseContent })
      }
    } else {
      // card.editedContent = await fetchSvgContent(card.r2Url) || card.editedContent

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
    const existingCard = await prisma.apiLog.findUnique({
      where: { cardId: params.cardId },
      select: { timestamp: true }
    });

    const createdAt = existingCard?.timestamp || new Date();
    const r2Url = await uploadSvgToR2(responseContent, params.cardId, createdAt);

    const updatedCard = await prisma.apiLog.update({
      where: { cardId: params.cardId },
      data: { responseContent: '', r2Url },
    })

    return NextResponse.json(updatedCard)
  } catch (error) {
    console.error('Error updating card:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
