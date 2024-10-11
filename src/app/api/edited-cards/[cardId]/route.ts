
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { cardId: string } }) {
    try {
        const editedCards = await prisma.editedCard.findUnique({
            where: { id: params.cardId }
        })

        return NextResponse.json(editedCards)
    } catch (error) {
        console.error('Error fetching edited card:', error)
        return NextResponse.json({ error: 'Failed to fetch edited card' }, { status: 500 })
    }
}
