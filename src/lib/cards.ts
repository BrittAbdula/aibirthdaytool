import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';
import { getNextPageCursor } from '@/lib/gallery-pagination';
import {
  ACTION_WEIGHTS,
  PREMIUM_QUALITY_MODELS,
  PREMIUM_TAB_TEXT_MODELS,
  REFERENCE_EDIT_MODELS,
  STRONG_QUALITY_MODELS,
  TEXT_QUALITY_MODELS,
} from '@/lib/card-ranking';

const PREMIUM_BADGE_MODELS = [
  ...REFERENCE_EDIT_MODELS,
  ...PREMIUM_QUALITY_MODELS,
] as const;

const PREMIUM_TAB_MODELS = [
  ...REFERENCE_EDIT_MODELS,
  ...PREMIUM_QUALITY_MODELS,
  ...PREMIUM_TAB_TEXT_MODELS,
] as const;

const ACTION_LOOKBACK_DAYS = 120;

const buildModelCondition = (models: readonly string[]) =>
  Prisma.sql`ec."model" IN (${Prisma.join(models.map(model => Prisma.sql`${model}`))})`;

const buildGalleryWhereClause = (
  wishCardType: string | null,
  relationship: string | null = null,
  extraConditions: Prisma.Sql[] = []
) => {
  const whereConditions: Prisma.Sql[] = [
    Prisma.sql`ec."isPublic" = true`,
    Prisma.sql`ec."deleted" = false`,
    Prisma.sql`ec."r2Url" IS NOT NULL`,
    Prisma.sql`ec."r2Url" <> ''`,
    ...extraConditions,
  ];

  if (wishCardType) {
    whereConditions.push(Prisma.sql`ec."cardType" = ${wishCardType}`);
  }

  if (relationship) {
    whereConditions.push(Prisma.sql`ec.relationship = ${relationship}`);
  }

  return Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`;
};

const modelQualityScoreSql = Prisma.sql`
  CASE
    WHEN ${buildModelCondition(REFERENCE_EDIT_MODELS)} THEN 70
    WHEN ${buildModelCondition(PREMIUM_QUALITY_MODELS)} THEN 65
    WHEN ${buildModelCondition(STRONG_QUALITY_MODELS)} THEN 55
    WHEN ${buildModelCondition(TEXT_QUALITY_MODELS)} THEN 40
    WHEN ec."model" IS NOT NULL THEN 15
    ELSE 0
  END
`;

const recencyBoostSql = Prisma.sql`
  CASE
    WHEN ec."createdAt" >= NOW() - INTERVAL '48 hours' THEN 30
    WHEN ec."createdAt" >= NOW() - INTERVAL '7 days' THEN 20
    WHEN ec."createdAt" >= NOW() - INTERVAL '30 days' THEN 10
    WHEN ec."createdAt" >= NOW() - INTERVAL '90 days' THEN 3
    ELSE 0
  END
`;

const recentActionCountsCte = Prisma.sql`
  RecentActionCounts AS (
    SELECT
      ua."cardId",
      SUM(
        CASE ua.action
          WHEN 'up' THEN ${ACTION_WEIGHTS.up}
          WHEN 'send' THEN ${ACTION_WEIGHTS.send}
          WHEN 'download' THEN ${ACTION_WEIGHTS.download}
          WHEN 'copy' THEN ${ACTION_WEIGHTS.copy}
          ELSE 0
        END
      )::double precision as weighted_actions,
      COUNT(*) FILTER (WHERE ua.action = 'up')::integer as up_count
    FROM "UserAction" ua
    WHERE ua.timestamp >= NOW() - (${ACTION_LOOKBACK_DAYS} * INTERVAL '1 day')
    GROUP BY ua."cardId"
  )
`;

export interface Card {
  id: string;
  cardType: string;
  relationship: string | null;
  r2Url: string | null;
  like_count?: number;
  premium?: boolean;
  message: string | null;
}

export interface GalleryCardsResult {
  cards: Card[];
  hasMore: boolean;
  nextCursor?: string;
  totalPages?: number;
}

export type TabType = 'featured' | 'recent' | 'popular' | 'liked';

function buildGalleryCardsResult(cards: Card[], page: number, pageSize: number): GalleryCardsResult {
  const hasMore = cards.length > pageSize;
  const visibleCards = hasMore ? cards.slice(0, pageSize) : cards;

  return {
    cards: visibleCards,
    hasMore,
    nextCursor: getNextPageCursor(page, hasMore),
    totalPages: hasMore ? page + 1 : page,
  };
}

export const getFeaturedCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string | null, relationship: string | null = null) => {
    return fetchFeaturedCards(page, pageSize, wishCardType, relationship);
  },
  ['featured-cards-server'],
  { revalidate: 300 }
);

export const getRecentCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string | null, relationship: string | null = null) => {
    return fetchRecentCards(page, pageSize, wishCardType, relationship);
  },
  ['recent-cards-server'],
  { revalidate: 300 }
);

export const getPopularCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string | null, relationship: string | null = null) => {
    return fetchPopularCards(page, pageSize, wishCardType, relationship);
  },
  ['popular-cards-server'],
  { revalidate: 300 }
);

export const getPremiumCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string | null, relationship: string | null = null) => {
    return fetchPremiumCards(page, pageSize, wishCardType, relationship);
  },
  ['premium-cards-server'],
  { revalidate: 300 }
);

async function fetchFeaturedCards(
  page: number,
  pageSize: number,
  wishCardType: string | null,
  relationship: string | null = null
): Promise<GalleryCardsResult> {
  const offset = (page - 1) * pageSize;
  const queryLimit = pageSize + 1;
  const whereClause = buildGalleryWhereClause(wishCardType, relationship);

  const cardsQuery = Prisma.sql`
    WITH
      ${recentActionCountsCte},
      CandidateCards AS (
        SELECT
          ec.id,
          ec."cardType",
          ec.relationship,
          ec."r2Url",
          ec."createdAt",
          ec."originalCardId",
          ec."message",
          CASE WHEN ${buildModelCondition(PREMIUM_BADGE_MODELS)} THEN true ELSE false END as premium,
          ${modelQualityScoreSql}::double precision as model_quality_score,
          ${recencyBoostSql}::double precision as recency_boost,
          COALESCE(edited_actions.weighted_actions, 0)::double precision as edited_weighted_actions,
          COALESCE(original_actions.weighted_actions, 0)::double precision as original_weighted_actions,
          COALESCE(edited_actions.up_count, 0)::integer as edited_up_count,
          COALESCE(original_actions.up_count, 0)::integer as original_up_count
        FROM "EditedCard" ec
        LEFT JOIN RecentActionCounts edited_actions ON edited_actions."cardId" = ec.id
        LEFT JOIN RecentActionCounts original_actions ON original_actions."cardId" = ec."originalCardId"
        ${whereClause}
      ),
      GroupedCards AS (
        SELECT
          *,
          (
            SUM(edited_weighted_actions) OVER (PARTITION BY "originalCardId") +
            MAX(original_weighted_actions) OVER (PARTITION BY "originalCardId")
          )::double precision as group_weighted_actions,
          (
            SUM(edited_up_count) OVER (PARTITION BY "originalCardId") +
            MAX(original_up_count) OVER (PARTITION BY "originalCardId")
          )::integer as group_up_count
        FROM CandidateCards
      ),
      RankedCards AS (
        SELECT
          *,
          ROW_NUMBER() OVER (
            PARTITION BY "originalCardId"
            ORDER BY
              (model_quality_score + recency_boost + LN(1 + group_weighted_actions)) DESC,
              "createdAt" DESC,
              id DESC
          ) as rn
        FROM GroupedCards
      )
    SELECT
      id,
      "cardType",
      relationship,
      "r2Url",
      group_up_count as like_count,
      "message",
      premium
    FROM RankedCards
    WHERE rn = 1
    ORDER BY
      (model_quality_score + recency_boost + LN(1 + group_weighted_actions)) DESC,
      "createdAt" DESC,
      id DESC
    LIMIT ${queryLimit} OFFSET ${offset};
  `;

  const cardsResult = await prisma.$queryRaw<Card[]>(cardsQuery);
  return buildGalleryCardsResult(cardsResult, page, pageSize);
}

async function fetchRecentCards(
  page: number,
  pageSize: number,
  wishCardType: string | null,
  relationship: string | null = null
): Promise<GalleryCardsResult> {
  const offset = (page - 1) * pageSize;
  const queryLimit = pageSize + 1;
  const whereClause = buildGalleryWhereClause(wishCardType, relationship);

  const cardsQuery = Prisma.sql`
    WITH RecentCardIds AS (
      SELECT
        DISTINCT ON (ec."originalCardId")
        ec.id,
        ec."cardType",
        ec.relationship,
        ec."createdAt",
        ec."originalCardId",
        CASE WHEN ${buildModelCondition(PREMIUM_BADGE_MODELS)} THEN true ELSE false END as premium
      FROM "EditedCard" ec
      ${whereClause}
      ORDER BY ec."originalCardId", ec."createdAt" DESC, ec.id DESC
    ),
    PagedCardIds AS (
      SELECT
        id,
        "cardType",
        relationship,
        "createdAt",
        "originalCardId",
        premium
      FROM RecentCardIds
      ORDER BY "createdAt" DESC, id DESC
      LIMIT ${queryLimit} OFFSET ${offset}
    ),
    RecentCards AS (
      SELECT
        pci.id,
        pci."cardType",
        pci.relationship,
        ec."r2Url",
        pci."createdAt",
        pci."originalCardId",
        ec."message",
        pci.premium
      FROM PagedCardIds pci
      CROSS JOIN LATERAL (
        SELECT
          ec."r2Url",
          ec."message"
        FROM "EditedCard" ec
        WHERE ec.id = pci.id
          AND ec."originalCardId" = pci."originalCardId"
          AND ec."createdAt" = pci."createdAt"
          AND ec."cardType" = pci."cardType"
          AND ec.relationship IS NOT DISTINCT FROM pci.relationship
          AND ec."isPublic" = true
          AND ec.deleted = false
          AND ec."r2Url" IS NOT NULL
          AND ec."r2Url" <> ''
        LIMIT 1
      ) ec
    )
    SELECT
      id,
      "cardType",
      relationship,
      "r2Url",
      "message",
      premium
    FROM RecentCards
    ORDER BY "createdAt" DESC, id DESC
    ;
  `;

  const cardsResult = await prisma.$queryRaw<Card[]>(cardsQuery);
  return buildGalleryCardsResult(cardsResult, page, pageSize);
}

async function fetchPopularCards(
  page: number,
  pageSize: number,
  wishCardType: string | null,
  relationship: string | null = null
): Promise<GalleryCardsResult> {
  const offset = (page - 1) * pageSize;
  const queryLimit = pageSize + 1;
  const whereClause = buildGalleryWhereClause(wishCardType, relationship);

  const cardsQuery = Prisma.sql`
    WITH
      ${recentActionCountsCte},
      CandidateCards AS (
        SELECT
          ec.id,
          ec."cardType",
          ec.relationship,
          ec."r2Url",
          ec."createdAt",
          ec."originalCardId",
          ec."message",
          CASE WHEN ${buildModelCondition(PREMIUM_BADGE_MODELS)} THEN true ELSE false END as premium,
          ${modelQualityScoreSql}::double precision as model_quality_score,
          COALESCE(edited_actions.weighted_actions, 0)::double precision as edited_weighted_actions,
          COALESCE(original_actions.weighted_actions, 0)::double precision as original_weighted_actions,
          COALESCE(edited_actions.up_count, 0)::integer as edited_up_count,
          COALESCE(original_actions.up_count, 0)::integer as original_up_count
        FROM "EditedCard" ec
        LEFT JOIN RecentActionCounts edited_actions ON edited_actions."cardId" = ec.id
        LEFT JOIN RecentActionCounts original_actions ON original_actions."cardId" = ec."originalCardId"
        ${whereClause}
      ),
      GroupedCards AS (
        SELECT
          *,
          MAX("createdAt") OVER (PARTITION BY "originalCardId") as max_created_at_in_group,
          (
            SUM(edited_weighted_actions) OVER (PARTITION BY "originalCardId") +
            MAX(original_weighted_actions) OVER (PARTITION BY "originalCardId")
          )::double precision as group_weighted_actions,
          (
            SUM(edited_up_count) OVER (PARTITION BY "originalCardId") +
            MAX(original_up_count) OVER (PARTITION BY "originalCardId")
          )::integer as group_up_count
        FROM CandidateCards
      ),
      RankedCards AS (
        SELECT
          *,
          ROW_NUMBER() OVER (
            PARTITION BY "originalCardId"
            ORDER BY model_quality_score DESC, "createdAt" DESC, id DESC
          ) as rn
        FROM GroupedCards
      )
    SELECT
      id,
      "cardType",
      relationship,
      "r2Url",
      group_up_count as like_count,
      "message",
      premium
    FROM RankedCards
    WHERE rn = 1
    ORDER BY
      group_weighted_actions DESC,
      max_created_at_in_group DESC,
      id DESC
    LIMIT ${queryLimit} OFFSET ${offset};
  `;

  const cardsResult = await prisma.$queryRaw<Card[]>(cardsQuery);
  return buildGalleryCardsResult(cardsResult, page, pageSize);
}

export const getLikedCardsServer = unstable_cache(
  async (page: number, pageSize: number, wishCardType: string | null = null, relationship: string | null = null) => {
    return fetchLikedCards(page, pageSize, wishCardType, relationship);
  },
  ['liked-cards-server'],
  { revalidate: 300 }
);

async function fetchLikedCards(
  page: number,
  pageSize: number,
  wishCardType: string | null = null,
  relationship: string | null = null
): Promise<GalleryCardsResult> {
  const offset = (page - 1) * pageSize;
  const queryLimit = pageSize + 1;
  const whereClause = buildGalleryWhereClause(wishCardType, relationship);

  const cardsQuery = Prisma.sql`
    WITH
      ${recentActionCountsCte},
      CandidateCards AS (
        SELECT
          ec.id,
          ec."cardType",
          ec.relationship,
          ec."r2Url",
          ec."createdAt",
          ec."originalCardId",
          ec."message",
          CASE WHEN ${buildModelCondition(PREMIUM_BADGE_MODELS)} THEN true ELSE false END as premium,
          ${modelQualityScoreSql}::double precision as model_quality_score,
          COALESCE(edited_actions.up_count, 0)::integer as edited_up_count,
          COALESCE(original_actions.up_count, 0)::integer as original_up_count
        FROM "EditedCard" ec
        LEFT JOIN RecentActionCounts edited_actions ON edited_actions."cardId" = ec.id
        LEFT JOIN RecentActionCounts original_actions ON original_actions."cardId" = ec."originalCardId"
        ${whereClause}
      ),
      GroupedCards AS (
        SELECT
          *,
          MAX("createdAt") OVER (PARTITION BY "originalCardId") as max_created_at_in_group,
          (
            SUM(edited_up_count) OVER (PARTITION BY "originalCardId") +
            MAX(original_up_count) OVER (PARTITION BY "originalCardId")
          )::integer as group_up_count
        FROM CandidateCards
      ),
      RankedCards AS (
        SELECT
          *,
          ROW_NUMBER() OVER (
            PARTITION BY "originalCardId"
            ORDER BY model_quality_score DESC, "createdAt" DESC, id DESC
          ) as rn
        FROM GroupedCards
      )
    SELECT
      id,
      "cardType",
      relationship,
      "r2Url",
      group_up_count as like_count,
      "message",
      premium
    FROM RankedCards
    WHERE rn = 1
    ORDER BY
      group_up_count DESC,
      max_created_at_in_group DESC,
      id DESC
    LIMIT ${queryLimit} OFFSET ${offset};
  `;

  const cardsResult = await prisma.$queryRaw<Card[]>(cardsQuery);
  return buildGalleryCardsResult(cardsResult, page, pageSize);
}

export async function fetchPremiumCards(
  page: number,
  pageSize: number,
  wishCardType: string | null = null,
  relationship: string | null = null
): Promise<GalleryCardsResult> {
  const offset = (page - 1) * pageSize;
  const queryLimit = pageSize + 1;
  const whereClause = buildGalleryWhereClause(wishCardType, relationship, [
    buildModelCondition(PREMIUM_TAB_MODELS),
  ]);

  const cardsQuery = Prisma.sql`
    WITH
      ${recentActionCountsCte},
      CandidateCards AS (
        SELECT
          ec.id,
          ec."cardType",
          ec.relationship,
          ec."r2Url",
          ec."createdAt",
          ec."originalCardId",
          ec."message",
          true as premium,
          ${modelQualityScoreSql}::double precision as model_quality_score,
          COALESCE(edited_actions.up_count, 0)::integer as edited_up_count,
          COALESCE(original_actions.up_count, 0)::integer as original_up_count
        FROM "EditedCard" ec
        LEFT JOIN RecentActionCounts edited_actions ON edited_actions."cardId" = ec.id
        LEFT JOIN RecentActionCounts original_actions ON original_actions."cardId" = ec."originalCardId"
        ${whereClause}
      ),
      GroupedCards AS (
        SELECT
          *,
          MAX("createdAt") OVER (PARTITION BY "originalCardId") as max_created_at_in_group,
          (
            SUM(edited_up_count) OVER (PARTITION BY "originalCardId") +
            MAX(original_up_count) OVER (PARTITION BY "originalCardId")
          )::integer as group_up_count
        FROM CandidateCards
      ),
      RankedCards AS (
        SELECT
          *,
          ROW_NUMBER() OVER (
            PARTITION BY "originalCardId"
            ORDER BY model_quality_score DESC, "createdAt" DESC, id DESC
          ) as rn
        FROM GroupedCards
      )
    SELECT
      id,
      "cardType",
      relationship,
      "r2Url",
      group_up_count as like_count,
      "message",
      premium
    FROM RankedCards
    WHERE rn = 1
    ORDER BY
      group_up_count DESC,
      max_created_at_in_group DESC,
      id DESC
    LIMIT ${queryLimit} OFFSET ${offset};
  `;

  const cardsResult = await prisma.$queryRaw<Card[]>(cardsQuery);
  return buildGalleryCardsResult(cardsResult, page, pageSize);
}
