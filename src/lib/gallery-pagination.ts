export const GALLERY_PAGE_SIZE = 12
export const MAX_GALLERY_PAGE_SIZE = 24

export function getGalleryOffset(page: number, pageSize = GALLERY_PAGE_SIZE): number {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
  return (safePage - 1) * pageSize
}

export function getSafeGalleryPage(value: string | null | undefined): number | null {
  if (!value) return 1
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return null
  return Math.floor(parsed)
}

export function getSafeGalleryPageSize(value: string | null | undefined): number {
  if (!value) return GALLERY_PAGE_SIZE
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return GALLERY_PAGE_SIZE
  return Math.min(Math.floor(parsed), MAX_GALLERY_PAGE_SIZE)
}

export function getNextPageCursor(page: number, hasMore: boolean): string | undefined {
  if (!hasMore) return undefined
  return String(Math.max(1, Math.floor(page)) + 1)
}

export function getPageFromCursor(cursor: string | null | undefined): number | null {
  if (!cursor) return null
  const parsed = Number.parseInt(cursor, 10)
  if (!Number.isFinite(parsed) || parsed < 1 || String(parsed) !== cursor.trim()) return null
  return Math.floor(parsed)
}
