export const GALLERY_PAGE_SIZE = 12

export function getGalleryOffset(page: number, pageSize = GALLERY_PAGE_SIZE): number {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
  return (safePage - 1) * pageSize
}
