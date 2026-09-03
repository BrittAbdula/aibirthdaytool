import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { FALLBACK_CARD_MAKERS, type CardMaker } from '@/lib/nav-config'

const readCardMakers = unstable_cache(
  async (): Promise<CardMaker[]> => {
    const generators = await prisma.cardGenerator.findMany({
      where: { isSystem: true },
      select: { slug: true, label: true },
      orderBy: { slug: 'asc' },
    })
    return generators.map((generator) => ({ slug: generator.slug, label: generator.label }))
  },
  ['nav-card-makers'],
  { revalidate: 3600 }
)

/**
 * Card makers for the header search and the compose-header check.
 * The static list is only a fallback: the navigation must never break, and a
 * stale menu is better than a failed layout render.
 */
export async function getNavCardMakers(): Promise<CardMaker[]> {
  try {
    const makers = await readCardMakers()
    return makers.length > 0 ? makers : FALLBACK_CARD_MAKERS
  } catch (error) {
    console.error('Failed to load card makers for navigation', error)
    return FALLBACK_CARD_MAKERS
  }
}
