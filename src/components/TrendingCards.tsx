'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'

interface TrendingCard {
  images: string[]
  title: string
  link: string
}

const trendingCards: TrendingCard[] = [
  {
    images: ['/card/birthday.svg', '/card/birthday_1.png', '/card/birthday_2.png', '/card/birthday_3.png', '/card/birthday_4.png'],
    title: 'Birthday Card',
    link: '/birthday/'
  },
  {
    images: ['/card/sorry.svg','https://store.celeprime.com/cards/2025/05/23/29bb5a93-fd90-45e2-8af6-4bec972a38b2.svg','https://store.celeprime.com/cards/2025/05/20/3b97f9b0-8baa-4c4f-a32f-a0edc342746c.svg'],
    title: 'Sorry Card',
    link: '/sorry/'
  },
  {
    images: ['/card/anniversary.svg'],
    title: 'Anniversary Card',
    link: '/anniversary/'
  },
  {
    images: ['/card/christmas.svg'],
    title: 'Christmas Card',
    link: '/christmas/'
  },
  {
    images: ['/card/newyear.svg'],
    title: 'New Year Card',
    link: '/newyear/'
  },
  {
    images: ['/card/love.svg'],
    title: 'Love Card',
    link: '/love/'
  },
  {
    images: ['/card/thankyou.svg'],
    title: 'Thank You Card',
    link: '/thankyou/'
  },
  {
    images: ['/card/congratulations.svg'],
    title: 'Congratulations Card',
    link: '/congratulations/'
  },
  {
    images: ['/card/holiday.svg'],
    title: 'Holiday Card',
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
    }, 1000)

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="relative w-full pb-[133.33%] mb-4">
      <div className={`absolute inset-0 transition-all duration-300 ease-in-out group-hover:scale-105 z-10 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}>
        <Image
          src={images[currentImageIndex]}
          alt={title}
          fill
          className="rounded-md object-contain"
        />
      </div>
      {/* Flicker effect overlay */}
      <div className={`absolute inset-0 bg-white rounded-md transition-opacity duration-150 z-20 pointer-events-none ${
        isTransitioning ? 'opacity-20' : 'opacity-0'
      }`} />
    </div>
  )
}

export const TrendingCards = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const scrollAmount = 400
    const container = scrollContainerRef.current
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="my-12 px-4">
      <h2 className="text-3xl font-bold mb-12 text-center">
        Explore what&apos;s <span className="text-purple-600">trending</span>
      </h2>
      <div className="relative overflow-hidden group">
        {/* Left scroll button */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        
        {/* Right scroll button */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide scroll-smooth">
          <div className="flex justify-start md:justify-center space-x-8 min-w-max px-4 md:px-12">
            {trendingCards.map((card, index) => (
              <Link href={card.link} key={index} className="group flex-shrink-0 w-64 md:w-72">
                <div className="bg-purple-100 rounded-lg p-4 transition-all duration-300 group-hover:shadow-lg h-full">
                  <CardImage images={card.images} title={card.title} />
                  <p className="text-center font-medium">AI {card.title} Generator</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}