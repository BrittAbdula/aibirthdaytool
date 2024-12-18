'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SparklesText from '@/components/ui/sparkles-text'
import { Menu, X } from "lucide-react"

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Home</Link>
            <Link href="/cards" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Card Generators</Link>
            <Link href="/card-gallery" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Gallery</Link>
          </div>
          {/* <Link href="/" className="hidden md:inline-block bg-[#FFC0CB] text-[#4A4A4A] px-4 py-2 rounded-md hover:bg-[#FFD1DC] font-serif">
            Login
          </Link> */}
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
        {isMenuOpen && (
          <div className="mt-4 md:hidden">
            <Link href="/" className="block py-2 px-4 w-full text-right text-[#4A4A4A] hover:text-[#FFC0CB] hover:bg-gray-50 font-serif">Home</Link>
            <Link href="/cards" className="block py-2 px-4 w-full text-right text-[#4A4A4A] hover:text-[#FFC0CB] hover:bg-gray-50 font-serif">Card Generators</Link>
            <Link href="/card-gallery" className="block py-2 px-4 w-full text-right text-[#4A4A4A] hover:text-[#FFC0CB] hover:bg-gray-50 font-serif">Gallery</Link>
            {/* <Link href="/" className="block py-2 px-4 w-full text-right text-[#4A4A4A] hover:text-[#FFC0CB] hover:bg-gray-50 font-serif">Login</Link> */}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
