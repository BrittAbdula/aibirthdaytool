import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Link2, Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WarmButton } from "@/components/ui/warm-button";
import SurpriseTheater from "@/components/viral/SurpriseTheater";
import CardStudioDemo from "@/components/home/CardStudioDemo";
import Image from "next/image";
import { HeartArt, PaperGrain, RingsArt } from "@/components/home/card-art";
import JsonLd from "@/components/JsonLd";
import { buildFaqSchema, buildItemListSchema, type SeoFaq } from "@/lib/seo";
import {
  BROWSE_INTENT_LINKS,
  PRIMARY_CREATION_PATHS,
} from "@/lib/experience-config";

export const metadata: Metadata = {
  title: "AI Greeting Card Generator & Birthday Card Maker | MewTruCard",
  description:
    "Create free online birthday cards and AI greeting cards, then share them by link or download. Explore birthday, valentine, sorry, anniversary, and more on MewTruCard.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://mewtrucard.com/",
    title: "AI Greeting Card Generator & Birthday Card Maker | MewTruCard",
    description:
      "Create birthday cards, valentine cards, apology cards, and shareable greeting card links with AI.",
    images: [
      {
        url: "https://mewtrucard.com/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "MewTruCard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@MewTruCard",
    title: "AI Greeting Card Generator & Birthday Card Maker | MewTruCard",
    description:
      "Create birthday cards online with AI, share them by link, and explore valentine, apology, and celebration ideas.",
    images: ["https://mewtrucard.com/og-cover.jpg"],
  },
};

export const revalidate = 300;

export default function Home() {
  const homeEntryLinks = [
    ...PRIMARY_CREATION_PATHS.map((path) => ({
      href: path.href,
      label: `${path.label} card maker`,
      description: path.description,
    })),
    ...BROWSE_INTENT_LINKS,
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-warm-cream text-[#202A3D]">
      <JsonLd data={buildFaqSchema(homeFaqs)} />
      <JsonLd
        data={buildItemListSchema("MewTruCard main entry points", homeEntryLinks)}
      />

      {/* ————— Hero ————— */}
      <section className="relative border-b border-[#F1D6DF]/70 bg-[#FFF8F6]">
        <PaperGrain id="grain-hero-bg" className="absolute inset-0 opacity-[0.16]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(400px,0.9fr)] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              The greeting card studio
            </p>
            <h1 className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-[1.04] tracking-tight text-[#202A3D] sm:text-6xl lg:text-[4.4rem] ">
              Make them
              <br />
              a birthday card{" "}
              <em className="font-light italic text-primary">worth keeping.</em>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#47536B] sm:text-lg sm:leading-8">
              Tell us who it&rsquo;s for and what you want them to feel.
              MewTruCard designs the card around your words. Then you send it
              as a link, a download, or a little surprise page.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/birthday/" className="sm:w-auto">
                <WarmButton size="lg" className="w-full sm:w-auto">
                  Create a birthday card
                  <ArrowRight className="ml-2 h-5 w-5" />
                </WarmButton>
              </Link>
              <Link href="/card-gallery/" className="sm:w-auto">
                <WarmButton variant="secondary" size="lg" className="w-full sm:w-auto">
                  Browse card ideas
                  <Search className="ml-2 h-5 w-5" />
                </WarmButton>
              </Link>
            </div>

            <p className="mt-8 text-sm leading-6 text-[#76819A]">
              Free to start. No design skills needed.
            </p>
          </div>

          <HeroCardScene />
        </div>
      </section>

      {/* ————— The core demo: three questions become a card ————— */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CardStudioDemo />
        </div>
      </section>

      {/* ————— Occasions as the house collection ————— */}
      <section className="relative border-y border-[#F1D6DF]/70 bg-warm-cream py-20">
        <PaperGrain id="grain-desk-bg" className="absolute inset-0 opacity-[0.16]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-serif text-4xl font-semibold leading-tight text-[#202A3D] sm:text-5xl [text-wrap:balance]">
              What are you celebrating?
            </h2>
            <p className="mt-4 text-base leading-7 text-[#525B70] sm:text-lg">
              Six house layouts to start from. Pick the moment — your words and
              their name take it from there.
            </p>
          </div>

          {/* the desk: one composed cluster of cards */}
          <div className="relative mx-auto flex max-w-4xl flex-wrap items-start justify-center gap-6 lg:block lg:h-[680px]">
            <HouseCardBigOne />
            <HouseCardBirthday />
            <HouseCardLove />
            <HouseCardSorry />
            <HouseCardThanks />
            <HouseCardAnniversary />
          </div>

          <p className="mt-6 text-center text-sm leading-6 text-[#76819A]">
            Also valentine, thank-you, wedding, and more —{" "}
            <Link
              href="/cards/"
              className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
            >
              browse every occasion
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ————— Surprise links: the theatrical peak ————— */}
      <section className="bg-[#202A3D] py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SurpriseTheater />
        </div>
      </section>

      {/* ————— FAQ: the small print ————— */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[#EADFD6] bg-[#FFF8F6] px-6 py-8 sm:px-10">
            <h2 className="text-center font-serif text-3xl font-semibold text-[#202A3D]">
              Good to know
            </h2>
            <div className="mt-6">
              <FAQ />
            </div>
          </div>
        </div>
      </section>

      {/* ————— The send-off ————— */}
      <section className="relative border-t border-[#F1D6DF]/70 bg-[#FFF8F6]">
        <PaperGrain id="grain-sendoff-bg" className="absolute inset-0 opacity-[0.16]" />
        <div className="relative mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 sm:py-28">
          <Image
            src="/props/sealed-envelope.jpg"
            alt="A sealed blush envelope with a raspberry wax seal"
            width={820}
            height={615}
            className="mtc-bob-slow mx-auto w-56 mix-blend-multiply sm:w-64"
          />
          <h2 className="mt-10 font-serif text-3xl font-semibold leading-tight text-[#202A3D] sm:text-5xl [text-wrap:balance]">
            Someone&rsquo;s about to{" "}
            <span className="whitespace-nowrap">keep this one.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md font-serif text-base italic leading-7 text-[#525B70] sm:text-lg">
            The best card isn&rsquo;t the prettiest one — it&rsquo;s the one
            that sounds like you.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/birthday/">
              <WarmButton size="lg">
                Start their card
                <ArrowRight className="ml-2 h-5 w-5" />
              </WarmButton>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ————— The house collection: one design language, six typographic
   personalities, arranged as a composed desk scatter on large screens. ————— */

function HouseMat({
  href,
  wrapper,
  tilt,
  label,
  shadow = "shadow-[0_2px_3px_rgba(32,42,61,0.1),10px_16px_30px_-16px_rgba(32,42,61,0.4)]",
  children,
}: {
  href: string;
  wrapper: string;
  tilt: number;
  label: string;
  shadow?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`group block ${wrapper}`}>
      <div
        className={`rounded-lg bg-white p-2 ring-1 ring-[#EADFD6] ${shadow} transition-all duration-300 group-hover:-translate-y-1.5 group-hover:rotate-0 group-hover:shadow-[10px_22px_40px_-16px_rgba(180,55,95,0.4)]`}
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        {children}
      </div>
      <p className="mt-2.5 text-center font-hand text-lg text-[#525B70] transition-colors group-hover:text-primary">
        {label}
      </p>
    </Link>
  );
}

function HouseCardBirthday() {
  return (
    <HouseMat
      href="/birthday/"
      label="Birthday"
      wrapper="w-48 sm:w-64 lg:absolute lg:left-[25%] lg:top-0 lg:z-30"
      tilt={0}
      shadow="shadow-[0_3px_5px_rgba(32,42,61,0.12),14px_24px_44px_-16px_rgba(32,42,61,0.45)]"
    >
      <div className="relative overflow-hidden rounded-md bg-primary px-5 pb-6 pt-6 text-left">
        <PaperGrain id="grain-hc-bday" className="absolute inset-0 opacity-[0.35]" />
        <div className="relative">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#FBD3DF]">
            Maya · 28
          </p>
          <p className="mt-3 font-serif text-[2rem] font-bold uppercase leading-[0.96] tracking-tight text-[#FFF8F6]">
            Happy
            <br />
            birthday,
            <br />
            <em className="font-semibold normal-case italic text-[#F9DF9C]">Maya.</em>
          </p>
          <p className="mt-4 font-hand text-lg leading-6 text-[#FBD3DF]">
            Save me the corner piece. — Nadia
          </p>
        </div>
      </div>
    </HouseMat>
  );
}

function HouseCardBigOne() {
  return (
    <HouseMat
      href="/birthday/"
      label="Birthday — milestone"
      wrapper="w-40 sm:w-48 lg:absolute lg:left-[6%] lg:top-[10%] lg:z-20"
      tilt={2}
    >
      <div className="rounded-md bg-[#232E45] px-4 pb-7 pt-8 text-center ring-1 ring-white/10">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#E5B72E]">
          Alex · the big one
        </p>
        <p className="mt-3 bg-gradient-to-b from-[#F4D06A] via-[#E5B72E] to-[#B98D1F] bg-clip-text font-serif text-7xl font-semibold italic leading-none text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]">
          30
        </p>
        <p className="mx-auto mt-3 max-w-[170px] font-serif text-sm italic leading-6 text-[#F6EFE9]">
          Brilliant, actually.
        </p>
        <div className="mx-auto mt-5 h-px w-10 bg-white/25" aria-hidden />
        <p className="mt-4 font-hand text-base text-[#9AA6C0]">— the whole crew</p>
      </div>
    </HouseMat>
  );
}

function HouseCardLove() {
  return (
    <HouseMat
      href="/valentine/"
      label="Love & Valentine"
      wrapper="w-52 sm:w-64 lg:absolute lg:left-[51%] lg:top-[10%] lg:z-20"
      tilt={-1.5}
    >
      <div className="relative overflow-hidden rounded-md border border-[#F1D6DF] bg-[#FFE8F0] px-6 pb-6 pt-5 text-left">
        <PaperGrain id="grain-hc-love" className="absolute inset-0 opacity-[0.4]" />
        <HeartArt className="absolute -bottom-10 -right-8 w-40 rotate-12 opacity-[0.12]" />
        <div className="relative">
          <p className="font-serif text-base text-[#202A3D]">All my heart,</p>
          <p className="font-serif text-5xl italic leading-[1.05] text-primary">always.</p>
          <HeartArt className="mtc-breathe -mt-1 ml-auto w-10" />
        </div>
      </div>
    </HouseMat>
  );
}

function HouseCardSorry() {
  return (
    <HouseMat
      href="/sorry/"
      label="Sorry"
      wrapper="w-44 sm:w-52 lg:absolute lg:left-[14%] lg:top-[50%] lg:z-10"
      tilt={-2}
    >
      <div
        className="relative overflow-hidden rounded-md border border-[#DDE3D6] bg-[#F3F5EF] pb-5 pl-9 pr-5 pt-6 text-left"
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 27px, rgba(98,115,92,0.18) 27px, rgba(98,115,92,0.18) 28px)",
        }}
      >
        <PaperGrain id="grain-hc-sorry" className="absolute inset-0 opacity-[0.4]" />
        <span aria-hidden className="absolute inset-y-0 left-6 w-px bg-[#D98A8A]/60" />
        <div className="relative">
          <p className="text-right font-hand text-base text-[#62735C]">Tuesday.</p>
          <p className="mt-2 font-hand text-[22px] leading-[28px] text-[#2C3A2F]">
            I was wrong — and worse, slow to say so.
          </p>
          <p className="mt-3 font-hand text-lg text-[#62735C]">— Sam</p>
        </div>
      </div>
    </HouseMat>
  );
}

function HouseCardAnniversary() {
  return (
    <HouseMat
      href="/anniversary/"
      label="Anniversary"
      wrapper="w-40 sm:w-48 lg:absolute lg:left-[65%] lg:top-[48%] lg:z-10"
      tilt={1.5}
    >
      <div className="relative overflow-hidden rounded-md border border-[#EFDFC8] bg-[#FFFEFB] px-4 pb-6 pt-7 text-center">
        <PaperGrain id="grain-hc-anniv" className="absolute inset-0 opacity-[0.4]" />
        <div className="relative border-y-[3px] border-double border-[#C9A227]/60 py-4">
          <p className="font-serif text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-[#202A3D]">
            Ten
            <br />
            <em className="font-light lowercase italic text-primary">years</em>
          </p>
          <RingsArt className="mx-auto mt-3 w-12" />
          <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#B99A4E]">
            Still us · 2016—2026
          </p>
        </div>
      </div>
    </HouseMat>
  );
}

function HouseCardThanks() {
  return (
    <HouseMat
      href="/thankyou/"
      label="Thank you"
      wrapper="w-40 sm:w-48 lg:absolute lg:left-[41%] lg:top-[56%] lg:z-0"
      tilt={-1}
    >
      <div className="relative flex min-h-[180px] flex-col justify-end overflow-hidden rounded-md border border-[#D9D5E8] bg-[#EBE9F4] px-5 pb-5 pt-4 text-left">
        <PaperGrain id="grain-hc-thanks" className="absolute inset-0 opacity-[0.35]" />
        <div className="relative">
          <p className="font-serif text-base italic leading-6 text-[#2E2A4D]">
            Thank you for showing up.
            <br />
            Every single time.
          </p>
          <p className="mt-2 font-hand text-base text-[#8B84AC]">— M, for R</p>
        </div>
      </div>
    </HouseMat>
  );
}

/* ————— Hero card scene: the studio-illustrated envelope prop with
   live typesetting overlaid on the blank card face. ————— */

function HeroCardScene() {
  return (
    <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[430px]">
      <div
        aria-hidden
        className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,232,240,0.9)_0%,transparent_72%)]"
      />
      <div
        className="relative aspect-[900/1206]"
        role="img"
        aria-label="A personalized birthday card rising out of an opened blush envelope, with its shareable link"
      >
        <Image
          src="/props/hero-envelope.jpg"
          alt=""
          width={900}
          height={1206}
          priority
          className="h-full w-full mix-blend-multiply"
        />

        {/* live typesetting on the blank card face */}
        <div className="pointer-events-none absolute inset-x-[25%] top-[39.5%] -rotate-1 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-primary sm:text-[11px]">
            For June · turning 30
          </p>
          <p className="mt-2 font-serif text-2xl font-semibold leading-[1.05] text-[#202A3D] [text-shadow:0_1px_0_rgba(255,255,255,0.9)] sm:mt-3 sm:text-[2.1rem]">
            Happy
            <br />
            <em className="italic text-primary">Birthday</em>
          </p>
          <p className="mt-2 font-hand text-base text-[#76819A] sm:mt-3 sm:text-xl">
            — love, Dad
          </p>
        </div>

        {/* shareable-link pill, tucked onto the envelope's bottom edge */}
        <div className="absolute bottom-[4%] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white py-2 pl-3 pr-4 shadow-[0_12px_24px_-10px_rgba(32,42,61,0.4)] ring-1 ring-[#F1D6DF]">
          <Link2 className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-semibold tracking-tight text-[#202A3D] sm:text-xs">
            mewtrucard.com/c/june-30
          </span>
        </div>
      </div>
    </div>
  );
}

const homeFaqs: SeoFaq[] = [
  {
    question: "What is MewTruCard best for right now?",
    answer:
      "MewTruCard works best as a fast AI birthday card maker with additional paths for valentine, apology, anniversary, thank-you, and celebration cards.",
  },
  {
    question: "Do I need to sign in before creating a card?",
    answer:
      "Yes. The current product flow requires sign-in before generation so you can save cards, reopen edits, and send shareable links from your account.",
  },
  {
    question: "Can I create cards on my phone?",
    answer:
      "Yes. The main generator flow, editing screens, and share links are mobile-friendly, so you can create and send cards directly from your phone browser.",
  },
  {
    question: "How do I share my card?",
    answer:
      "After generation and editing, you can download the card as an image or copy a unique link to send through WhatsApp, Messenger, email, or other social channels.",
  },
  {
    question: "What are surprise links?",
    answer:
      "They are shareable reveal pages for playful asks and special moments. Each surprise link can lead back into the relevant MewTruCard card flow.",
  },
];

function FAQ() {
  return (
    <Accordion type="single" collapsible className="border-t border-[#EADFD6]">
      {homeFaqs.map((faq, idx) => (
        <AccordionItem
          key={idx}
          value={`question-${idx}`}
          className="border-b border-[#EADFD6]"
        >
          <AccordionTrigger className="py-4 text-left text-base font-semibold text-[#202A3D] hover:no-underline hover:text-primary">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="leading-7 text-[#6B7280]">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
