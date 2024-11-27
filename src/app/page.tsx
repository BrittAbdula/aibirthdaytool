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
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-8 sm:mb-12 text-[#4A4A4A]">MewTruCard Generator</h1>
      <CardGenerator wishCardType="birthday" initialCardId="1" initialSVG="" />
      <TrendingCards />
      <h2 className="text-3xl font-bold mb-12 text-center">
        Use <span className="text-purple-600">Templates</span>
      </h2>
      <Suspense fallback={<div>Loading...</div>}>
        <CardMarquee wishCardType="birthday" initialCardsData={initialCardsData} />
      </Suspense>
      <HowToUse />
      <WhyChooseMewTruCard />
    </main>
  );
}