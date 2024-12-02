import { Metadata } from "next";
import CardGenerator from "@/components/CardGenerator";
import { HowToUse } from "@/components/HowToUse";
import { WhyChooseMewTruCard } from "@/components/WhyChooseMewTruCard";
import { TrendingCards } from "@/components/TrendingCards";
import { Suspense } from 'react';
import CardMarquee from '@/components/CardMarquee';
import { getRecentCardsServer } from '@/lib/cards';


export const metadata: Metadata = {
  title: "MewTruCard - AI Greeting Card Generator",
  description: "Create personalized cards for birthdays, love, holidays, and more with MewTruCard's AI-powered generator. Easy to use with a variety of beautiful templates.",
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 300; // 每5分钟重新验证页面

export default async function Home() {
  const initialCardsData = await getRecentCardsServer(1, 12, "");
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 py-12 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Main content */}
        <div className="relative">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-center mb-4 text-[#4A4A4A] tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              MewTruCard
            </span>
          </h1>
          <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto font-light">
            Create magical moments with AI-powered greeting cards that speak from the heart
          </p>
          
          <div className="mb-16">
            <CardGenerator wishCardType="birthday" initialCardId="1" initialSVG="" />
          </div>

          <div className="space-y-24">
            <section className="relative">
              <TrendingCards />
            </section>

            <section className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
                Explore Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Templates</span>
              </h2>
              <Suspense fallback={
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              }>
                <CardMarquee wishCardType="birthday" initialCardsData={initialCardsData} />
              </Suspense>
            </section>

            <section className="relative backdrop-blur-sm bg-white/30 rounded-2xl p-8 shadow-lg">
              <HowToUse />
            </section>

            <section className="relative backdrop-blur-sm bg-white/30 rounded-2xl p-8 shadow-lg">
              <WhyChooseMewTruCard />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}