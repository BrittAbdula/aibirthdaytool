'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import SparklesText from '@/components/ui/sparkles-text'
import { Menu, X, ChevronDown, Loader2, Crown } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CardTypeOption } from '@/lib/card-constants'
import { PremiumButton } from '@/components/PremiumModal'

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

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isGeneratorMenuOpen, setIsGeneratorMenuOpen] = useState(false)

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
  }, [pathname])

  // 监听认证状态
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [status])

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
            
            {/* Premium Button - Always visible */}
            <PremiumButton />
            
            {status === 'authenticated' && session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 hover:opacity-80">
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || ''}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <div className="text-center text-sm font-medium text-gray-700">
                    {session.user?.name}
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

          {/* Mobile Menu Button */}
          <button 
            aria-label="Toggle menu"
            className="md:hidden text-[#4A4A4A] relative w-6 h-6"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="absolute inset-0 transition-transform duration-300 ease-in-out">
              <Menu className={`h-6 w-6 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
              <X className={`h-6 w-6 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
            </div>
          </button>
        </div>

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
                    <Image
                      src={session.user.image}
                      alt={session.user.name || ''}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <div className="text-center text-sm font-medium text-gray-700">
                    {session.user?.name}
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
                  
                  {/* Premium Button - Mobile */}
                  <Button 
                    onClick={() => setIsMenuOpen(false)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-1 text-white bg-purple-600 hover:bg-purple-700 border-purple-600"
                  >
                    <Crown className="h-4 w-4" />
                    <span>Premium</span>
                  </Button>
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
