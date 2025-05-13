import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { searchTerm } = body

        if (!searchTerm || typeof searchTerm !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid search term' },
                { status: 400 }
            )
        }

        const normalizedSearchTerm = searchTerm.toLowerCase().trim()

        // Try to update existing record first
        const updated = await prisma.missingGenerator.update({
            where: { searchTerm: normalizedSearchTerm },
            data: { count: { increment: 1 } },
        }).catch(() => null)

        // If no existing record, create new one
        if (!updated) {
            await prisma.missingGenerator.create({
                data: {
                    searchTerm: normalizedSearchTerm,
                    count: 1,
                    createdAt: new Date(),
                },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reporting missing generator:', error)
        return NextResponse.json(
            { error: 'Failed to report missing generator' },
            { status: 500 }
        )
    }
}