import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Download,
  Gift,
  Heart,
  Link2,
  MessageCircle,
  Palette,
  PenTool,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { TrendingCards } from "@/components/TrendingCards";
import CardMarquee from "@/components/CardMarquee";
import { Card, getRecentCardsServer } from "@/lib/cards";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CardTypeBubbles from "@/components/CardTypeBubbles";
import { WarmButton } from "@/components/ui/warm-button";
import { GlassCard } from "@/components/ui/glass-card";
import ViralMicrositeGrid from "@/components/viral/ViralMicrositeGrid";
import DiscoveryPanel from "@/components/discovery/DiscoveryPanel";
import {
  EXPLORE_RECIPIENT_LINKS,
  EXPLORE_SURPRISE_LINKS,
  FEATURED_GENERATOR_LINKS,
} from "@/lib/discovery-links";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
}

interface StepCardProps {
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  tone: "primary" | "accent";
}

export const metadata: Metadata = {
  title: "Free AI Birthday Card Generator | Online Birthday Card Maker - MewTruCard",
  description:
    "Create a free online birthday card with AI, personalize the message, then download it or share a birthday card link. Explore birthday, valentine, sorry, and anniversary cards on MewTruCard.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://mewtrucard.com/",
    title: "Free AI Birthday Card Generator | MewTruCard",
    description:
      "Create a free online birthday card, copy a shareable link, and browse birthday, apology, and surprise-link ideas.",
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
    title: "Free AI Birthday Card Generator | MewTruCard",
    description:
      "Create birthday cards online with AI, share them by link, and explore valentine, sorry, and celebration ideas.",
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-warm-cream">
      <div className="relative">
        <div className="absolute left-0 top-0 h-64 w-64 animate-blob rounded-full bg-warm-peach opacity-60 mix-blend-multiply blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 animate-blob rounded-full bg-warm-rose opacity-60 mix-blend-multiply blur-3xl animation-delay-2000" />
        <div className="absolute bottom-0 left-20 h-64 w-64 animate-blob rounded-full bg-warm-coral/20 opacity-60 mix-blend-multiply blur-3xl animation-delay-4000" />

        <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
          <section className="mx-auto max-w-5xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-orange-100 bg-white/80 px-4 py-2 text-sm font-medium text-orange-700 shadow-sm">
              Birthday-first card maker with shareable links
            </div>

            <h1 className="text-5xl font-caveat font-bold leading-tight text-gray-800 sm:text-7xl">
              Create a <span className="text-primary">birthday card</span> worth
              sharing
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-8 text-gray-600 sm:text-2xl">
              Start with birthday cards, then move into valentine, apology, and
              anniversary moments. Personalize the message, save it to your
              account, and send it by link or download in minutes.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/birthday/" className="w-full sm:w-auto">
                <WarmButton size="lg" className="w-full px-12 text-lg shadow-warm hover:shadow-warm-lg sm:w-auto">
                  Start with Birthday
                  <Sparkles className="ml-2 h-5 w-5" />
                </WarmButton>
              </Link>
              <Link href="/card-gallery/" className="w-full sm:w-auto">
                <WarmButton variant="secondary" size="lg" className="w-full px-12 text-lg sm:w-auto">
                  Browse card ideas
                  <Search className="ml-2 h-5 w-5" />
                </WarmButton>
              </Link>
            </div>

            <div className="mt-10 grid gap-4 text-left md:grid-cols-3">
              <TrustPoint
                title="Make it personal"
                description="Recipient name, relationship, signature, and message all stay easy to edit."
                icon={<Heart className="h-5 w-5" />}
              />
              <TrustPoint
                title="Keep it in your account"
                description="Sign in once, save cards, reopen edits, and send again without starting over."
                icon={<Users className="h-5 w-5" />}
              />
              <TrustPoint
                title="Share the way people actually send"
                description="Copy a card link, send a surprise page, or download the final image."
                icon={<Link2 className="h-5 w-5" />}
              />
            </div>

            <div className="mt-12">
              <CardTypeBubbles currentType="birthday" />
            </div>
          </section>

          <div className="mt-24 space-y-32">
            <section>
              <SectionIntro
                title="Start your card your way"
                description="The fastest path is not always the same. Pick the route that matches what the user is trying to do right now."
              />
              <div className="grid gap-6 lg:grid-cols-3">
                <DiscoveryPanel
                  title="Start with a moment"
                  description="Jump straight into the occasion you need today."
                  icon={<Sparkles className="h-6 w-6" />}
                  links={FEATURED_GENERATOR_LINKS}
                />
                <DiscoveryPanel
                  title="Make it personal for someone"
                  description="Open ideas that already match the relationship."
                  icon={<Heart className="h-6 w-6" />}
                  links={EXPLORE_RECIPIENT_LINKS}
                />
                <DiscoveryPanel
                  title="Send a surprise link"
                  description="Use a playful interactive page before the final card."
                  icon={<Send className="h-6 w-6" />}
                  links={EXPLORE_SURPRISE_LINKS}
                />
              </div>
            </section>

            <section className="scroll-mt-24" id="trending">
              <TrendingCards />
            </section>

            <Features />

            <ViralMicrositeGrid
              title="Interactive surprise links"
              description="Borrow the strongest part of viral sharing: a lightweight landing moment before the card itself. These pages work well for birthday reveals, apology links, valentine asks, and wedding surprises."
            />

            <section>
              <SectionIntro
                title="See what other people create"
                description="A quick way to get unstuck: browse real public cards first, then make your own version."
              />

              <Suspense
                fallback={
                  <div className="flex h-64 items-center justify-center rounded-2xl bg-white/50">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
                  </div>
                }
              >
                <CardMarquee wishCardType="birthday" initialCardsData={initialCardsData} />
              </Suspense>
            </section>

            <HowToUse />

            <section className="rounded-[32px] border border-orange-100 bg-white/80 px-6 py-10 text-center shadow-sm sm:px-10">
              <h2 className="text-4xl font-caveat font-bold text-gray-800 sm:text-5xl">
                Ready to send something thoughtful?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600">
                If you want the fastest path, start with birthday. If you want
                inspiration first, browse public ideas and relationship-based
                examples.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/birthday/">
                  <WarmButton size="lg" className="px-10">
                    Start with Birthday
                    <PenTool className="ml-2 h-5 w-5" />
                  </WarmButton>
                </Link>
                <Link href="/cards/">
                  <WarmButton variant="secondary" size="lg" className="px-10">
                    Browse card ideas
                    <Search className="ml-2 h-5 w-5" />
                  </WarmButton>
                </Link>
              </div>
            </section>

            <FAQ />
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-12 text-center">
      <h2 className="text-4xl font-caveat font-bold text-gray-800 sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600">
        {description}
      </p>
    </div>
  );
}

function TrustPoint({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <GlassCard className="border-white/60 bg-white/75 p-5">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-orange-50 p-3 text-primary ring-1 ring-orange-100">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        </div>
      </div>
    </GlassCard>
  );
}

const Features: React.FC = () => (
  <section className="relative py-12">
    <div className="mx-auto max-w-6xl px-4">
      <SectionIntro
        title="Why people keep using MewTruCard"
        description="The goal is simple: help someone go from blank page to sent card without getting lost in tooling."
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <FeatureCard
          title="Start faster"
          description="A birthday-first setup for the most common use case, with other occasions one click away."
          icon={<Sparkles className="h-8 w-8 text-primary" />}
          benefits={[
            "Birthday path stays front and center",
            "Popular occasions are easy to switch between",
            "Public examples help users get unstuck",
          ]}
        />
        <FeatureCard
          title="Make it feel personal"
          description="Users should spend their time on the message and relationship, not on figuring out the interface."
          icon={<Palette className="h-8 w-8 text-primary" />}
          benefits={[
            "Recipient-first editing flow",
            "Message, names, and signature stay editable",
            "Relationship-based inspiration pages",
          ]}
        />
        <FeatureCard
          title="Share it the right way"
          description="The product is stronger when the sending format matches the moment."
          icon={<Send className="h-8 w-8 text-primary" />}
          benefits={[
            "Copy a card link in seconds",
            "Download a polished image",
            "Use interactive surprise pages before the card",
          ]}
        />
      </div>
    </div>
  </section>
);

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  benefits,
}) => (
  <GlassCard
    variant="warm"
    hoverEffect
    className="flex h-full flex-col items-center border-white/60 bg-white/60 p-8 text-center"
  >
    <div className="mb-6 rounded-full bg-orange-100/50 p-4 text-primary ring-4 ring-orange-50">
      {icon}
    </div>
    <h3 className="mb-4 text-2xl font-caveat font-bold text-gray-800">
      {title}
    </h3>
    <p className="mb-6 font-medium leading-relaxed text-gray-600">
      {description}
    </p>
    <ul className="mt-auto w-full space-y-3 text-left">
      {benefits.map((benefit, index) => (
        <li
          key={index}
          className="flex items-center rounded-lg bg-white/50 p-2 text-sm text-gray-600"
        >
          <span className="mr-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
          {benefit}
        </li>
      ))}
    </ul>
  </GlassCard>
);

const HowToUse: React.FC = () => (
  <section className="py-8">
    <div className="mx-auto max-w-6xl px-4">
      <SectionIntro
        title="From blank page to sent card in minutes"
        description="There are two good starting points: generate from scratch or browse ideas first. Both should end in a clean send flow."
      />

      <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
        <div className="relative">
          <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
          <h3 className="mb-8 flex items-center justify-center text-2xl font-caveat font-bold text-primary md:justify-start">
            <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-sans text-white">
              1
            </span>
            Start with the generator
          </h3>

          <div className="relative space-y-6">
            <div className="absolute bottom-8 left-6 top-8 -z-10 hidden w-0.5 bg-gradient-to-b from-primary/30 to-transparent md:block" />

            <StepCard
              title="Pick the occasion"
              description="Birthday is the fastest entry point, with other occasions always nearby."
              icon={<MessageCircle className="h-6 w-6 text-white" />}
              tone="primary"
              details={["Birthday", "Valentine", "Sorry", "Anniversary"]}
            />
            <StepCard
              title="Add the relationship and message"
              description="Tell us who the card is for and the feeling you want to send."
              icon={<Heart className="h-6 w-6 text-white" />}
              tone="primary"
              details={["Recipient name", "Relationship", "Optional note", "Signature"]}
            />
            <StepCard
              title="Save and send"
              description="Generate the card, then copy the link or download the finished version."
              icon={<Gift className="h-6 w-6 text-white" />}
              tone="primary"
              details={["Account save", "Card link", "Image download"]}
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-accent/10 blur-2xl" />
          <h3 className="mb-8 flex items-center justify-center text-2xl font-caveat font-bold text-accent md:justify-start">
            <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-sans text-white">
              2
            </span>
            Start from inspiration
          </h3>

          <div className="relative space-y-6">
            <div className="absolute bottom-8 left-6 top-8 -z-10 hidden w-0.5 bg-gradient-to-b from-accent/30 to-transparent md:block" />

            <StepCard
              title="Browse real ideas"
              description="Public cards, relationship pages, and occasion pages help users choose a direction quickly."
              icon={<Search className="h-6 w-6 text-white" />}
              tone="accent"
              details={["Public cards", "By occasion", "By relationship"]}
            />
            <StepCard
              title="Customize the details"
              description="Take the idea you like, then adapt it to the real person and moment."
              icon={<PenTool className="h-6 w-6 text-white" />}
              tone="accent"
              details={["Rewrite the message", "Adjust names", "Change the final feel"]}
            />
            <StepCard
              title="Choose the send format"
              description="Send a normal card, or layer in a surprise link before it."
              icon={<Download className="h-6 w-6 text-white" />}
              tone="accent"
              details={["Card link", "Download", "Interactive surprise link"]}
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const StepCard: React.FC<StepCardProps> = ({
  title,
  description,
  details,
  icon,
  tone,
}) => (
  <GlassCard className="flex items-start gap-4 bg-white/80 p-5 transition-colors hover:border-primary/30">
    <div
      className={`flex-shrink-0 rounded-xl p-3 shadow-warm ${
        tone === "primary"
          ? "bg-gradient-to-br from-primary to-warm-coral"
          : "bg-gradient-to-br from-accent to-primary"
      }`}
    >
      {icon}
    </div>
    <div>
      <h4 className="mb-1 text-lg font-bold text-gray-800">{title}</h4>
      <p className="mb-3 text-sm text-gray-600">{description}</p>
      <div className="flex flex-wrap gap-2">
        {details.map((detail, index) => (
          <span
            key={index}
            className="rounded-md border border-orange-100 bg-orange-50 px-2 py-1 text-xs text-gray-600"
          >
            {detail}
          </span>
        ))}
      </div>
    </div>
  </GlassCard>
);

const faqs = [
  {
    question: "What is MewTruCard best for right now?",
    answer:
      "MewTruCard performs best today as a birthday card maker with additional flows for valentine, sorry, anniversary, thank-you, and celebration cards. The clearest path is to sign in, start with a birthday card, personalize the details, then share the card by link or download.",
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
      "They are shareable pages for playful asks and reveal moments, like valentine prompts, apology links, birthday surprises, and bridesmaid asks. Each surprise link now feeds back into the relevant MewTruCard card flow.",
  },
];

const FAQ: React.FC = () => (
  <section className="py-12">
    <SectionIntro
      title="Frequently asked questions"
      description="Everything important, without making the user hunt for operational details."
    />

    <div className="mx-auto max-w-2xl px-4">
      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`question-${idx}`} className="border-none">
            <GlassCard className="overflow-hidden px-1">
              <AccordionTrigger className="group px-6 py-4 text-left font-medium text-gray-800 hover:no-underline">
                <span className="transition-colors group-hover:text-primary">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="bg-white/40 px-6 pb-4 leading-relaxed text-gray-600">
                {faq.answer}
              </AccordionContent>
            </GlassCard>
          </AccordionItem>
        ))}
      </Accordion>
    </div>

    <div className="mt-12 text-center">
      <p className="font-quicksand text-lg text-gray-600">
        Have more questions?{" "}
        <a href="mailto:support@mewtrucard.com" className="font-bold text-primary hover:underline">
          Contact support
        </a>
      </p>
    </div>
  </section>
);
