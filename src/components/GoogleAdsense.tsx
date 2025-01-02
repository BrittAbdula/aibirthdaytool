'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

// 允许显示广告的页面路径
const ALLOWED_PATHS = [
  '/birthday',
  '/love',
  '/congratulations',
  '/thankyou',
  '/holiday',
  '/anniversary',
  '/sorry',
  '/christmas',
  '/newyear'
]

export default function GoogleAdsense() {
  const pathname = usePathname()
  
  // 检查当前页面是否允许显示广告
  // const shouldShowAds = ALLOWED_PATHS.some(path => pathname.startsWith(path))
  
  // if (!shouldShowAds) {
  //   return null
  // }

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1555702340859042"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
