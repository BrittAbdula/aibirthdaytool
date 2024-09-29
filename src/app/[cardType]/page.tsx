import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Metadata } from "next/types";
import { CardType, getCardConfig } from "@/lib/card-config";
import CardTypeBubbles from "@/components/CardTypeBubbles";
import CardGenerator from "@/components/CardGenerator";


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
            canonical: `https://www.mewtrucard.com/${cardType}/`,
        },
    };
}

export default function CardGeneratorPage({ params }: CardGeneratorPageProps) {
    const cardType = params.cardType as CardType;
    const cardName = (params.cardType as string).charAt(0).toUpperCase() + (params.cardType as string).slice(1) as CardType;
    const cardConfig = getCardConfig(cardType);

    if (!cardConfig) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-8 sm:mb-12 text-[#4A4A4A]">
                <span className="text-pink-500">{cardName}</span> MewTruCard Generator
            </h1>
            <Suspense fallback={<div>Loading card generator...</div>}>
                <CardGenerator wishCardType={cardType} />
            </Suspense>
            <CardTypeBubbles currentType={cardType} />
        </div>
    );
}