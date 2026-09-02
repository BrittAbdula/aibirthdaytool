import Link from "next/link";
import { VIRAL_MICROSITES, ViralMicrositeConfig } from "@/lib/viral-microsites";

interface ViralMicrositeGridProps {
  title: string;
  description: string;
  tone?: "light" | "ink";
}

const THEME_STYLES: Record<
  ViralMicrositeConfig["theme"],
  { stage: string; yes: string; chip: string }
> = {
  rose: {
    stage: "bg-[#FFE8F0]",
    yes: "bg-[#B4375F]",
    chip: "text-[#B4375F]",
  },
  amber: {
    stage: "bg-[#FFF1D6]",
    yes: "bg-[#B4762A]",
    chip: "text-[#9A6A1F]",
  },
  mint: {
    stage: "bg-[#E2F4EA]",
    yes: "bg-[#2A7D52]",
    chip: "text-[#1F6B45]",
  },
  violet: {
    stage: "bg-[#ECE8FF]",
    yes: "bg-[#5B4BC4]",
    chip: "text-[#5B4BC4]",
  },
};

export default function ViralMicrositeGrid({
  title,
  description,
  tone = "light",
}: ViralMicrositeGridProps) {
  const ink = tone === "ink";
  return (
    <section className="space-y-12">
      <div className="mx-auto max-w-2xl text-center">
        <p
          className={`text-sm font-semibold uppercase tracking-[0.22em] ${
            ink ? "text-[#F8B7C7]" : "text-primary"
          }`}
        >
          Surprise links
        </p>
        <h2
          className={`mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl ${
            ink ? "text-white" : "text-[#202A3D]"
          }`}
        >
          {title}
        </h2>
        <p
          className={`mx-auto mt-4 max-w-2xl text-base leading-7 sm:text-lg ${
            ink ? "text-[#B9C1D4]" : "text-[#6B7280]"
          }`}
        >
          {description}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {VIRAL_MICROSITES.map((microsite) => {
          const theme = THEME_STYLES[microsite.theme];
          return (
            <Link
              key={microsite.slug}
              href={`/${microsite.slug}/`}
              className={`group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                ink
                  ? "bg-[#28344C] ring-1 ring-white/10 hover:ring-white/25"
                  : "border border-[#F1D6DF] bg-white hover:border-primary/30 hover:shadow-xl"
              }`}
            >
              {/* Hand-built preview of the microsite screen */}
              <div className={`px-5 pb-0 pt-5`}>
                <div className={`rounded-xl p-4 ${theme.stage}`}>
                  <div className="mx-auto max-w-[230px] rounded-lg bg-white px-4 pb-4 pt-5 text-center shadow-sm">
                    <p className="font-serif text-[15px] font-semibold leading-snug text-[#202A3D]">
                      {microsite.prompt}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <span
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-transform duration-300 group-hover:scale-110 ${theme.yes}`}
                      >
                        {microsite.primaryLabel}
                      </span>
                      <span className="rounded-full border border-[#D8DDE6] px-4 py-1.5 text-xs font-semibold text-[#8A93A6] transition-transform duration-300 group-hover:-rotate-12 group-hover:translate-x-5 group-hover:translate-y-1">
                        {microsite.secondaryLabel}
                      </span>
                    </div>
                    <p className={`mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.chip}`}>
                      {microsite.secondaryPhrases[1]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3
                  className={`font-serif text-xl font-semibold ${
                    ink ? "text-white" : "text-[#202A3D]"
                  }`}
                >
                  {microsite.shareTitle}
                </h3>
                <p
                  className={`mt-2 flex-1 text-sm leading-6 ${
                    ink ? "text-[#B9C1D4]" : "text-[#6B7280]"
                  }`}
                >
                  {microsite.description}
                </p>
                <span
                  className={`mt-4 text-sm font-semibold ${
                    ink ? "text-[#F8B7C7]" : "text-primary"
                  }`}
                >
                  Try this surprise link
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
