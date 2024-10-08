import React from 'react';
import { notFound } from 'next/navigation';
import CardGenerator from '@/components/CardGenerator';
import { getCardConfig, CardType } from '@/lib/card-config';
import { getTemplateById } from '@/lib/template-config';

interface CardTypeTemplatePageProps {
    params: { cardType: string; templateId: string };
}

export default async function CardTypeTemplatePage({ params }: CardTypeTemplatePageProps) {
    const cardType = params.cardType as CardType;
    const templateId = params.templateId;

    const cardConfig = getCardConfig(cardType);
    if (!cardConfig) {
        notFound();
    }

    const template = await getTemplateById(templateId);
    if (!template) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{cardConfig.title}</h1>
            <CardGenerator wishCardType={cardType} initialTemplate={template.id} />
        </div>
    );
}