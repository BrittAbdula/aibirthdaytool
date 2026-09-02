import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Prisma, type BillingPeriod } from '@prisma/client';
import Stripe from 'stripe';
import { createTransactionalPrismaClient } from '@/lib/prisma';
import { getUserPlanForSubscriptionStatus } from '@/lib/subscription-status';
import {
  getStripeSubscriptionAnalytics,
  handleStripeWebhook,
  type PreparedPackPurchaseEvent,
  type PreparedStripeEvent,
  type PreparedSubscriptionEvent,
  type StripeWebhookPersistResult,
} from '@/lib/stripe-webhook';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

function isUniqueConstraintError(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'code' in error && error.code === 'P2002';
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function getStripeLogData(prepared: PreparedStripeEvent) {
  if (prepared.kind === 'pack') {
    const session = prepared.session;
    return {
      amount: session.amount_total,
      currency: session.currency,
      status: session.status,
      paymentMethod: session.payment_method_types?.[0] || null,
      objectId: session.id,
      objectType: session.object,
      metadata: toJson(session.metadata || {}),
      rawData: toJson(session),
    };
  }

  const object = prepared.event.data.object as
    | Stripe.Checkout.Session
    | Stripe.Invoice
    | Stripe.Subscription;
  let amount: number | null = null;
  let currency: string | null = null;
  let status: string | null = null;
  let paymentMethod: string | null = null;

  if (prepared.event.type === 'checkout.session.completed') {
    const session = object as Stripe.Checkout.Session;
    amount = session.amount_total;
    currency = session.currency;
    status = session.status;
    paymentMethod = session.payment_method_types?.[0] || null;
  } else if (prepared.event.type === 'invoice.payment_succeeded') {
    const invoice = object as Stripe.Invoice;
    amount = invoice.amount_paid;
    currency = invoice.currency;
    status = invoice.status;
  } else {
    const item = prepared.subscription.items.data[0];
    amount = item?.price.unit_amount || null;
    currency = item?.price.currency || null;
    status = prepared.subscription.status;
  }

  return {
    amount,
    currency,
    status,
    paymentMethod,
    objectId: object.id,
    objectType: object.object,
    metadata: toJson(object.metadata || {}),
    rawData: toJson(object),
  };
}

async function persistSubscriptionEvent(
  prepared: PreparedSubscriptionEvent,
  tx: Prisma.TransactionClient
): Promise<StripeWebhookPersistResult> {
  const user = await tx.user.findUnique({
    where: { id: prepared.userId },
    select: { plan: true },
  });
  if (!user) return 'ignored';

  const subscription = prepared.subscription;
  const stripeAnalytics = getStripeSubscriptionAnalytics(subscription);
  const plan = getUserPlanForSubscriptionStatus(subscription.status);
  const billingPeriod: BillingPeriod = prepared.interval === 'year' ? 'YEARLY' : 'MONTHLY';
  const now = new Date();
  const billingUpdate = prepared.isBillingEvent ? { lastBilledAt: now } : {};

  await tx.subscription.upsert({
    where: { userId: prepared.userId },
    create: {
      userId: prepared.userId,
      plan,
      billingPeriod,
      ...stripeAnalytics,
      startDate: prepared.periodStart,
      endDate: prepared.periodEnd,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      lastBilledAt: prepared.isBillingEvent ? now : null,
      nextBillingAt: prepared.periodEnd,
    },
    update: {
      plan,
      billingPeriod,
      ...stripeAnalytics,
      startDate: prepared.periodStart,
      endDate: prepared.periodEnd,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      nextBillingAt: prepared.periodEnd,
      ...billingUpdate,
    },
  });

  await tx.user.update({
    where: { id: prepared.userId },
    data: { plan },
  });

  if (plan === 'PREMIUM' && user.plan !== 'PREMIUM') {
    await tx.monetizationEvent.create({
      data: {
        eventType: 'subscription_activated',
        userId: prepared.userId,
        plan: `${prepared.tier}_${prepared.interval}ly`,
        source: 'stripe_webhook',
        stripeSessionId: subscription.id,
        metadata: {
          eventId: prepared.event.id,
          status: subscription.status,
          tier: prepared.tier,
        },
      },
    });
  }

  const log = getStripeLogData(prepared);
  await tx.stripeLog.create({
    data: {
      userId: prepared.userId,
      eventId: prepared.event.id,
      eventType: prepared.event.type,
      objectId: log.objectId || '',
      objectType: log.objectType,
      amount: log.amount,
      currency: log.currency,
      status: log.status,
      stripeSubscriptionId: stripeAnalytics.stripeSubscriptionId,
      stripePriceId: stripeAnalytics.stripePriceId,
      stripeLivemode: stripeAnalytics.stripeLivemode,
      paymentMethod: log.paymentMethod,
      description: `${prepared.event.type} - ${log.objectId || ''}`,
      metadata: log.metadata,
      rawData: log.rawData,
    },
  });

  return 'processed';
}

async function persistPackPurchase(
  prepared: PreparedPackPurchaseEvent,
  tx: Prisma.TransactionClient
): Promise<StripeWebhookPersistResult> {
  const user = await tx.user.findUnique({
    where: { id: prepared.userId },
    select: { id: true },
  });
  if (!user) return 'ignored';

  // Stripe can deliver the same checkout.session.completed more than once. The
  // unique session id makes a replay a no-op instead of a second grant.
  const existingPurchase = await tx.purchase.findUnique({
    where: { stripeSessionId: prepared.session.id },
    select: { id: true },
  });
  if (existingPurchase) return 'duplicate';

  const { sku, session } = prepared;
  const cards = sku.cards ?? 0;

  await tx.purchase.create({
    data: {
      userId: prepared.userId,
      sku: sku.key,
      stripePriceId: session.metadata?.priceId || null,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || null,
      amountCents: session.amount_total ?? sku.amountCents,
      currency: session.currency || 'usd',
      cardsGranted: cards,
      stripeLivemode: session.livemode,
      metadata: toJson(session.metadata || {}),
    },
  });

  await tx.user.update({
    where: { id: prepared.userId },
    data: { packCredits: { increment: cards } },
  });

  await tx.monetizationEvent.create({
    data: {
      eventType: 'pack_purchase_completed',
      userId: prepared.userId,
      plan: sku.key,
      source: session.metadata?.source || 'stripe_webhook',
      stripeSessionId: session.id,
      metadata: {
        eventId: prepared.event.id,
        cards,
        amountCents: session.amount_total ?? sku.amountCents,
      },
    },
  });

  const log = getStripeLogData(prepared);
  await tx.stripeLog.create({
    data: {
      userId: prepared.userId,
      eventId: prepared.event.id,
      eventType: prepared.event.type,
      objectId: log.objectId || '',
      objectType: log.objectType,
      amount: log.amount,
      currency: log.currency,
      status: log.status,
      stripePriceId: session.metadata?.priceId || null,
      stripeLivemode: session.livemode,
      paymentMethod: log.paymentMethod,
      description: `${prepared.event.type} - ${sku.key}`,
      metadata: log.metadata,
      rawData: log.rawData,
    },
  });

  return 'processed';
}

async function persistStripeEvent(
  prepared: PreparedStripeEvent
): Promise<StripeWebhookPersistResult> {
  const prisma = createTransactionalPrismaClient();

  try {
    return await prisma.$transaction(async (tx) => {
      const existingEvent = await tx.stripeLog.findUnique({
        where: { eventId: prepared.event.id },
        select: { id: true },
      });
      if (existingEvent) return 'duplicate';

      return prepared.kind === 'pack'
        ? persistPackPurchase(prepared, tx)
        : persistSubscriptionEvent(prepared, tx);
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return 'duplicate';
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  const result = await handleStripeWebhook({
    body: await request.text(),
    signature: (await headers()).get('stripe-signature') || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    env: process.env,
    client: {
      constructEvent: (body, signature, secret) =>
        stripe.webhooks.constructEvent(body, signature, secret),
      retrieveSubscription: (subscriptionId) =>
        stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['items.data.price'],
        }),
    },
    store: { persist: persistStripeEvent },
    onError: (error) => console.error('Stripe webhook error:', error),
  });

  return new NextResponse(result.body, { status: result.status });
}
