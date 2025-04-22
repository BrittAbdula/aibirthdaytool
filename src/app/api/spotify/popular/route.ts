import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cardType = searchParams.get('cardType')
    // console.log('-----------cardType:', cardType)

    if (!cardType) {
      return NextResponse.json([], { status: 200 })
    }

    // Get the most popular songs for this card type
    const popularSongs = await prisma.spotifyMusic.findMany({
      where: { cardType },
      orderBy: [
        { selectCount: 'desc' },
        { lastSelected: 'desc' }
      ],
      take: 10
    })

    return NextResponse.json(popularSongs)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular songs' },
      { status: 500 }
    )
  }
}
