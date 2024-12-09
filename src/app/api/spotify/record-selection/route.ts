import { NextResponse } from 'next/server'
import {prisma} from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { cardType, song } = await request.json()

    if (!cardType || !song) {
      return NextResponse.json(
        { error: 'cardType and song are required' },
        { status: 400 }
      )
    }

    // Upsert the song record
    await prisma.spotifyMusic.upsert({
      where: {
        cardType_spotifyId: {
          cardType,
          spotifyId: song.id
        }
      },
      update: {
        selectCount: { increment: 1 },
        lastSelected: new Date()
      },
      create: {
        cardType,
        spotifyId: song.id,
        name: song.name,
        artist: song.artist,
        previewUrl: song.previewUrl || null,
        imageUrl: song.imageUrl || null,
        selectCount: 1
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to record song selection' },
      { status: 500 }
    )
  }
}
