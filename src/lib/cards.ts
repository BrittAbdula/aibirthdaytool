import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export interface Card {
  id: number;
  responseContent: string;
}

export const getRecentCards = unstable_cache(
  async (page: number, pageSize: number): Promise<Card[]> => {
    const cards = await prisma.apiLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        id: true,
        responseContent: true,
      },
    });
    return cards;
  },
  ['recent-cards'],
  { revalidate: 300 }
);