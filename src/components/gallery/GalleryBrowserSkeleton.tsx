import { GALLERY_GRID_CLASS, GallerySkeletonCard } from '@/components/gallery/GalleryCard'
import { GALLERY_PAGE_SIZE } from '@/lib/gallery-pagination'

export function GalleryBrowserSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading gallery">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="h-11 w-full animate-pulse rounded-full bg-[#F6E4EA]/60 md:w-80" />
        <div className="h-10 w-full animate-pulse rounded-full bg-[#F6E4EA]/60 md:w-56" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-[#F6E4EA]/60" />
        ))}
      </div>
      <div className={GALLERY_GRID_CLASS}>
        {Array.from({ length: GALLERY_PAGE_SIZE }, (_, index) => (
          <GallerySkeletonCard key={index} />
        ))}
      </div>
    </div>
  )
}
