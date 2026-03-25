import { GuidanceCard } from "@/lib/eeat-content";

interface GuidanceGridSectionProps {
  title: string;
  description: string;
  cards: GuidanceCard[];
}

export default function GuidanceGridSection({
  title,
  description,
  cards,
}: GuidanceGridSectionProps) {
  return (
    <section className="mb-12 rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
          {description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-5"
          >
            <h3 className="text-base font-semibold text-gray-800">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
