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
import { CookieConsentWrapper } from "@/components/CookieConsentWrapper";

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
              Free AI Greeting Card Generator For Every Occasion
            </span>
          </h1>
          <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto font-light">
            Design personalized digital cards with our smart AI card creator - perfect for birthdays, holidays, and special moments!
          </p>

          <div className="mb-16 items-center flex justify-center space-x-4">
            <button className="bg-[#FFC0CB] text-white px-8 py-3 rounded-full hover:bg-pink-400 transition">
              <a href="/cards">Create Your Digital Card</a>
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
                Explore Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">AI Card Templates</span>
              </h2>
              <Suspense fallback={
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              }>
                <CardMarquee wishCardType="" initialCardsData={initialCardsData} />
              </Suspense>
            </section>

            <HowToUse />

            <div className="mb-8 items-center flex justify-center">
            <button className="bg-[#FFC0CB] text-white px-8 py-3 rounded-full hover:bg-pink-400 transition">
              <a href="/cards">Make Your AI Card Now</a>
            </button>
          </div>
            <FAQ />
          </div>
        </div>
      </div>
      
      {/* Cookie Consent Component */}
      <CookieConsentWrapper />
    </main>
  );
}

// Features Section
const Features: React.FC = () => (
  <section className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-serif font-semibold mb-4 text-center text-[#4A4A4A]">
        Why Our AI Greeting Card Maker Is Awesome
      </h2>
      <p className="text-center text-[#666] mb-12 max-w-2xl mx-auto">
        No design skills needed - our virtual card generator does all the work for you
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          title="Quick AI Card Creation"
          description="Design a custom e-card in seconds"
          icon="✨"
          benefits={[
            "Simple inputs for perfect cards",
            "AI generates heartfelt messages",
            "Instant digital card preview"
          ]}
        />
        <FeatureCard
          title="Beautiful Digital Designs"
          description="Online cards that look professionally made"
          icon="🎨"
          benefits={[
            "Modern greeting card styles",
            "High-quality digital cards",
            "Thoughtfully designed templates"
          ]}
        />
        <FeatureCard
          title="Easy E-Card Sharing"
          description="Multiple ways to send your digital greetings"
          icon="🎁"
          benefits={[
            "Instant online card delivery",
            "Download printable card formats",
            "Share e-cards on social media"
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
const HowToUse: React.FC = () => (
    <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-serif font-semibold mb-4 text-center text-[#4A4A4A]">
          Create Digital Cards With Our Virtual Card Designer
        </h2>
        <p className="text-center text-[#666] mb-12 max-w-2xl mx-auto">
          Two easy methods to make the perfect AI greeting cards online - totally free!
        </p>
        
        <div className="flex flex-col md:flex-row mb-16">
          <div className="md:w-1/2 p-4">
            <div className="text-center mb-8">
              <h3 className="text-xl font-serif font-semibold mb-2 text-pink-600">
                Method 1: AI-Generated Custom Cards
              </h3>
              <p className="text-[#666] text-sm">
                Let our smart card generator create a personalized digital greeting card
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 relative">
              <div className="absolute top-0 bottom-0 left-10 w-[2px] bg-pink-200 -z-10"></div>
              
              <StepCard
                number="1"
                title="Choose Card Category"
                description="Select from our e-card templates collection"
                icon="📝"
                details={[
                  "Virtual birthday card maker",
                  "Digital anniversary cards",
                  "AI love card generator",
                  "Online holiday greeting cards",
                  "Custom occasion e-cards"
                ]}
              />
              
              <StepCard
                number="2"
                title="Customize Your E-Card"
                description="Tell our AI about your recipient"
                icon="✨"
                details={[
                  "Specify your relationship",
                  "Describe the special occasion",
                  "Add your personalized message",
                  "Choose sentiment for your e-card"
                ]}
              />
              
              <StepCard
                number="3"
                title="Generate & Share Your Card"
                description="Our AI creates your perfect digital greeting"
                icon="🎁"
                details={[
                  "One-click AI card generation",
                  "Edit your virtual card design",
                  "Download high-quality e-card",
                  "Share your digital card online"
                ]}
              />
            </div>
          </div>
          
          <div className="md:w-1/2 p-4 mt-12 md:mt-0">
            <div className="text-center mb-8">
              <h3 className="text-xl font-serif font-semibold mb-2 text-purple-600">
                Method 2: Browse Pre-Made AI Cards
              </h3>
              <p className="text-[#666] text-sm">
                Choose from our gallery of AI-designed greeting card templates
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 relative">
              <div className="absolute top-0 bottom-0 left-10 w-[2px] bg-purple-200 -z-10"></div>
              
              <StepCard
                number="1"
                title="Explore E-Card Templates"
                description="Browse our AI greeting card collection"
                icon="🔍"
                details={[
                  "Curated digital card designs",
                  "Filter by card occasion or style",
                  "Preview AI-generated templates",
                  "Find popular e-card designs"
                ]}
              />
              
              <StepCard
                number="2"
                title="Customize Your Digital Card"
                description="Make the e-card uniquely yours"
                icon="✏️"
                details={[
                  "Edit AI greeting text",
                  "Personalize virtual card elements",
                  "Add recipient details",
                  "Create a one-of-a-kind design"
                ]}
              />
              
              <StepCard
                number="3"
                title="Send Your E-Card"
                description="Share your digital greeting instantly"
                icon="💌"
                details={[
                  "Download as high-quality image",
                  "Share via unique card link",
                  "Post to social media directly",
                  "Email your digital greeting card"
                ]}
              />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <a href="/cards" className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:opacity-90 transition shadow-md">
            Create Your Free AI Greeting Card Now
          </a>
          <p className="mt-3 text-sm text-gray-500">No registration needed - design your first digital card in just seconds!</p>
        </div>
      </div>
    </section>
  );

const StepCard: React.FC<StepCardProps> = ({ number, title, description, details, icon }) => (
  <div className="bg-white border border-pink-100 rounded-lg p-5 pl-12 relative shadow-sm hover:shadow-md transition duration-300">
    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white flex items-center justify-center text-lg font-semibold">
      {number}
    </div>
    <div className="text-2xl absolute top-5 left-4">{icon}</div>
    <h4 className="font-serif text-[#4A4A4A] font-medium mb-1">{title}</h4>
    <p className="text-[#666] text-sm mb-3">{description}</p>
    <ul className="space-y-1.5">
      {details.map((detail, index) => (
        <li
          key={index}
          className="flex items-center text-xs text-[#666]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-pink-300 mr-2 flex-shrink-0" />
          {detail}
        </li>
      ))}
    </ul>
  </div>
);

// FAQ Section
const faqs = [
  {
    question: "What is MewTruCard's AI Greeting Card Generator?",
    answer: (
      <span>
        MewTruCard offers a next-gen AI card maker that helps you create digital greeting cards for any occasion. Our virtual card creator uses artificial intelligence to transform your thoughts into beautifully designed e-cards. What makes our online greeting card generator special is how it combines emotional messaging with stunning designs - just tell us your feelings and our AI does the rest!
      </span>
    ),
  },
  {
    question: "How do I create digital cards with MewTruCard's tool?",
    answer: (
      <span>
        Making e-cards with our AI greeting card generator is super easy:
        <ol className="mt-2 space-y-1">
          <li>1. Browse our digital card templates and pick your favorite style</li>
          <li>2. Enter details about who the virtual card is for</li>
          <li>3. Let our AI card maker generate your perfect online greeting</li>
        </ol>
        The whole e-card creation process takes less than a minute!
      </span>
    ),
  },
  {
    question: "What sharing options does your digital card maker provide?",
    answer: (
      <span>
        Our AI greeting card generator offers multiple ways to share your virtual cards:
        <ul className="mt-2 space-y-1">
          <li>• Each digital card gets its own unique sharing link</li>
          <li>• Download your AI-created cards in high resolution</li>
          <li>• Share your e-cards directly to social platforms</li>
          <li>• Send your digital greetings via email</li>
        </ul>
      </span>
    ),
  },
  {
    question: "What makes MewTruCard's AI-generated designs unique?",
    answer: (
      <span>
        Our digital greeting card maker stands out because:
        <ul className="mt-2 space-y-1">
          <li>• Every AI card features clean, modern aesthetics</li>
          <li>• Our virtual card designs have professional-grade layouts</li>
          <li>• The AI greeting card generator perfectly captures emotions</li>
        </ul>
      </span>
    ),
  },
  {
    question: "Can I customize cards from your online greeting card maker?",
    answer: (
      <span>
        Our AI card creator gives you complete creative control:
        <ul className="mt-2 space-y-1">
          <li>• Personalize your digital greeting card message</li>
          <li>• Access exclusive fonts for your virtual cards</li>
          <li>• Adjust color themes in your e-card design</li>
          <li>• Add personal touches to make the digital card yours</li>
        </ul>
      </span>
    ),
  },
  {
    question: "Is your AI greeting card generator free to use?",
    answer: (
      <span>
        We believe in flexible options for our online card maker:
        <ul className="mt-2 space-y-1">
          <li>• Create basic digital greeting cards completely free</li>
          <li>• Unlock premium virtual card features with subscription</li>
          <li>• Adjust your e-card creation plan anytime</li>
        </ul>
      </span>
    ),
  },
  {
    question: "Can I use your AI card generator on my phone?",
    answer: (
      <span>
        Our digital greeting card maker is totally mobile-friendly:
        <ul className="mt-2 space-y-1">
          <li>• Create e-cards on any device</li>
          <li>• Design virtual cards with easy touch controls</li>
          <li>• Make AI greeting cards wherever you are</li>
        </ul>
      </span>
    ),
  },
];

const FAQ: React.FC = () => (
    <Section>
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            AI Greeting Card Generator FAQ
          </span>
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Common questions about our digital card maker and online greeting card tool ✨
        </p>
      </div>

      <div className="mx-auto md:max-w-[800px]">
        <Accordion
          type="single"
          collapsible
          className="flex w-full flex-col items-center justify-center space-y-4"
        >
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`question-${idx}`}
              className="w-full border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <AccordionTrigger className="px-6 py-4 text-left">
                <span className="font-medium text-gray-800">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-gray-600">
          Have more questions about our AI card generator?{" "}
          <a href="mailto:support@mewtrucard.com" className="text-purple-600 hover:text-purple-700 underline font-medium">
            Contact our support team
          </a>
        </p>
      </div>
    </Section>
  );