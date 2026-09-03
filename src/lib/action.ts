'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// NOTE: cardId accepts either an ApiLog.cardId or an EditedCard.id. The gallery
// ranking in lib/cards.ts joins UserAction on both, and roughly a third of the
// stored 'up' rows reference EditedCard ids, so both must keep working.
//
// The Prisma schema declares UserAction.cardId as a foreign key to ApiLog.cardId,
// but that constraint does not exist in the live database, which is why those
// rows could be written. Adding it would need those rows reconciled first, so
// `prisma db push` would fail against production today.
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
