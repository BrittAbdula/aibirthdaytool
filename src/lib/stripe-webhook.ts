import type Stripe from 'stripe';
import { getCheckoutQuantity } from './pricing/checkout';
import { getPackForPriceId, getTierForPriceId, type PlanTier, type Sku } from './pricing/plans';

export const STRIPE_WEBHOOK_EVENT_TYPES = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
] as const;

export type StripeEnv = Record<string, string | undefined>;

export interface StripeWebhookClient {
  constructEvent(body: string, signature: string, secret: string): Stripe.Event;
  retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
}

export interface PreparedSubscriptionEvent {
  kind: 'subscription';
  event: Stripe.Event;
  userId: string;
  tier: PlanTier;
  interval: 'month' | 'year';
  subscription: Stripe.Subscription;
  periodStart: Date;
  periodEnd: Date;
  isBillingEvent: boolean;
}

export interface PreparedPackPurchaseEvent {
  kind: 'pack';
  event: Stripe.Event;
  userId: string;
  sku: Sku;
  quantity: number;
  cardsGranted: number;
  session: Stripe.Checkout.Session;
}

export type PreparedStripeEvent = PreparedSubscriptionEvent | PreparedPackPurchaseEvent;

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

/**
 * Which tier a subscription grants, resolved from its Stripe price.
 *
 * A price this cannot place produces a payment with no entitlement, so every
 * price we have ever sold — including the pre-split legacy ones — must resolve.
 */
export function getSubscriptionTier(
  subscription: Stripe.Subscription,
  env: StripeEnv
): PlanTier | null {
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return null;
  return getTierForPriceId(priceId, env);
}

export function getSubscriptionInterval(subscription: Stripe.Subscription): 'month' | 'year' {
  return subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'year' : 'month';
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

/**
 * A one-time card pack purchase.
 *
 * The SKU is resolved from the session's price id and cross-checked against the
 * amount actually charged: granting credits on a mismatch would hand out cards
 * the buyer did not pay for.
 */
export function preparePackPurchase(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  env: StripeEnv
): PreparedPackPurchaseEvent | null {
  const userId = session.metadata?.userId || null;
  if (!userId || session.client_reference_id !== userId) return null;
  if (session.payment_status !== 'paid') return null;

  const priceId = session.metadata?.priceId || null;
  const sku = priceId ? getPackForPriceId(priceId, env) : null;
  if (!sku || !sku.cards) return null;
  const rawQuantity = session.metadata?.quantity;
  if (rawQuantity !== undefined && !/^[1-9]\d*$/.test(rawQuantity)) return null;
  const quantity = getCheckoutQuantity(sku.key, rawQuantity === undefined ? undefined : Number(rawQuantity));
  if (quantity === null || session.amount_total !== sku.amountCents * quantity) return null;

  return { kind: 'pack', event, userId, sku, quantity, cardsGranted: sku.cards * quantity, session };
}

async function prepareStripeEvent(
  event: Stripe.Event,
  client: StripeWebhookClient,
  env: StripeEnv
): Promise<PreparedStripeEvent | null> {
  let userId: string | null = null;
  let subscription: Stripe.Subscription | null = null;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadataUserId = session.metadata?.userId || null;

    if (session.mode === 'payment') {
      return preparePackPurchase(event, session, env);
    }

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

  const tier = getSubscriptionTier(subscription, env);
  if (!tier || tier === 'free') return null;

  return {
    kind: 'subscription',
    event,
    userId,
    tier,
    interval: getSubscriptionInterval(subscription),
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
  env: StripeEnv;
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
    const prepared = await prepareStripeEvent(event, input.client, input.env);
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
