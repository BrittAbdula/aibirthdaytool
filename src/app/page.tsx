import { Metadata } from "next";
import Image from "next/image";
import { TrendingCards } from "@/components/TrendingCards";
import { Suspense } from 'react';
import CardMarquee from '@/components/CardMarquee';
import { Card, getRecentCardsServer } from '@/lib/cards';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CardTypeBubbles from "@/components/CardTypeBubbles";
import Link from "next/link";
import { Sparkles, Palette, Gift, Send, Download, PenTool, Search, MessageCircle, Heart } from "lucide-react";
import { WarmButton } from "@/components/ui/warm-button";
import { GlassCard } from "@/components/ui/glass-card";
import ViralMicrositeGrid from "@/components/viral/ViralMicrositeGrid";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Free AI Birthday Card Generator | Online Birthday Card Maker - MewTruCard",
  description: "Create a free online birthday card with AI, personalize the message, then download it or share a birthday card link. Explore birthday, valentine, sorry, and anniversary cards on MewTruCard.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://mewtrucard.com/",
    title: "Free AI Birthday Card Generator | MewTruCard",
    description: "Create a free online birthday card, copy a shareable link, and browse public birthday templates and viral card ideas.",
    images: [
      {
        url: "https://mewtrucard.com/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "MewTruCard Preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    creator: "@MewTruCard",
    title: "Free AI Birthday Card Generator | MewTruCard",
    description: "Create birthday cards online with AI, share them by link, and explore viral valentine, sorry, and celebration microsites.",
    images: ["https://mewtrucard.com/og-cover.jpg"]
  }
};

export const revalidate = 300; // 每5分钟重新验证页面

export default async function Home() {
  let initialCardsData: { cards: Card[]; totalPages: number } = { cards: [], totalPages: 0 };

  try {
    initialCardsData = await getRecentCardsServer(1, 12, "");
  } catch (error) {
    console.error("Failed to load homepage card data", error);
  }

  return (
    <main className="min-h-screen bg-warm-cream overflow-x-hidden">
      <div className="relative">
        {/* Decorative elements - Warm Blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-warm-peach rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-warm-rose rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-warm-coral/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-8 hover:scale-105 transition-transform duration-300">
              <a href="https://www.producthunt.com/posts/mewtrucard?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-mewtrucard" target="_blank" rel="noopener noreferrer">
                <Image
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=969395&theme=light&t=1748048449150"
                  alt="MewtruCard on Product Hunt"
                  width={250}
                  height={54}
                  unoptimized
                  className="rounded-lg shadow-sm"
                />
              </a>
            </div>
            
            <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              <span className="rounded-full bg-white/70 px-4 py-2 font-semibold text-orange-700 shadow-sm">
                Free online birthday card maker
              </span>
              <span className="rounded-full bg-white/70 px-4 py-2 font-semibold text-orange-700 shadow-sm">
                Shareable card links
              </span>
              <span className="rounded-full bg-white/70 px-4 py-2 font-semibold text-orange-700 shadow-sm">
                Sign in to create, save, and send
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-caveat font-bold mb-6 text-gray-800 tracking-tight leading-tight">
              Create a <span className="text-primary inline-block transform -rotate-2 hover:rotate-3 transition-transform duration-300 relative">
                Birthday
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" /></svg>
              </span> Card Online
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-quicksand font-medium leading-relaxed">
              MewTruCard is built first for <span className="text-primary font-bold">birthday cards</span>:
              create the message, personalize the card, then <span className="text-primary font-bold">copy a link</span> or download it.
              Also explore viral <span className="text-primary font-bold">valentine</span>, <span className="text-primary font-bold">sorry</span>, and celebration pages.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
              <Link href="/birthday/" className="w-full sm:w-auto">
                <WarmButton size="lg" className="w-full sm:w-auto text-lg px-12 shadow-warm hover:shadow-warm-lg">
                  Make a Birthday Card <Sparkles className="ml-2 h-5 w-5" />
                </WarmButton>
              </Link>
              <Link href="/type/birthday/" className="w-full sm:w-auto">
                <WarmButton variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-12">
                  Browse Birthday Ideas <Search className="ml-2 h-5 w-5" />
                </WarmButton>
              </Link>
            </div>

            <div className="mb-20 w-full max-w-4xl mx-auto transform hover:scale-[1.02] transition-transform duration-500">
              <CardTypeBubbles currentType="birthday" />
            </div>
          </div>

          <div className="space-y-32">
            <section className="relative scroll-mt-24" id="trending">
              <TrendingCards />
            </section>
            
            <Features />

            <ViralMicrositeGrid
              title="Templateable Viral Microsites"
              description="Launch playful share links for valentine asks, birthday reveals, apology links, and bridal party moments. These pages are now built from one reusable microsite system."
            />

            <section className="relative">
              <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl font-caveat font-bold mb-4 text-gray-800">
                  Explore Public <span className="text-primary">Birthday & Greeting Card Ideas</span>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                  Browse public examples for birthdays, valentine cards, apology cards, and more before you create your own.
                </p>
              </div>
              
              <Suspense fallback={
                <div className="flex items-center justify-center h-64 bg-white/50 rounded-2xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              }>
                <CardMarquee wishCardType="birthday" initialCardsData={initialCardsData} />
              </Suspense>
            </section>

            <HowToUse />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8">
              <Link href="/birthday/">
                <WarmButton size="lg" className="w-full sm:w-auto px-10">
                  Start with Birthday Cards <PenTool className="ml-2 h-5 w-5" />
                </WarmButton>
              </Link>
              <Link href="/cards/">
                <WarmButton variant="secondary" size="lg" className="w-full sm:w-auto px-10">
                  Browse All Generators <Search className="ml-2 h-5 w-5" />
                </WarmButton>
              </Link>
            </div>
            
            <FAQ />
          </div>
        </div>
      </div>
    </main>
  );
}

// Features Section
const Features: React.FC = () => (
  <section className="relative py-12">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-caveat font-bold mb-6 text-gray-800">
          Why MewTruCard is <span className="text-primary">Magical</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-quicksand">
          No design skills needed - just your feelings and our AI magic ✨
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          title="Birthday-First Flow"
          description="A clearer path from birthday idea to message to shareable link"
          icon={<Sparkles className="h-8 w-8 text-primary" />}
          benefits={[
            "Sign in, create, save, and send",
            "Recipient-first input flow",
            "Birthday card link sharing"
          ]}
        />
        <FeatureCard
          title="Templates + Generator"
          description="Start from a generator or browse public templates before editing"
          icon={<Palette className="h-8 w-8 text-primary" />}
          benefits={[
            "Birthday, valentine, sorry, and more",
            "Public galleries by type and relationship",
            "Editable messages and visuals"
          ]}
        />
        <FeatureCard
          title="Built to Spread"
          description="Use direct links or playful microsites to get shared faster"
          icon={<Send className="h-8 w-8 text-primary" />}
          benefits={[
            "Interactive viral microsites",
            "Direct generator handoff after the moment",
            "High-res image download",
            "Instant web link sharing"
          ]}
        />
      </div>
    </div>
  </section>
);

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, benefits }) => (
  <GlassCard 
    variant="warm" 
    hoverEffect 
    className="p-8 flex flex-col items-center text-center h-full border-white/60 bg-white/60"
  >
    <div className="mb-6 p-4 bg-orange-100/50 rounded-full text-primary ring-4 ring-orange-50">
      {icon}
    </div>
    <h3 className="text-2xl font-caveat font-bold mb-4 text-gray-800">
      {title}
    </h3>
    <p className="text-gray-600 mb-6 font-medium leading-relaxed">
      {description}
    </p>
    <ul className="space-y-3 mt-auto w-full text-left">
      {benefits.map((benefit, index) => (
        <li
          key={index}
          className="flex items-center text-sm text-gray-600 bg-white/50 p-2 rounded-lg"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0" />
          {benefit}
        </li>
      ))}
    </ul>
  </GlassCard>
);

// How To Use Section
const HowToUse: React.FC = () => (
  <section className="py-8">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-caveat font-bold mb-6 text-gray-800">
          Create a Card in <span className="text-primary">3 Clear Steps</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-quicksand">
          Keep the path simple: sign in, add your details, generate, then share or download.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <div className="relative">
          <div className="absolute -left-4 -top-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
          <h3 className="text-2xl font-caveat font-bold mb-8 text-primary flex items-center justify-center md:justify-start">
            <span className="w-8 h-8 rounded-full bg-primary text-white text-sm flex items-center justify-center mr-3 font-sans">1</span>
            Method: Create Custom AI Card
          </h3>
          
          <div className="space-y-6 relative">
             <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/30 to-transparent -z-10 md:block hidden"></div>
            
            <StepCard
              number="1"
              title="Start with Occasion"
              description="Birthday first, then valentine, sorry, anniversary, and more"
              icon={<MessageCircle className="h-6 w-6 text-white" />}
              details={["Birthday generator", "Other occasion generators"]}
            />
            <StepCard
              number="2"
              title="Add Recipient Details"
              description="Tell us who it is for and what you want to say"
              icon={<Heart className="h-6 w-6 text-white" />}
              details={["Recipient name & relationship", "Optional message or signature"]}
            />
            <StepCard
              number="3"
              title="Generate, Save, Share"
              description="Create the card, then copy a link or download it"
              icon={<Gift className="h-6 w-6 text-white" />}
              details={["AI writes the message", "Download or copy birthday link"]}
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-accent/10 rounded-full blur-2xl"></div>
          <h3 className="text-2xl font-caveat font-bold mb-8 text-accent flex items-center justify-center md:justify-start">
            <span className="w-8 h-8 rounded-full bg-accent text-white text-sm flex items-center justify-center mr-3 font-sans">2</span>
            Method: Browse Templates
          </h3>
          
          <div className="space-y-6 relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-accent/30 to-transparent -z-10 md:block hidden"></div>

            <StepCard
              number="1"
              title="Browse Public Ideas"
              description="Review public cards before you make your own"
              icon={<Search className="h-6 w-6 text-white" />}
              details={["Birthday templates", "Filter by type or relationship"]}
            />
            <StepCard
              number="2"
              title="Customize"
              description="Make it yours"
              icon={<PenTool className="h-6 w-6 text-white" />}
              details={["Edit text & names", "Adjust visuals"]}
            />
            <StepCard
              number="3"
              title="Send It"
              description="Share the joy"
              icon={<Download className="h-6 w-6 text-white" />}
              details={["High-quality download", "Direct share link"]}
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const StepCard: React.FC<StepCardProps> = ({ number, title, description, details, icon }) => (
  <GlassCard className="p-5 flex items-start gap-4 hover:border-primary/30 transition-colors bg-white/80">
    <div className="p-3 bg-gradient-to-br from-primary to-warm-coral rounded-xl shadow-warm flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-gray-800 text-lg mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex flex-wrap gap-2">
        {details.map((detail, index) => (
          <span key={index} className="text-xs bg-orange-50 text-gray-600 px-2 py-1 rounded-md border border-orange-100">
            {detail}
          </span>
        ))}
      </div>
    </div>
  </GlassCard>
);

// FAQ Section
const faqs = [
  {
    question: "What is MewTruCard best for right now?",
    answer: "MewTruCard performs best today as a birthday card maker with additional flows for valentine, sorry, anniversary, thank-you, and celebration cards. The clearest path is to sign in, start with a birthday card, personalize the details, then share the card by link or download."
  },
  {
    question: "Do I need to sign in before creating a card?",
    answer: "Yes. The current product flow requires sign-in before generation so you can save cards, reopen edits, and send shareable links from your account."
  },
  {
    question: "Can I create birthday cards on my phone?",
    answer: "Yes. The main generator flow, editing screens, and share links are mobile-friendly, so you can create and send birthday cards directly from your phone browser."
  },
  {
    question: "How do I share my card?",
    answer: "After generation and editing, you can download the card as an image or copy a unique link to send through WhatsApp, Messenger, email, or other social channels."
  },
  {
    question: "What are the viral microsites for?",
    answer: "They are shareable landing pages for playful asks and surprise moments, like valentine prompts, apology links, birthday reveals, and bridesmaid asks. Each microsite now feeds back into the relevant MewTruCard generator."
  }
];

const FAQ: React.FC = () => (
  <section className="py-12">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-caveat font-bold mb-4 text-gray-800">
        Frequently Asked <span className="text-primary">Questions</span>
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4 font-quicksand">
        Everything you need to know about creating magic with MewTruCard
      </p>
    </div>

    <div className="mx-auto max-w-2xl px-4">
      <Accordion
        type="single"
        collapsible
        className="space-y-4"
      >
        {faqs.map((faq, idx) => (
          <AccordionItem
            key={idx}
            value={`question-${idx}`}
            className="border-none"
          >
            <GlassCard className="px-1 overflow-hidden">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline font-medium text-gray-800 group">
                <span className="group-hover:text-primary transition-colors">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed bg-white/40">
                {faq.answer}
              </AccordionContent>
            </GlassCard>
          </AccordionItem>
        ))}
      </Accordion>
    </div>

    <div className="mt-12 text-center">
      <p className="text-lg text-gray-600 font-quicksand">
        Have more questions?{" "}
        <a href="mailto:support@mewtrucard.com" className="text-primary hover:underline font-bold">
          Contact Support
        </a>
      </p>
    </div>
  </section>
);
