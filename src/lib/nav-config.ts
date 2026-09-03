import { EXPLORE_RECIPIENT_LINKS, EXPLORE_SURPRISE_LINKS } from '@/lib/discovery-links'

export interface NavLink {
  href: string
  label: string
  description?: string
}

/**
 * Generator slugs that render the "compose" header (generator landing pages).
 * Also used by the header search to match against typed occasions.
 */
export const GENERATORS: { slug: string; label: string }[] = [
  { slug: 'birthday', label: 'Birthday' },
  { slug: 'eidmubarak', label: 'Eid Mubarak' },
  { slug: 'mothersday', label: "Mother's Day" },
  { slug: 'anniversary', label: 'Anniversary' },
  { slug: 'love', label: 'Love' },
  { slug: 'thankyou', label: 'Thank You' },
  { slug: 'wedding', label: 'Wedding' },
  { slug: 'graduation', label: 'Graduation' },
  { slug: 'baby', label: 'Baby' },
  { slug: 'congratulations', label: 'Congratulations' },
  { slug: 'goodluck', label: 'Good Luck' },
  { slug: 'sorry', label: 'Sorry' },
  { slug: 'christmas', label: 'Christmas' },
  { slug: 'valentine', label: 'Valentine' },
  { slug: 'goodmorning', label: 'Good Morning' },
  { slug: 'goodnight', label: 'Good Night' },
  { slug: 'teacher', label: 'Teacher' },
  { slug: 'easter', label: 'Easter' },
  { slug: 'womensday', label: "Women's Day" },
]

export const GENERATOR_SLUGS = new Set(GENERATORS.map((generator) => generator.slug))

export function isGeneratorComposePath(pathname: string) {
  const pathSegments = pathname.split('/').filter(Boolean)
  return pathSegments.length === 1 && GENERATOR_SLUGS.has(pathSegments[0])
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
