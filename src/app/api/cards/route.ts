import { NextResponse } from 'next/server'
import { getRecentCardsServer } from '@/lib/cards'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '12', 10)
  const wishCardType = searchParams.get('wishCardType')
  const relationship = searchParams.get('relationship')

  try {
    const cardsData = await getRecentCardsServer(page, pageSize, wishCardType, relationship)
    return NextResponse.json(cardsData)
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}