import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { CheckoutButton } from '@/components/paywall/CheckoutButton';
import { PricingPageTracker } from '@/components/PricingPageTracker';
import {
  SKUS,
  formatPerCardPrice,
  formatPrice,
  getMonthlyEquivalent,
  getYearlySavingsPercent,
} from '@/lib/pricing/plans';
import { PLAN_FEATURE_ROWS } from '@/lib/pricing/features';
import { AD_REWARD_DAILY_CAP, FREE_DAILY_CARDS } from '@/lib/pricing/quota';

export const metadata: Metadata = {
  title: 'Pricing | MewTruCard',
  description:
    'Make three cards a day for free. Card packs from $2.99 never expire. Subscribe only if you make cards all the time.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'MewTruCard Pricing',
    description: 'Free cards every day, card packs that never expire, and subscriptions for regular creators.',
    url: 'https://mewtrucard.com/pricing',
    images: [{ url: 'https://mewtrucard.com/og-cover.jpg', width: 1200, height: 630, alt: 'MewTruCard pricing' }],
  },
};

const packs = [SKUS.pack_20, SKUS.pack_50];

export default function PricingPage() {
  const plusSavings = getYearlySavingsPercent(SKUS.plus_monthly, SKUS.plus_yearly);
  const creatorSavings = getYearlySavingsPercent(SKUS.creator_pro_monthly, SKUS.creator_pro_yearly);

  return (
    <main className="min-h-screen bg-[#FFFDFC] text-[#202A3D]">
      <PricingPageTracker />

      <section className="border-b border-[#E8CDD6] bg-[#FFF8F6] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Pricing</p>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.08] sm:text-6xl">
            Start free. Pay only for what you actually need.
          </h1>
          <p className="mt-6 text-base leading-7 text-[#596174] sm:text-lg">
            {FREE_DAILY_CARDS} cards every day at no cost, and up to {AD_REWARD_DAILY_CAP} more for
            watching a short ad. When that is not enough, a card pack costs less than one card from a
            shop and never expires.
          </p>
        </div>
      </section>

      {/* One occasion — the case most people are actually in. */}
      <section className="border-b border-[#E8CDD6] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">For one occasion</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
              A card pack, not a subscription.
            </h2>
            <p className="mt-4 text-[#596174]">
              One payment. The cards sit in your account until you use them, and they unlock video,
              premium styles, private sharing, and clean downloads while they last.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-md border border-[#E8CDD6] bg-white p-6">
              <h3 className="text-xl font-semibold">Free</h3>
              <p className="mt-2 text-4xl font-bold">$0</p>
              <p className="mt-3 text-sm leading-6 text-[#687084]">
                {FREE_DAILY_CARDS} cards a day, every day. No card needed.
              </p>
              <div className="mt-6 space-y-3 text-sm text-[#4C5568]">
                {[`${FREE_DAILY_CARDS} cards daily`, `+${AD_REWARD_DAILY_CAP} a day from short ads`, 'Animated and static cards'].map((item) => (
                  <p key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </p>
                ))}
              </div>
              <Link
                href="/birthday/"
                className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#CFAEBA] bg-white px-5 text-sm font-semibold text-primary hover:bg-[#FFF3F5]"
              >
                Make a card
              </Link>
            </div>

            {packs.map((pack, index) => (
              <div
                key={pack.key}
                className={
                  index === 0
                    ? 'rounded-md border-2 border-primary bg-[#FFF8F6] p-6 shadow-[0_20px_50px_rgba(180,55,95,0.10)]'
                    : 'rounded-md border border-[#E8CDD6] bg-white p-6'
                }
              >
                {index === 0 && (
                  <span className="inline-flex rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className={index === 0 ? 'mt-3 text-xl font-semibold' : 'text-xl font-semibold'}>
                  {pack.label}
                </h3>
                <p className="mt-2 text-4xl font-bold">{formatPrice(pack.amountCents)}</p>
                <p className="mt-1 text-sm font-semibold text-primary">{formatPerCardPrice(pack)}</p>
                <p className="mt-3 text-sm leading-6 text-[#687084]">{pack.description}</p>
                <div className="mt-6 space-y-3 text-sm text-[#4C5568]">
                  {['Never expires', 'Video and premium styles', 'Private cards, no watermark, no ads'].map((item) => (
                    <p key={item} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </p>
                  ))}
                </div>
                <CheckoutButton
                  sku={pack.key}
                  source={`pricing_page_${pack.key}`}
                  className={
                    index === 0
                      ? 'mt-7 h-11 w-full bg-primary text-white hover:bg-primary/90'
                      : 'mt-7 h-11 w-full border border-[#CFAEBA] bg-white text-primary hover:bg-[#FFF3F5]'
                  }
                >
                  Get {pack.label} <ArrowRight className="ml-2 h-4 w-4" />
                </CheckoutButton>
              </div>
            ))}
          </div>

          <p className="mt-6 flex flex-wrap justify-center gap-5 text-xs text-[#687084]">
            <span className="inline-flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Secure Stripe checkout
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              One payment, no renewal
            </span>
          </p>
        </div>
      </section>

      {/* Every occasion — the recurring case. */}
      <section className="border-b border-[#E8CDD6] bg-[#FFF8F6] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">For every occasion</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
              Subscribe when card making is a habit.
            </h2>
            <p className="mt-4 text-[#596174]">
              Worth it once you are making cards most weeks, or running the same list of birthdays
              and work anniversaries every month.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-md border border-[#CFAEBA] bg-white p-6 sm:p-8">
              <h3 className="text-2xl font-semibold">Plus</h3>
              <p className="mt-2 text-sm leading-6 text-[#687084]">
                For people who make cards for everyone they know.
              </p>
              <p className="mt-5 text-4xl font-bold">{formatPrice(SKUS.plus_monthly.amountCents)}</p>
              <p className="mt-1 text-sm font-semibold text-primary">per month</p>
              <div className="mt-6 space-y-3 text-sm text-[#4C5568]">
                {['Unlimited cards', 'Video and every premium style', 'Private by default, no ads'].map((item) => (
                  <p key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </p>
                ))}
              </div>
              <CheckoutButton
                sku="plus_monthly"
                source="pricing_page_plus_monthly"
                className="mt-7 h-11 w-full bg-primary text-white hover:bg-primary/90"
              >
                Start Plus <ArrowRight className="ml-2 h-4 w-4" />
              </CheckoutButton>
              <CheckoutButton
                sku="plus_yearly"
                source="pricing_page_plus_yearly"
                variant="outline"
                className="mt-3 h-11 w-full border-[#CFAEBA] text-primary hover:bg-[#FFF3F5]"
              >
                Yearly — {formatPrice(SKUS.plus_yearly.amountCents)} ({getMonthlyEquivalent(SKUS.plus_yearly)}, save {plusSavings}%)
              </CheckoutButton>
            </div>

            <div className="rounded-md border border-[#CFAEBA] bg-white p-6 sm:p-8">
              <h3 className="text-2xl font-semibold">Creator Pro</h3>
              <p className="mt-2 text-sm leading-6 text-[#687084]">
                For the person responsible for a whole team&apos;s occasions.
              </p>
              <p className="mt-5 text-4xl font-bold">{formatPrice(SKUS.creator_pro_monthly.amountCents)}</p>
              <p className="mt-1 text-sm font-semibold text-primary">per month</p>
              <div className="mt-6 space-y-3 text-sm text-[#4C5568]">
                {['Everything in Plus', 'Unlimited roster and 30-day queue', 'Batches up to 50, export and history'].map((item) => (
                  <p key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </p>
                ))}
              </div>
              <CheckoutButton
                sku="creator_pro_monthly"
                source="pricing_page_creator_pro_monthly"
                className="mt-7 h-11 w-full bg-primary text-white hover:bg-primary/90"
              >
                Start Creator Pro <ArrowRight className="ml-2 h-4 w-4" />
              </CheckoutButton>
              <CheckoutButton
                sku="creator_pro_yearly"
                source="pricing_page_creator_pro_yearly"
                variant="outline"
                className="mt-3 h-11 w-full border-[#CFAEBA] text-primary hover:bg-[#FFF3F5]"
              >
                Yearly — {formatPrice(SKUS.creator_pro_yearly.amountCents)} ({getMonthlyEquivalent(SKUS.creator_pro_yearly)}, save {creatorSavings}%)
              </CheckoutButton>
              <Link
                href="/creator/"
                className="mt-4 block text-center text-sm font-semibold text-primary hover:underline"
              >
                Try one batch preview free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Everything side by side</h2>
          <div
            className="mt-8 overflow-x-auto border-y border-[#DDBDC8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            tabIndex={0}
            aria-label="Scrollable plan comparison"
          >
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <caption className="sr-only">Compare Free, card packs, Plus and Creator Pro</caption>
              <thead className="bg-[#FFFDFC] font-semibold">
                <tr className="border-b border-[#DDBDC8]">
                  <th scope="col" className="w-1/3 p-4 text-left">Capability</th>
                  <th scope="col" className="p-4 text-center">Free</th>
                  <th scope="col" className="p-4 text-center text-primary">Card pack</th>
                  <th scope="col" className="p-4 text-center">Plus</th>
                  <th scope="col" className="p-4 text-center">Creator Pro</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURE_ROWS.map((row) => (
                  <tr key={row.feature} className="border-b border-[#E8CDD6] last:border-0">
                    <th scope="row" className="p-4 text-left font-semibold">{row.feature}</th>
                    <td className="p-4 text-center text-[#687084]">{row.free}</td>
                    <td className="p-4 text-center font-semibold text-primary">{row.pack}</td>
                    <td className="p-4 text-center text-[#4C5568]">{row.plus}</td>
                    <td className="p-4 text-center text-[#4C5568]">{row.creatorPro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
