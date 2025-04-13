import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { CardType } from '@/lib/card-config'

export interface Card {
  id: string;
  cardType: string;
  editedContent: string;
  r2Url: string | null;
}

// 服务端渲染使用的函数，带有缓存
export const getRecentCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string|null, relationship: string|null = null) => {
    return fetchRecentCards(page, pageSize, wishCardType, relationship);
  },
  ['recent-cards-server2'],
  { revalidate: 300 }
);

// 客户端使用的函数，不使用缓存
export async function getRecentCardsClient(
  page: number, 
  pageSize: number, 
  wishCardType: string|null,
  relationship: string|null = null
): Promise<{ cards: Card[], totalPages: number }> {
  return fetchRecentCards(page, pageSize, wishCardType, relationship);
}

// 实际获取卡片的函数
async function fetchRecentCards(
  page: number, 
  pageSize: number, 
  wishCardType: string|null,
  relationship: string|null = null
): Promise<{ cards: Card[], totalPages: number }> {
  const where = {
    ...(wishCardType ? { cardType: wishCardType } : {}),
    ...(relationship ? { relationship: relationship } : {})
  };

  const totalCards = await prisma.editedCard.count({ where });
  const totalPages = Math.ceil(totalCards / pageSize);

  const cardsWithEdits = await prisma.editedCard.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    },
    take: pageSize,
    skip: (page - 1) * pageSize,
    select: {
      id: true,
      cardType: true,
      editedContent: true,
      r2Url: true
    },
  });


  return { cards: cardsWithEdits, totalPages };
}
