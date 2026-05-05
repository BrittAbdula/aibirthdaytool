import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next/types";
import { getCardConfig, getAllCardTypes } from "@/lib/card-config";
import { getCuratedGeneratorSitemapSlugs } from "@/lib/generator-seo";
import CardTypeBubbles from "@/components/CardTypeBubbles";
import CardGenerator from "@/components/CardGenerator";
import SimpleCardGallery from '@/app/card-gallery/SimpleCardGallery'
import { Card, getRecentCardsServer } from '@/lib/cards';
import GalleryComboLinkSection from "@/components/gallery/GalleryComboLinkSection";
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
    toAbsoluteUrl,
} from "@/lib/seo";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface CardGeneratorPageProps {
    params: Promise<{
        cardType: string;
    }>;
}

function getBaseCardName(label: string) {
    return label.replace(/\s+cards?$/i, "").trim() || label.trim();
}

// Generate static params for all card types at build time
export async function generateStaticParams() {
    const cardTypes = await getAllCardTypes();
    const officialParams = cardTypes.map((cardType) => ({
        cardType: cardType.type,
    }));
    const curatedParams = getCuratedGeneratorSitemapSlugs().map((cardType) => ({
        cardType,
    }));

    return [...officialParams, ...curatedParams];
}

// Force static page generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: CardGeneratorPageProps): Promise<Metadata> {
    const { cardType } = await params;
    const cardConfig = await getCardConfig(cardType);

    if (!cardConfig) {
        return notFound();
    }

    const imageUrl = `https://mewtrucard.com/mewtrucard-generator.jpg`;
    const canonical = toAbsoluteUrl(cardConfig.curatedCanonical);
    const shouldIndex = cardConfig.indexPolicy === "index";

    return {
        title: cardConfig.seoTitle,
        description: cardConfig.seoDescription,
        robots: shouldIndex
            ? undefined
            : {
                index: false,
                follow: true,
            },
        alternates: {
            canonical,
        },
        openGraph: {
            title: cardConfig.seoH1,
            description: cardConfig.seoDescription,
            images: [{
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: `${cardConfig.seoH1} preview`
            }],
            type: 'website',
            url: canonical,
        },
        twitter: {
            card: 'summary_large_image',
            title: cardConfig.seoH1,
            description: cardConfig.seoDescription,
            images: [imageUrl],
        },
    };
}

export default async function CardGeneratorPage({ params }: CardGeneratorPageProps) {
    const resolvedParams = await params;
    const cardType = resolvedParams.cardType;
    const cardConfig = await getCardConfig(cardType);

    if (!cardConfig) {
        notFound();
    }

    if (cardConfig.indexPolicy === "redirect") {
        permanentRedirect(cardConfig.curatedCanonical);
    }

    const baseCardName = getBaseCardName(cardConfig.label);
    const cardKeywordTitle = `${baseCardName} Card`;
    const cardKeywordLower = cardKeywordTitle.toLowerCase();
    const cardKeywordPluralLower = `${baseCardName} cards`.toLowerCase();
    const isBirthdayPage = cardType === 'birthday';
    const generatorDescription = cardConfig.seoDescription;
    const generatorName = cardConfig.seoH1;
    // Get initial cards data
    let initialCardsData: { cards: Card[]; totalPages: number } = { cards: [], totalPages: 0 };
    try {
        initialCardsData = await getRecentCardsServer(1, 20, cardType);
    } catch (error) {
        console.error(`Failed to load public cards for ${cardType}`, error);
    }

    // Prepare JSON-LD structured data
    const imageUrl = cardConfig.isSystem
        ? `https://store.celeprime.com/${cardType}.svg`
        : `https://mewtrucard.com/mewtrucard-generator.jpg`;
    const comboLinks = getSeoRelationshipsForType(cardType).slice(0, 6).map((relationship) => ({
        href: getGalleryComboHref(cardType, relationship),
        title: `${cardKeywordTitle} Ideas for ${getRelationshipLabel(relationship)}`,
        description: `Browse public ${cardKeywordLower} ideas for ${getRelationshipLabel(relationship).toLowerCase()}, then create your own.`,
    }));
    const comboSchemaLinks = comboLinks.map((link) => ({
        href: link.href,
        label: link.title,
        description: link.description,
    }));
    const trustGuide = getGeneratorTrustGuide(cardType, cardKeywordTitle);
    const trustLinks = getTrustHubRelatedLinks(cardType);
    const defaultFaqEntries = [
        {
            question: `What does the free plan include for MewTruCard ${cardKeywordPluralLower}?`,
            answer:
                "The free plan covers the main create-edit-share flow, including basic generation, saved editing, shareable links, and downloads. Premium expands model access, privacy options, and higher-end outputs.",
        },
        {
            question: `How fast can I create a ${cardKeywordLower} with MewTruCard?`,
            answer:
                "Most cards are ready quickly: animated cards often take 10 to 30 seconds, while higher-quality static images can take a bit longer depending on the selected model.",
        },
        {
            question: `Can I edit my MewTruCard ${cardKeywordLower} after it's generated?`,
            answer:
                "Yes. After generation you can reopen the card, update the message, change names or relationship details, and then download it or share it by link.",
        },
        {
            question: `What are the best ways to share my MewTruCard ${cardKeywordLower}?`,
            answer:
                "You can share a direct card link, download the finished card, or use a surprise-link page when the moment benefits from a playful reveal first.",
        },
    ];
    const faqEntries = cardConfig.seoFaqs?.length ? cardConfig.seoFaqs : defaultFaqEntries;
    const seoSchemaLinks = cardConfig.seoLinks.map((link) => ({
        href: link.href,
        label: link.label,
        description: link.description,
    }));

    return (
        <main className="min-h-screen bg-warm-cream text-[#202A3D]">
            <JsonLd
                data={buildSoftwareApplicationSchema({
                    name: generatorName,
                    description: generatorDescription,
                    path: cardConfig.curatedCanonical,
                    image: imageUrl,
                })}
            />
            <JsonLd
                data={buildBreadcrumbSchema([
                    { name: "Home", href: "/" },
                    { name: "Cards", href: "/cards/" },
                    { name: generatorName, href: cardConfig.curatedCanonical },
                ])}
            />
            <JsonLd
                data={buildWebPageSchema({
                    name: generatorName,
                    description: generatorDescription,
                    path: cardConfig.curatedCanonical,
                    reviewedBy: trustGuide.reviewedBy,
                    lastReviewed: trustGuide.lastReviewed,
                    about: [cardConfig.primaryIntent, cardKeywordTitle, "AI greeting card generator", "personalized card maker"],
                })}
            />
            <JsonLd data={buildFaqSchema(faqEntries)} />
            {comboLinks.length > 0 && (
                <JsonLd data={buildItemListSchema(`${cardKeywordTitle} ideas`, comboSchemaLinks)} />
            )}
            {seoSchemaLinks.length > 0 && (
                <JsonLd data={buildItemListSchema(`${generatorName} related paths`, seoSchemaLinks)} />
            )}
            <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                <section className="mb-10 grid gap-10 border-b border-[#F1D6DF]/70 pb-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)] lg:items-center">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                            {cardConfig.primaryIntent}
                        </p>
                        <h1 className="mt-4 max-w-4xl font-serif text-5xl font-semibold leading-tight text-[#202A3D] sm:text-6xl">
                            {cardConfig.seoH1}
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-[#6B7280] sm:text-lg">
                            {cardConfig.seoIntro}
                        </p>
                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#generator"
                                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
                            >
                                Start creating
                            </a>
                            <Link
                                href="#live-gallery"
                                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#F1D6DF] bg-white px-6 py-3 text-sm font-semibold text-[#202A3D] transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-[#FFF8F6]"
                            >
                                Browse ideas first
                            </Link>
                        </div>
                    </div>
                    <div className="mx-auto w-full max-w-sm rounded-xl border border-[#F1D6DF] bg-white p-4 shadow-xl">
                        {/* Generator preview may come from remote storage or local public assets. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt={`${cardKeywordTitle} preview`}
                            width={400}
                            height={600}
                            loading="eager"
                            className="h-auto w-full rounded-lg object-contain"
                        />
                    </div>
                </section>

                <section id="generator" className="mb-16 scroll-mt-28 sm:mb-24">
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
                            headingLevel="h2"
                        />
                    </Suspense>
                </section>

                {cardConfig.seoLinks.length > 0 && (
                    <section className="mb-16 sm:mb-24">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                            Related paths
                        </p>
                        <div className="grid gap-3 md:grid-cols-2">
                            {cardConfig.seoLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="rounded-xl border border-[#F1D6DF] bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                                >
                                    <span className="block text-sm font-bold text-[#202A3D]">{link.label}</span>
                                    <span className="mt-1 block text-sm leading-6 text-[#6B7280]">{link.description}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Templates Section */}
                <section id="live-gallery" className="text-center mb-16 sm:mb-24 scroll-mt-28">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                        Need ideas before you write?
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-warm-coral to-pink-600">
                            {isBirthdayPage ? "Birthday card ideas" : `${cardKeywordTitle} ideas`}
                        </span>
                    </h2>

                    <div className="text-center mb-12">
                        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 mb-6">
                            Browse recent public {cardKeywordPluralLower} for tone, layout, and message inspiration,
                            then open the editor to create a version that fits your moment.
                        </p>
                    </div>

                    <Suspense
                        fallback={
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 text-gray-600">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-purple-500"></div>
                                        <span>Loading recent public {cardKeywordPluralLower}...</span>
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
                        title={isBirthdayPage ? "Birthday cards by relationship" : `${cardKeywordTitle} ideas by relationship`}
                        description={`Need sharper examples before creating your own? Start with a relationship-specific page, then come back to the maker when you are ready to write.`}
                        links={comboLinks}
                    />
                )}


                {/* How to Create Section */}
                <section className="mb-16 sm:mb-24">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-[#202A3D]">
                        {isBirthdayPage ? "How to make a birthday card" : `How to make a ${cardKeywordLower}`}
                    </h2>

                    <p className="text-center text-[#536361] max-w-2xl mx-auto mb-12">
                        Fill in the recipient details, generate the card, then edit and send it.
                        MewTruCard keeps the path simple so you can move from idea to card link quickly.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#F1D6DF] flex flex-col items-center text-center relative">
                            <div className="w-16 h-16 bg-[#202A3D] rounded-full flex items-center justify-center mb-4 text-white font-bold text-2xl">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-[#202A3D]">Recipient & occasion</h3>
                            <p className="text-[#536361] mb-4">
                                Start with who the card is for, the occasion, and any names or relationship details that make the draft personal.
                            </p>
                            <div className="text-sm text-[#202A3D] bg-[#FFF1F5] px-3 py-1 rounded-full">
                                Context first
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#F1D6DF] flex flex-col items-center text-center relative">
                            <div className="w-16 h-16 bg-[#B4375F] rounded-full flex items-center justify-center mb-4 text-white font-bold text-2xl">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-[#202A3D]">Message & tone</h3>
                            <p className="text-[#536361] mb-4">
                                Write the message you want to send, then choose whether it should feel heartfelt, playful, elegant, or romantic.
                            </p>
                            <div className="text-sm text-[#8A2D4C] bg-[#FFF1F5] px-3 py-1 rounded-full">
                                Clear writing direction
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#F1D6DF] flex flex-col items-center text-center relative">
                            <div className="w-16 h-16 bg-[#E5B72E] rounded-full flex items-center justify-center mb-4 text-white font-bold text-2xl">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-[#202A3D]">Format, style & sharing</h3>
                            <p className="text-[#536361] mb-4">
                                Choose the card format and quality tier only after the message is clear, then generate, edit, copy, download, or share.
                            </p>
                            <div className="text-sm text-[#70510F] bg-[#FFF8E1] px-3 py-1 rounded-full">
                                Share-ready output
                            </div>
                        </div>
                    </div>
                </section>

                <TrustSignalsSection
                    title={`How this ${cardKeywordLower} guide is prepared`}
                    description={`This page is written to help visitors decide how to approach a ${cardKeywordLower}, using the real MewTruCard flow and public example patterns instead of generic greeting-card filler.`}
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
                                Why this {cardKeywordLower} flow works
                            </span>
                        </h2>

                        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
                            The goal is straightforward: help you move from idea to a finished {cardKeywordLower} without losing the personal details that matter.
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

                        <div className="bg-gradient-to-r from-pink-50 via-white to-purple-50 p-8 rounded-xl max-w-4xl mx-auto">
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
                                            Smooth transitions, particle effects, and motion graphics that bring your {cardKeywordPluralLower} to life.
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
                            {isBirthdayPage ? "Birthday card maker FAQ" : `${cardKeywordTitle} generator FAQ`}
                        </span>
                    </h2>

                    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
                        Get answers to common questions about creating, editing, and sharing a MewTruCard {cardKeywordLower}.
                    </p>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {/* Enhanced FAQ items with corrected pricing */}
                        <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                What does the free plan include for MewTruCard {cardKeywordPluralLower}?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                <strong>The free plan covers the main create-edit-share flow:</strong>
                                <ul className="mt-3 space-y-2 list-disc list-inside">
                                    <li><strong>Free plan access</strong> - Create cards with a daily allowance on the standard flow</li>
                                    <li><strong>Saved editing flow</strong> - Generate a draft, then return to edit and send</li>
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
                                How fast can I create a {cardKeywordLower} with MewTruCard?
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
                                How does MewTruCard create personalized {cardKeywordPluralLower}?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                MewTruCard analyzes multiple factors to create unique {cardKeywordPluralLower}:
                                <ol className="mt-3 space-y-2 list-decimal list-inside">
                                    <li><strong>Relationship context</strong> - Understanding your connection to the recipient</li>
                                    <li><strong>Occasion details</strong> - Specific information about the moment you want to send</li>
                                    <li><strong>Creative vision</strong> - Any style you can imagine, from vintage watercolor to futuristic neon</li>
                                    <li><strong>Personal message</strong> - Any custom text or reason you provide</li>
                                </ol>
                                <p className="mt-3">
                                    The result is a completely original {cardKeywordLower} with custom artwork,
                                    personalized messages, and smooth animations that bring your sentiment to life.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                Can I edit my MewTruCard {cardKeywordLower} after it&apos;s generated?
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
                                    For generated cards, the standard flow is: generate, edit, save, then send.
                                    Sharing links and recipient details are part of the core editing experience.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6">
                            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                                What are the best ways to share my MewTruCard {cardKeywordLower}?
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
                                Why choose MewTruCard {cardKeywordPluralLower} over store-bought options?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 pt-4">
                                MewTruCard-generated {cardKeywordPluralLower} offer significant advantages:
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
                                Can I create any style I imagine for my MewTruCard {cardKeywordLower}?
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
