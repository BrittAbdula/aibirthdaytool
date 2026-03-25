import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI and Editorial Policy",
  description:
    "Read how MewTruCard uses AI, how public examples are handled, and how guidance pages are reviewed for clarity and trust.",
  alternates: {
    canonical: "/ai-and-editorial-policy/",
  },
};

const policyCards = [
  {
    title: "AI is used to generate card drafts",
    description:
      "The product uses AI to create initial visuals and message structures. Users should still review the result before they share it.",
  },
  {
    title: "Public examples are meant to teach patterns",
    description:
      "Gallery pages exist to help visitors compare tone, layout, and relationship fit. They should reduce decision fatigue, not create more of it.",
  },
  {
    title: "Helpful pages should explain their method",
    description:
      "When we publish guidance pages, we try to show what the page is for, how the guidance was prepared, and what a user should do next.",
  },
  {
    title: "We avoid inflated promises",
    description:
      "If a claim cannot be tied to a real product behavior or a measured result, we would rather soften the language than overstate it.",
  },
];

export default function AiAndEditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-sm sm:p-10">
          <div className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
            AI and editorial policy
          </div>
          <h1 className="mt-5 text-4xl font-serif font-bold tracking-tight text-gray-800 sm:text-5xl">
            How MewTruCard uses AI and how our guidance pages are reviewed
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
            We want visitors to understand where automation helps, where human
            judgment still matters, and how public examples are presented on the
            site.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {policyCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[24px] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[28px] border border-white/70 bg-gradient-to-br from-white to-purple-50 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800">What this means for readers</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-gray-600">
              <p>
                Guidance pages should tell you who reviewed the page, why it
                exists, and what parts of the advice come from actual product
                flows or public examples.
              </p>
              <p>
                If a page does not help you choose a direction, write a better
                message, or understand the MewTruCard workflow, then it is not
                doing its job.
              </p>
              <p>
                Our intent is to keep search-facing pages people-first: useful to
                someone with a real card to send, even if search traffic did not
                exist.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/about/"
              className="inline-flex rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Learn about MewTruCard
            </Link>
            <Link
              href="/how-it-works/"
              className="inline-flex rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
            >
              See how the workflow works
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
