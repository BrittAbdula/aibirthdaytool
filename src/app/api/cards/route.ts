import { NextResponse } from 'next/server'
import { getRecentCardsServer, getPopularCardsServer, getLikedCardsServer, TabType, getPremiumCardsServer } from '@/lib/cards'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '12', 10)
  const wishCardType = searchParams.get('wishCardType')
  const relationship = searchParams.get('relationship')
  const tab = (searchParams.get('tab') as TabType) || 'recent'

  try {
    let cardsData;
    
    switch (tab) {
      case 'premium':
        cardsData = await getPremiumCardsServer(page, pageSize, wishCardType, relationship)
        break
      case 'popular':
        cardsData = await getPopularCardsServer(page, pageSize, wishCardType, relationship)
        break
      case 'liked':
        cardsData = await getLikedCardsServer(page, pageSize, wishCardType, relationship)
        break
      default:
        cardsData = await getRecentCardsServer(page, pageSize, wishCardType, relationship)
    }
    
    return NextResponse.json(cardsData)
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}