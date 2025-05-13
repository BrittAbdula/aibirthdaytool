'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import SparklesText from '@/components/ui/sparkles-text'
import { Menu, X, ChevronDown, Loader2, Crown, Search, SendHorizontal, Plus } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { CardTypeOption } from '@/lib/card-constants'
import { PremiumButton } from '@/components/PremiumModal'
import { cn } from '@/lib/utils'

// 定义生成器类型
const GENERATORS = [
  { slug: 'birthday', label: 'Birthday' },
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
  const [isGeneratorMenuOpen, setIsGeneratorMenuOpen] = useState(false)
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
      setFilteredGenerators(GENERATORS.slice(0, 8)) // 只显示前8个作为推荐
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
    <header className="bg-gradient-to-b from-white via-purple-50/50 to-white border-b border-purple-100/50 py-4">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="MewTruCard Logo"
              width={40}
              height={40}
            />
            <SparklesText
              text='MewTruCard.com'
              className="text-xl md:text-2xl font-serif font-bold text-[#4A4A4A]"
              sparklesCount={20}
              colors={{ first: "#A07CFE", second: "#FE8FB5" }}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Home</Link>

            {/* Generators Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif flex items-center"
                onMouseEnter={() => !isMobile && setIsGeneratorMenuOpen(true)}
                onMouseLeave={() => !isMobile && setIsGeneratorMenuOpen(false)}
              >
                Generators <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[280px] p-2"
                onMouseEnter={() => !isMobile && setIsGeneratorMenuOpen(true)}
                onMouseLeave={() => !isMobile && setIsGeneratorMenuOpen(false)}
              >
                <div className="grid grid-cols-2 gap-1">
                  <DropdownMenuItem asChild className="col-span-2">
                    <Link href="/cards/" className="w-full font-medium text-[#4A4A4A]">
                      All Generators
                    </Link>
                  </DropdownMenuItem>
                  {GENERATORS.map((generator) => (
                    <DropdownMenuItem key={generator.slug} asChild>
                      <Link href={`/${generator.slug}/`} className="w-full">
                        {generator.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Gallery Link */}
            <Link href="/card-gallery/" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Gallery</Link>

            <Link href="/my-cards/" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">My Cards</Link>

            {/* Search Icon & Dropdown */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-[#4A4A4A] hover:text-[#FFC0CB] p-1 rounded-full hover:bg-purple-50 transition-colors"
                aria-label="Search generators"
              >
                <Search className="h-5 w-5" />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-purple-100 overflow-hidden z-50">
                  <form onSubmit={handleSearch} className="p-3 border-b border-purple-50">
                    <div className="relative">
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Search generators..."
                        className="pl-9 pr-4 py-2 w-full bg-purple-50/30 border-purple-100 focus:ring-purple-300 focus:border-purple-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                      <button
                        type="submit"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700"
                        aria-label="Search"
                      >
                        <SendHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </form>

                  <div className="max-h-64 overflow-y-auto p-1">
                    {showComingSoon ? (
                      <div className="px-4 py-6 text-center">
                        <div className="text-purple-600 font-medium mb-2">
                          Thanks for your suggestion!
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          &quot;{searchTerm}&quot; generator is coming soon.
                        </div>
                        <Link
                          href="/cards/"
                          className="text-sm text-purple-700 hover:underline"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          Browse all available generators
                        </Link>
                      </div>
                    ) : filteredGenerators.length > 0 ? (
                      filteredGenerators.map((generator) => (
                        <Link
                          key={generator.slug}
                          href={`/${generator.slug}/`}
                          className="block px-4 py-2 text-sm text-[#4A4A4A] hover:bg-purple-50 rounded-md"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          {generator.label}
                        </Link>
                      ))
                    ) : searchTerm.length >= 2 ? (
                      <div className="px-4 py-3 text-center">
                        <div className="text-sm text-gray-500 mb-3">
                          No matching generators found
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-300 hover:bg-purple-50"
                          onClick={handleRequestGenerator}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Plus className="h-3 w-3 mr-1" />
                          )}
                          Request &quot;{searchTerm}&quot; generator
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-2 border-t border-purple-50 bg-purple-50/30">
                    <Link
                      href="/cards/"
                      className="block px-4 py-2 text-sm text-center text-purple-700 hover:bg-purple-100 rounded-md font-medium"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      View all generators
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Premium Button - Only show for non-premium users */}
            {!isPremiumUser && <PremiumButton />}

            {status === 'authenticated' && session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 hover:opacity-80">
                    {session.user?.image && (
                      <div className={cn(
                        "relative",
                        isPremiumUser && "ring-2 ring-purple-500 ring-offset-2 rounded-full"
                      )}>
                        <Image
                          src={session.user.image}
                          alt={session.user.name || ''}
                          width={32}
                          height={32}
                          className={cn(
                            "rounded-full",
                            isPremiumUser && "border-2 border-white"
                          )}
                        />
                        {isPremiumUser && (
                          <div className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                            <Crown className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <div className="text-center text-sm font-medium text-gray-700">
                      {session.user?.name}
                      {isPremiumUser && (
                        <div className="flex items-center justify-center mt-1 text-xs text-purple-600">
                          <Crown className="h-3 w-3 mr-1" />
                          <span>Premium user</span>
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="relative"
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
              <Button
                variant="outline"
                onClick={handleLogin}
                disabled={isLoading}
                className="text-[#4A4A4A] hover:text-[#FFC0CB] relative"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button and Search */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Search Icon - Mobile */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-[#4A4A4A] p-1 rounded-full hover:bg-purple-50/50"
              aria-label="Search generators"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              aria-label="Toggle menu"
              className="text-[#4A4A4A] relative w-6 h-6"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="absolute inset-0 transition-transform duration-300 ease-in-out">
                <Menu className={`h-6 w-6 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                <X className={`h-6 w-6 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && isMobile && (
          <div className="mt-4 md:hidden" ref={searchRef}>
            <form onSubmit={handleSearch} className="mb-2">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search generators..."
                  className="pl-9 pr-10 py-2 w-full bg-purple-50/30 border-purple-100 focus:ring-purple-300 focus:border-purple-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700"
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </form>

            {showComingSoon ? (
              <div className="bg-white rounded-lg shadow border border-purple-100 overflow-hidden p-4 text-center">
                <div className="text-purple-600 font-medium mb-2">
                  Thanks for your suggestion!
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  &quot;{searchTerm}&quot; generator is coming soon.
                </div>
                <Link
                  href="/cards/"
                  className="text-sm text-purple-700 hover:underline"
                  onClick={() => setIsSearchOpen(false)}
                >
                  Browse all available generators
                </Link>
              </div>
            ) : filteredGenerators.length > 0 ? (
              <div className="bg-white rounded-lg shadow border border-purple-100 overflow-hidden">
                <div className="max-h-64 overflow-y-auto p-1">
                  {filteredGenerators.map((generator) => (
                    <Link
                      key={generator.slug}
                      href={`/${generator.slug}/`}
                      className="block px-4 py-2 text-sm text-[#4A4A4A] hover:bg-purple-50 rounded-md"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      {generator.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="bg-white rounded-lg shadow border border-purple-100 overflow-hidden p-4 text-center">
                <div className="text-sm text-gray-500 mb-3">
                  No matching generators found
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  onClick={handleRequestGenerator}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Plus className="h-3 w-3 mr-1" />
                  )}
                  Request &quot;{searchTerm}&quot; generator
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 md:hidden">
            <Link href="/" className="block py-2.5 px-4 w-full text-right text-[#4A4A4A] hover:text-[#FFC0CB] hover:bg-gray-50 font-serif">Home</Link>

            {/* Generators Section - Mobile */}
            <div className="border-y border-purple-100/50 my-2 bg-purple-50/30">
              <div className="py-2 px-4">
                <div className="text-right font-serif text-[#4A4A4A] mb-2">Generators</div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/cards/"
                    className="block py-1.5 px-3 text-right text-[#4A4A4A]/80 hover:text-[#FFC0CB] hover:bg-white/50 rounded-md text-sm col-span-2 font-medium">
                    All Generators
                  </Link>
                  {GENERATORS.map((generator) => (
                    <Link
                      key={generator.slug}
                      href={`/${generator.slug}/`}
                      className="block py-1.5 px-3 text-right text-[#4A4A4A]/80 hover:text-[#FFC0CB] hover:bg-white/50 rounded-md text-sm"
                    >
                      {generator.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Gallery Link - Mobile */}
            <Link href="/card-gallery/" className="block py-2.5 px-4 w-full text-right text-[#4A4A4A] hover:text-[#FFC0CB] hover:bg-gray-50 font-serif">Gallery</Link>

            <Link href="/my-cards/" className="block py-2.5 px-4 w-full text-right text-[#4A4A4A] hover:text-[#FFC0CB] hover:bg-gray-50 font-serif">My Cards</Link>

            {status === 'authenticated' && session ? (
              <div className="p-4 border-t">
                <div className="flex items-center justify-end space-x-2 mb-2">
                  {session.user?.image && (
                    <div className={cn(
                      "relative",
                      isPremiumUser && "ring-2 ring-purple-500 ring-offset-1 rounded-full"
                    )}>
                      <Image
                        src={session.user.image}
                        alt={session.user.name || ''}
                        width={24}
                        height={24}
                        className={cn(
                          "rounded-full",
                          isPremiumUser && "border border-white"
                        )}
                      />
                      {isPremiumUser && (
                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full w-3 h-3 flex items-center justify-center">
                          <Crown className="h-2 w-2" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-center text-sm font-medium text-gray-700">
                    {session.user?.name}
                    {isPremiumUser && (
                      <div className="flex items-center justify-end mt-1 text-xs text-purple-600">
                        <Crown className="h-2 w-2 mr-1" />
                        <span>Premium</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full text-[#4A4A4A] hover:text-[#FFC0CB]"
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
            ) : (
              <div className="p-4 border-t">
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full text-[#4A4A4A] hover:text-[#FFC0CB]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                  
                  {/* Premium Button - Mobile (only if not premium) */}
                  {!isPremiumUser && (
                    <Button
                      onClick={() => setIsMenuOpen(false)}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-1 text-white bg-purple-600 hover:bg-purple-700 border-purple-600"
                    >
                      <Crown className="h-4 w-4" />
                      <span>Premium</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export { Header }
