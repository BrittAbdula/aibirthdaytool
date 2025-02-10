'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

// 不允许显示广告的页面路径
const DISALLOW_PATHS = [
  '/',
  '/to',
]

export default function GoogleAdsense() {
  const pathname = usePathname()
  
  //检查当前页面是否允许显示广告
  const disallowShowAds = DISALLOW_PATHS.some(path => pathname.startsWith(path))
  
  if (disallowShowAds) {
    return null
  }

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1555702340859042"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
