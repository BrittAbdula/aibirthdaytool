'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ALL_MAKERS_HREF,
  CREATE_MENU_OCCASIONS,
  CREATE_MENU_RECIPIENTS,
  CREATE_MENU_SURPRISES,
  type NavLink,
} from '@/lib/nav-config'
import { cn } from '@/lib/utils'

function MenuColumn({ title, links, compact }: { title: string; links: NavLink[]; compact?: boolean }) {
  return (
    <DropdownMenuGroup>
      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A93A6]">{title}</p>
      <div className={cn('grid gap-0.5', !compact && 'sm:grid-cols-2')}>
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild className="flex-col items-start rounded-lg p-0 focus:bg-[#FFF1F5]">
            <Link href={link.href} className="block px-2 py-2">
              <span className="block text-sm font-semibold text-[#202A3D]">{link.label}</span>
              {!compact && link.description && (
                <span className="mt-0.5 block text-xs leading-5 text-[#6B7280]">{link.description}</span>
              )}
            </Link>
          </DropdownMenuItem>
        ))}
      </div>
    </DropdownMenuGroup>
  )
}

export function CreateMenu() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="group inline-flex h-10 items-center gap-1 rounded-full px-3 text-[15px] font-semibold text-[#47536B] transition-colors hover:text-[#202A3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=open]:text-[#202A3D]">
        Create
        <ChevronDown
          className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={10}
        className="w-[46rem] rounded-2xl border-[#F1D6DF] bg-white p-5 shadow-xl"
      >
        <div className="grid grid-cols-[1.25fr_1fr] gap-6">
          <MenuColumn title="By occasion" links={CREATE_MENU_OCCASIONS} />
          <div className="grid content-start gap-5 border-l border-[#F1D6DF]/70 pl-6">
            <MenuColumn title="For someone" links={CREATE_MENU_RECIPIENTS} compact />
            <MenuColumn title="Surprise pages" links={CREATE_MENU_SURPRISES} compact />
          </div>
        </div>
        <DropdownMenuItem asChild className="mt-4 rounded-lg p-0 focus:bg-[#FFF1F5]">
          <Link
            href={ALL_MAKERS_HREF}
            className="flex items-center justify-between border-t border-[#F1D6DF]/70 px-2 pb-1 pt-4 text-sm font-semibold text-primary"
          >
            All card makers
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
