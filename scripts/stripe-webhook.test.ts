import assert from 'node:assert/strict';
import Stripe from 'stripe';
import {
  getInvoiceSubscriptionId,
  getPlanForSubscription,
  getStripeSubscriptionAnalytics,
  getSubscriptionPeriod,
  handleStripeWebhook,
  type PreparedStripeEvent,
  type StripeWebhookPersistResult,
} from '../src/lib/stripe-webhook';

const webhookSecret = 'whsec_test_secret';
const prices = {
  monthlyPriceId: 'price_monthly',
  yearlyPriceId: 'price_yearly',
};
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
    prices,
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
  assert.equal(valid.persisted[0].plan, 'monthly');
  assert.equal(valid.persisted[0].periodStart.toISOString(), '2023-11-14T22:13:20.000Z');
  assert.equal(valid.persisted[0].periodEnd.toISOString(), '2023-12-14T22:13:20.000Z');

  const invalidSignature = await run({ stripeEvent: checkoutEvent, signature: 'invalid' });
  assert.equal(invalidSignature.result.status, 400);
  assert.equal(invalidSignature.persisted.length, 0);

  const unrelated = await run({
    stripeEvent: checkoutEvent,
    retrievedSubscription: subscription({
      items: {
        ...subscription().items,
        data: [
          {
            ...subscription().items.data[0],
            price: { ...subscription().items.data[0].price, id: 'price_other_app' },
          },
        ],
      },
    }),
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
  assert.equal(canceled.persisted[0].subscription.status, 'canceled');

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
  assert.equal(invoiceResult.persisted[0].isBillingEvent, true);

  assert.equal(getPlanForSubscription(subscription(), prices), 'monthly');
  assert.deepEqual(getStripeSubscriptionAnalytics(subscription()), {
    stripeSubscriptionId: 'sub_relevant',
    stripeCustomerId: 'cus_relevant',
    stripePriceId: prices.monthlyPriceId,
    stripeUnitAmount: 699,
    stripeCurrency: 'usd',
    stripeLivemode: true,
  });
  assert.equal(
    getPlanForSubscription(
      subscription({
        items: {
          ...subscription().items,
          data: [
            {
              ...subscription().items.data[0],
              price: { ...subscription().items.data[0].price, id: 'price_yearly' },
            },
          ],
        },
      }),
      prices
    ),
    'yearly'
  );
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
