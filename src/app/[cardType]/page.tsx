import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next/types";
import { CardType, getCardConfig, getAllCardTypes } from "@/lib/card-config";
import CardTypeBubbles from "@/components/CardTypeBubbles";
import CardGenerator from "@/components/CardGenerator";
import SimpleCardGallery from '@/app/card-gallery/SimpleCardGallery'
import { getRecentCardsServer } from '@/lib/cards';

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
        title: `AI ${cardName} Generator | Free Online ${cardType} E‑Card Maker - MewTruCard`,
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
        "description": `Create personalized, AI-generated ${cardType} cards online. unlimited creative style, customize, and share instantly.`,
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

            <div className="relative container mx-auto px-4 sm:px-6 py-2 sm:py-6">
                {/* Header Section */}
                <header className="text-center mb-6">
                    <h1 className="text-2xl font-serif font-bold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            AI {cardName} Generator
                        </span>
                    </h1>
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
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            How to Create Your Perfect AI {cardName} in 3 Simple Steps
                        </span>
                    </h2>

                    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
                        Our AI {cardType} card generator makes creating personalized e-cards effortless.
                        No design skills needed - just follow these three easy steps.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col items-center text-center relative">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 text-white font-bold text-2xl">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">Enter Personal Details</h3>
                            <p className="text-gray-600 mb-4">
                                Input the recipient&apos;s name, your relationship, and specific occasion details.
                                Our AI analyzes these to create meaningful, personalized content.
                            </p>
                            <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                Takes 30 seconds
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col items-center text-center relative">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 text-white font-bold text-2xl">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">Unleash Your Creative Vision</h3>
                            <p className="text-gray-600 mb-4">
                                Describe any style you can imagine - vintage watercolor, modern minimalist, fantasy art,
                                or anything else. Our AI brings your creative vision to life with unlimited possibilities.
                            </p>
                            <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                Unlimited styles
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col items-center text-center relative">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 text-white font-bold text-2xl">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">Generate & Share Instantly</h3>
                            <p className="text-gray-600 mb-4">
                                Click generate and watch AI create your unique {cardType} card with custom
                                artwork, heartfelt messages, and smooth animations. Share via link or download.
                            </p>
                            <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                Ready in 10-30 seconds
                            </div>
                        </div>
                    </div>
                </section>

                {/* New features highlight section */}
                <section className="mb-16 sm:mb-24">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-5xl mx-auto">
                        <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
                            Why Our AI {cardName} Generator Leads the Market
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🆓</span>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">Forever Free Core</h4>
                                <p className="text-sm text-gray-600">
                                    Essential features permanently free. Create unlimited {cardType} cards
                                    with core templates and basic AI generation.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">⚡</span>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">Lightning Fast</h4>
                                <p className="text-sm text-gray-600">
                                    Animated cards in 10-30 seconds. Designer-quality static images
                                    in under 2 minutes.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🎨</span>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">Unlimited Creativity</h4>
                                <p className="text-sm text-gray-600">
                                    Complete style customization. From colors to animations -
                                    unleash your imagination without limits.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🚀</span>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">Multiple Formats</h4>
                                <p className="text-sm text-gray-600">
                                    Dynamic animations & stunning static designs available now.
                                    Audio & video cards coming soon!
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-sm text-gray-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Currently Available: Dynamic Cards • Designer Images
                            </div>
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-sm text-gray-600 ml-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                Coming Soon: Audio Cards • Video Cards
                            </div>
                        </div>
                    </div>
                </section>

                {cardConfig.why && (
                    <section className="mb-16 sm:mb-24">
                        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                                Why Our AI {cardName} Generator is the Best Choice
                            </span>
                        </h2>

                        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
                            Unlike generic card makers, our AI technology creates truly personalized {cardType} cards
                            that reflect your unique relationship and the special occasion.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
                            {cardConfig.why.map((feature, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow border border-pink-200 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-pink-600 text-sm">✓</span>
                                        </div>
                                        <div className="text-gray-700">{feature}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-xl max-w-4xl mx-auto">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                                    What Sets Our AI {cardName} Generator Apart?
                                </h3>
                                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                    We&apos;ve revolutionized digital card creation with blazing-fast AI that delivers
                                    <span className="font-semibold text-purple-600"> professional-quality results in seconds, not minutes</span>.
                                    Our platform combines lightning speed with unlimited creative freedom - generate animated cards
                                    in 10-30 seconds or stunning designer images in under 2 minutes.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    <div className="bg-white/70 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-2">🎬 Dynamic Animations</h4>
                                        <p className="text-sm text-gray-600">
                                            Smooth transitions, particle effects, and motion graphics that bring your {cardType} cards to life.
                                        </p>
                                    </div>
                                    <div className="bg-white/70 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-2">🎨 Designer-Quality Artwork</h4>
                                        <p className="text-sm text-gray-600">
                                            Studio-level static images with pixel-perfect details and professional composition.
                                        </p>
                                    </div>
                                </div>

                                <p className="text-sm text-purple-600 mt-4 font-medium">
                                    The future is even brighter: Audio-enhanced cards and full video experiences launching soon!
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Templates Section */}
                <section className="text-center mb-16 sm:mb-24">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            Stunning {cardName} Templates Created by AI
                        </span>
                    </h2>

                    <div className="text-center mb-12">
                        {cardConfig.templateInfo ? (
                            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-6">
                                {cardConfig.templateInfo}
                            </p>
                        ) : (
                            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-6">
                                Explore our collection of AI-generated {cardName.toLowerCase()} templates featuring
                                stunning artwork and heartfelt messages. Each template showcases what our AI {cardType}
                                card generator can create for any relationship and occasion.
                            </p>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                            <p className="text-blue-800 text-sm">
                                <strong>💡 Pro Tip:</strong> All templates are fully customizable! Modify text, music,
                                and sharing URLs to create the perfect {cardType} card that expresses your unique feelings.
                            </p>
                        </div>
                    </div>

                    <Suspense
                        fallback={
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 text-gray-600">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-purple-500"></div>
                                        <span>Loading beautiful {cardType} card templates...</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="aspect-[2/3] bg-gray-200 rounded-lg mb-3"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                    >
                        <SimpleCardGallery wishCardType={cardType} initialCardsData={initialCardsData} tabType="recent" />
                    </Suspense>
                </section>

                {/* Enhanced FAQ Section */}
                <section className="mb-16 sm:mb-24 max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            Frequently Asked Questions - AI {cardName} Generator
                        </span>
                    </h2>

                    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
                        Get answers to common questions about our AI {cardType} card generator, pricing,
                        features, and how to create the perfect personalized e-cards.
                    </p>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {/* Enhanced FAQ items with corrected pricing */}
                        <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                What features are permanently free with the AI {cardType} card generator?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                <strong>Our core features remain permanently free:</strong>
                                <ul className="mt-3 space-y-2 list-disc list-inside">
                                    <li><strong>Unlimited template access</strong> - Edit, customize, and download all pre-made {cardType} templates</li>
                                    <li><strong>Basic AI generation</strong> - Up to 10 AI-generated cards per day with essential styles</li>
                                    <li><strong>Full customization</strong> - Edit text, music, and create custom sharing URLs</li>
                                    <li><strong>Multiple download formats</strong> - High-resolution images, GIFs, and sharing links</li>
                                </ul>
                                <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                                    <p className="text-sm"><strong>Premium features available:</strong> Exclusive premium models, priority processing, and advanced customization options.</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-speed" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                How fast can I create a {cardType} card with AI?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                <strong>We&apos;re the fastest AI card generator on the market:</strong>
                                <div className="mt-3 space-y-3">
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <strong>⚡ Animated Cards: 10-30 seconds</strong>
                                        <p className="text-sm mt-1">Dynamic cards with smooth transitions, particle effects, and motion graphics</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <strong>🎨 Designer Images: 10 seconds to 2 minutes</strong>
                                        <p className="text-sm mt-1">Studio-quality static images with professional composition and pixel-perfect details</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm">
                                    Compare this to traditional design tools that take hours, or other AI platforms that take 5-10 minutes.
                                    Our optimized AI pipeline delivers professional results at unprecedented speed.
                                </p>
                                <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                                    <p className="text-sm"><strong>Coming Soon:</strong> Audio-enhanced cards and full video experiences to give you even more creative options!</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                How does AI create personalized {cardType} cards?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                Our advanced AI system analyzes multiple factors to create unique {cardType} cards:
                                <ol className="mt-3 space-y-2 list-decimal list-inside">
                                    <li><strong>Relationship context</strong> - Understanding your connection to the recipient</li>
                                    <li><strong>Occasion details</strong> - Specific information about the {cardType} event</li>
                                    <li><strong>Creative vision</strong> - Any style you can imagine, from vintage watercolor to futuristic neon</li>
                                    <li><strong>Personal message</strong> - Any custom text or reason you provide</li>
                                </ol>
                                <p className="mt-3">
                                    The result is a completely original {cardType} card with custom artwork,
                                    personalized messages, and smooth animations that bring your sentiment to life.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                Can I edit my {cardType} card after it&apos;s generated?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                <strong>Absolutely!</strong> Our {cardType} card editor offers extensive customization:
                                <ul className="mt-3 space-y-2 list-disc list-inside">
                                    <li><strong>Text editing</strong> - Modify messages, names, and all written content</li>
                                    <li><strong>Visual adjustments</strong> - Change colors, fonts, and layout elements</li>
                                    <li><strong>Animation tweaks</strong> - Adjust timing and motion effects</li>
                                    <li><strong>Music selection</strong> - Add or change background music</li>
                                    <li><strong>URL customization</strong> - Create memorable sharing links</li>
                                </ul>
                                <p className="mt-3">
                                    For AI-generated cards: unlimited edits and regenerations with free daily allowance.
                                    For templates: full text, music, and URL customization always available.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                What are the best ways to share my AI {cardType} card?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                We offer multiple sharing options to suit every preference:
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <strong>🔗 Instant Link Sharing</strong>
                                        <p className="text-sm ml-4">Get a unique URL to share via text, email, or social media. Recipients don&apos;t need an account.</p>
                                    </div>
                                    <div>
                                        <strong>📱 Download Options</strong>
                                        <p className="text-sm ml-4">High-resolution images, animated GIFs, or MP4 videos for offline sharing.</p>
                                    </div>
                                    <div>
                                        <strong>🖨️ Print-Ready Format</strong>
                                        <p className="text-sm ml-4">PDF downloads perfect for physical keepsakes or traditional mailing.</p>
                                    </div>
                                    <div>
                                        <strong>📧 Direct Email</strong>
                                        <p className="text-sm ml-4">Send directly from our platform with personalized subject lines.</p>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                Why choose AI {cardType} cards over store-bought options?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                AI-generated {cardType} cards offer significant advantages:
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <strong>🎯 Complete Personalization</strong>
                                        <p className="text-sm ml-4">Every card is unique, tailored to your specific relationship and occasion</p>
                                    </div>
                                    <div>
                                        <strong>⚡ Speed & Convenience</strong>
                                        <p className="text-sm ml-4">Create and send in under 2 minutes, no shopping or shipping required</p>
                                    </div>
                                    <div>
                                        <strong>🌱 Eco-Friendly</strong>
                                        <p className="text-sm ml-4">Zero paper waste, digital delivery with global instant reach</p>
                                    </div>
                                    <div>
                                        <strong>💰 Cost-Effective</strong>
                                        <p className="text-sm ml-4">Free core features vs. $3-8 for store cards plus shipping costs</p>
                                    </div>
                                    <div>
                                        <strong>✨ Interactive Features</strong>
                                        <p className="text-sm ml-4">Animations, music, and interactive elements impossible with paper cards</p>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-6" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                Can I create any style I imagine for my {cardType} card?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                <strong>Absolutely! Our AI has unlimited creative potential:</strong>
                                <div className="mt-3 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <strong>🎨 Artistic Styles</strong><br />
                                            Watercolor, oil painting, digital art, sketch, photography
                                        </div>
                                        <div>
                                            <strong>🌈 Color Themes</strong><br />
                                            Pastel, vibrant, monochrome, neon, earth tones
                                        </div>
                                        <div>
                                            <strong>🏛️ Art Movements</strong><br />
                                            Impressionist, minimalist, baroque, pop art, surrealist
                                        </div>
                                        <div>
                                            <strong>🎭 Themed Styles</strong><br />
                                            Vintage, futuristic, fantasy, nature, geometric
                                        </div>
                                        <div>
                                            <strong>🎪 Mood & Atmosphere</strong><br />
                                            Romantic, playful, elegant, dramatic, peaceful
                                        </div>
                                        <div>
                                            <strong>🌟 Creative Concepts</strong><br />
                                            Abstract, realistic, cartoon, anime, steampunk
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm bg-purple-50 p-3 rounded">
                                    <strong>💡 Pro Tip:</strong> Be as specific or creative as you want! Describe combinations like
                                    &quot;watercolor sunset with golden typography&quot; or &quot;minimalist geometric design with soft pastels&quot;
                                    - our AI brings any vision to life!
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </section>

                {/* Enhanced Other Card Types Section */}
                <section className="mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-center mb-4 text-gray-700">
                        Explore Our Complete AI Card Generator Collection
                    </h2>
                    <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8">
                        Need a card for a different occasion? Discover our full range of AI-powered card generators.
                        From birthday celebrations to heartfelt apologies, each generator creates personalized,
                        animated designs that perfectly capture your sentiment and strengthen your relationships.
                    </p>
                    <CardTypeBubbles currentType={cardType} />
                </section>
            </div>
        </main>
    );
}