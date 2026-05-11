/**
 * Database-driven card cleanup.
 *
 * Default mode is dry-run:
 *   pnpm cleanup:cards -- --dry-run
 *
 * Execute after reviewing dry-run output:
 *   pnpm cleanup:cards -- --execute
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { Prisma, PrismaClient } from '@prisma/client';
import {
  classifyStorageUrl,
  deleteStoredObjectByUrl,
  StorageDeletionResult,
} from '../src/lib/r2';
import {
  CLEANUP_PROTECTED_ACTIONS,
  DEFAULT_RETENTION_DAYS,
  dedupeById,
  getCleanupCutoffDate,
} from './cleanup-card-policy';

const DEFAULT_BATCH_SIZE = 500;

interface CleanupOptions {
  dryRun: boolean;
  retentionDays: number;
  limit: number;
}

interface CleanupStats {
  attempted: number;
  databaseDeleted: number;
  storageDeleted: number;
  skippedDatabase: number;
  failedStorage: number;
}

interface CleanupCandidate {
  id: string | number;
  label: string;
  r2Url: string | null;
  createdAt: Date;
  knownBytes: number;
}

function readNumberArg(args: string[], name: string, fallback: number): number {
  const prefix = `${name}=`;
  const value = args.find(arg => arg.startsWith(prefix))?.slice(prefix.length);
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function parseArgs(args = process.argv.slice(2)): CleanupOptions {
  const wantsExecute = args.includes('--execute');
  const wantsDryRun = args.includes('--dry-run');

  if (wantsExecute && wantsDryRun) {
    throw new Error('Choose either --dry-run or --execute, not both');
  }

  return {
    dryRun: !wantsExecute,
    retentionDays: readNumberArg(args, '--retention-days', DEFAULT_RETENTION_DAYS),
    limit: readNumberArg(args, '--limit', DEFAULT_BATCH_SIZE),
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
}

function estimateTextBytes(content: string | null | undefined): number {
  return content ? Buffer.byteLength(content, 'utf8') : 0;
}

function summarizeCandidates(label: string, total: number, candidates: CleanupCandidate[]): void {
  const knownBytes = candidates.reduce((sum, candidate) => sum + candidate.knownBytes, 0);
  const unknownRemoteObjects = candidates.filter(candidate => {
    const target = classifyStorageUrl(candidate.r2Url);
    return target.action === 'delete-r2' && candidate.knownBytes === 0;
  }).length;

  console.log(`\n--- ${label} ---`);
  console.log(`Total candidates: ${total}`);
  console.log(`Current batch: ${candidates.length}`);
  console.log(`Estimated known reclaimable text size in batch: ${formatBytes(knownBytes)}`);
  console.log(`Remote objects without known local size in batch: ${unknownRemoteObjects}`);

  for (const candidate of candidates) {
    const target = classifyStorageUrl(candidate.r2Url);
    const storageLabel = target.key || target.provider;
    console.log(
      `- ${candidate.label} | created=${candidate.createdAt.toISOString()} | storage=${storageLabel} | url=${candidate.r2Url || '(none)'}`
    );
  }
}

async function deleteStorageIfNeeded(
  url: string | null,
  dryRun: boolean
): Promise<StorageDeletionResult> {
  if (dryRun) {
    const target = classifyStorageUrl(url);
    return {
      ...target,
      status: 'skipped',
      url: url || undefined,
    };
  }

  return deleteStoredObjectByUrl(url);
}

function createStats(): CleanupStats {
  return {
    attempted: 0,
    databaseDeleted: 0,
    storageDeleted: 0,
    skippedDatabase: 0,
    failedStorage: 0,
  };
}

function printStats(label: string, stats: CleanupStats): void {
  console.log(`\n${label} results:`);
  console.log(`Attempted: ${stats.attempted}`);
  console.log(`Database rows deleted: ${stats.databaseDeleted}`);
  console.log(`Storage objects deleted: ${stats.storageDeleted}`);
  console.log(`Database rows kept because storage was not safely removable: ${stats.skippedDatabase}`);
  console.log(`Storage deletion failures: ${stats.failedStorage}`);
}

const protectedActions = [...CLEANUP_PROTECTED_ACTIONS];

interface EditedCardCleanupRow {
  id: string;
  originalCardId: string;
  cardType: string;
  createdAt: Date;
  r2Url: string | null;
  editedContent: string | null;
}

interface ApiLogCleanupRow {
  id: number;
  cardId: string;
  cardType: string;
  timestamp: Date;
  r2Url: string | null;
  responseContent: string | null;
}

function buildEditedCardBaseSql(cutoff: Date): Prisma.Sql {
  return Prisma.sql`
    FROM "EditedCard" ec
    LEFT JOIN "User" u ON u.id = ec."userId"
    WHERE ec."createdAt" < ${cutoff}
      AND ec."deleted" = false
      AND ec."customUrl" IS NULL
      AND (ec."userId" IS NULL OR COALESCE(u."plan"::text, 'FREE') <> 'PREMIUM')
      AND NOT EXISTS (
        SELECT 1 FROM "UserAction" ua
        WHERE ua."cardId" = ec."originalCardId"
          AND ua."action" IN (${Prisma.join(protectedActions)})
      )
  `;
}

function buildOrphanedApiLogBaseSql(cutoff: Date): Prisma.Sql {
  return Prisma.sql`
    FROM "ApiLog" al
    LEFT JOIN "User" u ON u.id = al."userId"
    WHERE al."timestamp" < ${cutoff}
      AND (al."userId" IS NULL OR COALESCE(u."plan"::text, 'FREE') <> 'PREMIUM')
      AND NOT EXISTS (
        SELECT 1 FROM "EditedCard" ec
        WHERE ec."originalCardId" = al."cardId"
      )
      AND NOT EXISTS (
        SELECT 1 FROM "UserAction" ua
        WHERE ua."cardId" = al."cardId"
          AND ua."action" IN (${Prisma.join(protectedActions)})
      )
  `;
}

async function cleanupEditedCards(
  prisma: PrismaClient,
  cutoff: Date,
  options: CleanupOptions
): Promise<CleanupStats> {
  const baseSql = buildEditedCardBaseSql(cutoff);
  const [totalRows, cards] = await Promise.all([
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      ${baseSql}
    `,
    prisma.$queryRaw<EditedCardCleanupRow[]>`
      SELECT
        ec.id,
        ec."originalCardId",
        ec."cardType",
        ec."createdAt",
        ec."r2Url",
        ec."editedContent"
      ${baseSql}
      ORDER BY ec."createdAt" ASC
      LIMIT ${options.limit}
    `,
  ]);
  const total = Number(totalRows[0]?.count ?? 0);
  const uniqueCards = dedupeById(cards);

  summarizeCandidates(
    'EditedCard cleanup candidates',
    total,
    uniqueCards.map(card => ({
      id: card.id,
      label: `EditedCard:${card.id} original=${card.originalCardId} type=${card.cardType}`,
      r2Url: card.r2Url,
      createdAt: card.createdAt,
      knownBytes: estimateTextBytes(card.editedContent),
    }))
  );

  const stats = createStats();
  for (const card of uniqueCards) {
    stats.attempted += 1;
    const storageResult = await deleteStorageIfNeeded(card.r2Url, options.dryRun);

    if (storageResult.status === 'deleted') {
      stats.storageDeleted += 1;
    }

    if (storageResult.status === 'failed') {
      stats.failedStorage += 1;
      console.error(`Keeping EditedCard ${card.id}; storage delete failed: ${storageResult.error}`);
      continue;
    }

    if (!storageResult.canDeleteDatabase) {
      stats.skippedDatabase += 1;
      console.warn(
        `Keeping EditedCard ${card.id}; ${storageResult.provider} is not safely removable: ${storageResult.reason || 'no reason provided'}`
      );
      continue;
    }

    if (!options.dryRun) {
      const result = await prisma.editedCard.deleteMany({ where: { id: card.id } });
      stats.databaseDeleted += result.count;
    }
  }

  return stats;
}

async function cleanupOrphanedApiLogs(
  prisma: PrismaClient,
  cutoff: Date,
  options: CleanupOptions
): Promise<CleanupStats> {
  const baseSql = buildOrphanedApiLogBaseSql(cutoff);
  const [totalRows, logs] = await Promise.all([
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      ${baseSql}
    `,
    prisma.$queryRaw<ApiLogCleanupRow[]>`
      SELECT
        al.id,
        al."cardId",
        al."cardType",
        al."timestamp",
        al."r2Url",
        al."responseContent"
      ${baseSql}
      ORDER BY al."timestamp" ASC
      LIMIT ${options.limit}
    `,
  ]);
  const total = Number(totalRows[0]?.count ?? 0);
  const uniqueLogs = dedupeById(logs);

  summarizeCandidates(
    'Orphaned ApiLog cleanup candidates',
    total,
    uniqueLogs.map(log => ({
      id: log.id,
      label: `ApiLog:${log.id} card=${log.cardId} type=${log.cardType}`,
      r2Url: log.r2Url,
      createdAt: log.timestamp,
      knownBytes: estimateTextBytes(log.responseContent),
    }))
  );

  const stats = createStats();
  for (const log of uniqueLogs) {
    stats.attempted += 1;
    const storageResult = await deleteStorageIfNeeded(log.r2Url, options.dryRun);

    if (storageResult.status === 'deleted') {
      stats.storageDeleted += 1;
    }

    if (storageResult.status === 'failed') {
      stats.failedStorage += 1;
      console.error(`Keeping ApiLog ${log.id}; storage delete failed: ${storageResult.error}`);
      continue;
    }

    if (!storageResult.canDeleteDatabase) {
      stats.skippedDatabase += 1;
      console.warn(
        `Keeping ApiLog ${log.id}; ${storageResult.provider} is not safely removable: ${storageResult.reason || 'no reason provided'}`
      );
      continue;
    }

    if (!options.dryRun) {
      const result = await prisma.apiLog.deleteMany({ where: { id: log.id } });
      stats.databaseDeleted += result.count;
    }
  }

  return stats;
}

async function main() {
  const options = parseArgs();
  const cutoff = getCleanupCutoffDate(new Date(), options.retentionDays);

  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
  const urlWithTimeout = dbUrl.includes('connect_timeout')
    ? dbUrl
    : dbUrl + (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30';

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: urlWithTimeout,
      },
    },
  });

  console.log('=== Card cleanup ===');
  console.log(`Mode: ${options.dryRun ? 'dry-run' : 'execute'}`);
  console.log(`Retention: ${options.retentionDays} days`);
  console.log(`Cutoff: ${cutoff.toISOString()}`);
  console.log(`Batch limit per section: ${options.limit}`);

  try {
    const editedStats = await cleanupEditedCards(prisma, cutoff, options);
    printStats('EditedCard cleanup', editedStats);

    const apiLogStats = await cleanupOrphanedApiLogs(prisma, cutoff, options);
    printStats('Orphaned ApiLog cleanup', apiLogStats);

    if (options.dryRun) {
      console.log('\nDry-run only. Re-run with --execute after reviewing candidates.');
    } else {
      console.log('\nCleanup complete. Consider VACUUM ANALYZE after large database deletions.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
}
