import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { CardType, getCardConfig } from "@/lib/card-config";
import CardTypeBubbles from "@/components/CardTypeBubbles";

const DynamicCardGenerator = dynamic(() => import("@/components/CardGenerator"), {
    loading: () => <p>Loading...</p>,
});

interface CardGeneratorPageProps {
    params: {
        cardType: string;
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
                <DynamicCardGenerator wishCardType={cardType} />
            </Suspense>
            <CardTypeBubbles currentType={cardType} />
        </div>
    );
}