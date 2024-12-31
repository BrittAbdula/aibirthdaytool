'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function recordUserAction(cardId: string, action: 'copy' | 'download' | 'send'): Promise<void> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    await prisma.userAction.create({
      data: {
        cardId,
        action,
        userId,
      },
    })
  } catch (error) {
    console.error('Failed to record user action:', error)
    throw error
  }
}
