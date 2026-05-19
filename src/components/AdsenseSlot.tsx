'use client'

import React, { useEffect, useRef } from 'react'

interface AdsenseSlotProps {
  slotId?: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  fullWidthResponsive?: boolean
  className?: string
}

export function AdsenseSlot({
  slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_GENERATION || '',
  format = 'auto',
  fullWidthResponsive = true,
  className
}: AdsenseSlotProps) {
  const insRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!slotId) return
    // @ts-ignore
    const adsbygoogle = (window as any).adsbygoogle || []
    try {
      adsbygoogle.push({})
    } catch {}
  }, [slotId])

  if (!slotId) return null

  return (
    <div className={className}>
      {/* display/anchor/video-enabled auto ads unit */}
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1555702340859042"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        ref={(el) => {
          // HTMLDivElement is fine for ins typing in TSX
          // store for potential future refresh logic
          // but not required now
          insRef.current = (el as unknown) as HTMLDivElement
        }}
      />
    </div>
  )
}

export default AdsenseSlot


