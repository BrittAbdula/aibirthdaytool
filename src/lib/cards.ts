import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { CardType } from '@/lib/card-config'

export interface Card {
  cardId: string;
  cardType: string;
  responseContent: string;
  r2Url: string | null;
  usageCount: number;
  userActions?: {
    action: string;
    timestamp: Date;
  }[];
}

// 服务端渲染使用的函数，带有缓存
export const getRecentCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string|null, relationship: string|null = null) => {
    return fetchRecentCards(page, pageSize, wishCardType, relationship);
  },
  ['recent-cards-server'],
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
    isError: false,
    r2Url: {
      not: null
    },
    ...(wishCardType ? { cardType: wishCardType } : {}),
    ...(relationship ? {
      userInputs: {
        path: ['relationship'],
        equals: relationship
      }
    } : {}),
    editedCards: {
      some: {} // Only cards with editedCards records
    }
  };

  const totalCards = await prisma.apiLog.count({ where });
  const totalPages = Math.ceil(totalCards / pageSize);

  const cardsWithEdits = await prisma.apiLog.findMany({
    where,
    orderBy: {
      editedCards: {
        _count: 'desc'
      }
    },
    take: pageSize,
    skip: (page - 1) * pageSize,
    select: {
      cardId: true,
      cardType: true,
      responseContent: true,
      r2Url: true,
      _count: {
        select: {
          editedCards: true
        }
      }
    },
  });

  const cards = cardsWithEdits.map(card => ({
    ...card,
    usageCount: card._count.editedCards,
  }));

  return { cards, totalPages };
}

export async function getDefaultCardByCardType(cardType: CardType): Promise<Card> {
  const card = await prisma.template.findFirst({
    where: { cardType: cardType },
    select: {
      cardId: true,
      cardType: true,
      previewSvg: true,
      r2Url: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return {
    cardId: card?.cardId || '',
    cardType,
    responseContent: card?.previewSvg || '',
    r2Url: card?.r2Url || null,
    usageCount: 0  // Default template cards have 0 usage count
  };
}
