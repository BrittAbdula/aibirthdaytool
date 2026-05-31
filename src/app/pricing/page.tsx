import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  CreditCard,
  Crown,
  Gift,
  LockKeyhole,
  Play,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react"
import { PricingCheckoutButton } from "@/components/PricingCheckoutButton"
import { WarmButton } from "@/components/ui/warm-button"
import {
  getYearlySavingsPercent,
  premiumFeatureRows,
  premiumHighlights,
  premiumPlans,
} from "@/lib/pricing"

export const metadata: Metadata = {
  title: "Pricing | MewTruCard Premium",
  description:
    "Upgrade to MewTruCard Premium for unlimited daily creations, premium image and video cards, private sharing, no watermarks, and no ads.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "MewTruCard Premium Pricing",
    description:
      "Compare free and Premium plans for MewTruCard's AI greeting card maker.",
    url: "https://mewtrucard.com/pricing",
    images: [
      {
        url: "https://mewtrucard.com/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "MewTruCard Premium pricing",
      },
    ],
  },
}

const repeatUseBenefits = [
  {
    icon: Gift,
    title: "Ready for every occasion",
    description: "Birthdays, holidays, apologies, thank-you notes, and last-minute cards stay in one place.",
  },
  {
    icon: LockKeyhole,
    title: "Cleaner cards to send",
    description: "Private sharing, no watermarks, and no ads make the final link feel finished.",
  },
  {
    icon: Play,
    title: "More formats when it matters",
    description: "Move from animated SVGs to premium images or videos without changing tools.",
  },
]

const faqs = [
  {
    question: "Can I cancel Premium?",
    answer: "Yes. Premium is a Stripe subscription and can be canceled anytime.",
  },
  {
    question: "What happens after checkout?",
    answer: "Stripe sends you back to MewTruCard. Your account is upgraded after the checkout webhook confirms the subscription.",
  },
  {
    question: "Which plan should I choose?",
    answer: `Yearly is the best value with ${getYearlySavingsPercent()}% savings. Monthly is better for a short burst of cards.`,
  },
]

export default function PricingPage() {
  const savingsPercent = getYearlySavingsPercent()

  return (
    <main className="min-h-screen overflow-x-hidden bg-warm-cream text-[#202A3D]">
      <section className="border-b border-[#F1D6DF] bg-[#FFF8F6]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              MewTruCard Premium
            </p>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.08] tracking-normal text-[#202A3D] sm:text-6xl">
              Make every card polished, private, and ready to send.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#525B70] sm:text-lg sm:leading-8">
              Keep creating after the free daily credits run out, unlock video and premium image models, and send cleaner links without ads or watermarks.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#plans" className="sm:w-auto">
                <WarmButton size="lg" className="w-full sm:w-auto">
                  View plans
                  <ArrowRight className="ml-2 h-5 w-5" />
                </WarmButton>
              </a>
              <Link href="/birthday/" className="sm:w-auto">
                <WarmButton variant="secondary" size="lg" className="w-full sm:w-auto">
                  Try card maker
                  <Sparkles className="ml-2 h-5 w-5" />
                </WarmButton>
              </Link>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {premiumHighlights.map((highlight) => (
                <div key={highlight} className="border-l border-primary/25 pl-4">
                  <Check className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold leading-6 text-[#202A3D]">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[430px] lg:min-h-[560px]" aria-label="Premium card examples">
            <div className="absolute left-0 top-8 w-[44%] rotate-[-7deg] rounded-lg border border-[#F1D6DF] bg-white p-3 shadow-xl transition-transform duration-300 hover:rotate-[-4deg]">
              <Image
                src="/card/birthday.svg"
                alt="Birthday card preview"
                width={420}
                height={600}
                priority
                className="h-auto w-full rounded-md object-contain"
              />
            </div>
            <div className="absolute left-[27%] top-0 z-10 w-[47%] rounded-lg border border-primary/20 bg-white p-3 shadow-2xl transition-transform duration-300 hover:-translate-y-1">
              <Image
                src="/card/valentine.svg"
                alt="Valentine card preview"
                width={420}
                height={600}
                priority
                className="h-auto w-full rounded-md object-contain"
              />
            </div>
            <div className="absolute right-0 top-20 w-[42%] rotate-[7deg] rounded-lg border border-[#F1D6DF] bg-white p-3 shadow-xl transition-transform duration-300 hover:rotate-[4deg]">
              <Image
                src="/card/anniversary.svg"
                alt="Anniversary card preview"
                width={420}
                height={600}
                priority
                className="h-auto w-full rounded-md object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-1/2 z-20 w-[min(92%,560px)] -translate-x-1/2 rounded-lg border border-[#F1D6DF] bg-white/95 p-5 shadow-xl backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-[#FFF1F5] p-3 text-primary">
                  <Wand2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Premium workflow
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[#202A3D]">
                    Generate, revise, download, and send without daily interruptions.
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="border-b border-[#F1D6DF] bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Plans</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-[#202A3D] sm:text-5xl">
              Start free. Upgrade when a card needs more.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-[#F1D6DF] bg-[#FFF8F6] p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold text-[#202A3D]">Free</h3>
                <span className="rounded-full border border-[#F1D6DF] bg-white px-3 py-1 text-sm font-semibold text-[#525B70]">
                  $0
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#6B7280]">
                Good for trying the generator and making occasional cards with daily credits.
              </p>
              <Link href="/birthday/" className="mt-6 block">
                <WarmButton variant="secondary" className="w-full">
                  Create free card
                </WarmButton>
              </Link>
              <div className="mt-6 space-y-3 text-sm text-[#525B70]">
                <p className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Daily free credits
                </p>
                <p className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Animated SVG card maker
                </p>
                <p className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Shareable saved card links
                </p>
              </div>
            </div>

            <div className="rounded-lg border-2 border-primary bg-white p-6 shadow-xl shadow-primary/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF1F5] px-3 py-1 text-sm font-semibold text-primary">
                    <Crown className="h-4 w-4" />
                    Best for repeat cards
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-[#202A3D]">Premium</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                    Unlimited creations with premium formats and cleaner delivery.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-4xl font-bold text-[#202A3D]">{premiumPlans.yearly.price}</div>
                  <div className="mt-1 text-sm font-semibold text-primary">
                    {premiumPlans.yearly.monthlyEquivalent} billed yearly
                  </div>
                  <div className="mt-1 text-sm text-[#6B7280]">Save {savingsPercent}% vs monthly</div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <PricingCheckoutButton
                  plan="yearly"
                  source="pricing_page_yearly"
                  className="h-12 bg-primary text-white hover:bg-primary/90"
                >
                  Choose yearly
                  <ArrowRight className="h-4 w-4" />
                </PricingCheckoutButton>
                <PricingCheckoutButton
                  plan="monthly"
                  source="pricing_page_monthly"
                  variant="outline"
                  className="h-12 border-primary/25 text-primary hover:bg-[#FFF1F5] hover:text-primary"
                >
                  Monthly {premiumPlans.monthly.price}
                </PricingCheckoutButton>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-[#6B7280]">
                <span className="inline-flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Secure Stripe checkout
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1D6DF] bg-[#FFF8F6] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Compare</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-[#202A3D] sm:text-5xl">
                The upgrade removes the moments that slow sending down.
              </h2>
            </div>
            <div className="overflow-hidden rounded-lg border border-[#F1D6DF] bg-white">
              <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] border-b border-[#F1D6DF] bg-[#FFF8F6] text-sm font-semibold text-[#202A3D]">
                <div className="p-4">Feature</div>
                <div className="p-4 text-center">Free</div>
                <div className="p-4 text-center text-primary">Premium</div>
              </div>
              {premiumFeatureRows.map((row) => (
                <div key={row.feature} className="grid grid-cols-[1.2fr_0.9fr_0.9fr] border-b border-[#F1D6DF]/70 last:border-b-0 text-sm">
                  <div className="p-4 font-semibold text-[#202A3D]">{row.feature}</div>
                  <div className="p-4 text-center text-[#6B7280]">{row.free}</div>
                  <div className="p-4 text-center font-semibold text-primary">{row.premium}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1D6DF] bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Repeat value</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-[#202A3D] sm:text-5xl">
              Premium is built for the cards you send again and again.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {repeatUseBenefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="rounded-lg border border-[#F1D6DF] bg-[#FFF8F6] p-6">
                  <Icon className="h-7 w-7 text-primary" />
                  <h3 className="mt-5 text-lg font-semibold text-[#202A3D]">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#6B7280]">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#202A3D] py-14 text-white sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F8B7C7]">FAQ</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-5xl">
              Upgrade only when it helps you finish the card.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/70">
              The free plan remains available. Premium is for people who create often, need video or private cards, or want a cleaner sending experience.
            </p>
            <PricingCheckoutButton
              plan="yearly"
              source="pricing_page_final_cta"
              className="mt-8 h-12 bg-white text-[#202A3D] hover:bg-[#FFF1F5]"
            >
              Start Premium yearly
              <ArrowRight className="h-4 w-4" />
            </PricingCheckoutButton>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-lg border border-white/15 bg-white/5 p-5">
                <h3 className="font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
