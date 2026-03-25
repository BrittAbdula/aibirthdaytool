import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About MewTruCard",
  description:
    "Learn what MewTruCard builds, who the product is for, and how the team thinks about helpful AI-assisted greeting card experiences.",
  alternates: {
    canonical: "/about/",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/40 to-white">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-sm sm:p-10">
          <div className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
            About MewTruCard
          </div>
          <h1 className="mt-5 text-4xl font-serif font-bold tracking-tight text-gray-800 sm:text-5xl">
            We are building an AI card tool that is useful in real sending moments
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
            MewTruCard is designed for people who want to move from a blank page
            to a thoughtful card quickly, without losing the personal details
            that make the message worth sending.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
              <h2 className="text-lg font-semibold text-gray-800">What we optimize for</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Speed helps, but clarity matters more. The product should help
                users decide on a tone, personalize a message, and share it
                without unnecessary friction.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
              <h2 className="text-lg font-semibold text-gray-800">What we do not want</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Generic output, empty marketing promises, or pages that only
                exist to capture search traffic without helping someone choose or
                send a better card.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
              <h2 className="text-lg font-semibold text-gray-800">Why public examples matter</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Public cards help visitors compare tones and layouts before they
                create their own version. They also help us see which ideas are
                easiest to adapt in real use.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border border-white/70 bg-gradient-to-br from-white to-purple-50 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800">How the product is intended to be used</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-purple-100 bg-white/90 p-5">
                <div className="text-sm font-semibold text-purple-700">1. Choose a moment</div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Start with an occasion, a relationship, or a gallery page that
                  narrows the direction before generation begins.
                </p>
              </div>
              <div className="rounded-2xl border border-purple-100 bg-white/90 p-5">
                <div className="text-sm font-semibold text-purple-700">2. Generate and edit</div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Use the generator to draft the card, then review the message,
                  update the editable details, and adjust the share settings.
                </p>
              </div>
              <div className="rounded-2xl border border-purple-100 bg-white/90 p-5">
                <div className="text-sm font-semibold text-purple-700">3. Send with intent</div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The end goal is not just an image. It is a card someone can
                  actually open, understand, and remember.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/how-it-works/"
              className="inline-flex rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              See how the flow works
            </Link>
            <Link
              href="/ai-and-editorial-policy/"
              className="inline-flex rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
            >
              Read our AI and editorial policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
