import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  Download,
  Heart,
  Link2,
  Mail,
  MessageCircle,
  PenTool,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import CardMarquee from "@/components/CardMarquee";
import { Card, getRecentCardsServer } from "@/lib/cards";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WarmButton } from "@/components/ui/warm-button";
import ViralMicrositeGrid from "@/components/viral/ViralMicrositeGrid";
import JsonLd from "@/components/JsonLd";
import { buildFaqSchema, buildItemListSchema, type SeoFaq } from "@/lib/seo";
import {
  BROWSE_INTENT_LINKS,
  FUNNEL_METRICS,
  PRIMARY_CREATION_PATHS,
} from "@/lib/experience-config";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

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

export default async function Home() {
  let initialCardsData: { cards: Card[]; totalPages: number } = {
    cards: [],
    totalPages: 0,
  };

  try {
    initialCardsData = await getRecentCardsServer(1, 12, "");
  } catch (error) {
    console.error("Failed to load homepage card data", error);
  }

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

      <section className="border-b border-[#F1D6DF]/70 bg-[#FFF8F6]">
        <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1fr)] lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              MewTruCard greeting card maker
            </p>
            <h1 className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-normal text-[#202A3D] sm:text-6xl lg:text-7xl">
              Create a birthday card people can open anywhere.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#525B70] sm:text-lg sm:leading-8">
              Start with who the card is for, add the message, then choose the
              format. MewTruCard turns that into a saved card link or download
              without making you design from scratch.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 lg:hidden" aria-label="Card preview examples">
              {PRIMARY_CREATION_PATHS.slice(0, 3).map((path) => (
                <div
                  key={path.href}
                  className="flex h-32 items-center justify-center rounded-lg border border-[#F1D6DF] bg-white p-2 shadow-sm"
                >
                  <Image
                    src={path.preview}
                    alt={`${path.label} card preview`}
                    width={120}
                    height={160}
                    priority
                    className="h-full w-auto object-contain"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {FUNNEL_METRICS.map((metric) => (
                <div key={metric.label} className="border-l border-primary/25 pl-4">
                  <div className="font-serif text-2xl font-semibold text-primary">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#202A3D]">
                    {metric.label}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[560px] lg:block">
            <div className="absolute left-2 top-8 w-[42%] rotate-[-8deg] rounded-2xl border border-[#F1D6DF] bg-white p-3 shadow-xl transition-transform duration-300 hover:rotate-[-5deg]">
              <Image
                src="/card/birthday.svg"
                alt="Birthday card preview"
                width={420}
                height={600}
                priority
                className="h-auto w-full rounded-xl object-contain"
              />
            </div>
            <div className="absolute left-[30%] top-0 z-10 w-[44%] rounded-2xl border border-primary/20 bg-white p-3 shadow-2xl transition-transform duration-300 hover:-translate-y-1">
              <Image
                src="/card/valentine.svg"
                alt="Valentine card preview"
                width={420}
                height={600}
                priority
                className="h-auto w-full rounded-xl object-contain"
              />
            </div>
            <div className="absolute right-2 top-24 w-[40%] rotate-[7deg] rounded-2xl border border-[#F1D6DF] bg-white p-3 shadow-xl transition-transform duration-300 hover:rotate-[4deg]">
              <Image
                src="/card/anniversary.svg"
                alt="Anniversary card preview"
                width={420}
                height={600}
                priority
                className="h-auto w-full rounded-xl object-contain"
              />
            </div>
            <div className="absolute bottom-10 left-1/2 z-20 w-[min(92%,560px)] -translate-x-1/2 rounded-xl border border-[#F1D6DF] bg-white/95 p-5 shadow-xl backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Share-ready
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[#202A3D]">
                    Copy the link, download the card, or send a surprise page.
                  </h2>
                </div>
                <div className="flex gap-2 text-primary">
                  <Link2 className="h-5 w-5" />
                  <Download className="h-5 w-5" />
                  <Send className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1D6DF]/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Create"
            title="What do you want to make?"
            description="Pick the moment first. Each path opens a focused generator instead of dropping you into a generic form."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PRIMARY_CREATION_PATHS.map((path) => (
              <Link
                key={path.href}
                href={path.href}
                className="group flex min-h-[360px] flex-col overflow-hidden rounded-xl border border-[#F1D6DF] bg-[#FFF8F6] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-xl"
              >
                <div className="relative flex h-48 items-center justify-center bg-white">
                  <Image
                    src={path.preview}
                    alt={`${path.label} card preview`}
                    width={220}
                    height={300}
                    className="h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {path.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-[#202A3D]">
                    {path.label}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[#6B7280]">
                    {path.description}
                  </p>
                  <span className="mt-6 inline-flex items-center text-sm font-semibold text-primary">
                    Open this maker
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FFF8F6]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <SectionIntro
            eyebrow="Browse"
            title="Need ideas before writing?"
            description="A strong creation flow still needs an escape hatch for people who do not know what to say yet."
            align="left"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {BROWSE_INTENT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-[#F1D6DF] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#202A3D]">
                  {link.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  {link.description}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  Browse this path
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomepageAdStrip />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Examples"
            title="See what people are making"
            description="Use real public cards for tone, composition, and message inspiration before creating your own."
          />
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center rounded-xl border border-[#F1D6DF] bg-[#FFF8F6]">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
              </div>
            }
          >
            <CardMarquee wishCardType="birthday" initialCardsData={initialCardsData} />
          </Suspense>
        </div>
      </section>

      <HowItWorks />

      <ViralMicrositeGrid
        title="Interactive surprise links"
        description="Use a lightweight reveal page when the moment needs more than a direct card link."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Sharing"
            title="The final step is clear"
            description="Generated cards should end with practical sending actions, not another maze of options."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Copy the card link"
              description="Use the same kind of shareable URL people already expect from gift lists and registries."
              icon={<Link2 className="h-5 w-5" />}
            />
            <FeatureCard
              title="Download the finished card"
              description="Save the image or video for apps where direct links are not the best fit."
              icon={<Download className="h-5 w-5" />}
            />
            <FeatureCard
              title="Send through familiar apps"
              description="WhatsApp, email, text, and social sharing stay one tap away after editing."
              icon={<Mail className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1D6DF]/70 bg-[#FFF8F6] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="FAQ"
            title="Common questions"
            description="Operational details stay available after the creation path is clear."
          />
          <FAQ />
        </div>
      </section>
    </main>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto mb-10 max-w-3xl text-center" : "max-w-xl"}>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#202A3D] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[#6B7280] sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function HomepageAdStrip() {
  return (
    <section className="border-y border-[#F1D6DF]/70 bg-[#FFF8F6] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <a
          href="https://www.skymakermodel.com"
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label="Visit Skymaker Model"
          className="group grid gap-4 rounded-xl border border-[#F1D6DF] bg-white p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-md md:grid-cols-[1fr_auto] md:items-center"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A5A25]">
              Sponsored
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#202A3D]">
              Explore detailed model kits and maker builds at Skymaker Model.
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#6B7280]">
              Visit skymakermodel.com for scale model products, project ideas,
              and more.
            </p>
          </div>
          <span className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-transform group-hover:-translate-y-0.5">
            Visit site
            <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </a>
      </div>
    </section>
  );
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-[#F1D6DF] bg-[#FFF8F6] p-6">
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[#202A3D]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#6B7280]">{description}</p>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Recipient & occasion",
      description:
        "Choose the moment, relationship, and recipient details before touching output settings.",
      icon: <Heart className="h-5 w-5" />,
    },
    {
      title: "Message & tone",
      description:
        "Write the feeling first. Tone, language, and signature support the message instead of distracting from it.",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      title: "Format & sharing",
      description:
        "Pick image, animation, or video only after the card has enough personal context.",
      icon: <PenTool className="h-5 w-5" />,
    },
  ];

  return (
    <section className="border-y border-[#F1D6DF]/70 bg-[#FFF8F6] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Workflow"
          title="A simpler three-step creator"
          description="The generator now follows the way people think about cards: who it is for, what it should say, then how it should be sent."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-xl border border-[#F1D6DF] bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div className="text-primary">{step.icon}</div>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#202A3D]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
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
    <Accordion type="single" collapsible className="space-y-3">
      {homeFaqs.map((faq, idx) => (
        <AccordionItem
          key={idx}
          value={`question-${idx}`}
          className="rounded-xl border border-[#F1D6DF] bg-white px-5"
        >
          <AccordionTrigger className="text-left font-semibold text-[#202A3D] hover:no-underline">
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
