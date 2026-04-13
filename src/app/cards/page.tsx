import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Link2,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { getAllCardPreviews } from "@/lib/card-config";
import ViralMicrositeGrid from "@/components/viral/ViralMicrositeGrid";
import DiscoveryPanel from "@/components/discovery/DiscoveryPanel";
import { WarmButton } from "@/components/ui/warm-button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  EXPLORE_RECIPIENT_LINKS,
  EXPLORE_SURPRISE_LINKS,
  FEATURED_GENERATOR_LINKS,
} from "@/lib/discovery-links";
import GuidanceGridSection from "@/components/eeat/GuidanceGridSection";
import TrustSignalsSection from "@/components/eeat/TrustSignalsSection";
import JsonLd from "@/components/JsonLd";
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
  buildWebPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Card Ideas & Generators | Birthday, Valentine, Sorry & More - MewTruCard",
  description:
    "Browse MewTruCard by moment, relationship, or surprise-link flow. Start with birthday cards first, then explore valentine, sorry, anniversary, and more.",
  alternates: {
    canonical: "/cards/",
  },
  openGraph: {
    title: "Card Ideas & Generators | Birthday, Valentine, Sorry & More - MewTruCard",
    description:
      "Browse MewTruCard by moment, relationship, or surprise-link flow. Start with birthday cards first, then explore valentine, sorry, anniversary, and more.",
    type: "website",
    url: "/cards/",
  },
};

const HUB_METHODS = [
  {
    title: "Built to reduce blank-page friction",
    description:
      "This hub exists to help visitors choose a useful starting path before they enter the generator, not to make them scroll through an undifferentiated list.",
  },
  {
    title: "Organized by real sending intent",
    description:
      "The main routes are grouped by occasion, relationship, and surprise-link use case because those are the clearest reasons people arrive here.",
  },
  {
    title: "Reviewed against the live product flow",
    description:
      "We keep this page tied to the current create-edit-share workflow so the recommendations stay aligned with what users can actually do next.",
  },
];

const HUB_GUIDANCE = [
  {
    title: "If you already know the occasion",
    description:
      "Go straight to the matching generator. This is usually the fastest path for birthday, valentine, apology, anniversary, and thank-you moments.",
  },
  {
    title: "If you know the person but not the tone",
    description:
      "Use a relationship-led gallery first. It is easier to judge what feels right for a friend, spouse, parent, or partner before you write the final message.",
  },
  {
    title: "If the reveal matters as much as the card",
    description:
      "Start with a surprise-link page. These flows work best when you want to stage the moment before the recipient sees the final card.",
  },
];

const HUB_RELATED_LINKS = [
  {
    href: "/about/",
    label: "About MewTruCard",
    description: "Who the product is for and what the team is trying to improve.",
  },
  {
    href: "/how-it-works/",
    label: "How the workflow works",
    description: "See the real create, edit, and share steps before you start.",
  },
  {
    href: "/ai-and-editorial-policy/",
    label: "AI and editorial policy",
    description: "How AI is used and how search-facing guidance pages are reviewed.",
  },
  {
    href: "/card-gallery/",
    label: "Browse public card ideas",
    description: "See public examples when you need visual or message inspiration first.",
  },
];

function GeneratorCard({ card }: { card: any }) {
  return (
    <Link href={card.link} className="group block h-full">
      <div className="flex h-full flex-col rounded-[28px] border border-white/70 bg-white/80 p-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/20 group-hover:shadow-xl">
        <div className="relative mb-4 w-full overflow-hidden rounded-[22px] bg-gradient-to-br from-white to-orange-50 pb-[133.33%]">
          <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-105">
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="rounded-[22px] object-contain p-3"
            />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-center text-lg font-semibold text-gray-800">
            {card.title}
          </h3>
          <p className="min-h-16 text-center text-sm leading-6 text-gray-600">
            {card.description}
          </p>
          <div className="w-full rounded-full border border-orange-200 px-4 py-3 text-center text-sm font-semibold text-primary transition-colors group-hover:bg-orange-50">
            Open this card flow
          </div>
        </div>
      </div>
    </Link>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-4xl font-caveat font-bold text-gray-800 sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600">
        {description}
      </p>
    </div>
  );
}

function BenefitCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <GlassCard className="border-white/60 bg-white/75 p-6 text-left">
      <div className="mb-4 inline-flex rounded-2xl bg-orange-50 p-3 text-primary ring-1 ring-orange-100">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
    </GlassCard>
  );
}

export default async function GeneratorsPage() {
  let allGenerators: Awaited<ReturnType<typeof getAllCardPreviews>> = [];

  try {
    allGenerators = await getAllCardPreviews();
  } catch (error) {
    console.error("Failed to load generators", error);
  }

  const featuredSlugs = [
    "birthday",
    "valentine",
    "sorry",
    "anniversary",
    "thankyou",
    "love",
  ];
  const officialGenerators = allGenerators.filter((generator) => generator.isSystem);
  const featuredGenerators = featuredSlugs
    .map((slug) =>
      officialGenerators.find((generator) => generator.link === `/${slug}/`)
    )
    .filter(
      (
        generator
      ): generator is NonNullable<typeof officialGenerators[number]> =>
        Boolean(generator)
    );
  const remainingOfficialGenerators = officialGenerators.filter(
    (generator) =>
      !featuredGenerators.some((featured) => featured.link === generator.link)
  );
  const featuredGeneratorLinks = featuredGenerators.map((generator) => ({
    href: generator.link,
    label: generator.title,
    description: generator.description || undefined,
  }));

  return (
    <div className="min-h-screen bg-warm-cream">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", href: "/" },
          { name: "Cards", href: "/cards/" },
        ])}
      />
      <JsonLd
        data={buildWebPageSchema({
          name: "Card Ideas & Generators",
          description:
            "Browse MewTruCard by moment, relationship, or surprise-link flow. Start with birthday cards first, then explore valentine, sorry, anniversary, and more.",
          path: "/cards/",
          reviewedBy: "MewTruCard editorial team",
          lastReviewed: "March 25, 2026",
          about: ["greeting cards", "AI card generator", "card gallery"],
        })}
      />
      {featuredGeneratorLinks.length > 0 && (
        <JsonLd
          data={buildItemListSchema("Featured card generator paths", featuredGeneratorLinks)}
        />
      )}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-warm-rose opacity-40 mix-blend-multiply blur-3xl" />
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-warm-peach opacity-40 mix-blend-multiply blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-warm-coral/30 opacity-40 mix-blend-multiply blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-12 md:py-16">
        <section className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-orange-100 bg-white/80 px-4 py-2 text-sm font-medium text-orange-700 shadow-sm">
            Find a card by moment, person, or surprise format
          </div>

          <h1 className="text-4xl font-caveat font-bold tracking-tight text-gray-800 sm:text-6xl">
            Find the right card starting point
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl">
            Use birthday as the main path, then branch into valentine,
            anniversary, apology, thank-you, and other card moments. If users do
            not know where to start, let them browse by relationship or surprise
            link instead of guessing.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/birthday/">
              <WarmButton size="lg" className="px-10">
                Start with Birthday
                <Sparkles className="ml-2 h-5 w-5" />
              </WarmButton>
            </Link>
            <Link href="/card-gallery/">
              <WarmButton variant="secondary" size="lg" className="px-10">
                Browse public ideas
                <Search className="ml-2 h-5 w-5" />
              </WarmButton>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <BenefitCard
              title="Choose the path that matches intent"
              description="Users can begin with an occasion, a relationship, or a surprise page instead of being forced into one generic entry."
              icon={<Search className="h-5 w-5" />}
            />
            <BenefitCard
              title="Keep it personal"
              description="Relationship-led pages help users get closer to what they want before they ever type the message."
              icon={<Heart className="h-5 w-5" />}
            />
            <BenefitCard
              title="Send beyond the editor"
              description="Card links and surprise pages make the end of the flow feel more shareable and more memorable."
              icon={<Link2 className="h-5 w-5" />}
            />
          </div>
        </section>

        <div className="mt-12">
          <TrustSignalsSection
            title="How this card hub is reviewed"
            description="This page is intentionally structured as a decision hub. It should help visitors pick the next useful page quickly and understand where to go if they need more product or trust context."
            reviewedBy="MewTruCard editorial team"
            lastReviewed="March 25, 2026"
            purpose="Help visitors pick the right MewTruCard path based on occasion, relationship, or surprise-link intent instead of forcing every visitor into the same entry page."
            methodology={HUB_METHODS}
            links={HUB_RELATED_LINKS}
          />
          <GuidanceGridSection
            title="How to choose your starting path"
            description="The best first click depends on what the visitor already knows. Use the shortest path that still gives enough context to create a card that feels specific."
            cards={HUB_GUIDANCE}
          />
        </div>

        <div className="mt-24 space-y-24">
          <section>
            <SectionHeading
              title="Choose a path"
              description="Borrowing from the best template libraries, this page now helps people discover a fitting starting point before asking them to create."
            />
            <div className="grid gap-6 lg:grid-cols-3">
              <div id="moments" className="scroll-mt-28">
                <DiscoveryPanel
                  title="Start with a moment"
                  description="Jump straight into the occasion you need most often."
                  icon={<Sparkles className="h-6 w-6" />}
                  links={FEATURED_GENERATOR_LINKS}
                />
              </div>
              <div id="recipient" className="scroll-mt-28">
                <DiscoveryPanel
                  title="Cards for someone"
                  description="Pre-filtered inspiration for common relationship-based needs."
                  icon={<Users className="h-6 w-6" />}
                  links={EXPLORE_RECIPIENT_LINKS}
                />
              </div>
              <div id="surprise" className="scroll-mt-28">
                <DiscoveryPanel
                  title="Surprise links"
                  description="Interactive pages that set up the moment before the card."
                  icon={<Send className="h-6 w-6" />}
                  links={EXPLORE_SURPRISE_LINKS}
                />
              </div>
            </div>
          </section>

          <section>
            <SectionHeading
              title="Most popular places to start"
              description="These are the best first clicks right now, based on current demand and the flows that already convert well."
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {featuredGenerators.map((card, index) => (
                <GeneratorCard key={index} card={card} />
              ))}
            </div>
          </section>

          <div>
            <ViralMicrositeGrid
              title="Interactive surprise pages"
              description="Some moments work better when there is a playful reveal before the final card. Keep those flows visible and easy to reach."
            />
          </div>

          <section>
            <SectionHeading
              title="More occasions to explore"
              description="Once the main intent is handled, the rest of the library should still be easy to scan and visually consistent."
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {remainingOfficialGenerators.map((card, index) => (
                <GeneratorCard key={index} card={card} />
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-orange-100 bg-white/80 px-6 py-10 text-center shadow-sm sm:px-10">
            <h2 className="text-4xl font-caveat font-bold text-gray-800 sm:text-5xl">
              Need a card flow that does not exist yet?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600">
              Keep the official library focused, but leave space for users to
              suggest or create more specialized starting points.
            </p>
            <div className="mt-8 flex items-center justify-center">
              <Link
                href="/create-generator"
                className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
              >
                Create your generator
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
