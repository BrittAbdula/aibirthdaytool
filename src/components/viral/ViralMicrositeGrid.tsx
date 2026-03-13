import Image from "next/image";
import Link from "next/link";
import { VIRAL_MICROSITES } from "@/lib/viral-microsites";

interface ViralMicrositeGridProps {
  title: string;
  description: string;
}

export default function ViralMicrositeGrid({
  title,
  description,
}: ViralMicrositeGridProps) {
  return (
    <section className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-caveat font-bold text-gray-800 sm:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600 sm:text-lg">
          {description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {VIRAL_MICROSITES.map((microsite) => (
          <Link
            key={microsite.slug}
            href={`/${microsite.slug}/`}
            className="group overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-white to-orange-50">
              <Image
                src={microsite.imageUrl}
                alt={microsite.imageAlt}
                width={640}
                height={640}
                className="aspect-square w-full object-contain p-4 transition duration-500 group-hover:scale-105"
              />
            </div>

            <div className="space-y-3 px-1 pb-2 pt-4">
              <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">
                {microsite.eyebrow}
              </span>
              <h3 className="text-xl font-semibold text-gray-800">{microsite.prompt}</h3>
              <p className="text-sm leading-6 text-gray-600">{microsite.description}</p>
              <div className="text-sm font-semibold text-primary">
                Try this surprise link
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
