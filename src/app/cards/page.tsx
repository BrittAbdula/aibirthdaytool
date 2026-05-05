import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Send, Users } from "lucide-react";
import { getAllCardPreviews } from "@/lib/card-config";
import ViralMicrositeGrid from "@/components/viral/ViralMicrositeGrid";
import GuidanceGridSection from "@/components/eeat/GuidanceGridSection";
import TrustSignalsSection from "@/components/eeat/TrustSignalsSection";
import JsonLd from "@/components/JsonLd";
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
  buildWebPageSchema,
} from "@/lib/seo";
import {
  BROWSE_INTENT_LINKS,
  PRIMARY_CREATION_PATHS,
} from "@/lib/experience-config";
import {
  EXPLORE_RECIPIENT_LINKS,
  EXPLORE_SURPRISE_LINKS,
} from "@/lib/discovery-links";

export const metadata: Metadata = {
  title: "Card Ideas & Generators | Birthday, Valentine, Sorry & More - MewTruCard",
  description:
    "Choose what kind of card to create, browse card ideas, or start from relationship and surprise-link paths on MewTruCard.",
  alternates: {
    canonical: "/cards/",
  },
  openGraph: {
    title: "Card Ideas & Generators | Birthday, Valentine, Sorry & More - MewTruCard",
    description:
      "Choose what kind of card to create, browse card ideas, or start from relationship and surprise-link paths on MewTruCard.",
    type: "website",
    url: "/cards/",
  },
};

const HUB_METHODS = [
  {
    title: "Built around the first decision",
    description:
      "The page starts with a small set of high-confidence creation paths before showing the full library.",
  },
  {
    title: "Organized by sending intent",
    description:
      "Occasion, recipient, tone, and surprise-link routes map to why someone needs a card today.",
  },
  {
    title: "Kept close to the live product",
    description:
      "Links point to flows that already exist or to generator pages that can accept useful prefilled context.",
  },
];

const HUB_GUIDANCE = [
  {
    title: "If you know the occasion",
    description:
      "Choose one of the main makers. It is the shortest route to a finished card.",
  },
  {
    title: "If you know the person",
    description:
      "Open a relationship-led path first so the message examples start closer to the recipient.",
  },
  {
    title: "If the reveal matters",
    description:
      "Use a surprise-link page before the card when the moment benefits from a little staging.",
  },
];

const TONE_LINKS = [
  {
    href: "/birthday/?tone=Heartfelt",
    label: "Heartfelt",
    description: "Warm, sincere birthday cards for close relationships.",
  },
  {
    href: "/birthday/?tone=Funny",
    label: "Funny",
    description: "Light, playful wording when the card should feel casual.",
  },
  {
    href: "/valentine/?tone=Romantic",
    label: "Romantic",
    description: "Love-card language for partners and valentine moments.",
  },
  {
    href: "/sorry/?tone=Sincere",
    label: "Sincere",
    description: "Simple apology cards without overcomplicating the message.",
  },
];

function CreationPathCard({ path }: { path: (typeof PRIMARY_CREATION_PATHS)[number] }) {
  return (
    <Link
      href={path.href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#F1D6DF] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
    >
      <div className="relative flex h-52 items-center justify-center bg-[#FFF8F6]">
        <Image
          src={path.preview}
          alt={`${path.label} card preview`}
          width={220}
          height={300}
          className="h-44 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {path.eyebrow}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-[#202A3D]">{path.label}</h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-[#6B7280]">
          {path.description}
        </p>
        <span className="mt-6 inline-flex items-center text-sm font-semibold text-primary">
          Start creating
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function CompactLinkCard({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-[#F1D6DF] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <h3 className="text-lg font-semibold text-[#202A3D]">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{description}</p>
      <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
        Open path
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function LibraryCard({ card }: { card: Awaited<ReturnType<typeof getAllCardPreviews>>[number] }) {
  return (
    <Link href={card.link} className="group block h-full">
      <div className="flex h-full flex-col rounded-xl border border-[#F1D6DF] bg-white p-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg">
        <div className="relative mb-4 w-full overflow-hidden rounded-lg bg-[#FFF8F6] pb-[133.33%]">
          <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-105">
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="object-contain p-4"
            />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-[#202A3D]">{card.title}</h3>
        <p className="mt-2 min-h-16 text-sm leading-6 text-[#6B7280]">
          {card.description}
        </p>
        <div className="mt-auto inline-flex min-h-[44px] items-center text-sm font-semibold text-primary">
          Open maker
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10 max-w-3xl">
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

export default async function GeneratorsPage() {
  let allGenerators: Awaited<ReturnType<typeof getAllCardPreviews>> = [];

  try {
    allGenerators = await getAllCardPreviews();
  } catch (error) {
    console.error("Failed to load generators", error);
  }

  const featuredSlugs = PRIMARY_CREATION_PATHS.map((path) => path.slug);
  const officialGenerators = allGenerators.filter((generator) => generator.isSystem);
  const remainingOfficialGenerators = officialGenerators.filter(
    (generator) => !featuredSlugs.some((slug) => generator.link === `/${slug}/`)
  );
  const primarySchemaLinks = PRIMARY_CREATION_PATHS.map((path) => ({
    href: path.href,
    label: path.label,
    description: path.description,
  }));

  return (
    <main className="min-h-screen bg-warm-cream text-[#202A3D]">
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
            "Choose what kind of card to create, browse card ideas, or start from relationship and surprise-link paths on MewTruCard.",
          path: "/cards/",
          reviewedBy: "MewTruCard editorial team",
          lastReviewed: "March 25, 2026",
          about: ["greeting cards", "AI card generator", "card gallery"],
        })}
      />
      <JsonLd
        data={buildItemListSchema("Primary card creation paths", primarySchemaLinks)}
      />

      <section className="border-b border-[#F1D6DF]/70 bg-[#FFF8F6]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Create or browse
              </p>
              <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-tight text-[#202A3D] sm:text-6xl">
                What kind of card do you want to make?
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6B7280]">
                Start with the moment, the person, or the tone. The shortest
                path should match what you already know.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PRIMARY_CREATION_PATHS.map((path) => (
                <CompactLinkCard
                  key={path.href}
                  href={path.href}
                  label={path.label}
                  description={path.description}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Main makers"
            title="Start with a focused card flow"
            description="These are the highest-confidence entry points. Each one opens directly into a generator built for that moment."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PRIMARY_CREATION_PATHS.map((path) => (
              <CreationPathCard key={path.href} path={path} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#F1D6DF]/70 bg-[#FFF8F6] py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Browse ideas
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#202A3D] sm:text-4xl">
              Need examples before writing?
            </h2>
            <p className="mt-4 text-base leading-7 text-[#6B7280]">
              Use this route when you know the feeling but need a message,
              layout, or relationship-specific starting point.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {BROWSE_INTENT_LINKS.map((link) => (
              <CompactLinkCard key={link.href} {...link} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1D6DF]/70 bg-[#FFF8F6] py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-3xl font-semibold text-[#202A3D]">
              By recipient
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              Use this when the person matters more than the occasion.
            </p>
            <div className="mt-5 grid gap-3">
              {EXPLORE_RECIPIENT_LINKS.map((link) => (
                <CompactLinkCard key={link.href} {...link} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-3xl font-semibold text-[#202A3D]">
              By tone
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              Let the generator open with a tone direction already selected.
            </p>
            <div className="mt-5 grid gap-3">
              {TONE_LINKS.map((link) => (
                <CompactLinkCard key={link.href} {...link} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
              <Send className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-3xl font-semibold text-[#202A3D]">
              Surprise links
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              Start with a reveal page when the opening moment matters.
            </p>
            <div className="mt-5 grid gap-3">
              {EXPLORE_SURPRISE_LINKS.map((link) => (
                <CompactLinkCard key={link.href} {...link} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Full library"
            title="All card makers"
            description="Browse the rest of the official library once the main paths are handled."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {remainingOfficialGenerators.map((card) => (
              <LibraryCard key={card.link} card={card} />
            ))}
          </div>
        </div>
      </section>

      <ViralMicrositeGrid
        title="Interactive surprise pages"
        description="Use these when the reveal needs a small moment before the recipient opens the final card."
      />

      <section className="border-t border-[#F1D6DF]/70 bg-[#FFF8F6] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TrustSignalsSection
            title="How this card hub is reviewed"
            description="This page is structured as a decision hub: users pick a useful next step first, then find supporting context below."
            reviewedBy="MewTruCard editorial team"
            lastReviewed="March 25, 2026"
            purpose="Help visitors pick the right MewTruCard path based on occasion, relationship, tone, or surprise-link intent."
            methodology={HUB_METHODS}
            links={[
              {
                href: "/about/",
                label: "About MewTruCard",
                description: "Who the product is for and what the team is trying to improve.",
              },
              {
                href: "/how-it-works/",
                label: "How the workflow works",
                description: "See the create, edit, and share steps before starting.",
              },
              {
                href: "/card-gallery/",
                label: "Browse public card ideas",
                description: "See public examples when you need inspiration first.",
              },
            ]}
          />
          <GuidanceGridSection
            title="How to choose your starting path"
            description="Use the shortest route that still gives enough context to make the card feel specific."
            cards={HUB_GUIDANCE}
          />
        </div>
      </section>
    </main>
  );
}
