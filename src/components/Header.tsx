'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import SparklesText from '@/components/ui/sparkles-text'
import { Menu, X, ChevronDown, Loader2 } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

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
          <Link href="/cards/" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Generators</Link>
            <Link href="/card-gallery/" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Templates</Link>
            <Link href="/my-cards/" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">My Cards</Link>
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
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </span>
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
            <Link href="/" className="block py-2 px-4 w-full text-right text-[#4A4A4A] hover:text-[#FFC0CB] hover:bg-gray-50 font-serif">Home</Link>
            <Link href="/cards/" className="block py-2 px-4 w-full text-right text-[#4A4A4A] hover:text-[#FFC0CB] hover:bg-gray-50 font-serif">Card Generators</Link>
            <Link href="/card-gallery/" className="block py-2 px-4 w-full text-right text-[#4A4A4A] hover:text-[#FFC0CB] hover:bg-gray-50 font-serif">Templates</Link>
            <Link href="/my-cards/" className="block py-2 px-4 w-full text-right text-[#4A4A4A] hover:text-[#FFC0CB] hover:bg-gray-50 font-serif">My Cards</Link>
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
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </span>
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
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export { Header }
