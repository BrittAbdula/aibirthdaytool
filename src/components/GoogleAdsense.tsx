'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

// 不允许显示广告的页面路径
const DISALLOW_PATHS = [
  '/',
  '/to/*',
]

// Function to check if the current path matches any disallowed path
function isPathDisallowed(pathname: string, disallowPaths: string[]): boolean {
  return disallowPaths.some((path) => {
    if (path.includes('*')) {
      const basePath = path.replace('*', '');
      return pathname.startsWith(basePath);
    }
    return pathname === path;
  });
}

export default function GoogleAdsense() {
  const pathname = usePathname()
  
  // Check if the current page is allowed to show ads
  const disallowShowAds = isPathDisallowed(pathname, DISALLOW_PATHS)
  
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
