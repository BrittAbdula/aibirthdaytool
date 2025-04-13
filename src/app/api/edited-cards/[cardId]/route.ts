
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { cardId: string } }) {
    let editedCards: {
        id: string | null,
        editedContent: string | null,
        r2Url: string | null,
        originalCardId: string | null
    } | null = null
    try {
         editedCards = await prisma.editedCard.findUnique({
            where: { id: params.cardId },
            select: {
                id: true,
                editedContent: true,
                r2Url: true,
                originalCardId: true
            }
        })
        console.log('--------------------------------')
        console.log('editedCards', editedCards)
        if (!editedCards?.id) {
            const originalCard = await prisma.apiLog.findUnique({
                where: { cardId: params.cardId },
                select: {
                    cardId: true,
                    responseContent: true,
                    r2Url: true 
                }
            })
            console.log('originalCard', originalCard)
            if (originalCard) {
                editedCards = {
                    id: null,
                    editedContent: originalCard.responseContent,
                    r2Url: originalCard.r2Url,
                    originalCardId: originalCard.cardId
                }
            }
            console.log('editedCards', editedCards)
        }

        return NextResponse.json(editedCards)
    } catch (error) {
        console.error('Error fetching edited card:', error)
        return NextResponse.json({ error: 'Failed to fetch edited card' }, { status: 500 })
    }
}
