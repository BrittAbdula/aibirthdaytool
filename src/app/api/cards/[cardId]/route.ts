import { NextResponse } from 'next/server'
import {prisma} from '@/lib/prisma';
import {fetchSvgContent} from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const card = await prisma.apiLog.findUnique({
      where: { cardId: params.cardId },
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }
    card.responseContent = await fetchSvgContent(card.r2Url)

    return NextResponse.json(card)
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
