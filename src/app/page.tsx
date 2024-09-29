import { Metadata } from "next";
import CardGenerator from "@/components/CardGenerator";
import { HowToUse } from "@/components/HowToUse";
import { WhyChooseMewTruCard } from "@/components/WhyChooseMewTruCard";

export const metadata: Metadata = {
  title: "MewTruCard - AI Greeting Card Generator",
  description: "Create personalized cards for birthdays, love, holidays, and more with MewTruCard's AI-powered generator. Easy to use with a variety of beautiful templates.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-8 sm:mb-12 text-[#4A4A4A]">MewTruCard Generator</h1>
      <CardGenerator wishCardType="birthday" />
      <HowToUse />
      <WhyChooseMewTruCard />
    </main>
  );
}