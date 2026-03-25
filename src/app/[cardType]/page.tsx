import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next/types";
import { getCardConfig, getAllCardTypes } from "@/lib/card-config";
import CardTypeBubbles from "@/components/CardTypeBubbles";
import CardGenerator from "@/components/CardGenerator";
import SimpleCardGallery from '@/app/card-gallery/SimpleCardGallery'
import { Card, getRecentCardsServer } from '@/lib/cards';
import GalleryComboLinkSection from "@/components/gallery/GalleryComboLinkSection";
import HeroCardProof from "@/components/gallery/HeroCardProof";
import JsonLd from "@/components/JsonLd";
import GuidanceGridSection from "@/components/eeat/GuidanceGridSection";
import TrustSignalsSection from "@/components/eeat/TrustSignalsSection";
import {
    getGalleryComboHref,
    getRelationshipLabel,
    getSeoRelationshipsForType,
} from "@/lib/gallery-combos";
import {
    getGeneratorTrustGuide,
    getTrustHubRelatedLinks,
} from "@/lib/eeat-content";
import {
    buildBreadcrumbSchema,
    buildFaqSchema,
    buildItemListSchema,
    buildSoftwareApplicationSchema,
    buildWebPageSchema,
} from "@/lib/seo";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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
    const isBirthdayPage = cardType === 'birthday';
    const description = isBirthdayPage
        ? `Create a free online birthday card, personalize the message, and copy a birthday card link or download it. Sign in to create, save, and send with MewTruCard.`
        : `Create personalized ${cardType} cards with MewTruCard's AI-powered generator online. Sign in to create, edit, download, and share with friends and family.`;

    return {
        title: isBirthdayPage
            ? `Free AI Birthday Card Generator | Online Birthday Card Maker - MewTruCard`
            : `AI ${cardName} Generator | Free Online ${cardType} E‑Card Maker - MewTruCard`,
        description,
        alternates: {
            canonical: `https://mewtrucard.com/${cardType}/`,
        },
        openGraph: {
            title: isBirthdayPage
                ? `Free AI Birthday Card Generator | MewTruCard`
                : `AI ${cardName} Generator | Free Online E‑Card Maker`,
            description,
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
            title: isBirthdayPage
                ? `Free AI Birthday Card Generator | MewTruCard`
                : `AI ${cardName} Generator | Free Online E‑Card Maker`,
            description,
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
    const isBirthdayPage = cardType === 'birthday';
    const generatorDescription = isBirthdayPage
        ? `Create a free online birthday card, personalize the message, and share it by link or download.`
        : `Create personalized, AI-generated ${cardType} cards online, customize them, and share instantly.`;
    // Get initial cards data
    let initialCardsData: { cards: Card[]; totalPages: number } = { cards: [], totalPages: 0 };
    try {
        initialCardsData = await getRecentCardsServer(1, 20, cardType);
    } catch (error) {
        console.error(`Failed to load public cards for ${cardType}`, error);
    }

    // Prepare JSON-LD structured data
    const imageUrl = `https://store.celeprime.com/${cardType}.svg`;
    const comboLinks = getSeoRelationshipsForType(cardType).slice(0, 6).map((relationship) => ({
        href: getGalleryComboHref(cardType, relationship),
        title: `${cardName} Cards for ${getRelationshipLabel(relationship)}`,
        description: `Browse public ${cardName.toLowerCase()} card ideas for ${getRelationshipLabel(relationship).toLowerCase()}, then create your own.`,
    }));
    const comboSchemaLinks = comboLinks.map((link) => ({
        href: link.href,
        label: link.title,
        description: link.description,
    }));
    const trustGuide = getGeneratorTrustGuide(cardType, cardName);
    const trustLinks = getTrustHubRelatedLinks(cardType);
    const faqEntries = [
        {
            question: `What does the free plan include for MewTruCard AI ${cardType} cards?`,
            answer:
                "The free plan covers the main create-edit-share flow, including basic generation, saved editing, shareable links, and downloads. Premium expands model access, privacy options, and higher-end outputs.",
        },
        {
            question: `How fast can I create a ${cardType} card with MewTruCard AI?`,
            answer:
                "Most cards are ready quickly: animated cards often take 10 to 30 seconds, while higher-quality static images can take a bit longer depending on the selected model.",
        },
        {
            question: `Can I edit my MewTruCard ${cardType} card after it's generated?`,
            answer:
                "Yes. After generation you can reopen the card, update the message, change names or relationship details, and then download it or share it by link.",
        },
        {
            question: `What are the best ways to share my MewTruCard AI ${cardType} card?`,
            answer:
                "You can share a direct card link, download the finished card, or use a surprise-link page when the moment benefits from a playful reveal first.",
        },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-b from-warm-cream via-rose-50 to-white">
            <JsonLd
                data={buildSoftwareApplicationSchema({
                    name: `AI ${cardName} Generator`,
                    description: generatorDescription,
                    path: `/${cardType}/`,
                    image: imageUrl,
                })}
            />
            <JsonLd
                data={buildBreadcrumbSchema([
                    { name: "Home", href: "/" },
                    { name: "Cards", href: "/cards/" },
                    { name: `${cardName} generator`, href: `/${cardType}/` },
                ])}
            />
            <JsonLd
                data={buildWebPageSchema({
                    name: `AI ${cardName} Generator`,
                    description: generatorDescription,
                    path: `/${cardType}/`,
                    reviewedBy: trustGuide.reviewedBy,
                    lastReviewed: trustGuide.lastReviewed,
                    about: [cardName, "AI greeting card generator", "personalized card maker"],
                })}
            />
            <JsonLd data={buildFaqSchema(faqEntries)} />
            {comboLinks.length > 0 && (
                <JsonLd data={buildItemListSchema(`${cardName} card ideas`, comboSchemaLinks)} />
            )}

            {/* Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
                <div className="absolute top-0 -left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 py-3 sm:py-8">
                <section className="mb-12 grid gap-8 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(320px,540px)] lg:items-center">
                    <header className="mx-auto min-w-0 max-w-4xl text-center lg:mx-0 lg:max-w-none lg:text-left">
                    <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm lg:justify-start">
                        <span className="rounded-full bg-white/80 px-4 py-2 font-semibold text-orange-700 shadow-sm">
                            Sign in required to create, save, and send
                        </span>
                        {isBirthdayPage && (
                            <span className="rounded-full bg-white/80 px-4 py-2 font-semibold text-orange-700 shadow-sm">
                                Shareable birthday card links
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight sm:text-5xl lg:max-w-3xl">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-warm-coral to-pink-600">
                            {isBirthdayPage ? "Free Online Birthday Card Maker" : `AI ${cardName} Generator - MewTruCard`}
                        </span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg lg:mx-0">
                        {isBirthdayPage
                            ? "Create a birthday card with AI, personalize the message, then copy a shareable birthday card link or download the final card."
                            : `Create a ${cardName.toLowerCase()} card with AI, personalize the message, then save, edit, and share it from your account.`}
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm text-gray-600 lg:justify-start">
                        <span className="rounded-full bg-orange-50 px-3 py-1">Recipient-first form</span>
                        <span className="rounded-full bg-orange-50 px-3 py-1">Editable after generation</span>
                        <span className="rounded-full bg-orange-50 px-3 py-1">Link sharing + download</span>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                        <a
                            href="#generator"
                            className="inline-flex rounded-full bg-gradient-to-r from-warm-coral to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-pink-500 hover:to-pink-600"
                        >
                            Start creating now
                        </a>
                        <a
                            href="#live-gallery"
                            className="inline-flex rounded-full border border-orange-200 bg-white/80 px-5 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                        >
                            See public card ideas
                        </a>
                    </div>
                </header>

                    <HeroCardProof
                        cards={initialCardsData.cards}
                        cardName={cardName}
                        galleryHref="#live-gallery"
                    />
                </section>

                {/* Card Generator Section */}
                <section id="generator" className="mb-16 sm:mb-24">
                    <Suspense
                        fallback={
                            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-warm-coral"></div>
                                <p className="text-gray-500">Creating magic...</p>
                            </div>
                        }
                    >
                        <CardGenerator
                            wishCardType={cardType}
                            initialCardId={''}
                            initialImgUrl={imageUrl}
                            cardConfig={cardConfig}
                        />
                    </Suspense>
                </section>

                {/* Templates Section */}
                <section id="live-gallery" className="text-center mb-16 sm:mb-24 scroll-mt-28">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-warm-coral to-pink-600">
                            Recent Public {cardName} Card Ideas
                        </span>
                    </h2>

                    <div className="text-center mb-12">
                        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 mb-6">
                            Browse real public {cardName.toLowerCase()} cards for tone, layout, and message inspiration,
                            then open the editor to create a version that fits your moment.
                        </p>
                    </div>

                    <Suspense
                        fallback={
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 text-gray-600">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-purple-500"></div>
                                        <span>Loading recent public {cardType} cards...</span>
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

                {comboLinks.length > 0 && (
                    <GalleryComboLinkSection
                        title={`${cardName} Card Ideas by Relationship`}
                        description={`These pages capture stronger long-tail intent than a generic gallery alone. Use them to browse examples first, then open the generator when you are ready to make your own card.`}
                        links={comboLinks}
                    />
                )}


                {/* How to Create Section */}
                <section className="mb-16 sm:mb-24">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-warm-coral to-pink-600">
                            How to Create Your Perfect AI {cardName} in 3 Simple Steps
                        </span>
                    </h2>

                    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
                        Sign in, fill in the recipient details, generate the card, then edit and send it.
                        MewTruCard keeps the path simple so you can move from idea to card link quickly.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col items-center text-center relative">
                            <div className="w-16 h-16 bg-gradient-to-r from-warm-coral to-pink-500 rounded-full flex items-center justify-center mb-4 text-white font-bold text-2xl">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">Enter Personal Details</h3>
                            <p className="text-gray-600 mb-4">
                                Input the recipient&apos;s name, your relationship, and specific occasion details.
                                MewTruCard AI uses this to create more relevant content from the start.
                            </p>
                            <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                Takes 30 seconds
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col items-center text-center relative">
                            <div className="w-16 h-16 bg-gradient-to-r from-warm-coral to-pink-500 rounded-full flex items-center justify-center mb-4 text-white font-bold text-2xl">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">Unleash Your Creative Vision</h3>
                            <p className="text-gray-600 mb-4">
                                Describe any style you can imagine - vintage watercolor, modern minimalist, fantasy art,
                                or anything else. Keep it simple if you want a faster path, or add more direction for a more tailored result.
                            </p>
                            <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                Unlimited styles
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col items-center text-center relative">
                            <div className="w-16 h-16 bg-gradient-to-r from-warm-coral to-pink-500 rounded-full flex items-center justify-center mb-4 text-white font-bold text-2xl">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-800">Generate & Share Instantly</h3>
                            <p className="text-gray-600 mb-4">
                                Click generate and watch MewTruCard AI create your unique {cardType} card with custom
                                artwork and heartfelt messages. Then edit it, copy a link, or download it.
                            </p>
                            <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                Ready in 10-30 seconds
                            </div>
                        </div>
                    </div>
                </section>

                <TrustSignalsSection
                    title={`How this ${cardName} guide is prepared`}
                    description={`This page is written to help visitors decide how to approach a ${cardName.toLowerCase()} card, using the real MewTruCard flow and public example patterns instead of generic greeting-card filler.`}
                    reviewedBy={trustGuide.reviewedBy}
                    lastReviewed={trustGuide.lastReviewed}
                    purpose={trustGuide.purpose}
                    methodology={trustGuide.methodology}
                    links={trustLinks}
                />

                {trustGuide.sections.map((section) => (
                    <GuidanceGridSection
                        key={section.title}
                        title={section.title}
                        description={section.description}
                        cards={section.cards}
                    />
                ))}

                {cardConfig.why && (
                    <section className="mb-16 sm:mb-24">
                        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-warm-coral to-pink-600">
                                Why this {cardName} flow works
                            </span>
                        </h2>

                        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
                            The goal is straightforward: help you move from idea to finished {cardName.toLowerCase()} card without losing the personal details that matter.
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

                        <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-8 rounded-xl max-w-4xl mx-auto">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                                    What you can do after generation
                                </h3>
                                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                    After the first draft is ready, you can keep refining the card instead of starting over. That makes the generator more useful for real send-and-share moments, not just one-off experiments.
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

                            </div>
                        </div>
                    </section>
                )}

                {/* Enhanced FAQ Section */}
                <section className="mb-16 sm:mb-24 max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-warm-coral to-pink-600">
                            Frequently Asked Questions - AI {cardName} Generator
                        </span>
                    </h2>

                    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
                        Get answers to common questions about MewTruCard AI {cardType} card generator, pricing,
                        features, and how to create the perfect personalized e-cards with MewTruCard.
                    </p>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {/* Enhanced FAQ items with corrected pricing */}
                        <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                What does the free plan include for MewTruCard AI {cardType} cards?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                <strong>The free plan covers the main create-edit-share flow:</strong>
                                <ul className="mt-3 space-y-2 list-disc list-inside">
                                    <li><strong>Free plan access</strong> - Create cards with a daily allowance on the standard flow</li>
                                    <li><strong>Saved editing flow</strong> - Sign in, generate, then return to edit and send</li>
                                    <li><strong>Shareable links</strong> - Create direct card links for sending online</li>
                                    <li><strong>Download support</strong> - Export the finished card when you are ready to send it</li>
                                </ul>
                                <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                                    <p className="text-sm"><strong>Premium features available:</strong> Higher-end models, added privacy options, and broader output choices.</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-speed" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                How fast can I create a {cardType} card with MewTruCard AI?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                <strong>Timing depends on the format, model, and amount of detail in the request.</strong>
                                <div className="mt-3 space-y-3">
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <strong>⚡ Lighter image or SVG flows usually finish sooner</strong>
                                        <p className="text-sm mt-1">These are the quickest paths when you want to draft, review, and iterate fast.</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <strong>🎨 Heavier formats can take longer</strong>
                                        <p className="text-sm mt-1">More detailed image requests and premium video outputs usually need more processing time.</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm">
                                    The fastest way to move quickly is to start with a simple brief, review the first draft, then use the editor to refine the result before sending.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                How does MewTruCard AI create personalized {cardType} cards?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                MewTruCard advanced AI system analyzes multiple factors to create unique {cardType} cards:
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
                                Can I edit my MewTruCard {cardType} card after it&apos;s generated?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                <strong>Yes.</strong> After generation, you can review the draft and update the parts that matter before sharing it:
                                <ul className="mt-3 space-y-2 list-disc list-inside">
                                    <li><strong>Editable text fields</strong> - Update names and detected text content in the generated card</li>
                                    <li><strong>Personal message</strong> - Add or revise the message that travels with the card</li>
                                    <li><strong>Recipient and sender details</strong> - Adjust relationship context, recipient name, and sender name</li>
                                    <li><strong>Share settings</strong> - Decide whether the finished card is public and, on supported plans, set a custom URL</li>
                                    <li><strong>Optional music</strong> - Add a Spotify track when the flow supports it</li>
                                </ul>
                                <p className="mt-3">
                                    For generated cards, the standard flow is: sign in, generate, edit, save, then send.
                                    Sharing links and recipient details are part of the core editing experience.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                What are the best ways to share my MewTruCard AI {cardType} card?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                MewTruCard supports a few practical share paths after you save the card:
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <strong>🔗 Instant Link Sharing</strong>
                                        <p className="text-sm ml-4">Get a unique URL to share via text, email, or social media. Recipients don&apos;t need an account.</p>
                                    </div>
                                    <div>
                                        <strong>📱 Download the result</strong>
                                        <p className="text-sm ml-4">Depending on the output, you can download a PNG image or MP4 video for sending elsewhere.</p>
                                    </div>
                                    <div>
                                        <strong>📧 Email or social sharing</strong>
                                        <p className="text-sm ml-4">Use the share link in your mail app or social apps when you want to send the card through channels you already use.</p>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                Why choose MewTruCard AI {cardType} cards over store-bought options?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                MewTruCard AI-generated {cardType} cards offer significant advantages:
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
                                Can I create any style I imagine for my MewTruCard {cardType} card?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                <strong>Absolutely. MewTruCard AI supports a wide range of visual directions:</strong>
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
                                    - MewTruCard AI brings any vision to life!
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
                        Need a card for a different occasion? Discover MewTruCard full range of AI-powered card generators.
                        From birthday celebrations to heartfelt apologies, each MewTruCard generator creates personalized,
                        animated designs that perfectly capture your sentiment and strengthen your relationships.
                    </p>
                    <CardTypeBubbles currentType={cardType} />
                </section>
            </div>
        </main>
    );
}
