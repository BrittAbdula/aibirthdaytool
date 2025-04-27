import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { CardType } from '@/lib/card-config'
import { Prisma } from '@prisma/client';
export interface Card {
  id: string;
  cardType: string;
  relationship: string | null;
  // editedContent: string;
  r2Url: string | null;
  // createdAt: Date; // Add createdAt for sorting
  // originalCardId: string; // Add originalCardId for grouping
}

export type TabType = 'recent' | 'popular';

// 服务端渲染使用的函数，带有缓存 - 最新卡片
export const getRecentCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string|null, relationship: string|null = null) => {
    return fetchRecentCards(page, pageSize, wishCardType, relationship);
  },
  ['recent-cards-server'],
  { revalidate: 1800 }
);

// 服务端渲染使用的函数，带有缓存 - 热门卡片 (for now, just sorted by date in reverse)
export const getPopularCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string|null, relationship: string|null = null) => {
    // For demo purposes, we're sorting "popular" cards randomly
    // In a real app, you would use real popularity metrics
    return fetchPopularCards(page, pageSize, wishCardType, relationship);
  },
  ['popular-cards-server'],
  { revalidate: 7200 }
);

// 客户端使用的函数，不使用缓存 - 最新卡片
// export async function getRecentCardsClient(
//   page: number, 
//   pageSize: number, 
//   wishCardType: string|null,
//   relationship: string|null = null
// ): Promise<{ cards: Card[], totalPages: number }> {
//   return fetchRecentCards(page, pageSize, wishCardType, relationship);
// }

// 客户端使用的函数，不使用缓存 - 热门卡片
// export async function getPopularCardsClient(
//   page: number, 
//   pageSize: number, 
//   wishCardType: string|null,
//   relationship: string|null = null
// ): Promise<{ cards: Card[], totalPages: number }> {
//   return fetchPopularCards(page, pageSize, wishCardType, relationship);
// }

async function fetchRecentCards(
  page: number,
  pageSize: number,
  wishCardType: string | null,
  relationship: string | null = null
): Promise<{ cards: Card[]; totalPages: number }> {
  const offset = (page - 1) * pageSize;

  // Base WHERE conditions
  const whereConditions: Prisma.Sql[] = [];
  if (wishCardType) {
    whereConditions.push(Prisma.sql`"cardType" = ${wishCardType}`);
  }
  if (relationship) {
    whereConditions.push(Prisma.sql`relationship = ${relationship}`);
  }

  // Combine WHERE conditions
  const whereClause = whereConditions.length > 0 
    ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
    : Prisma.sql``;

  // Main query using ROW_NUMBER() to find the oldest card per group,
  // and MAX() OVER to order groups by the newest card's date.
  const cardsQuery = Prisma.sql`
    WITH RankedCards AS (
      SELECT
        ec.id,
        ec."cardType",
        ec.relationship,
        ec."editedContent",
        ec."r2Url",
        ec."createdAt",
        ec."originalCardId",
        -- Rank within each group to find the oldest (rn_asc = 1)
        ROW_NUMBER() OVER (PARTITION BY ec."originalCardId" ORDER BY ec."createdAt" ASC) as rn_asc,
        -- Get the latest timestamp for each group for ordering the groups
        MAX(ec."createdAt") OVER (PARTITION BY ec."originalCardId") as max_createdAt_in_group
      FROM "EditedCard" ec
      ${whereClause}
    )
    SELECT
      id,
      "cardType",
      relationship,
      "editedContent",
      "r2Url",
      "createdAt",
      "originalCardId"
    FROM RankedCards
    WHERE rn_asc = 1 -- Select only the oldest card from each group
    ORDER BY max_createdAt_in_group DESC -- Order groups by the newest card within them
    LIMIT ${pageSize} OFFSET ${offset};
  `;

  // Query for total distinct groups matching the criteria
  const totalGroupsQuery = Prisma.sql`
    SELECT COUNT(DISTINCT "originalCardId")::integer as count
    FROM "EditedCard"
    ${whereClause};
  `;
  // Alternatively, use Prisma's count if simpler and efficient enough:
  // const totalGroupsCount = await prisma.editedCard.count({
  //   where: {
  //     r2Url: { not: null },
  //     ...(wishCardType ? { cardType: wishCardType } : {}),
  //     ...(relationship ? { relationship: relationship } : {}),
  //   },
  //   distinct: ['originalCardId'],
  // });

  // Execute queries concurrently
  const [cardsResult, totalResult] = await Promise.all([
    prisma.$queryRaw<Card[]>(cardsQuery),
    prisma.$queryRaw<{ count: number }[]>(totalGroupsQuery)
  ]);

  const totalGroupsCount = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalGroupsCount / pageSize);

  return { cards: cardsResult, totalPages };
}


// --- Optimized fetchPopularCards ---
// Orders groups by the number of cards in them (desc), then by most recent activity.
// Selects the oldest card within each selected group.
async function fetchPopularCards(
  page: number,
  pageSize: number,
  wishCardType: string | null,
  relationship: string | null = null
): Promise<{ cards: Card[]; totalPages: number }> {
  const offset = (page - 1) * pageSize;

  // Base WHERE conditions (same as recent)
  const whereConditions: Prisma.Sql[] = [];
  if (wishCardType) {
    whereConditions.push(Prisma.sql`"cardType" = ${wishCardType}`);
  }
  if (relationship) {
    whereConditions.push(Prisma.sql`relationship = ${relationship}`);
  }

  const whereClause = whereConditions.length > 0 
    ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
    : Prisma.sql``;

  // Main query using ROW_NUMBER() to find the oldest card per group,
  // and COUNT() OVER to order groups by their size (popularity).
  const cardsQuery = Prisma.sql`
    WITH RankedCards AS (
      SELECT
        ec.id,
        ec."cardType",
        ec.relationship,
        ec."r2Url",
        -- Rank within each group to find the oldest (rn_asc = 1)
        ROW_NUMBER() OVER (PARTITION BY ec."originalCardId" ORDER BY ec."createdAt" ASC) as rn_asc,
        -- Count cards per group for popularity ranking
        COUNT(*) OVER (PARTITION BY ec."originalCardId") as group_count,
        -- Get the latest timestamp for tie-breaking in ordering
        MAX(ec."createdAt") OVER (PARTITION BY ec."originalCardId") as max_createdAt_in_group
      FROM "EditedCard" ec
      ${whereClause}
    )
    SELECT
      id,
      "cardType",
      relationship,
      "r2Url",
    FROM RankedCards
    WHERE rn_asc = 1 -- Select only the oldest card from each group
    ORDER BY
      group_count DESC,        -- Order groups by popularity (count)
      max_createdAt_in_group ASC -- Tie-breaker: oldest activity first
    LIMIT ${pageSize} OFFSET ${offset};
  `;

  // Query for total distinct groups (same as recent)
  const totalGroupsQuery = Prisma.sql`
    SELECT COUNT(DISTINCT "originalCardId")::integer as count
    FROM "EditedCard"
    ${whereClause};
  `;

  // Execute queries concurrently
  const [cardsResult, totalResult] = await Promise.all([
    prisma.$queryRaw<Card[]>(cardsQuery),
    prisma.$queryRaw<{ count: number }[]>(totalGroupsQuery)
  ]);

  const totalGroupsCount = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalGroupsCount / pageSize);

  return { cards: cardsResult, totalPages };
}