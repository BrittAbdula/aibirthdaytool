'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CARD_TYPES } from '@/lib/card-constants'

// 不允许显示广告的页面路径
const DISALLOW_PATHS = [
  '/',
  '/to/*',
  '/will-you-be-my-valentine',
  '/open-your-birthday-surprise',
  '/forgive-me',
  '/will-you-be-my-bridesmaid',
]

const DISALLOW_PREFIXES = ['/type/', '/relationship/']
const DISALLOW_EXACT_PATHS = new Set([
  '/cards',
  '/card-gallery',
  ...CARD_TYPES.map((cardType) => `/${cardType.type}`),
])

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
  const { data: session } = useSession()
  const isPremiumUser = (session as any)?.user?.plan === 'PREMIUM'
  const normalizedPathname =
    pathname && pathname !== '/' && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname

  // Check if the current page is allowed to show ads
  const disallowShowAds =
    isPathDisallowed(pathname, DISALLOW_PATHS) ||
    DISALLOW_PREFIXES.some((prefix) => normalizedPathname.startsWith(prefix)) ||
    DISALLOW_EXACT_PATHS.has(normalizedPathname) ||
    isPremiumUser

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
