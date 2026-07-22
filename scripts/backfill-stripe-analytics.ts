import { createTransactionalPrismaClient, prisma } from '../src/lib/prisma';

interface BackfillRow {
  id: string;
  userId: string | null;
  eventType: string;
  createdAt: Date;
  rawData: unknown;
}

interface StripeIdentity {
  stripeSubscriptionId: string;
  stripeCustomerId: string | null;
  stripePriceId: string;
  stripeUnitAmount: number | null;
  stripeCurrency: string;
  stripeLivemode: boolean;
}

function objectValue(value: unknown): Record<string, any> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any>
    : null;
}

function expandableId(value: unknown): string | null {
  if (typeof value === 'string') return value;
  const object = objectValue(value);
  return typeof object?.id === 'string' ? object.id : null;
}

function getPrice(raw: Record<string, any>): Record<string, any> | null {
  if (raw.object === 'subscription') {
    return objectValue(raw.items?.data?.[0]?.price);
  }
  if (raw.object === 'invoice') {
    const line = raw.lines?.data?.[0];
    const expanded = objectValue(line?.price);
    if (expanded) return expanded;
    const priceId = line?.pricing?.price_details?.price;
    if (typeof priceId === 'string') {
      return {
        id: priceId,
        unit_amount: raw.amount_paid,
        currency: raw.currency,
      };
    }
  }
  return null;
}

function getSubscriptionId(raw: Record<string, any>): string | null {
  if (raw.object === 'subscription') return expandableId(raw.id);
  if (raw.object === 'invoice') {
    return expandableId(raw.parent?.subscription_details?.subscription)
      || expandableId(raw.subscription);
  }
  return expandableId(raw.subscription);
}

function extractIdentity(rawData: unknown, allowedPriceIds: Set<string>): StripeIdentity | null {
  const raw = objectValue(rawData);
  if (!raw) return null;
  const price = getPrice(raw);
  const stripePriceId = expandableId(price?.id);
  const stripeSubscriptionId = getSubscriptionId(raw);
  const stripeCurrency = typeof price?.currency === 'string'
    ? price.currency
    : typeof raw.currency === 'string' ? raw.currency : null;

  if (!stripeSubscriptionId || !stripePriceId || !allowedPriceIds.has(stripePriceId) || !stripeCurrency) {
    return null;
  }

  return {
    stripeSubscriptionId,
    stripeCustomerId: expandableId(raw.customer),
    stripePriceId,
    stripeUnitAmount: typeof price?.unit_amount === 'number'
      ? price.unit_amount
      : typeof raw.amount_paid === 'number' ? raw.amount_paid : null,
    stripeCurrency,
    stripeLivemode: raw.livemode === true,
  };
}

function readPriceIds(args: string[]): string[] {
  const values: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--price-id' && args[index + 1]) {
      values.push(args[index + 1]);
      index += 1;
    }
  }
  if (values.length > 0) return values;
  return [process.env.STRIPE_MONTHLY_PRICE_ID, process.env.STRIPE_YEARLY_PRICE_ID]
    .filter((value): value is string => Boolean(value));
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const priceIds = readPriceIds(args);
  if (priceIds.length === 0) {
    throw new Error('Provide at least one --price-id or configure Stripe price IDs');
  }

  const patterns = priceIds.map(priceId => `%${priceId}%`);
  const whereClause = patterns.map((_, index) => `"rawData"::text LIKE $${index + 1}`).join(' OR ');
  const rows = await prisma.$queryRawUnsafe<BackfillRow[]>(
    `SELECT id, "userId", "eventType", "createdAt", "rawData"
     FROM "StripeLog"
     WHERE ${whereClause}
     ORDER BY "createdAt" ASC`,
    ...patterns
  );

  const allowedPriceIds = new Set(priceIds);
  const parsed = rows
    .map(row => ({ row, identity: extractIdentity(row.rawData, allowedPriceIds) }))
    .filter((entry): entry is { row: BackfillRow; identity: StripeIdentity } => Boolean(entry.identity));
  const subscriptionOwners = new Map<string, Set<string>>();
  const latestByUser = new Map<string, { createdAt: Date; identity: StripeIdentity }>();

  for (const entry of parsed) {
    if (!entry.row.userId) continue;
    const owners = subscriptionOwners.get(entry.identity.stripeSubscriptionId) ?? new Set<string>();
    owners.add(entry.row.userId);
    subscriptionOwners.set(entry.identity.stripeSubscriptionId, owners);

    const current = latestByUser.get(entry.row.userId);
    if (!current || current.createdAt < entry.row.createdAt) {
      latestByUser.set(entry.row.userId, {
        createdAt: entry.row.createdAt,
        identity: entry.identity,
      });
    }
  }

  const ownershipConflicts = [...subscriptionOwners.values()].filter(owners => owners.size > 1).length;
  if (ownershipConflicts > 0) {
    throw new Error(`Found ${ownershipConflicts} Stripe subscription ownership conflicts`);
  }

  const summary = {
    mode: apply ? 'apply' : 'dry-run',
    candidateLogs: rows.length,
    parsedLogs: parsed.length,
    mappedSubscriptions: latestByUser.size,
    liveLogs: parsed.filter(entry => entry.identity.stripeLivemode).length,
    priceIds,
  };
  console.log(JSON.stringify(summary, null, 2));

  if (!apply) return;

  const transactionalPrisma = createTransactionalPrismaClient();
  try {
    await transactionalPrisma.$transaction(async tx => {
      for (const entry of parsed) {
        await tx.stripeLog.update({
          where: { id: entry.row.id },
          data: {
            stripeSubscriptionId: entry.identity.stripeSubscriptionId,
            stripePriceId: entry.identity.stripePriceId,
            stripeLivemode: entry.identity.stripeLivemode,
          },
        });
      }

      for (const [userId, entry] of latestByUser) {
        await tx.subscription.updateMany({
          where: { userId },
          data: entry.identity,
        });
      }
    }, { maxWait: 20_000, timeout: 90_000 });
  } finally {
    await transactionalPrisma.$disconnect();
  }

  console.log(`Updated ${parsed.length} Stripe logs and ${latestByUser.size} subscriptions.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
