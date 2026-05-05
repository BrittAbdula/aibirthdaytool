export type GeneratorIndexPolicy = "index" | "noindex" | "redirect";

export interface GeneratorSeoLink {
  href: string;
  label: string;
  description: string;
}

export interface GeneratorSeoFaq {
  question: string;
  answer: string;
}

export interface GeneratorSeoConfig {
  seoTitle: string;
  seoDescription: string;
  primaryIntent: string;
  indexPolicy: GeneratorIndexPolicy;
  curatedCanonical: string;
  seoH1: string;
  seoIntro: string;
  seoLinks: GeneratorSeoLink[];
  seoFaqs?: GeneratorSeoFaq[];
}

export interface GeneratorSeoInput {
  slug: string;
  label: string;
  isSystem: boolean;
}

const CURATED_GENERATOR_SITEMAP_SLUGS = [
  "happy-birthday",
  "friendship-card",
] as const;

const generatorSeoOverrides: Record<string, Partial<GeneratorSeoConfig>> = {
  birthday: {
    seoTitle: "Free AI Birthday Card Maker | Share by Link - MewTruCard",
    seoDescription:
      "Create a free AI birthday card with name and message, then download it or share by link. No design needed, just personalize and send.",
    primaryIntent: "free AI birthday card maker",
    seoH1: "Free AI Birthday Card Maker You Can Share by Link",
    seoIntro:
      "Make a birthday card online without opening a design tool. Add the recipient name, relationship, message, and sender details, then create a shareable birthday card link or download the finished card.",
    seoLinks: [
      {
        href: "/open-your-birthday-surprise/",
        label: "Birthday surprise link",
        description: "Open a playful birthday reveal before the final card.",
      },
      {
        href: "/type/birthday/",
        label: "Birthday card ideas",
        description: "Compare public birthday card examples before creating.",
      },
      {
        href: "/type/birthday/for/friend/",
        label: "Birthday cards for a friend",
        description: "Use friend-specific examples for warmer messages.",
      },
      {
        href: "/type/birthday/for/mother/",
        label: "Birthday cards for mom",
        description: "Find heartfelt birthday examples for mothers.",
      },
    ],
    seoFaqs: [
      {
        question: "Can I make a free AI birthday card online?",
        answer:
          "Yes. MewTruCard lets you create a birthday card online, add the name and message, then save, download, or share the finished card by link.",
      },
      {
        question: "Do I need design experience to create a birthday card?",
        answer:
          "No. Start with the birthday card maker, enter the recipient details and message, and let the generator create a first draft you can edit before sending.",
      },
      {
        question: "Can I share the birthday card as a link?",
        answer:
          "Yes. After saving the card, you can copy a shareable link or use the birthday surprise page when you want a playful reveal first.",
      },
      {
        question: "Can I browse birthday card ideas before making one?",
        answer:
          "Yes. The birthday ideas gallery and relationship pages show public examples for friends, parents, partners, and family members.",
      },
    ],
  },
  sorry: {
    seoTitle: "Sorry Website for Girlfriend & Apology Card Maker | MewTruCard",
    seoDescription:
      "Create a sincere apology card or sorry website for your girlfriend, boyfriend, or partner. Add a personal message and share the apology link.",
    primaryIntent: "sorry website for girlfriend",
    seoH1: "Sorry Website and Apology Card Maker",
    seoIntro:
      "Use this apology card maker when a plain text message does not feel thoughtful enough. Write a specific apology, make it personal, and share a sorry card or apology link.",
    seoLinks: [
      {
        href: "/forgive-me/",
        label: "Forgive me apology link",
        description: "Send an interactive apology page before the card.",
      },
      {
        href: "/type/sorry/for/girlfriend/",
        label: "Sorry cards for girlfriend",
        description: "Browse girlfriend-specific apology card examples.",
      },
      {
        href: "/type/sorry/for/boyfriend/",
        label: "Sorry cards for boyfriend",
        description: "Find apology ideas for a boyfriend or partner.",
      },
      {
        href: "/type/sorry/",
        label: "Sorry card ideas",
        description: "Compare apology card examples before creating.",
      },
    ],
    seoFaqs: [
      {
        question: "Can I make a sorry website for my girlfriend?",
        answer:
          "Yes. You can create a sorry card or use the Forgive Me microsite, then share the apology link with a personal message.",
      },
      {
        question: "What should I write in an apology card?",
        answer:
          "Use a specific apology, mention what you understand, and add the next step you want to take. MewTruCard helps turn that message into a shareable card.",
      },
      {
        question: "Can I send the apology as a link?",
        answer:
          "Yes. Save the card and copy the link, or use the interactive apology page when you want the recipient to open a small sorry website first.",
      },
      {
        question: "Can I browse apology card examples first?",
        answer:
          "Yes. The sorry card gallery includes relationship-specific examples, including cards for a girlfriend, boyfriend, spouse, friend, or partner.",
      },
    ],
  },
  valentine: {
    seoTitle: "Free AI Valentine Card Maker | Share a Love Link - MewTruCard",
    seoDescription:
      "Create a free AI Valentine card with a romantic message, then download it or share by link. No design needed for a sweet love note.",
    primaryIntent: "free AI Valentine card maker",
    seoH1: "Free AI Valentine Card Maker",
    seoIntro:
      "Create a Valentine card, playful love note, or shareable romantic link in a few steps. Add the relationship, message, and style, then send the result online.",
    seoLinks: [
      {
        href: "/will-you-be-my-valentine/",
        label: "Will you be my Valentine?",
        description: "Send an interactive Valentine ask before the card.",
      },
      {
        href: "/type/valentine/for/girlfriend/",
        label: "Valentine cards for girlfriend",
        description: "Browse romantic examples for a girlfriend.",
      },
      {
        href: "/type/valentine/for/boyfriend/",
        label: "Valentine cards for boyfriend",
        description: "Find Valentine card ideas for a boyfriend.",
      },
      {
        href: "/type/valentine/",
        label: "Valentine card ideas",
        description: "Compare public Valentine examples before creating.",
      },
    ],
    seoFaqs: [
      {
        question: "Can I make a free AI Valentine card online?",
        answer:
          "Yes. MewTruCard lets you create a Valentine card, personalize the romantic message, and share the final card by link or download.",
      },
      {
        question: "Can I send a Valentine card as a love link?",
        answer:
          "Yes. After creating the card, copy the share link or use the interactive Valentine ask page for a more playful reveal.",
      },
      {
        question: "Can I make Valentine cards for a girlfriend or boyfriend?",
        answer:
          "Yes. Use the relationship pages for girlfriend, boyfriend, wife, husband, crush, or partner examples before creating your own card.",
      },
      {
        question: "Do I need to design the Valentine card myself?",
        answer:
          "No. Add the relationship and message details, choose a format, and let the AI card maker create the first draft for you to review.",
      },
    ],
  },
  "happy-birthday": {
    seoTitle: "Happy Birthday Card Maker | Free AI Birthday Link - MewTruCard",
    seoDescription:
      "Create a happy birthday card online with AI, personalize the name and message, then share the finished birthday card by link.",
    primaryIntent: "happy birthday card maker",
    indexPolicy: "index",
    curatedCanonical: "/happy-birthday/",
    seoH1: "Happy Birthday Card Maker",
    seoIntro:
      "This curated birthday page is for visitors searching specifically for happy birthday card ideas, messages, and shareable birthday card links.",
  },
  "friendship-card": {
    seoTitle: "Friendship Card Maker | Free AI Card for Friends - MewTruCard",
    seoDescription:
      "Create a friendship card online, add a personal message for your friend, and share the finished card by link or download.",
    primaryIntent: "friendship card maker",
    indexPolicy: "index",
    curatedCanonical: "/friendship-card/",
    seoH1: "Friendship Card Maker",
    seoIntro:
      "This curated friendship card page is for users who want a warm card for a friend without starting from a broad greeting card page.",
  },
  "will-you-be-my-valentine-manghud": {
    primaryIntent: "will you be my valentine interactive page",
    indexPolicy: "redirect",
    curatedCanonical: "/will-you-be-my-valentine/",
  },
};

function normalizeSlug(slug: string) {
  return decodeURIComponent(slug).trim().toLowerCase();
}

function normalizeCardLabel(label: string) {
  return label.replace(/\s+cards?$/i, "").trim() || label.trim();
}

function titleCaseSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function buildDefaultSeoConfig({
  slug,
  label,
  isSystem,
}: GeneratorSeoInput): GeneratorSeoConfig {
  const normalizedSlug = normalizeSlug(slug);
  const baseLabel = normalizeCardLabel(label || titleCaseSlug(normalizedSlug));
  const cardKeyword = `${baseLabel} Card`;
  const cardKeywordLower = cardKeyword.toLowerCase();

  return {
    seoTitle: `${cardKeyword} Generator | Create & Share Online - MewTruCard`,
    seoDescription: `Create a personalized ${cardKeywordLower}, edit the message, and share or download it with MewTruCard.`,
    primaryIntent: `${cardKeywordLower} generator`,
    indexPolicy: isSystem ? "index" : "noindex",
    curatedCanonical: `/${normalizedSlug}/`,
    seoH1: `${baseLabel} Card Maker`,
    seoIntro: `Create a personalized ${cardKeywordLower}, then edit and share it online when the result is ready.`,
    seoLinks: [],
  };
}

export function getGeneratorSeoConfig(input: GeneratorSeoInput): GeneratorSeoConfig {
  const normalizedSlug = normalizeSlug(input.slug);
  const baseConfig = buildDefaultSeoConfig({
    ...input,
    slug: normalizedSlug,
  });
  const override = generatorSeoOverrides[normalizedSlug] || {};

  return {
    ...baseConfig,
    ...override,
    seoLinks: override.seoLinks || baseConfig.seoLinks,
    seoFaqs: override.seoFaqs || baseConfig.seoFaqs,
  };
}

export function getCuratedGeneratorSitemapSlugs() {
  return [...CURATED_GENERATOR_SITEMAP_SLUGS];
}
