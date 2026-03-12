import Link from 'next/link'

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
    <section className="mb-12 rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
          {description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-[22px] border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-4 transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800 group-hover:text-purple-700">
                {link.title}
              </h3>
              <p className="text-sm leading-6 text-gray-600">{link.description}</p>
              <div className="text-sm font-semibold text-purple-700">Open gallery</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
