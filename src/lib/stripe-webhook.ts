import type Stripe from 'stripe';
import type { PremiumPlanKey } from './pricing';

export const STRIPE_WEBHOOK_EVENT_TYPES = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
] as const;

export interface StripePriceConfig {
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export interface StripeWebhookClient {
  constructEvent(body: string, signature: string, secret: string): Stripe.Event;
  retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
}

export interface PreparedStripeEvent {
  event: Stripe.Event;
  userId: string;
  plan: PremiumPlanKey;
  subscription: Stripe.Subscription;
  periodStart: Date;
  periodEnd: Date;
  isBillingEvent: boolean;
}

export type StripeWebhookPersistResult = 'processed' | 'duplicate' | 'ignored';

export interface StripeWebhookStore {
  persist(prepared: PreparedStripeEvent): Promise<StripeWebhookPersistResult>;
}

export interface StripeWebhookResult {
  status: number;
  body: string;
}

export interface StripeSubscriptionAnalytics {
  stripeSubscriptionId: string;
  stripeCustomerId: string | null;
  stripePriceId: string;
  stripeUnitAmount: number | null;
  stripeCurrency: string;
  stripeLivemode: boolean;
}

function getExpandableId(value: string | { id: string } | null | undefined): string | null {
  if (typeof value === 'string') return value;
  return value?.id || null;
}

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  return getExpandableId(invoice.parent?.subscription_details?.subscription);
}

export function getSubscriptionPeriod(subscription: Stripe.Subscription): {
  periodStart: Date;
  periodEnd: Date;
} {
  const item = subscription.items.data[0];
  if (!item?.current_period_start || !item.current_period_end) {
    throw new Error(`Subscription ${subscription.id} is missing its current billing period`);
  }

  return {
    periodStart: new Date(item.current_period_start * 1000),
    periodEnd: new Date(item.current_period_end * 1000),
  };
}

export function getPlanForSubscription(
  subscription: Stripe.Subscription,
  prices: StripePriceConfig
): PremiumPlanKey | null {
  const priceId = subscription.items.data[0]?.price.id;
  if (priceId === prices.monthlyPriceId) return 'monthly';
  if (priceId === prices.yearlyPriceId) return 'yearly';
  return null;
}

export function getStripeSubscriptionAnalytics(
  subscription: Stripe.Subscription
): StripeSubscriptionAnalytics {
  const price = subscription.items.data[0]?.price;
  if (!price?.id) {
    throw new Error(`Subscription ${subscription.id} is missing its price`);
  }

  return {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: getExpandableId(subscription.customer),
    stripePriceId: price.id,
    stripeUnitAmount: price.unit_amount,
    stripeCurrency: price.currency,
    stripeLivemode: subscription.livemode,
  };
}

async function prepareStripeEvent(
  event: Stripe.Event,
  client: StripeWebhookClient,
  prices: StripePriceConfig
): Promise<PreparedStripeEvent | null> {
  let userId: string | null = null;
  let subscription: Stripe.Subscription | null = null;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadataUserId = session.metadata?.userId || null;
    if (
      session.mode !== 'subscription' ||
      !metadataUserId ||
      session.client_reference_id !== metadataUserId
    ) {
      return null;
    }

    const subscriptionId = getExpandableId(session.subscription);
    if (!subscriptionId) return null;
    userId = metadataUserId;
    subscription = await client.retrieveSubscription(subscriptionId);
  } else if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    subscription = event.data.object as Stripe.Subscription;
    userId = subscription.metadata?.userId || null;
  } else if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    userId = invoice.parent?.subscription_details?.metadata?.userId || null;
    const subscriptionId = getInvoiceSubscriptionId(invoice);
    if (!userId || !subscriptionId) return null;
    subscription = await client.retrieveSubscription(subscriptionId);
  } else {
    return null;
  }

  if (!userId || !subscription || subscription.metadata?.userId !== userId) {
    return null;
  }

  const plan = getPlanForSubscription(subscription, prices);
  if (!plan) return null;

  return {
    event,
    userId,
    plan,
    subscription,
    ...getSubscriptionPeriod(subscription),
    isBillingEvent:
      event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded',
  };
}

export async function handleStripeWebhook(input: {
  body: string;
  signature: string;
  webhookSecret: string;
  prices: StripePriceConfig;
  client: StripeWebhookClient;
  store: StripeWebhookStore;
  onError?: (error: unknown) => void;
}): Promise<StripeWebhookResult> {
  if (!input.signature || !input.webhookSecret) {
    return { status: 400, body: 'Webhook signature or secret missing' };
  }

  let event: Stripe.Event;
  try {
    event = input.client.constructEvent(input.body, input.signature, input.webhookSecret);
  } catch (error) {
    input.onError?.(error);
    return { status: 400, body: 'Webhook signature verification failed' };
  }

  try {
    const prepared = await prepareStripeEvent(event, input.client, input.prices);
    if (!prepared) {
      return { status: 200, body: 'Webhook ignored' };
    }

    const result = await input.store.persist(prepared);
    return {
      status: 200,
      body: result === 'processed' ? 'Webhook received' : `Webhook ${result}`,
    };
  } catch (error) {
    input.onError?.(error);
    return { status: 500, body: 'Error handling webhook' };
  }
}
