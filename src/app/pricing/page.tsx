import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, CreditCard, ShieldCheck, Users } from 'lucide-react';
import { PricingCheckoutButton } from '@/components/PricingCheckoutButton';
import { PricingPageTracker } from '@/components/PricingPageTracker';
import { premiumFeatureRows, premiumPlans } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Creator Pro Pricing | MewTruCard',
  description: 'Creator Pro is the recurring card workflow for HR and office managers: recipient roster, 30-day queue, brand preset, complete batches, and premium delivery.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'MewTruCard Creator Pro Pricing',
    description: 'Create personalized team occasion cards in a reusable monthly workflow.',
    url: 'https://mewtrucard.com/pricing',
    images: [{ url: 'https://mewtrucard.com/og-cover.jpg', width: 1200, height: 630, alt: 'MewTruCard Creator Pro pricing' }],
  },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FFFDFC] text-[#202A3D]">
      <PricingPageTracker />
      <section className="relative border-b border-[#E8CDD6] bg-[#FFF8F6]">
        <div className="absolute inset-y-0 right-0 hidden w-[44%] bg-[#F5E2E7] lg:block" />
        <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div className="relative z-10 max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-700 motion-reduce:animate-none">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">MewTruCard Creator Pro</p>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.06] sm:text-6xl lg:text-7xl">One monthly system for every team moment.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#596174] sm:text-lg sm:leading-8">Keep the roster, see what is coming, reuse your brand direction, and generate the complete batch without starting over.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#plans" className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90">See monthly plan <ArrowRight className="ml-2 h-4 w-4" /></a>
              <Link href="/creator/" className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#CFAEBA] bg-white px-6 text-sm font-semibold text-[#4B4050] hover:bg-[#FFF3F5]">Try one batch preview</Link>
            </div>
            <div className="mt-9 space-y-3 text-sm font-semibold text-[#3F485B]">
              {['Unlimited recipient roster and complete batches', 'Reusable brand preset and 30-day queue', 'Private, ad-free cards with premium formats'].map((item) => <p key={item} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 text-primary" />{item}</p>)}
            </div>
          </div>

          <div className="relative min-h-[440px] lg:min-h-[610px]" aria-label="Creator Pro team card examples">
            <div className="absolute left-[1%] top-[14%] w-[44%] -rotate-6 rounded-md border border-white bg-white p-2 shadow-2xl transition-transform duration-300 hover:-translate-y-2 hover:-rotate-3 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:-rotate-6">
              <Image src="/card/birthday_1.png" alt="Employee birthday card" width={440} height={650} priority className="h-auto w-full rounded-sm" />
            </div>
            <div className="absolute left-[29%] top-[3%] z-20 w-[47%] rotate-1 rounded-md border border-white bg-white p-2 shadow-2xl transition-transform duration-300 hover:-translate-y-2 hover:rotate-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-1">
              <Image src="/card/anniversary.svg" alt="Work anniversary card" width={440} height={650} priority className="h-auto w-full rounded-sm" />
            </div>
            <div className="absolute right-0 top-[19%] w-[42%] rotate-6 rounded-md border border-white bg-white p-2 shadow-2xl transition-transform duration-300 hover:-translate-y-2 hover:rotate-3 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-6">
              <Image src="/card/thankyou.svg" alt="Employee appreciation card" width={440} height={650} priority className="h-auto w-full rounded-sm" />
            </div>
            <div className="absolute bottom-3 left-1/2 z-30 w-[min(92%,540px)] -translate-x-1/2 border-y border-[#CFAEBA] bg-white/95 px-5 py-4 shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Recurring workflow</p>
              <p className="mt-2 font-semibold">Roster → upcoming queue → branded batch → export</p>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="scroll-mt-16 border-b border-[#E8CDD6] bg-white py-16 sm:scroll-mt-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Plans</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-5xl">Prove the workflow free. Subscribe when it becomes repeat work.</h2>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="border-t border-[#CFAEBA] pt-6">
              <div className="flex items-start justify-between gap-5"><div><h3 className="text-2xl font-semibold">Free preview</h3><p className="mt-2 text-sm leading-6 text-[#687084]">Use your own recipient data before deciding.</p></div><p className="text-3xl font-bold">$0</p></div>
              <div className="mt-6 space-y-3 text-sm text-[#4C5568]">
                {['Up to 3 recipients', 'One generated batch preview', '30-day queue and one brand preset'].map((item) => <p key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" />{item}</p>)}
              </div>
              <Link href="/creator/" className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#CFAEBA] bg-white px-5 text-sm font-semibold text-primary hover:bg-[#FFF3F5]">Build free roster</Link>
            </div>

            <div className="rounded-md border-2 border-primary bg-[#FFF8F6] p-6 shadow-[0_24px_60px_rgba(180,55,95,0.12)] sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div><div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary"><Users className="h-3.5 w-3.5" />For repeat creators</div><h3 className="mt-4 text-3xl font-semibold">Creator Pro</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#687084]">For the person responsible for recurring birthdays, work anniversaries, and personalized team batches.</p></div>
                <div className="shrink-0 sm:text-right"><p className="text-4xl font-bold">{premiumPlans.monthly.price}</p><p className="mt-1 text-sm font-semibold text-primary">{premiumPlans.monthly.billingLabel}</p></div>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {['Unlimited roster', 'Up to 50 cards per batch', 'Batch export and history', 'Premium image and video', 'Private by default', 'No watermark or ads'].map((item) => <p key={item} className="flex gap-2 text-sm font-semibold text-[#3F485B]"><Check className="mt-0.5 h-4 w-4 text-primary" />{item}</p>)}
              </div>
              <PricingCheckoutButton plan="monthly" source="pricing_page_monthly" className="mt-8 h-12 w-full bg-primary text-white hover:bg-primary/90">Start Creator Pro monthly <ArrowRight className="ml-2 h-4 w-4" /></PricingCheckoutButton>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-[#687084]"><span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Secure Stripe checkout</span><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Cancel anytime</span></div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-[#E8CDD6] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-semibold">Annual subscription</p><p className="mt-1 text-sm text-[#687084]">Available for teams that already know the workflow fits.</p></div>
            <PricingCheckoutButton plan="yearly" source="pricing_page_yearly_secondary" variant="outline" className="h-11 border-[#CFAEBA] text-primary hover:bg-[#FFF3F5]">Choose yearly — {premiumPlans.yearly.price}</PricingCheckoutButton>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E8CDD6] bg-[#FFF8F6] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div><p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Compare</p><h2 className="mt-4 font-serif text-3xl font-semibold sm:text-5xl">A clear boundary between trying and operating.</h2></div>
            <div className="overflow-x-auto border-y border-[#DDBDC8] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" tabIndex={0} aria-label="Scrollable plan comparison">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <caption className="sr-only">Compare the Free preview and Creator Pro plans</caption>
                <thead className="bg-[#FFFDFC] font-semibold">
                  <tr className="border-b border-[#DDBDC8]">
                    <th scope="col" className="w-1/2 p-4 text-left">Capability</th>
                    <th scope="col" className="w-1/4 p-4 text-center">Free</th>
                    <th scope="col" className="w-1/4 p-4 text-center text-primary">Creator Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {premiumFeatureRows.map((row) => (
                    <tr key={row.feature} className="border-b border-[#E8CDD6] last:border-0">
                      <th scope="row" className="p-4 text-left font-semibold">{row.feature}</th>
                      <td className="p-4 text-center text-[#687084]">{row.free}</td>
                      <td className="p-4 text-center font-semibold text-primary">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#202A3D] px-4 py-16 text-center text-white sm:px-6 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F7B6C9]">Creator Pro</p>
        <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-semibold sm:text-6xl">Be ready for the next occasion, and the one after that.</h2>
        <Link href="/creator/" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-[#F7B6C9] px-7 text-sm font-semibold text-[#202A3D] hover:bg-white">Create your free preview <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </section>
    </main>
  );
}
