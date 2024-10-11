import { prisma } from '@/lib/prisma'

export async function recordUserAction(cardId: string, action: 'copy' | 'download' | 'send'): Promise<void> {
    console.log('recordUserAction', cardId, action)
  try {
    await prisma.userAction.create({
      data: {
        cardId,
        action,
      },
    })
  } catch (error) {
    console.error('Failed to record user action:', error)
    throw error
  }
}