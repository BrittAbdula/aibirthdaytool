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
  "sorry-link",
  "sorry-card-for-gf",
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
        href: "/sorry-link/",
        label: "Send a sorry link",
        description: "An interactive apology they open on their phone — card, message, and a Forgive me? question.",
      },
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
  love: {
    seoTitle: "Love Card for Girlfriend or Boyfriend | Animated, Free, Send as a Link - MewTruCard",
    seoDescription:
      "Make an animated love card with their name and your message, free. Send it as a link they open on their phone — with music and a surprise reveal.",
    primaryIntent: "love card for girlfriend",
    seoH1: "Make a Love Card They Open as a Link",
    seoIntro:
      "Write what you feel, add their name, and turn it into an animated love card. Share it as a link on WhatsApp — they tap, the envelope opens, your words appear.",
    seoLinks: [
      {
        href: "/will-you-be-my-valentine/",
        label: "Will you be mine?",
        description: "Send an interactive ask before the card.",
      },
      {
        href: "/type/love/for/girlfriend/",
        label: "Love cards for girlfriend",
        description: "Browse romantic examples for a girlfriend.",
      },
      {
        href: "/type/love/for/boyfriend/",
        label: "Love cards for boyfriend",
        description: "Find love card ideas for a boyfriend.",
      },
      {
        href: "/type/love/",
        label: "Love card ideas",
        description: "Compare public love card examples before creating.",
      },
    ],
  },
  "sorry-link": {
    seoTitle: "Sorry Link — Send an Interactive Apology They Open on Their Phone | MewTruCard",
    seoDescription:
      "Make a sorry link for your girlfriend, boyfriend, or friend: an animated apology card with your message, music, and a Forgive me? question. Free, share on WhatsApp.",
    primaryIntent: "sorry link",
    indexPolicy: "index",
    curatedCanonical: "/sorry-link/",
    seoH1: "Send a Sorry Link — an Apology They Open on Their Phone",
    seoIntro:
      "A sorry link is more than a card. They tap your link, an envelope opens, your apology appears word by word — then a Forgive me? question with a no button that playfully runs away. Write what happened, and we turn it into a moment.",
    seoLinks: [
      {
        href: "/sorry/",
        label: "Sorry card maker",
        description: "Start with the full apology card maker.",
      },
      {
        href: "/forgive-me/",
        label: "Forgive me page",
        description: "Try the interactive apology experience first.",
      },
      {
        href: "/type/sorry/for/girlfriend/",
        label: "Sorry ideas for girlfriend",
        description: "Browse apology examples for a girlfriend.",
      },
      {
        href: "/type/sorry/for/boyfriend/",
        label: "Sorry ideas for boyfriend",
        description: "Browse apology examples for a boyfriend.",
      },
    ],
    seoFaqs: [
      {
        question: "What is a sorry link?",
        answer:
          "A sorry link is a personal apology page you send instead of a plain text. The person you hurt opens the link, an animated card reveals itself, your message types out, and a Forgive me? question lets them answer — playfully.",
      },
      {
        question: "Can I send the sorry link on WhatsApp?",
        answer:
          "Yes. After creating your apology, tap Send on WhatsApp and the link goes out with a preview image. It works in any chat app or text message.",
      },
      {
        question: "Is the sorry link free?",
        answer:
          "Yes. Creating an animated sorry card, adding your message, and sharing the link — including the Forgive me? game — is free.",
      },
      {
        question: "Can I make a sorry link for my girlfriend or boyfriend?",
        answer:
          "Yes. Tell us what happened and who it is for, and the card, message, and Forgive me? moment are personalized to them.",
      },
      {
        question: "Will I know if they forgive me?",
        answer:
          "Yes. When they answer the Forgive me? question, the answer is saved with your card so you can see it in My Cards.",
      },
    ],
  },
  "sorry-card-for-gf": {
    seoTitle: "Sorry Card for GF — Animated Apology Card with Her Name | MewTruCard",
    seoDescription:
      "Make a sorry card for your gf with her name and your own words. She opens it as a link: animated card, your apology, and a Forgive me? question. Free.",
    primaryIntent: "sorry card for gf",
    indexPolicy: "index",
    curatedCanonical: "/sorry-card-for-gf/",
    seoH1: "Sorry Card for Your GF She Opens as a Link",
    seoIntro:
      "When a text is not enough: write what happened in your own words, add her name, and send her a link. She taps it, the envelope opens, your apology appears — then she gets to answer Forgive me?",
    seoLinks: [
      {
        href: "/sorry-link/",
        label: "What is a sorry link?",
        description: "See how the interactive apology works.",
      },
      {
        href: "/sorry/",
        label: "Sorry card maker",
        description: "Start with the full apology card maker.",
      },
      {
        href: "/type/sorry/for/girlfriend/",
        label: "Sorry ideas for girlfriend",
        description: "Browse apology examples for a girlfriend.",
      },
    ],
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
