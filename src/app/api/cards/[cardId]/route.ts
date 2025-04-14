import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma';
import { fetchSvgContent } from '@/lib/utils';

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
        // 从 userInputs 中提取 relationship 值
        const userInputs = originalCard.userInputs;

        // 确保 userInputs 是 JSON 格式
        const parsedInputs = typeof userInputs === "string" ? JSON.parse(userInputs) : userInputs;

        // 查找 relationship 值
        const relationshipField = parsedInputs.find((field: any) => field.name === "relationship" || field.name === "sender");

        // 如果找到 relationship，返回对应值
        const relationshipValue = relationshipField?.defaultValue || "Unknown";
        return NextResponse.json({
          id: null,
          originalCardId: originalCard.cardId,
          editedContent: originalCard.responseContent,
          cardType: originalCard.cardType,
          relationship: relationshipValue
        })
      } else {
        const responseContent = await fetchSvgContent(`https://store.celeprime.com/${cardType}.svg`)
        return NextResponse.json({responseContent})
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
