'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SparklesText from '@/components/ui/sparkles-text'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-[#FFF9F0] border-b border-[#FFC0CB] py-4">
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
            <Link href="/cards" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Cards</Link>
            <Link href="/card-gallery" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Gallery</Link>
          </div>
          {/* <Link href="/" className="hidden md:inline-block bg-[#FFC0CB] text-[#4A4A4A] px-4 py-2 rounded-md hover:bg-[#FFD1DC] font-serif">
            Login
          </Link> */}
          <button 
            className="md:hidden text-[#4A4A4A]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        {isMenuOpen && (
          <div className="mt-4 md:hidden">
            <Link href="/" className="block py-2 text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Home</Link>
            <Link href="/cards" className="block py-2 text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Cards</Link>
            <Link href="/card-gallery" className="block py-2 text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Gallery</Link>
            {/* <Link href="/" className="block py-2 text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Login</Link> */}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
