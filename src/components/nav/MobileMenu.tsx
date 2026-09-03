'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowRight } from 'lucide-react'
import { GeneratorSearchInline } from '@/components/nav/GeneratorSearch'
import { SignInButton, SignOutButton } from '@/components/nav/UserMenu'
import {
  ALL_MAKERS_HREF,
  CREATE_MENU_OCCASIONS,
  CREATOR_WORKSPACE_HREF,
  MY_CARDS_HREF,
  PRIMARY_NAV_LINKS,
  isActivePath,
  type CardMaker,
} from '@/lib/nav-config'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  pathname: string
  cardMakers: CardMaker[]
}

const rowClass =
  'flex min-h-12 items-center justify-between rounded-xl px-4 text-base font-semibold text-[#202A3D] transition-colors hover:bg-[#FFF1F5]'

export function MobileMenu({ open, onClose, pathname, cardMakers }: MobileMenuProps) {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      id="mobile-menu"
      className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-[#F1D6DF]/70 bg-[#FFF8F6] md:hidden"
    >
      <div className="container mx-auto flex flex-col gap-6 py-5">
        <GeneratorSearchInline onNavigate={onClose} cardMakers={cardMakers} />

        <section aria-labelledby="mobile-create-heading">
          <p id="mobile-create-heading" className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A93A6]">
            Make a card
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CREATE_MENU_OCCASIONS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="inline-flex min-h-10 items-center rounded-full border border-[#F1D6DF] bg-white px-4 text-sm font-semibold text-[#202A3D] transition-colors hover:border-primary/40 hover:bg-[#FFF1F5]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={ALL_MAKERS_HREF}
              onClick={onClose}
              className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-primary"
            >
              All makers
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        <nav aria-label="Site" className="grid gap-1">
          {PRIMARY_NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={cn(rowClass, active && 'bg-white')}
              >
                {link.label}
              </Link>
            )
          })}
          {status === 'authenticated' && (
            <>
              <Link href={MY_CARDS_HREF} onClick={onClose} className={rowClass}>
                My cards
              </Link>
              <Link href={CREATOR_WORKSPACE_HREF} onClick={onClose} className={rowClass}>
                Creator workspace
              </Link>
            </>
          )}
        </nav>

        <section className="border-t border-[#F1D6DF]/70 pt-5" aria-label="Account">
          {status === 'authenticated' && session?.user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {session.user.image && (
                  <Image src={session.user.image} alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#202A3D]">{session.user.name}</p>
                  <p className="text-xs text-[#6B7280]">{session.user.plan === 'PREMIUM' ? 'Creator Pro' : 'Free plan'}</p>
                </div>
              </div>
              <SignOutButton />
            </div>
          ) : status === 'loading' ? (
            <span className="block h-12 w-full animate-pulse rounded-xl bg-[#F1D6DF]/50" aria-hidden />
          ) : (
            <SignInButton className="h-12 w-full text-base" />
          )}
        </section>
      </div>
    </div>
  )
}
