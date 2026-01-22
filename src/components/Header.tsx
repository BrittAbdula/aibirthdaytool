'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import SparklesText from '@/components/ui/sparkles-text'
import { Menu, X, ChevronDown, Loader2, Crown, Search, SendHorizontal, Plus } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from '@/components/ui/button'
import { WarmButton } from '@/components/ui/warm-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { PremiumButton } from '@/components/PremiumModal'
import { SubscriptionButton } from '@/components/SubscriptionModal'
import { cn } from '@/lib/utils'

// 定义生成器类型
const GENERATORS = [
  { slug: 'birthday', label: 'Birthday' },
  { slug: 'eidmubarak', label: 'Eid Mubarak' },
  { slug: 'mothersday', label: 'Mother\'s Day' },
  { slug: 'anniversary', label: 'Anniversary' },
  { slug: 'love', label: 'Love' },
  { slug: 'thankyou', label: 'Thank You' },
  { slug: 'wedding', label: 'Wedding' },
  { slug: 'graduation', label: 'Graduation' },
  { slug: 'baby', label: 'Baby' },
  { slug: 'congratulations', label: 'Congratulations' },
  { slug: 'goodluck', label: 'Good Luck' },
  { slug: 'sorry', label: 'Sorry' },
  { slug: 'christmas', label: 'Christmas' },
  { slug: 'valentine', label: 'Valentine' },
  { slug: 'goodmorning', label: 'Good Morning' },
  { slug: 'goodnight', label: 'Good Night' },
  { slug: 'teacher', label: 'Teacher' },
  { slug: 'easter', label: 'Easter' },
  { slug: 'womensday', label: 'Women\'s Day' },
]

// 记录搜索不存在的生成器类型
async function reportMissingGenerator(searchTerm: string) {
  try {
    const response = await fetch('/api/report-missing-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchTerm }),
    })

    if (!response.ok) {
      throw new Error('Failed to report missing generator')
    }
    return response.json()
  } catch (error) {
    console.error('Error reporting missing generator:', error)
    return { success: false }
  }
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredGenerators, setFilteredGenerators] = useState(GENERATORS)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hasExactMatch, setHasExactMatch] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // 检查用户是否为Premium会员
  const isPremiumUser = session?.user?.plan === "PREMIUM"

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
    setSearchTerm('')
    setShowComingSoon(false)
  }, [pathname])

  // 监听认证状态
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [status])

  // 处理搜索输入变化
  useEffect(() => {
    // 清除前一个定时器
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    if (searchTerm) {
      const filtered = GENERATORS.filter(generator =>
        generator.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        generator.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )

      setFilteredGenerators(filtered)

      // 检查是否有完全匹配
      const exactMatch = GENERATORS.some(g =>
        g.label.toLowerCase() === searchTerm.toLowerCase() ||
        g.slug.toLowerCase() === searchTerm.toLowerCase()
      )

      setHasExactMatch(exactMatch)

      // 设置定时器，当用户停止输入3秒后，如果没有匹配项且输入长度足够，自动上报
      if (filtered.length === 0 && searchTerm.length >= 3) {
        const timeout = setTimeout(() => {
          // 只有当搜索框仍然打开且内容未变时才上报
          if (isSearchOpen && searchTerm.length >= 3) {
            reportMissingGenerator(searchTerm)
          }
        }, 3000)

        setTypingTimeout(timeout)
      }
    } else {
      setFilteredGenerators(GENERATORS) // Show all generators as recommendations
      setHasExactMatch(false)
    }

    // 清除Coming Soon提示
    setShowComingSoon(false)

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [searchTerm, isSearchOpen])

  // 点击外部关闭搜索
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // 如果有匹配的生成器，导航到第一个匹配的生成器
    if (filteredGenerators.length > 0) {
      window.location.href = `/${filteredGenerators[0].slug}/`
      return
    }

    // 如果没有匹配项，显示Coming Soon信息
    if (searchTerm.length >= 2) {
      handleRequestGenerator()
    }
  }

  const handleRequestGenerator = async () => {
    if (!searchTerm || searchTerm.length < 2 || isSubmitting) return

    setIsSubmitting(true)

    try {
      await reportMissingGenerator(searchTerm)
      setShowComingSoon(true)

      // 清空搜索框，但保持聚焦
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    } catch (error) {
      console.error('Error requesting generator:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      await signIn('google', { callbackUrl: window.location.href })
    } catch (error) {
      console.error('Login failed:', error)
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await signOut({ callbackUrl: window.location.href })
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100/50 bg-white/80 backdrop-blur-xl transition-all duration-300">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="MewTruCard Logo"
                width={40}
                height={40}
                className="drop-shadow-sm"
              />
            </div>
            <SparklesText
              text='MewTruCard'
              className="text-2xl font-caveat font-bold text-gray-800"
              sparklesCount={12}
              colors={{ first: "#FF6B6B", second: "#FFD700" }}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-primary font-quicksand font-medium transition-colors text-base relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
              Home
            </Link>

            <Link href="/cards/" className="text-gray-600 hover:text-primary font-quicksand font-medium transition-colors text-base relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
              Generators
            </Link>

            <Link href="/card-gallery/" className="text-gray-600 hover:text-primary font-quicksand font-medium transition-colors text-base relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
              Gallery
            </Link>

            <Link href="/my-cards/" className="text-gray-600 hover:text-primary font-quicksand font-medium transition-colors text-base relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
              My Cards
            </Link>

            {/* Search Icon & Dropdown */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-orange-50 transition-colors"
                aria-label="Search generators"
              >
                <Search className="h-5 w-5" />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-4 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <form onSubmit={handleSearch} className="p-4 border-b border-orange-50">
                    <div className="relative">
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for specialized cards..."
                        className="pl-10 pr-4 py-6 w-full bg-orange-50/50 border-orange-100 focus:ring-primary/20 focus:border-primary rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <button
                        type="submit"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                        aria-label="Search"
                      >
                        <SendHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </form>

                  <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
                    {showComingSoon ? (
                      <div className="px-4 py-8 text-center bg-orange-50/30 rounded-xl mx-2">
                        <div className="text-primary font-caveat text-xl mb-2">
                          Thanks for your suggestion!
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          &quot;{searchTerm}&quot; generator is coming soon.
                        </div>
                        <Link
                          href="/cards/"
                          className="text-sm text-primary hover:underline font-medium"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          Browse all available generators
                        </Link>
                      </div>
                    ) : filteredGenerators.length > 0 ? (
                      <div className="grid grid-cols-1 gap-1">
                        {filteredGenerators.map((generator) => (
                          <Link
                            key={generator.slug}
                            href={`/${generator.slug}/`}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary rounded-xl transition-colors group"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-200 group-hover:bg-primary mr-3 transition-colors"></span>
                            {generator.label}
                          </Link>
                        ))}
                      </div>
                    ) : searchTerm.length >= 2 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="text-sm text-gray-500 mb-4">
                          No matching generators found
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-primary border-primary/20 hover:bg-orange-50 hover:text-primary hover:border-primary"
                          onClick={handleRequestGenerator}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-3 w-3 mr-2" />
                          )}
                          Request &quot;{searchTerm}&quot; generator
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-3 border-t border-orange-50 bg-orange-50/20">
                    <Link
                      href="/cards/"
                      className="block px-4 py-2 text-sm text-center text-primary hover:bg-orange-100/50 rounded-lg font-medium transition-colors"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      View all generators
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {!isPremiumUser && <PremiumButton />}
            {isPremiumUser && <SubscriptionButton />}

            {status === 'authenticated' && session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    {session.user?.image && (
                      <div className={cn(
                        "relative",
                        isPremiumUser && "ring-2 ring-primary ring-offset-2 rounded-full"
                      )}>
                        <Image
                          src={session.user.image}
                          alt={session.user.name || ''}
                          width={32}
                          height={32}
                          className={cn(
                            "rounded-full border border-gray-100",
                            isPremiumUser && "border-2 border-white"
                          )}
                        />
                        {isPremiumUser && (
                          <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                            <Crown className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white/95 backdrop-blur shadow-xl border-orange-100">
                  <DropdownMenuItem className="focus:bg-orange-50 rounded-xl cursor-default">
                    <div className="flex flex-col text-sm">
                      <span className="font-semibold text-gray-800">{session.user?.name}</span>
                      {isPremiumUser && (
                        <span className="flex items-center mt-1 text-xs text-primary font-medium">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium user
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <div className="my-1 border-t border-orange-50" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="focus:bg-red-50 focus:text-red-600 rounded-xl cursor-pointer p-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Signing out...
                      </>
                    ) : (
                      'Sign Out'
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <WarmButton
                variant="outline"
                onClick={handleLogin}
                disabled={isLoading}
                className="rounded-full border-gray-200 text-gray-600 hover:text-primary hover:border-primary/20 hover:bg-orange-50 px-6 h-10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </WarmButton>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-500 p-2 rounded-full hover:bg-orange-50 active:bg-orange-100 transition-colors"
              aria-label="Search generators"
            >
              <Search className="h-6 w-6" />
            </button>

            <button
              aria-label="Toggle menu"
              className="text-gray-600 relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-50 active:bg-orange-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-6 h-6">
                <Menu className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                <X className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
              </div>
            </button>
          </div>
        </div>

        {isSearchOpen && isMobile && (
          <div className="mt-2 md:hidden animate-in slide-in-from-top-4 duration-300 pb-4" ref={searchRef}>
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search generators..."
                  className="pl-10 pr-10 py-3 w-full bg-orange-50/80 border-orange-100 focus:ring-primary focus:border-primary rounded-xl h-12 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-primary active:scale-95 transition-transform"
                >
                  <SendHorizontal className="h-5 w-5" />
                </button>
              </div>
            </form>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
              {showComingSoon ? (
                 <div className="p-6 text-center">
                  <div className="text-primary font-medium mb-2">
                    Thanks for your suggestion!
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    &quot;{searchTerm}&quot; generator is coming soon.
                  </div>
                  <Link
                    href="/cards/"
                    className="block w-full py-3 text-center text-primary font-medium border border-orange-100 rounded-xl hover:bg-orange-50 active:scale-[0.98] transition-all"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    Browse all available generators
                  </Link>
                </div>
              ) : filteredGenerators.length > 0 ? (
                <div className="max-h-[60vh] overflow-y-auto">
                  {filteredGenerators.map((generator) => (
                    <Link
                      key={generator.slug}
                      href={`/${generator.slug}/`}
                      className="flex items-center px-5 py-4 text-base text-gray-700 border-b border-orange-50 last:border-0 active:bg-orange-50"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-200 mr-4"></span>
                      {generator.label}
                    </Link>
                  ))}
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="p-6 text-center">
                  <div className="text-gray-500 mb-4">
                    No matching generators found
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full py-6 text-primary border-primary/20 hover:bg-orange-50 hover:border-primary"
                    onClick={handleRequestGenerator}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Request &quot;{searchTerm}&quot; generator
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {isMenuOpen && (
          <div className="md:hidden py-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col space-y-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-orange-100 p-4 shadow-lg">
              <Link href="/" className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-xl transition-colors font-medium text-lg">
                Home
              </Link>
              <Link href="/cards/" className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-xl transition-colors font-medium text-lg">
                Generators
              </Link>
              <Link href="/card-gallery/" className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-xl transition-colors font-medium text-lg">
                Gallery
              </Link>
              <Link href="/my-cards/" className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-xl transition-colors font-medium text-lg">
                My Cards
              </Link>

              <div className="my-2 border-t border-orange-100/50"></div>

              {status === 'authenticated' && session ? (
                <div className="pt-2">
                  <div className="flex items-center px-4 py-3 mb-2 bg-orange-50/50 rounded-xl">
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || ''}
                        width={40}
                        height={40}
                        className="rounded-full border border-white shadow-sm mr-3"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{session.user?.name}</span>
                      {isPremiumUser && (
                        <span className="text-xs text-primary font-medium flex items-center">
                          <Crown className="h-3 w-3 mr-1" /> Premium Member
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    {!isPremiumUser ? (
                      <div className="w-full"><PremiumButton /></div>
                    ) : (
                      <div className="w-full"><SubscriptionButton /></div>
                    )}
                    
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-12 text-base"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Signing out...
                        </>
                      ) : (
                        'Sign Out'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex flex-col gap-3">
                  <WarmButton
                    variant="outline"
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl h-12 text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </WarmButton>
                  
                  <div className="w-full">
                    <PremiumButton />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export { Header }
