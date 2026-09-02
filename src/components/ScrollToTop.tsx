'use client'

import { useState, useEffect } from 'react'
import { ChevronUpIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // 当页面滚动超过300px时显示按钮；接近页脚时隐藏，避免压住页脚链接
      const nearBottom =
        window.scrollY + window.innerHeight >
        document.documentElement.scrollHeight - 220
      setIsVisible(window.scrollY > 300 && !nearBottom)
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed right-4 bottom-4 z-50 md:hidden",
        "w-10 h-10 rounded-full",
        "bg-white/90 ring-1 ring-[#E5E9F0] backdrop-blur hover:bg-white hover:ring-[#F1D6DF]",
        "flex items-center justify-center",
        "shadow-lg hover:shadow-xl",
        "transform transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ChevronUpIcon className="w-5 h-5 text-[#202A3D]" />
    </button>
  )
} 