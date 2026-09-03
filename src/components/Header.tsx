'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { CreateMenu } from '@/components/nav/CreateMenu'
import { GeneratorSearchButton } from '@/components/nav/GeneratorSearch'
import { MobileMenu } from '@/components/nav/MobileMenu'
import { UserMenu } from '@/components/nav/UserMenu'
import {
  GALLERY_HREF,
  PRIMARY_CREATE_HREF,
  PRIMARY_NAV_LINKS,
  isActivePath,
  type CardMaker,
} from '@/lib/nav-config'

type HeaderVariant = 'default' | 'compose'

const navLinkClass =
  'inline-flex h-10 items-center rounded-full px-3 text-[15px] font-semibold text-[#47536B] transition-colors hover:text-[#202A3D] aria-[current=page]:text-[#202A3D] aria-[current=page]:underline aria-[current=page]:decoration-primary aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8'

const ctaClass =
  'inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md'

/**
 * Site header.
 * - `default`: Create menu, Gallery, Pricing, search, primary CTA, account.
 * - `compose`: generator pages keep only the brand, Gallery, and account so the
 *   maker stays the focus.
 * Session-dependent UI lives only in the trailing account slot, so the bar does
 * not shift while the session resolves.
 */
function Header({ variant = 'default', cardMakers }: { variant?: HeaderVariant; cardMakers: CardMaker[] }) {
  const pathname = usePathname() || '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const isCompose = variant === 'compose'
  const links = isCompose ? PRIMARY_NAV_LINKS.filter((link) => link.href === GALLERY_HREF) : PRIMARY_NAV_LINKS

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* The blur lives on this wrapper, not the header: backdrop-filter would otherwise
          turn the header into the containing block for the fixed mobile drawer. */}
      <div className="border-b border-[#F1D6DF]/70 bg-[#FFF8F6]/90 backdrop-blur-xl">
      <nav className="container mx-auto flex h-16 items-center justify-between gap-3" aria-label="Main">
        <Link href="/" className="group flex min-w-0 items-center gap-2" aria-label="MewTruCard home">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            priority
            className="h-9 w-9 shrink-0 drop-shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10"
          />
          <span className="hidden truncate font-serif text-xl font-semibold tracking-tight text-[#202A3D] min-[360px]:block sm:text-2xl">
            MewTruCard
          </span>
        </Link>

        <div className="hidden flex-1 items-center gap-1 md:flex">
          {!isCompose && <CreateMenu />}
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}
              className={navLinkClass}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {!isCompose && <GeneratorSearchButton cardMakers={cardMakers} />}
          {!isCompose && (
            <Link href={PRIMARY_CREATE_HREF} className={ctaClass}>
              Make a card
            </Link>
          )}
          <UserMenu />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {isCompose ? (
            <Link
              href={GALLERY_HREF}
              className="inline-flex h-10 items-center rounded-full border border-[#F1D6DF] bg-white px-4 text-sm font-semibold text-[#202A3D]"
            >
              Gallery
            </Link>
          ) : (
            <Link href={PRIMARY_CREATE_HREF} className={ctaClass}>
              Make a card
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#202A3D] transition-colors hover:bg-[#FFF1F5]"
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>
      </nav>
      </div>

      <MobileMenu open={menuOpen} onClose={closeMenu} pathname={pathname} cardMakers={cardMakers} />
    </header>
  )
}

export { Header }
