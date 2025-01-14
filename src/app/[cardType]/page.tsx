import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next/types";
import { CardType, getCardConfig, getAllCardTypes } from "@/lib/card-config";
import CardTypeBubbles from "@/components/CardTypeBubbles";
import CardGenerator from "@/components/CardGenerator";
import { getDefaultCardByCardType } from "@/lib/cards";
import CardGallery from '@/app/card-gallery/CardGallery'
import { getRecentCardsServer } from '@/lib/cards';
import Breadcrumb from "@/components/Breadcrumb"; 

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
    // console.log(cardConfig)

    if (!cardConfig) {
        return notFound();
    }

    const cardName = cardConfig.label;
    return {
        title: `${cardName} Card Generator - MewTruCard`,
        description: `Create personalized ${cardType} cards with MewTruCard's AI-powered generator. Easy to use with beautiful ${cardType} card templates.`,
        alternates: {
            canonical: `https://mewtrucard.com/${cardType}/`,
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
    const { cards, totalPages } = await getRecentCardsServer(1, 12, cardType);
    const initialCardsData = {
        cards,
        totalPages
    };

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
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            {cardName} Card Generator
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                        Create a personalized {cardName.toLowerCase()} card with AI magic ✨
                    </p>
                </header>

                {/* Card Generator Section */}
                <section >
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
                            initialSVG={''}
                            cardConfig={cardConfig}
                        />
                    </Suspense>
                </section>


                {cardConfig.why && (
                    <section className="text-center my-16 sm:mb-24">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            Why MewtruCard&apos;s {cardName} card
                        </span>
                    </h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
                            {cardConfig.why.map((feature, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow border border-[#FFC0CB]">
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {/* Templates Section */}
                <section className="text-center mb-16 sm:mb-24">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            {cardName} card templates
                        </span>
                    </h2>
                    {cardConfig.templateInfo && <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-8 sm:mb-12">
                        {cardConfig.templateInfo}
                    </p>
                    }
                    {!cardConfig.templateInfo && <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-8 sm:mb-12">
                        Send your love and warm wishes on personalized, {cardName.toLowerCase()} cards from MewtruCard collection of free customizable templates ✨
                    </p>
                    }

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
                        <CardGallery wishCardType={cardType} initialCardsData={initialCardsData} />
                    </Suspense>
                </section>

                {/* Other Card Types Section */}
                <section className="mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-center mb-6 text-gray-700">
                        Explore More MewTruCard Types
                    </h2>
                    <CardTypeBubbles currentType={cardType} />
                </section>
            </div>
        </main>
    );
}