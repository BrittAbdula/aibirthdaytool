import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next/types";
import { CardType, getCardConfig, getAllCardTypes } from "@/lib/card-config";
import CardTypeBubbles from "@/components/CardTypeBubbles";
import CardGenerator from "@/components/CardGenerator";
import SimpleCardGallery from '@/app/card-gallery/SimpleCardGallery'
import { getRecentCardsServer } from '@/lib/cards';
import Breadcrumb from "@/components/Breadcrumb"; 
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Script from "next/script";

interface CardGeneratorPageProps {
    params: {
        cardType: string;
    };
}

// Generate static params for all card types at build time
export async function generateStaticParams() {
    const cardTypes = await getAllCardTypes();
    return cardTypes.map((cardType) => ({
        cardType: cardType.type,
    }));
}

// Force static page generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: CardGeneratorPageProps): Promise<Metadata> {
    const cardType = params.cardType;
    const cardConfig = await getCardConfig(cardType);

    if (!cardConfig) {
        return notFound();
    }

    const cardName = cardConfig.label;
    const imageUrl = `https://mewtrucard.com/mewtrucard-generator.jpg`;
    
    return {
        title: `AI ${cardName} Generator | Free Online Birthday E‑Card Maker - MewTruCard`,
        description: `Create personalized ${cardType} cards with MewTruCard's AI-powered generator online. design with any style and theme. Download and share with your friends and family.`,
        alternates: {
            canonical: `https://mewtrucard.com/${cardType}/`,
        },
        openGraph: {
            title: `AI ${cardName} Generator | Free Online E‑Card Maker`,
            description: `Create personalized AI-generated ${cardType} cards with any style. Easy to customize, download and share.`,
            images: [{
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: `AI ${cardName} generator preview`
            }],
            type: 'website',
            url: `https://mewtrucard.com/${cardType}/`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `AI ${cardName} Generator | Free Online E‑Card Maker`,
            description: `Create personalized AI-generated ${cardType} cards with any style. Easy to customize, download and share.`,
            images: [imageUrl],
        },
    };
}

export default async function CardGeneratorPage({ params }: CardGeneratorPageProps) {
    const cardType = params.cardType;
    const cardConfig = await getCardConfig(cardType);

    if (!cardConfig) {
        notFound();
    }

    const cardName = cardConfig.label;
    // Get initial cards data
    const { cards, totalPages } = await getRecentCardsServer(1, 20, cardType);
    const initialCardsData = {
        cards,
        totalPages
    };
    
    // Prepare JSON-LD structured data
    const imageUrl = `https://store.celeprime.com/${cardType}.svg`;
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": `AI ${cardName} Generator`,
        "applicationCategory": "UtilitiesApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": `Create personalized, AI-generated ${cardType} cards online. Choose styles, customize, and share instantly.`,
        "image": imageUrl,
        "screenshot": imageUrl,
        "operatingSystem": "Web browser",
        "url": `https://mewtrucard.com/${cardType}/`
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white">
            {/* JSON-LD structured data */}
            <Script
                id="json-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            {/* Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
                <div className="absolute top-0 -left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header Section */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            AI {cardName} Generator
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                        Create personalized {cardType} cards in seconds with our free AI card maker. 
                        Simply enter the recipient&apos;s name, pick a style—Classic, Pastel, Ghibli—and let our AI generate a beautiful card for your friends and family. ✨
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <span className="px-3 py-1 bg-purple-50 rounded-full text-sm font-medium text-purple-700">✨ AI generated {cardType} wishes</span>
                        <span className="px-3 py-1 bg-pink-50 rounded-full text-sm font-medium text-pink-700">🎨 Personalized digital {cardType} card</span>
                        <span className="px-3 py-1 bg-blue-50 rounded-full text-sm font-medium text-blue-700">💌 Free AI {cardType} e‑card maker</span>
                    </div>
                </header>

                {/* Card Generator Section */}
                <section className="mb-16 sm:mb-24">
                    <Suspense
                        fallback={
                            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                                <p className="text-gray-500">Creating magic...</p>
                            </div>
                        }
                    >
                        <CardGenerator
                            wishCardType={cardType}
                            initialCardId={''}
                            initialImgUrl={''}
                            cardConfig={cardConfig}
                        />
                    </Suspense>
                </section>


                {/* How to Create Section */}
                <section className="mb-16 sm:mb-24">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            How to Create an AI {cardName} in 3 Steps
                        </span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-purple-600">1</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Enter Details</h3>
                            <p className="text-gray-600">
                                Input the recipient&apos;s name, relationship, and occasion specifics. Our AI {cardType} e‑card maker uses these details to create personalized content.
                            </p>
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-purple-600">2</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Choose a Style</h3>
                            <p className="text-gray-600">
                                Select from multiple design styles for your personalized digital {cardType} card. Whether you prefer Classic, Pastel, or Ghibli-inspired artwork.
                            </p>
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-purple-600">3</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Generate & Share</h3>
                            <p className="text-gray-600">
                                Click generate and our AI creates your unique {cardType} card with AI generated {cardType} wishes. Download or share directly via link.
                            </p>
                        </div>
                    </div>
                </section>

                {cardConfig.why && (
                    <section className="text-center mb-16 sm:mb-24">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        Why Choose Our AI {cardName} Maker?
                        </span>
                    </h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
                            {cardConfig.why.map((feature, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow border border-[#FFC0CB]">
                                    {feature}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 text-gray-600 max-w-2xl mx-auto text-lg">
                            <p>Our AI {cardType} e‑card maker stands out by fusing advanced AI technology with dynamic motion design. Unlike traditional, static card tools, it crafts unique, animated digital {cardType} cards—</p>
                            <p className="font-bold">complete with smooth transitions and subtle effects</p>
                            <p>—that feel genuinely personal and alive.</p>
                        </div>
                    </section>
                )}
                {/* Templates Section */}
                <section className="text-center mb-16 sm:mb-24">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        Free {cardName} Templates Powered by AI
                        </span>
                    </h2>
                    {cardConfig.templateInfo && <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-8 sm:mb-12">
                        {cardConfig.templateInfo}
                    </p>
                    }
                    {!cardConfig.templateInfo && <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-8">
                        Browse our collection of AI-generated {cardName.toLowerCase()} templates featuring stunning artwork and heartfelt messages. Each template showcases what our AI {cardType} e‑card maker can create, with personalized digital {cardType} cards for any occasion and relationship.
                    </p>
                    }
                    <p className="text-gray-600 max-w-2xl mx-auto px-4 mb-8">
                        All templates are fully customizable – you can modify the text, style, and design elements to create the perfect card that expresses your feelings. Our AI-powered platform ensures each card feels personal and unique.
                    </p>

                    <Suspense
                        fallback={
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 py-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="aspect-[2/3] bg-gray-200 rounded-lg mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        }
                    >
                        <SimpleCardGallery wishCardType={cardType} initialCardsData={initialCardsData} tabType="recent" />
                    </Suspense>
                </section>

                {/* FAQ Section */}
                <section className="mb-16 sm:mb-24 max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            FAQ About Our AI {cardName} Maker
                        </span>
                    </h2>
                    
                    <Accordion type="single" collapsible className="w-full">
  {/* ─────────────────── 1. 价格与用量 ─────────────────── */}
  <AccordionItem value="item-1">
    <AccordionTrigger className="text-left text-lg font-medium">
      Is the AI {cardType} e‑card maker really free?
    </AccordionTrigger>
    <AccordionContent className="text-gray-600">
      Yes—core features are 100 % free.
      <ul className="mt-2 list-disc list-inside space-y-1">
        <li>
          <strong>Unlimited</strong> use of all ready‑made {cardType} templates:
          edit, download, customize url and send as many as you like.
        </li>
        <li>
          <strong>AI‑powered personalisation</strong> is also free, but to keep the
          service fast for everyone we cap it at&nbsp;
          <strong>✦ 10 requests per day</strong>
          (the counter resets every 24 h).
        </li>
        <li>
          Need more generations or extra premium styles? You can upgrade at any
          time, but it&apos;s totally optional.
        </li>
      </ul>
    </AccordionContent>
  </AccordionItem>

  {/* ─────────────────── 2. 工作原理 ─────────────────── */}
  <AccordionItem value="item-2">
    <AccordionTrigger className="text-left text-lg font-medium">
      How does the AI generate {cardType} cards?
    </AccordionTrigger>
    <AccordionContent className="text-gray-600">
      Our engine blends a large‑language model with motion‑graphic templates to
      craft bespoke, animated designs. It analyses:
      <ol className="mt-2 list-decimal list-inside space-y-1">
        <li>Your relationship to the recipient</li>
        <li>Occasion‑specific details you provide</li>
        <li>Style or mood preferences (e.g.&nbsp;Pastel, Vintage, Ghibli)</li>
      </ol>
      The result is an on‑demand card with original artwork, heartfelt copy,
      and subtle animations that bring the message to life.
    </AccordionContent>
  </AccordionItem>

  {/* ─────────────────── 3. 后期编辑 ─────────────────── */}
  <AccordionItem value="item-3">
    <AccordionTrigger className="text-left text-lg font-medium">
      Can I edit the {cardType} card after it&rsquo;s generated?
    </AccordionTrigger>
    <AccordionContent className="text-gray-600">
      Absolutely! Tweak text, colours, fonts, layout, or even the animation
      timing. You can regenerate with new prompts or keep fine‑tuning until
      it&rsquo;s perfect—no limit on edits.
      if you use the template, you can only edit the text, music and customize the url.
    </AccordionContent>
  </AccordionItem>

  {/* ─────────────────── 4. 分享与导出 ─────────────────── */}
  <AccordionItem value="item-4">
    <AccordionTrigger className="text-left text-lg font-medium">
      How do I share my AI‑generated {cardType} card?
    </AccordionTrigger>
    <AccordionContent className="text-gray-600">
      Choose the method that suits you:
      <ul className="mt-2 list-disc list-inside space-y-1">
        <li>
          <strong>Download</strong> as a high‑resolution image or short MP4/GIF
          (for animated cards).
        </li>
        <li>
          <strong>Instant link</strong>—copy a unique URL and send via chat,
          email, or social media. No account needed for the recipient.
        </li>
        <li>
          <strong>Print‑ready PDF</strong> for those who prefer a physical
          keepsake.
        </li>
      </ul>
    </AccordionContent>
  </AccordionItem>

  {/* ─────────────────── 5. 与商店卡片比较 ─────────────────── */}
  <AccordionItem value="item-5">
    <AccordionTrigger className="text-left text-lg font-medium">
      What makes these better than store‑bought cards?
    </AccordionTrigger>
    <AccordionContent className="text-gray-600">
      Every AI {cardType} card is tailor‑made—no two designs are alike.
      Personalised copy, signature animations, and eco‑friendly digital
      delivery mean you get:
      <ul className="mt-2 list-disc list-inside space-y-1">
        <li>
          <strong>Authenticity</strong>—messages and visuals that mirror your
          unique relationship.
        </li>
        <li>
          <strong>Speed</strong>—create and send in under a minute.
        </li>
        <li>
          <strong>Sustainability</strong>—zero paper waste, instant global
          reach.
        </li>
      </ul>
    </AccordionContent>
  </AccordionItem>
</Accordion>
                </section>

                {/* Other Card Types Section */}
                <section className="mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-center mb-6 text-gray-700">
                        Explore More MewTruCard Types
                    </h2>
                    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
                        Looking for different occasion cards? Discover our full range of AI-powered card makers for every special moment in your life. Each type offers the same personalized experience with unique themes and designs.
                    </p>
                    <CardTypeBubbles currentType={cardType} />
                </section>
            </div>
        </main>
    );
}