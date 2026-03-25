import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How MewTruCard Works",
  description:
    "See the real MewTruCard workflow from generator input to editing, sharing, and downloading your finished card.",
  alternates: {
    canonical: "/how-it-works/",
  },
};

const steps = [
  {
    title: "Start with a page that matches the intent",
    description:
      "Users can begin from a generator page, a gallery page, or a relationship-specific example page depending on how much direction they already have.",
  },
  {
    title: "Generate a first draft from recipient context",
    description:
      "The system uses the occasion, relationship, message details, and visual preferences to create an initial card draft.",
  },
  {
    title: "Review and edit before sharing",
    description:
      "Users can update editable text, add a personal message, decide whether the card should be public, and save a shareable link.",
  },
  {
    title: "Choose the final share format",
    description:
      "Depending on the output, users can share the link, copy the result, or download a PNG or MP4 version for sending elsewhere.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-sm sm:p-10">
          <div className="inline-flex rounded-full border border-purple-100 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700">
            How it works
          </div>
          <h1 className="mt-5 text-4xl font-serif font-bold tracking-tight text-gray-800 sm:text-5xl">
            The create, edit, and share flow behind MewTruCard
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
            We want the workflow to be understandable before a user signs in or
            starts typing. This page explains what the tool actually does, where
            AI is involved, and where the user still makes the final decisions.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[24px] border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-6"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-800">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[28px] border border-white/70 bg-gradient-to-br from-white to-orange-50 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800">Where AI helps and where humans still decide</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-orange-100 bg-white/90 p-5">
                <h3 className="text-lg font-semibold text-gray-800">AI helps with the first draft</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  AI is used to generate visuals and message structure quickly so
                  the user does not start from zero every time.
                </p>
              </div>
              <div className="rounded-2xl border border-orange-100 bg-white/90 p-5">
                <h3 className="text-lg font-semibold text-gray-800">Users still control the final send</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Users decide whether to edit, what details to keep, whether the
                  card is public, and how the final result gets shared.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/birthday/"
              className="inline-flex rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Try the birthday flow
            </Link>
            <Link
              href="/ai-and-editorial-policy/"
              className="inline-flex rounded-full border border-purple-200 bg-white px-6 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
            >
              Read the AI and editorial policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
