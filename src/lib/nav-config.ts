import { EXPLORE_RECIPIENT_LINKS, EXPLORE_SURPRISE_LINKS } from '@/lib/discovery-links'

export interface NavLink {
  href: string
  label: string
  description?: string
}

export interface CardMaker {
  slug: string
  label: string
}

/**
 * Last-resort list of card makers, used only when the database read fails.
 * The live list comes from getNavCardMakers() in nav-card-makers.ts.
 */
export const FALLBACK_CARD_MAKERS: CardMaker[] = [
  { slug: 'anniversary', label: 'Anniversary' },
  { slug: 'baby', label: 'Baby' },
  { slug: 'birthday', label: 'Birthday' },
  { slug: 'christmas', label: 'Christmas' },
  { slug: 'congratulations', label: 'Congratulations' },
  { slug: 'easter', label: 'Easter' },
  { slug: 'eidmubarak', label: 'Eid Mubarak' },
  { slug: 'goodluck', label: 'Good Luck' },
  { slug: 'goodmorning', label: 'Good Morning' },
  { slug: 'goodnight', label: 'Good Night' },
  { slug: 'graduation', label: 'Graduation' },
  { slug: 'love', label: 'Love' },
  { slug: 'mothersday', label: "Mother's Day" },
  { slug: 'newyear', label: 'New Year' },
  { slug: 'sorry', label: 'Sorry' },
  { slug: 'teacher', label: 'Teacher' },
  { slug: 'thankyou', label: 'Thank You' },
  { slug: 'valentine', label: 'Valentine' },
  { slug: 'wedding', label: 'Wedding' },
  { slug: 'womensday', label: "Women's Day" },
]

/** Generator landing pages (single-segment paths) render the compose header. */
export function isGeneratorComposePath(pathname: string, cardMakers: CardMaker[]) {
  const segments = pathname.split('/').filter(Boolean)
  return segments.length === 1 && cardMakers.some((maker) => maker.slug === segments[0])
}

export function matchCardMakers(cardMakers: CardMaker[], term: string) {
  const query = term.trim().toLowerCase()
  if (!query) return cardMakers
  // Match "new year" against the newyear slug as well as the label.
  const collapsed = query.replace(/[\s-]+/g, '')
  return cardMakers.filter(
    (maker) =>
      maker.label.toLowerCase().includes(query) ||
      maker.slug.includes(collapsed) ||
      maker.label.toLowerCase().replace(/[\s'-]+/g, '').includes(collapsed)
  )
}

export const HOME_HREF = '/'
export const GALLERY_HREF = '/card-gallery/'
export const PRICING_HREF = '/pricing/'
export const ALL_MAKERS_HREF = '/cards/'
export const PRIMARY_CREATE_HREF = '/birthday/'
export const MY_CARDS_HREF = '/my-cards/'
export const CREATOR_WORKSPACE_HREF = '/creator/'
export const FOR_TEAMS_HREF = '/for/employee-birthday-cards/'

/** Occasions shown in the Create menu. Keep to the eight most-used makers. */
export const CREATE_MENU_OCCASIONS: NavLink[] = [
  { href: '/birthday/', label: 'Birthday', description: 'The card people need most often.' },
  { href: '/valentine/', label: 'Valentine', description: 'Romantic notes and playful asks.' },
  { href: '/anniversary/', label: 'Anniversary', description: 'Milestones and long-term love.' },
  { href: '/sorry/', label: 'Sorry', description: 'A sincere apology, easy to send.' },
  { href: '/thankyou/', label: 'Thank you', description: 'Gratitude that feels specific.' },
  { href: '/wedding/', label: 'Wedding', description: 'Warm words for the big day.' },
  { href: '/congratulations/', label: 'Congratulations', description: 'Wins, news, and new chapters.' },
  { href: '/graduation/', label: 'Graduation', description: 'Proud words for what comes next.' },
]

export const CREATE_MENU_RECIPIENTS: NavLink[] = EXPLORE_RECIPIENT_LINKS
export const CREATE_MENU_SURPRISES: NavLink[] = EXPLORE_SURPRISE_LINKS

/** Top-level text links, identical in every session state so the bar never shifts. */
export const PRIMARY_NAV_LINKS: NavLink[] = [
  { href: GALLERY_HREF, label: 'Gallery' },
  { href: PRICING_HREF, label: 'Pricing' },
]

export function isActivePath(pathname: string, href: string) {
  if (href === HOME_HREF) return pathname === HOME_HREF
  const normalized = href.endsWith('/') ? href : `${href}/`
  return pathname === href || pathname.startsWith(normalized)
}
