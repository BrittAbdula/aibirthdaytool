// app/generators/page.tsx

import { Metadata } from "next";
import Image from 'next/image'
import Link from 'next/link'
import { getAllCardPreviews } from '@/lib/card-config'
import ViralMicrositeGrid from '@/components/viral/ViralMicrositeGrid'

export const metadata: Metadata = {
  title: "Card Generators | Birthday, Valentine, Sorry & More - MewTruCard",
  description: "Browse MewTruCard generators with a birthday-first path, plus valentine, sorry, anniversary, thank-you, and interactive microsite experiences for shareable moments.",
};

export default async function GeneratorsPage() {
  let allGenerators: Awaited<ReturnType<typeof getAllCardPreviews>> = [];
  try {
    allGenerators = await getAllCardPreviews();
  } catch (error) {
    console.error('Failed to load generators', error);
  }
  
  // 分离官方和用户生成器
  const featuredSlugs = ['birthday', 'valentine', 'sorry', 'anniversary', 'thankyou', 'love'];
  const officialGenerators = allGenerators.filter(gen => gen.isSystem);
  const featuredGenerators = featuredSlugs
    .map((slug) => officialGenerators.find((generator) => generator.link === `/${slug}/`))
    .filter((generator): generator is NonNullable<typeof officialGenerators[number]> => Boolean(generator));
  const remainingOfficialGenerators = officialGenerators.filter(
    (generator) => !featuredGenerators.some((featured) => featured.link === generator.link)
  );
  const communityGenerators = allGenerators.filter(gen => !gen.isSystem).slice(0, 8);
  // 渲染生成器卡片的组件
  const GeneratorCard = ({ card }: { card: any }) => (
    <Link href={card.link} className="group block">
      <div className="h-full rounded-[24px] border border-white/70 bg-white/80 p-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
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
          <h3 className="text-lg font-medium text-center text-gray-800">{card.title}</h3>
          <p className="text-sm text-gray-600 text-center min-h-10">
            {/* Create personalized {card.title.toLowerCase()} */}
            {card.description}
          </p>
          <div className="w-full rounded-full border border-purple-200 px-4 py-3 text-center text-sm font-semibold text-purple-700 transition-colors group-hover:bg-purple-50">
            Open generator
          </div>
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
            Start with birthday cards first, then branch into valentine, sorry, anniversary, and other shareable greeting card flows.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="rounded-full bg-white/80 px-3 py-2 font-medium text-purple-700 shadow-sm">Birthday-first entry point</span>
            <span className="rounded-full bg-white/80 px-3 py-2 font-medium text-purple-700 shadow-sm">Sign in to create, save, and send</span>
            <span className="rounded-full bg-white/80 px-3 py-2 font-medium text-purple-700 shadow-sm">Direct link sharing</span>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/birthday/" className="w-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] sm:w-auto">
              Start with Birthday Cards
            </Link>
            <Link href="/type/birthday/" className="w-full rounded-full border border-purple-200 bg-white/80 px-8 py-3 text-center text-sm font-semibold text-purple-700 transition hover:bg-purple-50 sm:w-auto">
              Browse Birthday Ideas
            </Link>
          </div>
        </div>

        {/* Featured Generators Section */}
        <section className="mb-16">
          <h2 className="mb-2 text-2xl font-bold text-[#4A4A4A]">
            Start Here
          </h2>
          <p className="mb-6 max-w-2xl text-sm text-gray-600">
            These are the highest-value entry points based on current search demand and sharing behavior.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
            {featuredGenerators.map((card, index) => (
              <GeneratorCard key={index} card={card} />
            ))}
          </div>
        </section>

        {/* Official Generators Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-[#4A4A4A]">
            More Official Generators
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {remainingOfficialGenerators.map((card, index) => (
              <GeneratorCard key={index} card={card} />
            ))}
          </div>
        </section>

        <div className="mb-16">
          <ViralMicrositeGrid
            title="Interactive Viral Microsites"
            description="Use reusable surprise-link pages for asks, reveals, apologies, and wedding moments, then hand users into the matching generator."
          />
        </div>

        {/* Community Generators Section */}
        {communityGenerators.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-[#4A4A4A] flex items-center">
              Community Generator Experiments
              <span className="ml-3 text-sm font-normal text-gray-500">
                Curated examples from the community
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {communityGenerators.map((card, index) => (
                <GeneratorCard key={index} card={card} />
              ))}
            </div>
          </section>
        )}
        <div className="mb-16 flex items-center justify-center space-x-4">
          <Link
            href="/create-generator"
            className="rounded-full bg-[#FFC0CB] px-8 py-3 text-white transition hover:bg-pink-400"
          >
            Create Your Generator
          </Link>
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
