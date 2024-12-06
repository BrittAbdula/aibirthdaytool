// app/generators/page.tsx

import { Metadata } from "next";
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Card Generators | MewTruCard",
  description: "Create personalized greeting cards with our AI-powered card generators",
};

interface TrendingCard {
  image: string
  title: string
  link: string
}

const trendingCards: TrendingCard[] = [
  {
    image: '/card/christmas.svg',
    title: 'Christmas Card',
    link: '/christmas/'
  },
  {
    image: '/card/love.svg',
    title: 'Love Card',
    link: '/love/'
  },
  {
    image: '/card/sorry.svg',
    title: 'Sorry Card',
    link: '/sorry/'
  },
  {
    image: '/card/anniversary.svg',
    title: 'Anniversary Card',
    link: '/anniversary/'
  },
  {
    image: '/card/birthday.svg',
    title: 'Birthday Card',
    link: '/birthday/'
  },
  {
    image: '/card/congratulations.svg',
    title: 'Congratulations Card',
    link: '/congratulations/'
  },
  {
    image: '/card/thankyou.svg',
    title: 'Thank You Card',
    link: '/thankyou/'
  },
  {
    image: '/card/holiday.svg',
    title: 'Holiday Card',
    link: '/holiday/'
  },
]

export default function GeneratorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Card <span className="text-purple-600">Generators</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose a card type to start creating your personalized message
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trendingCards.map((card, index) => (
            <Link 
              href={card.link} 
              key={index} 
              className="group block"
            >
              <div className="bg-purple-100 rounded-lg p-4 transition-all duration-300 group-hover:shadow-lg h-full">
                <div className="relative w-full pb-[133.33%] mb-4">
                  <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-105">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="rounded-md object-contain"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{card.title}</h3>
                  <p className="text-sm text-gray-600">
                    Create personalized {card.title.toLowerCase()}
                  </p>
                  <button className="w-full py-2 text-sm text-purple-600 border border-purple-300 rounded-full hover:bg-purple-200 transition-colors">
                    Start Creating →
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Why Choose Our Generators</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">✨</span>
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Smart message generation for every occasion
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Instant Creation</h3>
              <p className="text-gray-600 text-sm">
                Create beautiful cards in seconds
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🎨</span>
              </div>
              <h3 className="font-semibold mb-2">Beautiful Designs</h3>
              <p className="text-gray-600 text-sm">
                Professional templates for every card
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}