// app/generators/page.tsx

import { Metadata } from "next";
import Image from 'next/image'
import Link from 'next/link'
import { getAllCardPreviews } from '@/lib/card-config'
import { PlusIcon } from '@radix-ui/react-icons'

export const metadata: Metadata = {
  title: "Card Generators | MewTruCard",
  description: "Create personalized greeting cards with our AI-powered card generators",
};

export default async function GeneratorsPage() {
  const allGenerators = await getAllCardPreviews();
  
  // 分离官方和用户生成器
  const officialGenerators = allGenerators.filter(gen => gen.isSystem);
  const communityGenerators = allGenerators.filter(gen => !gen.isSystem);

  // 渲染生成器卡片的组件
  const GeneratorCard = ({ card }: { card: any }) => (
    <Link href={card.link} className="group block">
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
          <h3 className="text-lg font-medium text-center">{card.title}</h3>
          <p className="text-sm text-gray-600 text-center">
            {/* Create personalized {card.title.toLowerCase()} */}
            {card.description}
          </p>
          <button className="w-full py-2 text-sm text-purple-600 border border-purple-300 rounded-full hover:bg-purple-200 transition-colors">
            Start Creating →
          </button>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 -left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Card Generators
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-6">
            Choose a card type to start creating your personalized message ✨
          </p>
          <Link 
            href="/create-generator" 
            className="inline-flex items-center px-4 py-2 bg-[#FFC0CB] text-[#4A4A4A] rounded-full hover:bg-[#FFD1DC] transition-colors"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Your Own Generator
          </Link>
        </div>

        {/* Official Generators Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-[#4A4A4A]">
            Official Generators
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {officialGenerators.map((card, index) => (
              <GeneratorCard key={index} card={card} />
            ))}
          </div>
        </section>

        {/* Community Generators Section */}
        {communityGenerators.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-[#4A4A4A] flex items-center">
              Community Generators
              <span className="ml-3 text-sm font-normal text-gray-500">
                Created by our community
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {communityGenerators.map((card, index) => (
                <GeneratorCard key={index} card={card} />
              ))}
            </div>
          </section>
        )}
        <div className="mb-16 items-center flex justify-center space-x-4">
          <button className="bg-[#FFC0CB] text-white px-8 py-3 rounded-full hover:bg-pink-400 transition">
            <a href="/create-generator">Create Your Generator</a>
          </button>
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