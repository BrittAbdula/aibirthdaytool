import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Prisma, type BillingPeriod } from '@prisma/client';
import Stripe from 'stripe';
import { createTransactionalPrismaClient } from '@/lib/prisma';
import { getUserPlanForSubscriptionStatus } from '@/lib/subscription-status';
import {
  getStripeSubscriptionAnalytics,
  handleStripeWebhook,
  type PreparedStripeEvent,
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

      const user = await tx.user.findUnique({
        where: { id: prepared.userId },
        select: { plan: true },
      });
      if (!user) return 'ignored';

      const subscription = prepared.subscription;
      const stripeAnalytics = getStripeSubscriptionAnalytics(subscription);
      const plan = getUserPlanForSubscriptionStatus(subscription.status);
      const billingPeriod: BillingPeriod = prepared.plan === 'monthly' ? 'MONTHLY' : 'YEARLY';
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
            plan: prepared.plan,
            source: 'stripe_webhook',
            stripeSessionId: subscription.id,
            metadata: {
              eventId: prepared.event.id,
              status: subscription.status,
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
    prices: {
      monthlyPriceId: process.env.STRIPE_MONTHLY_PRICE_ID || '',
      yearlyPriceId: process.env.STRIPE_YEARLY_PRICE_ID || '',
    },
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
