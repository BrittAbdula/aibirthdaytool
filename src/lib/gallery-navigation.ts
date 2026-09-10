import { CARD_TYPES, RELATIONSHIPS } from '@/lib/card-constants'
import {
  getGalleryComboHref,
  getRelationshipLabel,
  getRelationshipValue,
  hasSeoGalleryCombo,
} from '@/lib/gallery-combos'
import { GALLERY_PAGE_SIZE } from '@/lib/gallery-pagination'

export type GalleryTab = 'featured' | 'recent' | 'popular' | 'liked'

export const GALLERY_TABS: { id: GalleryTab; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'recent', label: 'Recent' },
  { id: 'popular', label: 'Popular' },
  { id: 'liked', label: 'Liked' },
]

export const DEFAULT_GALLERY_TAB: GalleryTab = 'featured'
export const GALLERY_ROOT_HREF = '/card-gallery/'

/** Occasions shown as chips; every other card type sits behind the "More" menu. */
export const PRIMARY_GALLERY_TYPES = [
  'birthday',
  'valentine',
  'anniversary',
  'sorry',
  'thankyou',
  'wedding',
  'congratulations',
  'graduation',
]

/** Filters fixed by the route: /type/x/, /relationship/y/, /type/x/for/y/. */
export interface GalleryScope {
  type: string | null
  relationship: string | null
}

export interface GalleryFilterState extends GalleryScope {
  tab: GalleryTab
}

export function parseGalleryTab(value: string | null | undefined, defaultTab = DEFAULT_GALLERY_TAB): GalleryTab {
  return GALLERY_TABS.some((tab) => tab.id === value) ? (value as GalleryTab) : defaultTab
}

export function normalizeGalleryType(value: string | null | undefined): string | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  return CARD_TYPES.some((cardType) => cardType.type === normalized) ? normalized : null
}

export function normalizeGalleryRelationship(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const normalized = getRelationshipValue(value)
    return RELATIONSHIPS.some((relationship) => relationship.value === normalized) ? normalized : null
  } catch {
    return null
  }
}

/**
 * Canonical URL for a filter state. Static routes win; query params are used only
 * where no static route exists, so the server-rendered page already matches the
 * filters in most cases.
 */
export function buildGalleryHref(state: GalleryFilterState): string {
  const { type, relationship, tab } = state
  const query = new URLSearchParams()
  let base = GALLERY_ROOT_HREF

  if (type && relationship) {
    if (hasSeoGalleryCombo(type, relationship)) {
      base = getGalleryComboHref(type, relationship)
    } else {
      base = `/type/${type}/`
      query.set('relationship', relationship)
    }
  } else if (type) {
    base = `/type/${type}/`
  } else if (relationship) {
    base = `/relationship/${relationship}/`
  }

  const defaultTab = base === GALLERY_ROOT_HREF ? 'recent' : DEFAULT_GALLERY_TAB
  if (tab !== defaultTab) query.set('tab', tab)
  const search = query.toString()
  return search ? `${base}?${search}` : base
}

export function getHrefPath(href: string) {
  return href.split('?')[0].split('#')[0]
}

export function isSamePath(a: string, b: string) {
  const strip = (value: string) => value.replace(/\/+$/, '') || '/'
  return strip(a) === strip(b)
}

export function buildGalleryApiUrl(params: {
  page: number
  tab: GalleryTab
  type: string | null
  relationship: string | null
  pageSize?: number
}): string {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize ?? GALLERY_PAGE_SIZE),
    tab: params.tab,
  })
  if (params.type) search.set('wishCardType', params.type)
  // The database stores relationship labels ("Friend"), not slugs.
  if (params.relationship) search.set('relationship', getRelationshipLabel(params.relationship))
  return `/api/cards?${search.toString()}`
}

/** Generator URL prefilled from a public card, used by "Make one like this". */
export function buildInspirationHref(card: { cardType: string; relationship: string | null; message: string | null }) {
  const params = new URLSearchParams()
  if (card.relationship) params.set('relationship', card.relationship)
  if (card.message) params.set('message', card.message)
  const search = params.toString()
  return `/${card.cardType}/${search ? `?${search}` : ''}`
}
