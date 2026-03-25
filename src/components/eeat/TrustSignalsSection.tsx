import Link from "next/link";
import {
  GuidanceCard,
  TrustLink,
} from "@/lib/eeat-content";

interface TrustSignalsSectionProps {
  title: string;
  description: string;
  reviewedBy: string;
  lastReviewed: string;
  purpose: string;
  methodology: GuidanceCard[];
  links: TrustLink[];
}

export default function TrustSignalsSection({
  title,
  description,
  reviewedBy,
  lastReviewed,
  purpose,
  methodology,
  links,
}: TrustSignalsSectionProps) {
  return (
    <section className="mb-12 rounded-[28px] border border-orange-100 bg-gradient-to-br from-white to-orange-50/70 p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <span className="rounded-full bg-white px-3 py-1 font-semibold text-orange-700 shadow-sm">
          Reviewed by {reviewedBy}
        </span>
        <span className="rounded-full bg-white px-3 py-1 shadow-sm">
          Last reviewed {lastReviewed}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
            {description}
          </p>
          <div className="mt-4 rounded-2xl border border-orange-100 bg-white/80 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              Why this page exists
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-700 sm:text-base">
              {purpose}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Trust hub</h3>
          <div className="mt-4 space-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-2xl border border-orange-100 bg-orange-50/50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
              >
                <div className="text-sm font-semibold text-gray-800">{link.label}</div>
                <p className="mt-1 text-sm leading-6 text-gray-600">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {methodology.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-orange-100 bg-white/80 p-5 shadow-sm"
          >
            <h3 className="text-base font-semibold text-gray-800">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
