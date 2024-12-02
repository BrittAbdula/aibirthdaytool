import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next/types";
import { CardType, getCardConfig, getAllCardTypes } from "@/lib/card-config";
import CardTypeBubbles from "@/components/CardTypeBubbles";
import CardGenerator from "@/components/CardGenerator";
import { getDefaultCardByCardType } from "@/lib/cards";
import CardMarquee from "@/components/CardMarquee";
import { getRecentCardsServer } from '@/lib/cards';

interface CardGeneratorPageProps {
    params: {
        cardType: string;
    };
}

// Generate static params for all card types at build time
export async function generateStaticParams() {
    const cardTypes = getAllCardTypes();
    return cardTypes.map((cardType) => ({
        cardType: cardType.type,
    }));
}

// Force static page generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: CardGeneratorPageProps): Promise<Metadata> {
    const cardType = params.cardType as CardType;
    const cardName = cardType.charAt(0).toUpperCase() + cardType.slice(1);
    const cardConfig = getCardConfig(cardType);

    if (!cardConfig) {
        return notFound();
    }

    return {
        title: `${cardName} Card Generator - MewTruCard`,
        description: `Create personalized ${cardType} cards with MewTruCard's AI-powered generator. Easy to use with beautiful ${cardType} card templates.`,
        alternates: {
            canonical: `https://mewtrucard.com/${cardType}/`,
        },
    };
}

export default async function CardGeneratorPage({ params }: CardGeneratorPageProps) {
    const cardType = params.cardType as CardType;
    const cardName = (params.cardType as string).charAt(0).toUpperCase() + (params.cardType as string).slice(1) as CardType;
    const cardConfig = getCardConfig(cardType);
    
    const [defaultCard, initialCardsData] = await Promise.all([
        getDefaultCardByCardType(cardType),
        getRecentCardsServer(1, 10, cardType)
    ]);

    if (!cardConfig) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white">
            {/* Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
                <div className="absolute top-0 -left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header Section */}
                <header className="text-center mb-8 sm:mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            {cardName} Card Generator
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                        Create beautiful {cardName.toLowerCase()} card with AI magic ✨
                    </p>
                </header>

                {/* Card Generator Section */}
                <section className="mb-16 sm:mb-24">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-8">
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
                                initialCardId={defaultCard.cardId} 
                                initialSVG={defaultCard.responseContent} 
                            />
                        </Suspense>
                    </div>
                </section>

                {/* Templates Section */}
                <section className="mb-16 sm:mb-24">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            Popular Templates
                        </span>
                    </h2>
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-8">
                        <Suspense 
                            fallback={
                                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                                    <p className="text-gray-500">Loading templates...</p>
                                </div>
                            }
                        >
                            <CardMarquee wishCardType={cardType} initialCardsData={initialCardsData} />
                        </Suspense>
                    </div>
                </section>

                {/* Other Card Types Section */}
                <section className="mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-center mb-6 text-gray-700">
                        Explore More Card Types
                    </h2>
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-8">
                        <CardTypeBubbles currentType={cardType} />
                    </div>
                </section>
            </div>
        </main>
    );
}