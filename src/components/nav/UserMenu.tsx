'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import { ChevronDown, Crown, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CREATOR_WORKSPACE_HREF, MY_CARDS_HREF, PRICING_HREF } from '@/lib/nav-config'
import { cn } from '@/lib/utils'

function useAuthActions() {
  const [pending, setPending] = useState<'in' | 'out' | null>(null)

  const login = async () => {
    setPending('in')
    try {
      await signIn('google', { callbackUrl: window.location.href })
    } catch (error) {
      console.error('Login failed:', error)
      setPending(null)
    }
  }

  const logout = async () => {
    setPending('out')
    try {
      await signOut({ callbackUrl: window.location.href })
    } catch (error) {
      console.error('Logout failed:', error)
      setPending(null)
    }
  }

  return { pending, login, logout }
}

const pillClass =
  'inline-flex h-10 items-center justify-center rounded-full border border-[#F1D6DF] bg-white px-4 text-sm font-semibold text-[#202A3D] transition-colors hover:border-primary/40 hover:bg-[#FFF1F5] disabled:opacity-60'

export function SignInButton({ className }: { className?: string }) {
  const { pending, login } = useAuthActions()
  return (
    <button type="button" onClick={() => void login()} disabled={pending !== null} className={cn(pillClass, className)}>
      {pending === 'in' ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Signing in
        </>
      ) : (
        'Sign in'
      )}
    </button>
  )
}

export function SignOutButton({ className }: { className?: string }) {
  const { pending, logout } = useAuthActions()
  return (
    <button type="button" onClick={() => void logout()} disabled={pending !== null} className={cn(pillClass, className)}>
      {pending === 'out' ? 'Signing out' : 'Sign out'}
    </button>
  )
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <DropdownMenuItem asChild className="rounded-lg px-2 py-2 text-sm text-[#202A3D] focus:bg-[#FFF1F5]">
      <Link href={href}>{children}</Link>
    </DropdownMenuItem>
  )
}

/**
 * Account slot for the header. Every state renders at the same height and the slot
 * sits at the end of the bar, so resolving the session never moves other items.
 */
export function UserMenu() {
  const { data: session, status } = useSession()
  const { pending, logout } = useAuthActions()

  if (status === 'loading') {
    return <span className="inline-block h-10 w-[4.75rem] animate-pulse rounded-full bg-[#F1D6DF]/50" aria-hidden />
  }

  if (status !== 'authenticated' || !session?.user) {
    return <SignInButton />
  }

  const user = session.user
  const isPremium = user.plan === 'PREMIUM'

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="group inline-flex h-10 items-center gap-1 rounded-full pl-1 pr-2 transition-colors hover:bg-[#FFF1F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <span
          className={cn(
            'relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#FFE8F0] text-sm font-semibold text-primary',
            isPremium && 'ring-2 ring-primary ring-offset-1 ring-offset-[#FFF8F6]'
          )}
        >
          {user.image ? (
            <Image src={user.image} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            (user.name?.[0] ?? 'M').toUpperCase()
          )}
        </span>
        <ChevronDown
          className="h-4 w-4 text-[#8A93A6] transition-transform duration-200 group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-60 rounded-2xl border-[#F1D6DF] bg-white p-2 shadow-xl">
        <DropdownMenuLabel className="px-2 py-2 font-normal">
          <span className="block truncate text-sm font-semibold text-[#202A3D]">{user.name || 'Signed in'}</span>
          <span className="mt-0.5 flex items-center gap-1 text-xs text-[#6B7280]">
            {isPremium && <Crown className="h-3 w-3 text-primary" aria-hidden />}
            {isPremium ? 'Creator Pro' : 'Free plan'}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#F1D6DF]/70" />
        <MenuLink href={MY_CARDS_HREF}>My cards</MenuLink>
        <MenuLink href={CREATOR_WORKSPACE_HREF}>Creator workspace</MenuLink>
        {!isPremium && <MenuLink href={PRICING_HREF}>Get more cards</MenuLink>}
        <DropdownMenuSeparator className="bg-[#F1D6DF]/70" />
        <DropdownMenuItem
          onSelect={() => void logout()}
          disabled={pending !== null}
          className="rounded-lg px-2 py-2 text-sm text-[#9E405E] focus:bg-[#FFF1F5] focus:text-[#9E405E]"
        >
          {pending === 'out' ? 'Signing out' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
