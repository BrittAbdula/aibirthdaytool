import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next/types";
import { CardType, getCardConfig } from "@/lib/card-config";
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
    const defaultCard = await getDefaultCardByCardType(cardType);
    const initialCardsData = await getRecentCardsServer(1, 10, cardType);
    if (!cardConfig) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 sm:py-12">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-8 sm:mb-12 text-gray-800">
                <span className="text-pink-500">{cardName}</span> MewTruCard Generator
            </h1>
            <Suspense fallback={<div className="text-center text-gray-600">Loading card generator...</div>}>
                <CardGenerator wishCardType={cardType} initialCardId={defaultCard.cardId} initialSVG={defaultCard.responseContent} />
            </Suspense>
            {/* <h2 className="text-2xl font-serif font-semibold text-center mt-12 mb-6 text-gray-700">
            <span className="text-pink-500">{cardName} Card</span> Templates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {templates.map((template) => (
                    <Template key={template.id} template={template} />
                ))}
            </div> */}

      <h2 className="text-3xl font-bold mb-12 text-center">
        Use <span className="text-purple-600">Templates</span>
      </h2>
      <Suspense fallback={<div>Loading...</div>}>
        <CardMarquee wishCardType={cardType} initialCardsData={initialCardsData} />
      </Suspense>
            <h2 className="text-2xl font-serif font-semibold text-center mt-12 mb-6 text-gray-700">
              Other Card Types
            </h2>
            <div className="mt-12">
                <CardTypeBubbles currentType={cardType} />
            </div>
        </div>
    );
}