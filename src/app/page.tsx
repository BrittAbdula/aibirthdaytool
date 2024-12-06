import { Metadata } from "next";
import { TrendingCards } from "@/components/TrendingCards";
import { Suspense } from 'react';
import CardMarquee from '@/components/CardMarquee';
import { getRecentCardsServer } from '@/lib/cards';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Section from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CardTypeBubbles from "@/components/CardTypeBubbles";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  details: string[];
  icon: string;
}

interface FaqItemProps {
  question: string;
  answer: string;
}

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
              Create Beautiful Digital Cards for Every Moment
            </span>
          </h1>
          <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto font-light">
            Express your feelings with MewTruCard&apos;s elegant and personalized e-cards
          </p>

          <div className="mb-16 items-center flex justify-center">
            <button className="bg-[#FFC0CB] text-white px-8 py-3 rounded-full hover:bg-pink-400 transition">
              <a href="/cards">Create Your Card</a>
            </button>
          </div>

          <div className="mb-16 items-center flex justify-center">
            <CardTypeBubbles currentType="holiday" />
          </div>

          <div className="space-y-24">
            <section className="relative">
              <TrendingCards />
            </section>
            <Features />

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

            <HowToUse />

            <FAQ />
          </div>
        </div>
      </div>
    </main>
  );
}

// Features Section
const Features: React.FC = () => (
  <section className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-serif font-semibold mb-4 text-center text-[#4A4A4A]">
        Why Choose MewTruCard
      </h2>
      <p className="text-center text-[#666] mb-12 max-w-2xl mx-auto">
        Express your feelings effortlessly with our intelligent card creation system
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          title="One-Click Creation"
          description="Just three simple inputs for a perfect card"
          icon="✨"
          benefits={[
            "Name, occasion, and relationship",
            "AI-powered emotional message",
            "Instant preview and generation"
          ]}
        />
        <FeatureCard
          title="Elegant Design"
          description="Professional designs that capture hearts"
          icon="🎨"
          benefits={[
            "Modern minimalist style",
            "Premium visual quality",
            "Thoughtfully crafted layouts"
          ]}
        />
        <FeatureCard
          title="Easy Sharing"
          description="Multiple ways to deliver your love"
          icon="🎁"
          benefits={[
            "Instant digital sharing",
            "High-quality printable format",
            "Social media ready"
          ]}
        />
      </div>
    </div>
  </section>
);

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, benefits }) => (
  <div className="p-6 rounded-lg bg-gradient-to-b from-pink-50 to-white border border-pink-100 hover:shadow-lg transition duration-300">
    <div className="text-4xl mb-4 bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
      {icon}
    </div>
    <h3 className="text-xl font-serif font-semibold mb-3 text-[#4A4A4A] text-center">
      {title}
    </h3>
    <p className="text-[#666] text-center mb-4">
      {description}
    </p>
    <ul className="space-y-2">
      {benefits.map((benefit, index) => (
        <li
          key={index}
          className="flex items-center text-sm text-[#666]"
        >
          <span className="text-pink-400 mr-2">•</span>
          {benefit}
        </li>
      ))}
    </ul>
  </div>
);



// How To Use Section
export const HowToUse: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-serif font-semibold mb-4 text-center text-[#4A4A4A]">
          Create Your MewTruCard in 3 Simple Steps
        </h2>
        <p className="text-center text-[#666] mb-12 max-w-2xl mx-auto">
          Express your feelings in minutes with our intuitive card creation process
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-[2px] bg-pink-200 -z-10" />

          <StepCard
            number="1"
            title="Choose MewTruCard Template"
            description="Select the perfect design for your occasion"
            icon="📝"
            details={[
              "Anniversary MewTruCard",
              "Love MewTruCard",
              "Apology MewTruCard",
              "... MewTruCard",
              "Customizable templates"
            ]}
          />
          <StepCard
            number="2"
            title="Add Personal Touch"
            description="Make it uniquely yours with custom details"
            icon="✨"
            details={[
              "Recipient's name",
              "Your relationship",
              "Special message",
              "Occasion details"
            ]}
          />
          <StepCard
            number="3"
            title="Share & Delight"
            description="Multiple ways to deliver your card"
            icon="🎁"
            details={[
              "Download as image",
              "Share via MewTruCard link",
              "Print ready format",
              "Social media sharing MewTruCard"
            ]}
          />
        </div>
      </div>
    </section>
  );
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description, details, icon }) => (
  <Card className="bg-white border border-[#FFC0CB] hover:shadow-lg transition duration-300 relative">
    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
      <div className="w-10 h-10 rounded-full bg-[#FFC0CB] text-white flex items-center justify-center text-lg font-semibold">
        {number}
      </div>
    </div>
    <CardHeader className="pt-8">
      <div className="text-3xl mb-4 text-center">{icon}</div>
      <CardTitle className="font-serif text-[#4A4A4A] text-center">{title}</CardTitle>
      <p className="text-[#666] text-center text-sm mt-2">{description}</p>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2 mt-4">
        {details.map((detail, index) => (
          <li
            key={index}
            className="flex items-center text-sm text-[#666]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-pink-300 mr-2" />
            {detail}
          </li>
        ))}
      </ul>
      {number === "3" && (
        <button className="w-full mt-4 py-2 text-sm text-pink-500 hover:text-pink-600 transition duration-300">
          <a href="/cards">Create Your MewTru Card Now  →</a>
        </button>
      )}
    </CardContent>
  </Card>
);

// FAQ Section
const faqs = [
  {
    question: "What is MewTruCard and why choose MewTru Card?",
    answer: (
      <span>
        MewTruCard is your go-to AI-powered greeting card platform. Using MewTru Card&apos;s advanced technology, you can create heartfelt digital cards for any occasion. The MewTruCard platform stands out with its intelligent design system - simply input your feelings, and MewTru Card transforms them into beautiful, personalizedcards. Every MewTruCard creation combines emotional depth with elegant design.
      </span>
    ),
  },
  {
    question: "How do I create cards with MewTruCard?",
    answer: (
      <span>
        Creating with MewTru Card is simple and intuitive:
        <ol className="mt-2 space-y-1">
          <li>1. Visit MewTruCard&apos;s template gallery and choose your style</li>
          <li>2. Use MewTru Card&apos;s smart input system to describe your recipient</li>
          <li>3. Let MewTruCard&apos;s AI create your perfect card</li>
        </ol>
        Experience the magic of MewTru Card in less than a minute!
      </span>
    ),
  },
  {
    question: "What sharing options does MewTruCard provide?",
    answer: (
      <span>
        MewTru Card offers multiple ways to share your creations:
        <ul className="mt-2 space-y-1">
          <li>• Every MewTruCard creation gets a unique sharing link</li>
          <li>• Download your MewTru Card designs in high resolution</li>
          <li>• Share your MewTruCard directly to social platforms</li>
          <li>• Send your MewTru Card creation via email</li>
        </ul>
      </span>
    ),
  },
  {
    question: "What makes MewTruCard designs unique?",
    answer: (
      <span>
        MewTru Card&apos;s design philosophy centers on three elements:
        <ul className="mt-2 space-y-1">
          <li>• Every MewTruCard features clean, modern aesthetics</li>
          <li>• MewTru Card ensures professional-grade layouts</li>
          <li>• Your MewTruCard perfectly captures emotional moments</li>
        </ul>
      </span>
    ),
  },
  {
    question: "How can I customize my MewTruCard creation?",
    answer: (
      <span>
        MewTru Card offers complete creative control:
        <ul className="mt-2 space-y-1">
          <li>• Personalize your MewTruCard message</li>
          <li>• Access MewTru Card&apos;s exclusive font collection</li>
          <li>• Adjust your MewTruCard color themes</li>
          <li>• Add personal touches to your MewTru Card design</li>
        </ul>
      </span>
    ),
  },
  {
    question: "What are MewTruCard's pricing options?",
    answer: (
      <span>
        MewTru Card believes in flexible pricing:
        <ul className="mt-2 space-y-1">
          <li>• Create basic MewTruCards for free</li>
          <li>• Unlock premium MewTru Card features with subscription</li>
          <li>• Adjust your MewTruCard membership anytime</li>
        </ul>
      </span>
    ),
  },
  {
    question: "Can I use MewTruCard on mobile devices?",
    answer: (
      <span>
        MewTru Card is fully optimized for mobile use:
        <ul className="mt-2 space-y-1">
          <li>• Access MewTruCard on any device</li>
          <li>• Create MewTru Card designs with easy touch controls</li>
          <li>• Your MewTruCard studio goes wherever you do</li>
        </ul>
      </span>
    ),
  },
];

export function FAQ() {
  return (
    <Section title="MewTruCard FAQ" subtitle="Everything you need to know about your MewTru Card experience">
      <div className="mx-auto my-12 md:max-w-[800px]">
        <Accordion
          type="single"
          collapsible
          className="flex w-full flex-col items-center justify-center space-y-2"
        >
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`question-${idx}`}
              className="w-full border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <h4 className="mb-12 text-center text-sm font-medium tracking-tight text-foreground/80">
        Have questions about your MewTruCard experience? Contact the MewTru Card team at{" "}
        <a href="mailto:support@mewtrucard.com" className="underline">
          support@mewtrucard.com
        </a>
      </h4>
    </Section>
  );
}