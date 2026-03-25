import { CARD_TYPES, RELATIONSHIPS } from "@/lib/card-constants";

export interface SeoFaq {
  question: string;
  answer: string;
}

export interface SeoLink {
  href: string;
  label: string;
  description?: string;
}

const cardTypeMap = new Map(CARD_TYPES.map((item) => [item.type, item.label]));
const relationshipMap = new Map(
  RELATIONSHIPS.map((item) => [item.value.toLowerCase(), item.label])
);

export function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://mewtrucard.com").replace(
    /\/$/,
    ""
  );
}

export function toAbsoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${normalizedPath}`;
}

export function getSeoCardTypeLabel(cardType: string | null | undefined) {
  if (!cardType) {
    return "Greeting";
  }

  return (
    cardTypeMap.get(cardType.toLowerCase()) ||
    `${cardType.charAt(0).toUpperCase()}${cardType.slice(1)}`
  );
}

export function getSeoRelationshipLabel(relationship: string | null | undefined) {
  if (!relationship) {
    return null;
  }

  const normalized = relationship.trim().toLowerCase();
  return (
    relationshipMap.get(normalized) ||
    `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
  );
}

export function buildCardPreviewAlt(
  cardType: string,
  relationship?: string | null
) {
  const typeLabel = getSeoCardTypeLabel(cardType).toLowerCase();
  const relationshipLabel = getSeoRelationshipLabel(relationship)?.toLowerCase();

  return relationshipLabel
    ? `Example ${typeLabel} card design for ${relationshipLabel}`
    : `Example ${typeLabel} card design`;
}

export function buildCardPreviewTitle(
  cardType: string,
  relationship?: string | null
) {
  const typeLabel = getSeoCardTypeLabel(cardType);
  const relationshipLabel = getSeoRelationshipLabel(relationship);

  return relationshipLabel
    ? `${typeLabel} card idea for ${relationshipLabel}`
    : `${typeLabel} card idea`;
}

export function buildFaqSchema(faqs: SeoFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildOrganizationSchema() {
  const url = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MewTruCard",
    url,
    logo: toAbsoluteUrl("/logo.png"),
    sameAs: ["https://x.com/MewTruCard"],
  };
}

export function buildWebsiteSchema() {
  const url = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MewTruCard",
    url,
    inLanguage: "en",
  };
}

export function buildItemListSchema(name: string, links: SeoLink[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: links.map((link, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: link.label,
      description: link.description,
      url: toAbsoluteUrl(link.href),
    })),
  };
}

export function buildSoftwareApplicationSchema({
  name,
  description,
  path,
  image,
}: {
  name: string;
  description: string;
  path: string;
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description,
    image,
    screenshot: image,
    url: toAbsoluteUrl(path),
  };
}
