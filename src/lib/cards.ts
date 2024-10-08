import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export interface Card {
  id: number;
  cardType: string;
  responseContent: string;
}

export const getRecentCards = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string|null): Promise<Card[]> => {
    const cards = await prisma.apiLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        id: true,
        cardType: true,
        responseContent: true,
      },
      where: { 
        isError: false,
        ...(wishCardType ? { cardType: wishCardType } : {}),
      },
    });
    return cards;
  },
  ['recent-cards'],
  { revalidate: 300 }
);