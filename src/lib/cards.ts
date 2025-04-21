import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { CardType } from '@/lib/card-config'

export interface Card {
  id: string;
  cardType: string;
  relationship: string | null;
  editedContent: string;
  r2Url: string | null;
  createdAt: Date; // Add createdAt for sorting
  originalCardId: string; // Add originalCardId for grouping
}

export type TabType = 'recent' | 'popular';

// 服务端渲染使用的函数，带有缓存 - 最新卡片
export const getRecentCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string|null, relationship: string|null = null) => {
    return fetchRecentCards(page, pageSize, wishCardType, relationship);
  },
  ['recent-cards-server'],
  { revalidate: 300 }
);

// 服务端渲染使用的函数，带有缓存 - 热门卡片 (for now, just sorted by date in reverse)
export const getPopularCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string|null, relationship: string|null = null) => {
    // For demo purposes, we're sorting "popular" cards randomly
    // In a real app, you would use real popularity metrics
    return fetchPopularCards(page, pageSize, wishCardType, relationship);
  },
  ['popular-cards-server'],
  { revalidate: 300 }
);

// 客户端使用的函数，不使用缓存 - 最新卡片
export async function getRecentCardsClient(
  page: number, 
  pageSize: number, 
  wishCardType: string|null,
  relationship: string|null = null
): Promise<{ cards: Card[], totalPages: number }> {
  return fetchRecentCards(page, pageSize, wishCardType, relationship);
}

// 客户端使用的函数，不使用缓存 - 热门卡片
export async function getPopularCardsClient(
  page: number, 
  pageSize: number, 
  wishCardType: string|null,
  relationship: string|null = null
): Promise<{ cards: Card[], totalPages: number }> {
  return fetchPopularCards(page, pageSize, wishCardType, relationship);
}

// 按创建时间获取卡片的函数 (newest first)，按 originalCardId 分组并获取每组最老的记录
async function fetchRecentCards(
  page: number, 
  pageSize: number, 
  wishCardType: string|null,
  relationship: string|null = null
): Promise<{ cards: Card[], totalPages: number }> {
  const where = {
    r2Url: {
      not: null
    },
    ...(wishCardType ? { cardType: wishCardType } : {}),
    ...(relationship ? { relationship: relationship } : {}),
  };

  // 首先获取所有符合条件的originalCardId，按时间排序
  const originalCardIds = await prisma.editedCard.groupBy({
    by: ['originalCardId'],
    where,
    orderBy: {
      _max: {
        createdAt: 'desc' // 按每组最新的创建时间排序
      }
    },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });
  
  const totalGroups = await prisma.editedCard.groupBy({
    by: ['originalCardId'],
    where,
    _count: true,
  });
  
  const totalPages = Math.ceil(totalGroups.length / pageSize);
  
  if (originalCardIds.length === 0) {
    return { cards: [], totalPages };
  }

  // 对于每个originalCardId，获取该组最老的记录
  const oldestCardPromises = originalCardIds.map(async ({ originalCardId }) => {
    const oldestCards = await prisma.editedCard.findMany({
      where: {
        originalCardId,
        ...where
      },
      orderBy: {
        createdAt: 'asc'  // 按创建时间升序排序，获取最老的记录
      },
      take: 1,
      select: {
        id: true,
        cardType: true,
        relationship: true,
        editedContent: true,
        r2Url: true,
        createdAt: true,
        originalCardId: true
      }
    });
    
    return oldestCards[0];
  });
  
  const cardsWithEdits = await Promise.all(oldestCardPromises);

  return { cards: cardsWithEdits, totalPages };
}

// 获取"热门"卡片的函数，按 originalCardId 分组并获取每组最老的记录
async function fetchPopularCards(
  page: number, 
  pageSize: number, 
  wishCardType: string|null,
  relationship: string|null = null
): Promise<{ cards: Card[], totalPages: number }> {
  const where = {
    r2Url: {
      not: null
    },
    ...(wishCardType ? { cardType: wishCardType } : {}),
    ...(relationship ? { relationship: relationship } : {})
  };

  // 首先获取所有符合条件的originalCardId
  const originalCardIds = await prisma.editedCard.groupBy({
    by: ['originalCardId'],
    where,
    // 由于没有真实的popularity指标，我们仍然按时间排序
    orderBy: {
      _max: {
        createdAt: 'desc'
      }
    },
    take: pageSize * 2, // 获取更多记录以便进行随机排序
    skip: (page - 1) * pageSize,
  });
  
  const totalGroups = await prisma.editedCard.groupBy({
    by: ['originalCardId'],
    where,
    _count: true,
  });
  
  const totalPages = Math.ceil(totalGroups.length / pageSize);
  
  if (originalCardIds.length === 0) {
    return { cards: [], totalPages };
  }

  // 随机排序originalCardIds以模拟popularity
  const shuffledOriginalCardIds = [...originalCardIds].sort(() => 0.5 - Math.random());
  const selectedOriginalCardIds = shuffledOriginalCardIds.slice(0, pageSize);

  // 对于每个originalCardId，获取该组最老的记录
  const oldestCardPromises = selectedOriginalCardIds.map(async ({ originalCardId }) => {
    const oldestCards = await prisma.editedCard.findMany({
      where: {
        originalCardId,
        ...where
      },
      orderBy: {
        createdAt: 'asc'  // 按创建时间升序排序，获取最老的记录
      },
      take: 1,
      select: {
        id: true,
        cardType: true,
        relationship: true,
        editedContent: true,
        r2Url: true,
        createdAt: true,
        originalCardId: true
      }
    });
    
    return oldestCards[0];
  });
  
  const cardsWithEdits = await Promise.all(oldestCardPromises);

  return { cards: cardsWithEdits, totalPages };
}
