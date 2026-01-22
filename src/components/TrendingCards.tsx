'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TrendingCard {
  images: string[]
  title: string
  link: string
}

const trendingCards: TrendingCard[] = [
  {
    images: ['/card/birthday.svg', '/card/birthday_1.png', '/card/birthday_2.png', '/card/birthday_3.png', '/card/birthday_4.png'],
    title: 'Birthday',
    link: '/birthday/'
  },
  {
    images: ['/card/sorry.svg','https://store.celeprime.com/cards/2025/05/23/29bb5a93-fd90-45e2-8af6-4bec972a38b2.svg','https://store.celeprime.com/cards/2025/05/20/3b97f9b0-8baa-4c4f-a32f-a0edc342746c.svg'],
    title: 'Sorry',
    link: '/sorry/'
  },
  {
    images: ['/card/anniversary.svg'],
    title: 'Anniversary',
    link: '/anniversary/'
  },
  {
    images: ['/card/christmas.svg'],
    title: 'Christmas',
    link: '/christmas/'
  },
  {
    images: ['/card/newyear.svg'],
    title: 'New Year',
    link: '/newyear/'
  },
  {
    images: ['/card/love.svg'],
    title: 'Love',
    link: '/love/'
  },
  {
    images: ['/card/thankyou.svg'],
    title: 'Thank You',
    link: '/thankyou/'
  },
  {
    images: ['/card/congratulations.svg'],
    title: 'Congratulations',
    link: '/congratulations/'
  },
  {
    images: ['/card/holiday.svg'],
    title: 'Holiday',
    link: '/holiday/'
  }
]

const CardImage = ({ images, title }: { images: string[], title: string }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
        setIsTransitioning(false)
      }, 50)
    }, 2500) // Slower rotation for calmer feel

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="relative w-full pb-[133.33%] mb-3 overflow-hidden rounded-xl bg-white shadow-sm border border-orange-50">
      <div className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}>
        <Image
          src={images[currentImageIndex]}
          alt={title}
          fill
          className="object-contain p-2 hover:scale-105 transition-transform duration-500"
        />
      </div>
    </div>
  )
}

export const TrendingCards = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const scrollAmount = 300
    const container = scrollContainerRef.current
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative py-8">
      <div className="flex justify-between items-end mb-8 px-4">
        <h2 className="text-3xl font-caveat font-bold text-gray-800">
          Trending <span className="text-primary">Now</span>
        </h2>
        <div className="hidden md:flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-orange-100 bg-white hover:bg-orange-50 text-gray-600 hover:text-primary transition-colors focus:outline-none"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-orange-100 bg-white hover:bg-orange-50 text-gray-600 hover:text-primary transition-colors focus:outline-none"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef} 
        className="overflow-x-auto scrollbar-hide scroll-smooth pb-8 px-1"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        <div className="flex space-x-6 min-w-max px-4">
          {trendingCards.map((card, index) => (
            <Link href={card.link} key={index} className="group flex-shrink-0 w-64 md:w-72">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 hover:border-orange-200 transition-all duration-300 hover:shadow-warm hover:-translate-y-1">
                <CardImage images={card.images} title={card.title} />
                <p className="text-center font-caveat font-bold text-xl text-gray-700 group-hover:text-primary transition-colors">{card.title} Card</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}