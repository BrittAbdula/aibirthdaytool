import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { recordMonetizationEvent } from '@/lib/monetization';
import { getUserPlanForSubscriptionStatus } from '@/lib/subscription-status';
import { getStripeSubscriptionAnalytics, getSubscriptionPeriod } from '@/lib/stripe-webhook';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
  httpClient: Stripe.createFetchHttpClient(),
  timeout: 20_000,
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid checkout session.' }, { status: 400 });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (
      checkoutSession.mode !== 'subscription' ||
      checkoutSession.client_reference_id !== session.user.id ||
      checkoutSession.metadata?.userId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Checkout session does not belong to this account.' }, { status: 403 });
    }

    const subscriptionId = typeof checkoutSession.subscription === 'string'
      ? checkoutSession.subscription
      : checkoutSession.subscription?.id;
    if (!subscriptionId) return NextResponse.json({ error: 'Subscription is not ready yet.' }, { status: 409 });

    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price'],
    });
    if (stripeSubscription.metadata?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Subscription does not belong to this account.' }, { status: 403 });
    }

    const priceId = stripeSubscription.items.data[0]?.price.id;
    const billingPeriod = priceId === process.env.STRIPE_MONTHLY_PRICE_ID
      ? 'MONTHLY'
      : priceId === process.env.STRIPE_YEARLY_PRICE_ID
        ? 'YEARLY'
        : null;
    if (!billingPeriod) return NextResponse.json({ error: 'Unknown subscription price.' }, { status: 400 });

    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    const plan = getUserPlanForSubscriptionStatus(stripeSubscription.status);
    const period = getSubscriptionPeriod(stripeSubscription);
    const analytics = getStripeSubscriptionAnalytics(stripeSubscription);

    await prisma.$transaction([
      prisma.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          plan,
          billingPeriod,
          status: stripeSubscription.status,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          startDate: period.periodStart,
          endDate: period.periodEnd,
          nextBillingAt: period.periodEnd,
          ...analytics,
        },
        update: {
          plan,
          billingPeriod,
          status: stripeSubscription.status,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          startDate: period.periodStart,
          endDate: period.periodEnd,
          nextBillingAt: period.periodEnd,
          ...analytics,
        },
      }),
      prisma.user.update({ where: { id: session.user.id }, data: { plan } }),
    ]);

    if (plan === 'PREMIUM' && existingUser?.plan !== 'PREMIUM') {
      await recordMonetizationEvent({
        eventType: 'subscription_activated',
        userId: session.user.id,
        plan: billingPeriod === 'MONTHLY' ? 'monthly' : 'yearly',
        source: 'checkout_reconciliation',
        stripeSessionId: sessionId,
        metadata: { status: stripeSubscription.status },
      });
    }

    return NextResponse.json({ plan, status: stripeSubscription.status });
  } catch (error) {
    console.error('Checkout reconciliation failed:', error);
    return NextResponse.json({ error: 'Subscription confirmation is still pending.' }, { status: 503 });
  }
}
