import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadSvgToR2 } from '@/lib/r2'
import { auth } from '@/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id || null

    const { editedCardId, cardType, originalCardId, editedContent, spotifyTrackId, customUrl, relationship, message, r2Url, isPublic, requirements, senderName, recipientName } = await request.json()
    console.log('-------------:', editedCardId, cardType, originalCardId, editedContent, spotifyTrackId, customUrl, relationship, message, r2Url, isPublic, requirements, senderName, recipientName)
    console.log('r2UrlImage:', r2Url)

    // Helper function to determine if URL is a video
    const isVideo = (url?: string) => {
      if (!url) return false;
      const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.ogg'];
      return videoExtensions.some(ext => url.toLowerCase().includes(ext));
    };

    const createdAt = new Date()
    
    if (editedCardId) {
      // For videos, use the r2Url directly without uploading SVG content
      // For images/SVG, upload the edited content if available
      let r2UrlImage: string;
      let finalEditedContent: string;

      if (isVideo(r2Url)) {
        // For videos: use the video URL directly and clear SVG content
        r2UrlImage = r2Url;
        finalEditedContent = ''; // Videos don't have SVG content, use empty string
      } else {
        // For images/SVG: upload edited content if available, otherwise use existing r2Url
        r2UrlImage = editedContent ? await uploadSvgToR2(editedContent, editedCardId, createdAt) : r2Url;
        finalEditedContent = editedContent || '';
      }

      await prisma.editedCard.update({
        where: { id: editedCardId },
        data: {
          editedContent: finalEditedContent,
          spotifyTrackId,
          r2Url: r2UrlImage,
          userId,
          customUrl,
          relationship,
          message,
          isPublic,
          requirements,
          senderName,
          recipientName
        },
      })
      return NextResponse.json({ id: editedCardId, customUrl: customUrl }, { status: 200 })
    } else {
      // Generate a new ID for the edited card
      const newCardId = crypto.randomUUID()
      
      // For videos, use the r2Url directly without uploading SVG content
      // For images/SVG, upload the edited content if available
      let r2UrlImage: string;
      let finalEditedContent: string;

      if (isVideo(r2Url)) {
        // For videos: use the video URL directly and clear SVG content
        r2UrlImage = r2Url;
        finalEditedContent = ''; // Videos don't have SVG content, use empty string
      } else {
        // For images/SVG: upload edited content if available, otherwise use existing r2Url
        r2UrlImage = editedContent ? await uploadSvgToR2(editedContent, newCardId, createdAt) : r2Url;
        finalEditedContent = editedContent || '';
      }

      const editedCard = await prisma.editedCard.create({
        data: {
          id: newCardId,
          cardType,
          originalCardId,
          editedContent: finalEditedContent,
          spotifyTrackId,
          r2Url: r2UrlImage,
          userId,
          createdAt,
          customUrl,
          relationship,
          message,
          isPublic,
          requirements,
          senderName,
          recipientName
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
