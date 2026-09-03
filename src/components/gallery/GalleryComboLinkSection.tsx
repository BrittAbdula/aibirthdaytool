import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface GalleryComboLink {
  href: string
  title: string
  description: string
}

interface GalleryComboLinkSectionProps {
  title: string
  description: string
  links: GalleryComboLink[]
}

export default function GalleryComboLinkSection({
  title,
  description,
  links,
}: GalleryComboLinkSectionProps) {
  if (!links.length) {
    return null
  }

  return (
    <section className="mb-12 rounded-2xl border border-[#F1D6DF] bg-white p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-[#202A3D] sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280] sm:text-base">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-[#F1D6DF] bg-[#FFF8F6] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-[#202A3D] transition-colors group-hover:text-primary">
              {link.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">{link.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Open gallery
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
