'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client';

interface ActionResponse {
  success: boolean;
  message?: string;
}

// Helper to parse card IDs safely
function parseCardIds(idsString: string | null | undefined, isNumeric: boolean = false): string[] | number[] {
  if (!idsString) return [];
  const ids = idsString.split(',').map(id => id.trim()).filter(id => id !== '');
  if (isNumeric) {
    return ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  }
  return ids;
}

export async function deleteSentCards(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'User not authenticated.' }
  }

  const cardIdsString = formData.get('cardIds') as string | null;
  const cardIds = parseCardIds(cardIdsString, false) as string[]; // Sent card IDs are strings

  if (cardIds.length === 0) {
    return { success: false, message: 'No card IDs provided or IDs are invalid.' }
  }

  try {
    // insert deleted card ids and information into deletedCard table
    const deletedCards = await prisma.editedCard.findMany({
      where: {
        id: {
          in: cardIds,
        },
        userId: session.user.id,
      },
      select: {
        id: true,
        cardType: true,
        relationship: true,
        editedContent: true,
        spotifyTrackId: true,
        r2Url: true,
        originalCardId: true,
      },
    })

    // insert the deleted cards into the deletedCard table
    await prisma.deletedCard.createMany({
      data: deletedCards.map(card => ({
        editedCardId: card.id,
        userId: session.user.id,
        originalCardId: card.originalCardId,
        cardType: card.cardType,
        relationship: card.relationship,
        r2Url: card.r2Url,
      })),
    })

    // delete the edited cards from the editedCard table
    await prisma.editedCard.deleteMany({
      where: {
        id: {
          in: cardIds,
        },
        userId: session.user.id,
      },
    })
    revalidatePath('/my-cards')
    return { success: true, message: 'Selected sent cards deleted.' }
  } catch (error) {
    console.error('Error deleting sent cards:', error)
    return { success: false, message: 'Failed to delete sent cards.' }
  }
}

export async function deleteGeneratedCards(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'User not authenticated.' }
  }

  const cardIdsString = formData.get('cardIds') as string | null;
  // Generated card IDs are numbers, parse them accordingly
  const cardIds = parseCardIds(cardIdsString, true) as number[]; 

  if (cardIds.length === 0) {
    return { success: false, message: 'No card IDs provided or IDs are invalid.' }
  }

  try {
    await prisma.apiLog.deleteMany({
      where: {
        id: {
          in: cardIds,
        },
        userId: session.user.id, 
      },
    })
    revalidatePath('/my-cards')
    return { success: true, message: 'Selected generated cards deleted.' }
  } catch (error) {
    console.error('Error deleting generated cards:', error)
    return { success: false, message: 'Failed to delete generated cards.' }
  }
} 