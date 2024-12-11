'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean)
  
  // Always start with home
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ]

  // Build up the breadcrumbs array
  let currentPath = ''
  paths.forEach((path, index) => {
    currentPath += `/${path}`
    
    // Format the label (replace hyphens with spaces and capitalize)
    const label = path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    breadcrumbs.push({
      label,
      href: currentPath,
      current: index === paths.length - 1
    })
  })

  return breadcrumbs
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  if (pathname === '/') return null

  return (
    <nav className="flex px-4 sm:px-6 py-3" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="mx-2 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
            )}
            <Link
              href={breadcrumb.href}
              className={cn(
                "text-sm font-medium hover:text-purple-600 flex items-center",
                breadcrumb.current 
                  ? "text-gray-600 cursor-default hover:text-gray-600" 
                  : "text-gray-500"
              )}
              aria-current={breadcrumb.current ? 'page' : undefined}
            >
              {index === 0 ? (
                <>
                  <HomeIcon className="h-4 w-4 mr-1" />
                  <span className="sr-only">{breadcrumb.label}</span>
                </>
              ) : (
                breadcrumb.label
              )}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
