import { Metadata } from "next";
import { TrendingCards } from "@/components/TrendingCards";
import { Suspense } from 'react';
import CardMarquee from '@/components/CardMarquee';
import { getRecentCardsServer } from '@/lib/cards';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CardTypeBubbles from "@/components/CardTypeBubbles";
import Link from "next/link";
import { getAllCardTypes, CardBadge } from "@/lib/card-config";
import { Sparkles, Palette, Gift, Heart, Send, Download, PenTool, Search, MessageCircle } from "lucide-react";
import { WarmButton } from "@/components/ui/warm-button";
import { GlassCard } from "@/components/ui/glass-card";
import SparklesText from "@/components/ui/sparkles-text";

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
  title: "MewTruCard – Free AI Greeting Card Generator | 30000+ Templates & Download",
  description: "Create AI-powered animated greeting cards for birthdays, holidays, love and more. with 30000+ beautiful templates you can personalize and download in seconds.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://mewtrucard.com/",
    title: "MewTruCard – Free AI Greeting Card Generator",
    description: "100+ AI-animated templates, totally free to customize and instantly download your greeting card.",
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
    title: "MewTruCard – Free AI Greeting Card Generator",
    description: "Make stunning AI-animated greeting cards for any occasion. Free to use with 100+ templates and one-click download.",
    images: ["https://mewtrucard.com/og-cover.jpg"]
  }
};

export const revalidate = 300; // 每5分钟重新验证页面

export default async function Home() {
  const initialCardsData = await getRecentCardsServer(1, 12, "");
  
  // Pre-fetch card badge data
  const allCardTypes = await getAllCardTypes();
  const cardTypeBadges: Record<string, CardBadge> = {};
  
  // Convert array to record object for client-side use
  allCardTypes.forEach(cardType => {
    if (cardType.badge) {
      cardTypeBadges[cardType.type] = cardType.badge;
    }
  });

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
              <a href="https://www.producthunt.com/posts/mewtrucard?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-mewtrucard" target="_blank">
                <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=969395&theme=light&t=1748048449150" alt="MewtruCard on Product Hunt" width="250" height="54" className="rounded-lg shadow-sm" />
              </a>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-caveat font-bold mb-6 text-gray-800 tracking-tight leading-tight">
              Create <span className="text-primary inline-block transform -rotate-2 hover:rotate-3 transition-transform duration-300 relative">
                Magical
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" /></svg>
              </span> Moments
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-quicksand font-medium leading-relaxed">
              Design personalized digital cards with our AI-powered creator. 
              Perfect for <span className="text-primary font-bold">birthdays</span>, <span className="text-primary font-bold">holidays</span>, and sharing your <span className="text-primary font-bold">love</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
              <Link href="/cards/" className="w-full sm:w-auto">
                <WarmButton size="lg" className="w-full sm:w-auto text-lg px-12 shadow-warm hover:shadow-warm-lg">
                  Create AI Card <Sparkles className="ml-2 h-5 w-5" />
                </WarmButton>
              </Link>
              <Link href="/card-gallery" className="w-full sm:w-auto">
                <WarmButton variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-12">
                  Explore Gallery <Search className="ml-2 h-5 w-5" />
                </WarmButton>
              </Link>
            </div>

            <div className="mb-20 w-full max-w-4xl mx-auto transform hover:scale-[1.02] transition-transform duration-500">
              <CardTypeBubbles currentType="holiday" />
            </div>

            {/* Valentine Banner */}
            <div className="mb-24">
               <Link href="/will-you-be-my-valentine/">
                <GlassCard variant="warm" hoverEffect className="inline-flex items-center px-8 py-3 bg-red-50/80 border-red-100/50 hover:bg-red-50 cursor-pointer">
                  <Heart className="text-red-500 fill-red-500 animate-pulse mr-3 h-6 w-6" />
                  <span className="text-red-600 font-bold font-quicksand text-lg">Valentine&apos;s Special Collection</span>
                  <Heart className="text-red-500 fill-red-500 animate-pulse ml-3 h-6 w-6" />
                </GlassCard>
              </Link>
            </div>
          </div>

          <div className="space-y-32">
            <section className="relative scroll-mt-24" id="trending">
              <TrendingCards />
            </section>
            
            <Features />

            <section className="relative">
              <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl font-caveat font-bold mb-4 text-gray-800">
                  Explore our <span className="text-primary">Inspiration</span>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">Over 30,000 templates generated by our community</p>
              </div>
              
              <Suspense fallback={
                <div className="flex items-center justify-center h-64 bg-white/50 rounded-2xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              }>
                <CardMarquee wishCardType="" initialCardsData={initialCardsData} />
              </Suspense>
            </section>

            <HowToUse />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8">
              <Link href="/cards/">
                <WarmButton size="lg" className="w-full sm:w-auto px-10">
                  Start Creating Now <PenTool className="ml-2 h-5 w-5" />
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
          title="Quick AI Generation"
          description="Transform your thoughts into heartfelt messages instantly"
          icon={<Sparkles className="h-8 w-8 text-primary" />}
          benefits={[
            "Simple inputs for perfect cards",
            "Emotional & personalized text",
            "Instant digital preview"
          ]}
        />
        <FeatureCard
          title="Beautiful Aesthetics"
          description="Professionally designed templates that look stunning"
          icon={<Palette className="h-8 w-8 text-primary" />}
          benefits={[
            "Millions of unique styles",
            "High-quality visuals",
            "Thoughtful compositions"
          ]}
        />
        <FeatureCard
          title="Share the Love"
          description="Send your greetings anywhere, anyhow"
          icon={<Send className="h-8 w-8 text-primary" />}
          benefits={[
            "Instant web link sharing",
            "High-res image download",
            "Direct social media posting"
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
          Create Magic in <span className="text-primary">3 Simple Steps</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-quicksand">
          Choose between creating something new or exploring our gallery
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
              title="Choose Category"
              description="Select the perfect occasion"
              icon={<MessageCircle className="h-6 w-6 text-white" />}
              details={["Birthday, Holiday, Love", "Custom occasions supported"]}
            />
            <StepCard
              number="2"
              title="Add Personal Touch"
              description="Tell us who it's for"
              icon={<Heart className="h-6 w-6 text-white" />}
              details={["Recipient name & relation", "Tone of message"]}
            />
            <StepCard
              number="3"
              title="Generate & Share"
              description="Get your unique card instantly"
              icon={<Gift className="h-6 w-6 text-white" />}
              details={["AI writes the message", "Download or copy link"]}
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
              title="Explore Gallery"
              description="Browse 30,000+ designs"
              icon={<Search className="h-6 w-6 text-white" />}
              details={["Filter by occasion", "Find popular styles"]}
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
              details={["High-quality download", "Social sharing"]}
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
    question: "What is MewTruCard's AI Greeting Card Generator?",
    answer: "MewTruCard uses advanced AI to create personalized, emotionally resonant greeting cards in seconds. Simply choose an occasion and provide a few details, and our magical engine writes the perfect message and designs a stunning card."
  },
  {
    question: "Is it free to use?",
    answer: "Yes! You can generate standard cards for free. We also offer a Premium plan for exclusive designs, unlimited generation, and advanced customization features."
  },
  {
    question: "Can I use it on my phone?",
    answer: "Absolutely. MewTruCard is designed 'mobile-first', meaning you get a beautiful app-like experience right in your mobile browser."
  },
  {
    question: "How do I share my card?",
    answer: "Once generated, you can download the card as a high-quality image, or copy a unique link to send via WhatsApp, Messenger, or email."
  },
  {
    question: "Can I customize the message?",
    answer: "Yes, you have full control. You can edit the AI-generated message, change the recipient's name, or write your own heartfelt note from scratch."
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