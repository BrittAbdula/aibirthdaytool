'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// NOTE: UserAction.cardId is a foreign key to ApiLog.cardId — always pass the
// original card id (EditedCard.originalCardId), never an EditedCard.id.
export type UserActionType =
  | 'copy'
  | 'download'
  | 'send'
  | 'up'
  | 'generate_start'
  | 'generate_complete'
  | 'recipient_view'
  | 'recipient_reply_click'
  | 'recipient_create_click'
  | 'moment_answer'

export async function recordUserAction(cardId: string, action: UserActionType): Promise<void> {
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
