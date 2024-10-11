'use server'

import { recordUserAction as dbRecordUserAction } from './db'

export async function recordUserAction(cardId: string, action: 'copy' | 'download' | 'send'): Promise<void> {
  try {
    await dbRecordUserAction(cardId, action)
  } catch (error) {
    console.error('Failed to record user action:', error)
    throw error
  }
}
