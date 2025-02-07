'use client'

import { useState, useEffect } from 'react'
import { ChevronUpIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // 当页面滚动超过300px时显示按钮
      setIsVisible(window.scrollY > 300)
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
        "fixed right-4 sm:right-8 bottom-4 sm:bottom-8 z-50",
        "w-10 h-10 sm:w-12 sm:h-12 rounded-full",
        "bg-gradient-to-r from-purple-600/90 to-pink-600/90 hover:from-purple-600 hover:to-pink-600",
        "flex items-center justify-center",
        "shadow-lg hover:shadow-xl",
        "transform transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ChevronUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      <div className="absolute inset-0 rounded-full bg-white/10 animate-ping-slow" />
    </button>
  )
} 