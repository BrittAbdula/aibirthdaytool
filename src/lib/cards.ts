import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { CardType } from '@/lib/card-config'
import { Prisma } from '@prisma/client';

const FEATURED_MODELS = [
  'gpt4o-image',
  'google/nano-banana',
  'google/nano-banana-pro',
  'google/nano-banana-edit',
  'hm-veo3-fast-video',
  'anthropic/claude-sonnet-4',
  'claude-sonnet-4-20250514',
  'claude-sonnet-4-5-20250929',
  'gemini-2.0-flash-image'
] as const;

const PREMIUM_BADGE_MODELS = [
  'gpt4o-image',
  'google/nano-banana-pro',
  'hm-veo3-fast-video'
] as const;

const PREMIUM_TAB_MODELS = [
  'gpt4o-image',
  'google/nano-banana-pro',
  'anthropic/claude-sonnet-4',
  'claude-sonnet-4-5-20250929',
  'anthropic/claude-3.7-sonnet',
  'google/nano-banana-edit'
] as const;

const buildModelCondition = (models: readonly string[]) =>
  Prisma.sql`ec."model" IN (${Prisma.join(models.map(model => Prisma.sql`${model}`))})`;
export interface Card {
  id: string;
  cardType: string;
  relationship: string | null;
  // editedContent: string;
  r2Url: string | null;
  like_count?: number;
  premium?: boolean;
  message: string | null;
  // createdAt: Date; // Add createdAt for sorting
  // originalCardId: string; // Add originalCardId for grouping
}

export type TabType = 'recent' | 'popular' | 'liked';

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

export const getPremiumCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string|null, relationship: string|null = null) => {
    return fetchPremiumCards(page, pageSize, wishCardType, relationship);
  },
  ['premium-cards-server'],
  { revalidate: 300 }
);


async function fetchRecentCards(
  page: number,
  pageSize: number,
  wishCardType: string | null,
  relationship: string | null = null
): Promise<{ cards: Card[]; totalPages: number }> {
  const offset = (page - 1) * pageSize;

  // Base WHERE conditions
  const whereConditions: Prisma.Sql[] = [
    buildModelCondition(FEATURED_MODELS),
    Prisma.sql`ec."isPublic" = true`
  ];
  if (wishCardType) {
    whereConditions.push(Prisma.sql`ec."cardType" = ${wishCardType}`);
    }
  if (relationship) {
    whereConditions.push(Prisma.sql`ec.relationship = ${relationship}`);
  }

  // Combine WHERE conditions
  const whereClause = whereConditions.length > 0 
    ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
    : Prisma.sql``;

  // Main query using ROW_NUMBER() to find the newest card per group,
  // and MAX() OVER to order groups by the newest card's date.
  const cardsQuery = Prisma.sql`
    WITH RankedCards AS (
      SELECT
        ec.id,
        ec."cardType",
        ec.relationship,
        ec."r2Url",
        ec."createdAt",
        ec."originalCardId",
        ec."message",
        case when ${buildModelCondition(PREMIUM_BADGE_MODELS)} then true else false end as premium,
        -- Rank within each group to find the newest (rn_asc = 1)
        ROW_NUMBER() OVER (PARTITION BY ec."originalCardId" ORDER BY ec."createdAt" DESC) as rn_asc,
        -- Get the latest timestamp for each group for ordering the groups
        MAX(ec."createdAt") OVER (PARTITION BY ec."originalCardId") as max_createdAt_in_group
      FROM "EditedCard" ec
      ${whereClause}
    )
    SELECT
      id,
      "cardType",
      relationship,
      "r2Url",
      "createdAt",
      "originalCardId",
      "message",
      premium
    FROM RankedCards
    WHERE rn_asc = 1 -- Select only the newest card from each group
    ORDER BY max_createdAt_in_group DESC -- Order groups by the newest card within them
    LIMIT ${pageSize} OFFSET ${offset};
  `;

  // Query for total distinct groups matching the criteria
  const totalGroupsQuery = Prisma.sql`
    SELECT COUNT(DISTINCT "originalCardId")::integer as count
    FROM "EditedCard" ec
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
  const whereConditions: Prisma.Sql[] = [
    buildModelCondition(FEATURED_MODELS),
    Prisma.sql`ec."isPublic" = true`
  ];
  if (wishCardType) {
    whereConditions.push(Prisma.sql`ec."cardType" = ${wishCardType}`);
  }
  if (relationship) {
    whereConditions.push(Prisma.sql`ec.relationship = ${relationship}`);
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
        ec."message",
        case when ${buildModelCondition(PREMIUM_BADGE_MODELS)} then true else false end as premium,
        -- Rank within each group to find the oldest (rn_asc = 1)
        ROW_NUMBER() OVER (PARTITION BY ec."originalCardId" ORDER BY ec."createdAt" DESC) as rn_asc,
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
      "message",
      premium
    FROM RankedCards
    WHERE rn_asc = 1 -- Select only the oldest card from each group
    ORDER BY
      group_count DESC,        -- Order groups by popularity (count)
      max_createdAt_in_group DESC -- Tie-breaker: oldest activity first
    LIMIT ${pageSize} OFFSET ${offset};
  `;

  // Query for total distinct groups (same as recent)
  const totalGroupsQuery = Prisma.sql`
    SELECT COUNT(DISTINCT "originalCardId")::integer as count
    FROM "EditedCard" ec
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

export async function getLikedCardsServer(
  page: number,
  pageSize: number,
  wishCardType: string | null = null,
  relationship: string | null = null
): Promise<{ cards: Card[]; totalPages: number }> {
  const offset = (page - 1) * pageSize;

  // Base WHERE conditions
  const whereConditions: Prisma.Sql[] = [
    Prisma.sql`"ec"."createdAt" >= NOW() - INTERVAL '60 days'`,
    Prisma.sql`ec."isPublic" = true`
  ];
  if (wishCardType) {
    whereConditions.push(Prisma.sql`ec."cardType" = ${wishCardType}`);
  }
  if (relationship) {
    whereConditions.push(Prisma.sql`ec.relationship = ${relationship}`);
  }
  whereConditions.push(buildModelCondition(FEATURED_MODELS));
  

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
        ec."message",
        case when ${buildModelCondition(PREMIUM_BADGE_MODELS)} then true else false end as premium,
        -- Rank within each group to find the oldest (rn_asc = 1)
        ROW_NUMBER() OVER (PARTITION BY ec."originalCardId" ORDER BY ec."createdAt" ASC) as rn_asc,
        -- Count cards per group for popularity ranking
        COUNT(*) OVER (PARTITION BY ec."originalCardId") as group_count,
        -- Get the latest timestamp for tie-breaking in ordering
        MAX(ec."createdAt") OVER (PARTITION BY ec."originalCardId") as max_createdAt_in_group,
        -- Count user actions with 'up' for each group
        COUNT(ua.id) OVER (PARTITION BY ec."originalCardId")::integer as like_count
      FROM "EditedCard" ec
      LEFT JOIN "UserAction" ua ON ua."cardId" = ec."id" AND ua.action = 'up'
      ${whereClause}
    )
    SELECT
      id,
      "cardType",
      relationship,
      "r2Url",
      like_count,
      "message",
      premium
    FROM RankedCards
    WHERE rn_asc = 1 -- Select only the oldest card from each group
    ORDER BY
      like_count DESC,        -- Order groups by number of likes
      max_createdAt_in_group DESC -- Tie-breaker: newest first
    LIMIT ${pageSize} OFFSET ${offset};
  `;
  

  // Query for total distinct groups
  const totalGroupsQuery = Prisma.sql`
    SELECT COUNT(DISTINCT "originalCardId")::integer as count
    FROM "EditedCard" ec
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

export async function fetchPremiumCards(
  page: number,
  pageSize: number,
  wishCardType: string | null = null,
  relationship: string | null = null
): Promise<{ cards: Card[]; totalPages: number }> {
  const offset = (page - 1) * pageSize;

  // Base WHERE conditions
  const whereConditions: Prisma.Sql[] = [
    buildModelCondition(PREMIUM_TAB_MODELS),
    Prisma.sql`ec."isPublic" = true`
  ];
  if (wishCardType) {
    whereConditions.push(Prisma.sql`ec."cardType" = ${wishCardType}`);
  }
  if (relationship) {
    whereConditions.push(Prisma.sql`ec.relationship = ${relationship}`);
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
        ec."message",
        case when ${buildModelCondition(PREMIUM_TAB_MODELS)} then true else false end as premium,
        -- Rank within each group to find the oldest (rn_asc = 1)
        ROW_NUMBER() OVER (PARTITION BY ec."originalCardId" ORDER BY ec."createdAt" ASC) as rn_asc,
        -- Count cards per group for popularity ranking
        COUNT(*) OVER (PARTITION BY ec."originalCardId") as group_count,
        -- Get the latest timestamp for tie-breaking in ordering
        MAX(ec."createdAt") OVER (PARTITION BY ec."originalCardId") as max_createdAt_in_group,
        -- Count user actions with 'up' for each group
        COUNT(ua.id) OVER (PARTITION BY ec."originalCardId")::integer as like_count
      FROM "EditedCard" ec
      LEFT JOIN "UserAction" ua ON ua."cardId" = ec."id" AND ua.action = 'up'
      ${whereClause}
    )
    SELECT
      id,
      "cardType",
      relationship,
      "r2Url",
      like_count,
      "message",
      premium
    FROM RankedCards
    WHERE rn_asc = 1 -- Select only the oldest card from each group
    ORDER BY
      like_count DESC,        -- Order groups by number of likes
      max_createdAt_in_group DESC -- Tie-breaker: newest first
    LIMIT ${pageSize} OFFSET ${offset};
  `;
  

  // Query for total distinct groups
  const totalGroupsQuery = Prisma.sql`
    SELECT COUNT(DISTINCT "originalCardId")::integer as count
    FROM "EditedCard" ec
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
