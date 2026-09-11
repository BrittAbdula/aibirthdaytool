import assert from 'node:assert/strict';
import Stripe from 'stripe';
import {
  getInvoiceSubscriptionId,
  getStripeSubscriptionAnalytics,
  getSubscriptionInterval,
  getSubscriptionPeriod,
  getSubscriptionTier,
  handleStripeWebhook,
  type PreparedStripeEvent,
  type PreparedSubscriptionEvent,
  type StripeWebhookPersistResult,
} from '../src/lib/stripe-webhook';

const webhookSecret = 'whsec_test_secret';
const env = {
  STRIPE_PLUS_MONTHLY_PRICE_ID: 'price_monthly',
  STRIPE_PLUS_YEARLY_PRICE_ID: 'price_yearly',
  STRIPE_CREATOR_PRO_MONTHLY_PRICE_ID: 'price_cp_monthly',
  STRIPE_CREATOR_PRO_YEARLY_PRICE_ID: 'price_cp_yearly',
  STRIPE_PACK_20_PRICE_ID: 'price_pack_20',
  STRIPE_PACK_50_PRICE_ID: 'price_pack_50',
  STRIPE_MONTHLY_PRICE_ID: 'price_legacy_monthly',
  STRIPE_YEARLY_PRICE_ID: 'price_legacy_yearly',
};

function withPrice(priceId: string, unitAmount = 699): Stripe.Subscription {
  const base = subscription();
  return subscription({
    items: {
      ...base.items,
      data: [
        {
          ...base.items.data[0],
          price: { ...base.items.data[0].price, id: priceId, unit_amount: unitAmount },
        },
      ],
    },
  });
}

function asSubscriptionEvent(prepared: PreparedStripeEvent): PreparedSubscriptionEvent {
  assert.equal(prepared.kind, 'subscription');
  return prepared as PreparedSubscriptionEvent;
}
const stripe = new Stripe('sk_test_placeholder');

function subscription(overrides: Record<string, unknown> = {}): Stripe.Subscription {
  return {
    id: 'sub_relevant',
    object: 'subscription',
    customer: 'cus_relevant',
    livemode: true,
    metadata: { userId: 'user_123' },
    status: 'active',
    cancel_at_period_end: false,
    items: {
      object: 'list',
      data: [
        {
          id: 'si_123',
          object: 'subscription_item',
          current_period_start: 1_700_000_000,
          current_period_end: 1_702_592_000,
          price: {
            id: 'price_monthly',
            object: 'price',
            currency: 'usd',
            unit_amount: 699,
          },
        },
      ],
      has_more: false,
      url: '/v1/subscription_items',
    },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

function signedRequest(event: Stripe.Event) {
  const body = JSON.stringify(event);
  return {
    body,
    signature: Stripe.webhooks.generateTestHeaderString({
      payload: body,
      secret: webhookSecret,
    }),
  };
}

function event(type: Stripe.Event.Type, object: Record<string, unknown>): Stripe.Event {
  return {
    id: `evt_${type}`,
    object: 'event',
    api_version: '2025-04-30.basil',
    created: 1_700_000_000,
    data: { object },
    livemode: true,
    pending_webhooks: 1,
    request: null,
    type,
  } as unknown as Stripe.Event;
}

async function run(input: {
  stripeEvent: Stripe.Event;
  retrievedSubscription?: Stripe.Subscription;
  persistResult?: StripeWebhookPersistResult;
  persistError?: Error;
  signature?: string;
}) {
  const persisted: PreparedStripeEvent[] = [];
  const request = signedRequest(input.stripeEvent);
  const result = await handleStripeWebhook({
    body: request.body,
    signature: input.signature ?? request.signature,
    webhookSecret,
    env,
    client: {
      constructEvent: (body, signature, secret) =>
        stripe.webhooks.constructEvent(body, signature, secret),
      retrieveSubscription: async () => input.retrievedSubscription || subscription(),
    },
    store: {
      persist: async (prepared) => {
        if (input.persistError) throw input.persistError;
        persisted.push(prepared);
        return input.persistResult || 'processed';
      },
    },
  });
  return { result, persisted };
}

async function main() {
  const checkoutEvent = event('checkout.session.completed', {
    id: 'cs_live_123',
    object: 'checkout.session',
    mode: 'subscription',
    client_reference_id: 'user_123',
    metadata: { userId: 'user_123', plan: 'monthly' },
    subscription: 'sub_relevant',
  });

  const valid = await run({ stripeEvent: checkoutEvent });
  assert.equal(valid.result.status, 200);
  assert.equal(valid.result.body, 'Webhook received');
  assert.equal(valid.persisted.length, 1);
  const validPrepared = asSubscriptionEvent(valid.persisted[0]);
  assert.equal(validPrepared.tier, 'plus');
  assert.equal(validPrepared.interval, 'month');
  assert.equal(validPrepared.periodStart.toISOString(), '2023-11-14T22:13:20.000Z');
  assert.equal(validPrepared.periodEnd.toISOString(), '2023-12-14T22:13:20.000Z');

  const invalidSignature = await run({ stripeEvent: checkoutEvent, signature: 'invalid' });
  assert.equal(invalidSignature.result.status, 400);
  assert.equal(invalidSignature.persisted.length, 0);

  // This Stripe account also bills other products, so their events arrive here
  // too and must be ignored rather than mutating a MewTruCard user's plan.
  const unrelated = await run({
    stripeEvent: checkoutEvent,
    retrievedSubscription: withPrice('price_other_app'),
  });
  assert.equal(unrelated.result.status, 200);
  assert.equal(unrelated.result.body, 'Webhook ignored');
  assert.equal(unrelated.persisted.length, 0);

  const duplicate = await run({ stripeEvent: checkoutEvent, persistResult: 'duplicate' });
  assert.equal(duplicate.result.status, 200);
  assert.equal(duplicate.result.body, 'Webhook duplicate');

  const transientFailure = await run({
    stripeEvent: checkoutEvent,
    persistError: new Error('temporary database failure'),
  });
  assert.equal(transientFailure.result.status, 500);

  const canceledSubscription = subscription({ status: 'canceled', cancel_at_period_end: false });
  const canceled = await run({
    stripeEvent: event(
      'customer.subscription.deleted',
      canceledSubscription as unknown as Record<string, unknown>
    ),
  });
  assert.equal(canceled.result.status, 200);
  assert.equal(asSubscriptionEvent(canceled.persisted[0]).subscription.status, 'canceled');

  const invoice = {
    id: 'in_123',
    object: 'invoice',
    amount_paid: 699,
    currency: 'usd',
    status: 'paid',
    parent: {
      type: 'subscription_details',
      subscription_details: {
        subscription: 'sub_relevant',
        metadata: { userId: 'user_123' },
      },
      quote_details: null,
    },
  };
  assert.equal(getInvoiceSubscriptionId(invoice as unknown as Stripe.Invoice), 'sub_relevant');
  const invoiceResult = await run({
    stripeEvent: event('invoice.payment_succeeded', invoice),
  });
  assert.equal(invoiceResult.result.status, 200);
  assert.equal(asSubscriptionEvent(invoiceResult.persisted[0]).isBillingEvent, true);

  assert.equal(getSubscriptionTier(subscription(), env), 'plus');
  assert.deepEqual(getStripeSubscriptionAnalytics(subscription()), {
    stripeSubscriptionId: 'sub_relevant',
    stripeCustomerId: 'cus_relevant',
    stripePriceId: 'price_monthly',
    stripeUnitAmount: 699,
    stripeCurrency: 'usd',
    stripeLivemode: true,
  });
  assert.equal(getSubscriptionTier(withPrice('price_yearly'), env), 'plus');
  assert.equal(getSubscriptionTier(withPrice('price_cp_monthly', 1999), env), 'creator_pro');
  assert.equal(getSubscriptionTier(withPrice('price_other_app'), env), null);
  assert.equal(getSubscriptionInterval(subscription()), 'month');

  // Every price we have ever sold must resolve, or a real payment lands with no
  // entitlement attached. Legacy subscribers keep the full Creator Pro set.
  assert.equal(getSubscriptionTier(withPrice('price_legacy_monthly'), env), 'creator_pro');
  assert.equal(getSubscriptionTier(withPrice('price_legacy_yearly', 5299), env), 'creator_pro');

  // --- one-time card packs ---
  const packSession: Record<string, unknown> = {
    id: 'cs_live_pack',
    object: 'checkout.session',
    mode: 'payment',
    payment_status: 'paid',
    livemode: true,
    amount_total: 299,
    currency: 'usd',
    client_reference_id: 'user_123',
    payment_intent: 'pi_123',
    metadata: { userId: 'user_123', sku: 'pack_20', priceId: 'price_pack_20' },
  };

  const packResult = await run({ stripeEvent: event('checkout.session.completed', packSession) });
  assert.equal(packResult.result.status, 200);
  assert.equal(packResult.persisted.length, 1);
  const packPrepared = packResult.persisted[0];
  assert.equal(packPrepared.kind, 'pack');
  assert.equal(packPrepared.kind === 'pack' && packPrepared.sku.key, 'pack_20');
  assert.equal(packPrepared.kind === 'pack' && packPrepared.sku.cards, 20);

  assert.equal(packPrepared.kind === 'pack' && packPrepared.quantity, 1);
  assert.equal(packPrepared.kind === 'pack' && packPrepared.cardsGranted, 20);
  for (const [sku, quantity, amount, cards] of [
    ['pack_20', 3, 897, 60],
    ['pack_50', 2, 998, 100],
    ['pack_20', 99, 29601, 1980],
  ] as const) {
    const multiSession = {
      ...packSession,
      amount_total: amount,
      metadata: { userId: 'user_123', sku, priceId: `price_${sku}`, quantity: String(quantity) },
    };
    const multi = await run({ stripeEvent: event('checkout.session.completed', multiSession) });
    assert.equal(multi.persisted.length, 1);
    const prepared = multi.persisted[0];
    assert.equal(prepared.kind === 'pack' && prepared.quantity, quantity);
    assert.equal(prepared.kind === 'pack' && prepared.cardsGranted, cards);
    const mismatch = await run({ stripeEvent: event('checkout.session.completed', { ...multiSession, amount_total: 299 }) });
    assert.equal(mismatch.persisted.length, 0);
    const duplicate = await run({ stripeEvent: event('checkout.session.completed', multiSession), persistResult: 'duplicate' });
    assert.equal(duplicate.result.body, 'Webhook duplicate');
  }
  for (const quantity of ['', '0', '-1', '1.5', '100', 'NaN', '3e0', ' 3']) {
    const invalid = await run({ stripeEvent: event('checkout.session.completed', {
      ...packSession,
      metadata: { userId: 'user_123', sku: 'pack_20', priceId: 'price_pack_20', quantity },
    }) });
    assert.equal(invalid.persisted.length, 0);
  }

  // An unpaid session must never grant cards.
  const unpaidPack = await run({
    stripeEvent: event('checkout.session.completed', {
      ...packSession,
      id: 'cs_live_pack_unpaid',
      payment_status: 'unpaid',
    }),
  });
  assert.equal(unpaidPack.persisted.length, 0);

  // Neither must a session whose charged amount disagrees with the SKU.
  const mismatchedPack = await run({
    stripeEvent: event('checkout.session.completed', {
      ...packSession,
      id: 'cs_live_pack_mismatch',
      amount_total: 1,
    }),
  });
  assert.equal(mismatchedPack.persisted.length, 0);

  // Nor one whose client_reference_id disagrees with the metadata user.
  const spoofedPack = await run({
    stripeEvent: event('checkout.session.completed', {
      ...packSession,
      id: 'cs_live_pack_spoofed',
      client_reference_id: 'user_other',
    }),
  });
  assert.equal(spoofedPack.persisted.length, 0);

  // A payment-mode session for another product on this account is ignored.
  const foreignPayment = await run({
    stripeEvent: event('checkout.session.completed', {
      ...packSession,
      id: 'cs_live_foreign',
      metadata: { userId: 'user_123', sku: 'pack_20', priceId: 'price_some_other_product' },
    }),
  });
  assert.equal(foreignPayment.persisted.length, 0);

  assert.throws(
    () =>
      getSubscriptionPeriod(
        subscription({
          items: {
            ...subscription().items,
            data: [{ ...subscription().items.data[0], current_period_end: undefined }],
          },
        })
      ),
    /missing its current billing period/
  );

  console.log('stripe webhook rules ok');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
