import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import {prisma} from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '12')
  const skip = (page - 1) * pageSize

  try {
    const [cards, total] = await Promise.all([
      prisma.apiLog.findMany({
        where: {
          userActions: {
            some: {
              action: 'send',
              userId: session.user.id
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        skip,
        take: pageSize,
      }),
      prisma.apiLog.count({
        where: {
          userActions: {
            some: {
              action: 'send',
              userId: session.user.id
            }
          }
        }
      })
    ])

    return NextResponse.json({
      cards,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (error) {
    console.error('Error fetching user cards:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
