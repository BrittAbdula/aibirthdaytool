import Image from "next/image";
import Link from "next/link";
import { Card } from "@/lib/cards";
import {
  buildCardPreviewAlt,
  buildCardPreviewTitle,
  getSeoRelationshipLabel,
} from "@/lib/seo";

interface HeroCardProofProps {
  cards: Card[];
  cardName: string;
  galleryHref: string;
}

function ProofCard({
  card,
  priority = false,
}: {
  card: Card;
  priority?: boolean;
}) {
  const relationshipLabel = getSeoRelationshipLabel(card.relationship);

  return (
    <article className="overflow-hidden rounded-[24px] border border-white/80 bg-white/90 shadow-sm">
      <div className="relative aspect-[2/3] bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <Image
          src={card.r2Url || "/mewtrucard-generator.jpg"}
          alt={buildCardPreviewAlt(card.cardType, card.relationship)}
          fill
          priority={priority}
          sizes="(max-width: 768px) 42vw, 220px"
          className="object-contain p-2"
        />
      </div>
      <div className="space-y-2 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700">
            Public card
          </span>
          {relationshipLabel && (
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
              {relationshipLabel}
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-sm font-medium leading-6 text-gray-700">
          {buildCardPreviewTitle(card.cardType, card.relationship)}
        </p>
      </div>
    </article>
  );
}

export default function HeroCardProof({
  cards,
  cardName,
  galleryHref,
}: HeroCardProofProps) {
  const featuredCards = cards.slice(0, 5);

  if (!featuredCards.length) {
    return null;
  }

  const [leadCard, ...supportCards] = featuredCards;

  return (
    <section className="relative w-full min-w-0 max-w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="mb-5 flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
            Live gallery preview
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            See what people are making right now
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
            Browse recent public {cardName.toLowerCase()} cards for tone, layout,
            and style ideas before you create your own.
          </p>
        </div>
        <Link
          href={galleryHref}
          className="hidden rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 sm:inline-flex"
        >
          Browse full gallery
        </Link>
      </div>

      <div className="flex w-full max-w-full gap-3 overflow-x-auto pb-2 md:hidden">
        {featuredCards.map((card, index) => (
          <div key={card.id} className="w-[152px] flex-none snap-start">
            <ProofCard card={card} priority={index === 0} />
          </div>
        ))}
      </div>

      <div className="hidden gap-3 md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(0,0.95fr)] md:grid-rows-2">
        <div className="row-span-2">
          <ProofCard card={leadCard} priority />
        </div>
        {supportCards.map((card) => (
          <ProofCard key={card.id} card={card} />
        ))}
      </div>

      <div className="mt-4 sm:hidden">
        <Link
          href={galleryHref}
          className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
        >
          Browse full gallery
        </Link>
      </div>
    </section>
  );
}
