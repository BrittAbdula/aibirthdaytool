import { NextResponse } from 'next/server'
import {
  getFeaturedCardsServer,
  getRecentCardsServer,
  getPopularCardsServer,
  getLikedCardsServer,
  TabType,
} from '@/lib/cards'
import {
  GALLERY_PAGE_SIZE,
  MAX_GALLERY_PAGE_SIZE,
  getPageFromCursor,
  getSafeGalleryPage,
  getSafeGalleryPageSize,
} from '@/lib/gallery-pagination'

const CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=3600'
const VALID_TABS: TabType[] = ['featured', 'recent', 'popular', 'liked']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const cursorPage = getPageFromCursor(cursor)
  const page = cursor ? cursorPage : getSafeGalleryPage(searchParams.get('page'))
  const pageSize = getSafeGalleryPageSize(searchParams.get('pageSize') || GALLERY_PAGE_SIZE.toString())
  const wishCardType = searchParams.get('wishCardType')
  const relationship = searchParams.get('relationship')
  const tab = (searchParams.get('tab') as TabType) || 'featured'

  if (!page) {
    return NextResponse.json({ error: 'Invalid page or cursor' }, { status: 400 })
  }

  if (!VALID_TABS.includes(tab)) {
    return NextResponse.json({ error: 'Unsupported tab' }, { status: 400 })
  }

  try {
    let cardsData;
    
    switch (tab) {
      case 'featured':
        cardsData = await getFeaturedCardsServer(page, pageSize, wishCardType, relationship)
        break
      case 'recent':
        cardsData = await getRecentCardsServer(page, pageSize, wishCardType, relationship)
        break
      case 'popular':
        cardsData = await getPopularCardsServer(page, pageSize, wishCardType, relationship)
        break
      case 'liked':
        cardsData = await getLikedCardsServer(page, pageSize, wishCardType, relationship)
        break
      default:
        cardsData = await getFeaturedCardsServer(page, pageSize, wishCardType, relationship)
    }

    const response = NextResponse.json(cardsData)
    response.headers.set('Cache-Control', CACHE_CONTROL)
    response.headers.set('X-Gallery-Max-Page-Size', String(MAX_GALLERY_PAGE_SIZE))
    return response
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
