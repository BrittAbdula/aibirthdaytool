import { Metadata } from "next";

export interface ViralMicrositeLink {
  href: string;
  label: string;
}

export interface ViralMicrositeConfig {
  slug: string;
  title: string;
  description: string;
  shareTitle: string;
  shareUrl: string;
  imageUrl: string;
  imageAlt: string;
  eyebrow: string;
  prompt: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryPhrases: string[];
  acceptedTitle: string;
  acceptedBody: string;
  acceptedCaption?: string;
  replayLabel: string;
  primaryCta: ViralMicrositeLink;
  secondaryCta?: ViralMicrositeLink;
  theme: "rose" | "amber" | "mint" | "violet";
}

export const VIRAL_MICROSITES: ViralMicrositeConfig[] = [
  {
    slug: "will-you-be-my-valentine",
    title: "Will You Be My Valentine? | Interactive Valentine's Day Card",
    description:
      "Send a playful valentine microsite with a moving No button, instant sharing, and a direct path into MewTruCard's valentine card generator.",
    shareTitle: "Will you be my Valentine?",
    shareUrl: "https://mewtrucard.com/will-you-be-my-valentine/",
    imageUrl: "https://store.celeprime.com/cute-love-bear-roses-ou7zho5oosxnpo6k.gif",
    imageAlt: "Cute bear with roses",
    eyebrow: "Interactive valentine microsite",
    prompt: "Will you be my Valentine?",
    primaryLabel: "Yes",
    secondaryLabel: "No",
    secondaryPhrases: [
      "No",
      "Are you sure?",
      "Really sure?",
      "Think again!",
      "Last chance!",
      "You might regret this!",
      "Have a heart!",
      "Change of heart?",
      "You're breaking my heart ;(",
    ],
    acceptedTitle: "Ok yay!!!",
    acceptedBody: "Thank you for accepting my invitation!",
    acceptedCaption: "You're my favorite.",
    replayLabel: "Play again",
    primaryCta: { href: "/valentine/", label: "Create a Valentine card" },
    secondaryCta: { href: "/", label: "Back to MewTruCard" },
    theme: "rose",
  },
  {
    slug: "open-your-birthday-surprise",
    title: "Open Your Birthday Surprise | Interactive Birthday Reveal",
    description:
      "Share a playful birthday surprise microsite, then send the recipient to a personalized birthday card or birthday card link.",
    shareTitle: "Open your birthday surprise",
    shareUrl: "https://mewtrucard.com/open-your-birthday-surprise/",
    imageUrl: "https://store.celeprime.com/birthday.svg",
    imageAlt: "Birthday card surprise",
    eyebrow: "Interactive birthday reveal",
    prompt: "Ready to open your birthday surprise?",
    primaryLabel: "Open it",
    secondaryLabel: "Maybe later",
    secondaryPhrases: [
      "Maybe later",
      "No peeking?",
      "Just one click!",
      "Birthday magic awaits",
      "Open the surprise",
      "This is your moment",
      "Cake first, click second?",
      "Come on, open it!",
    ],
    acceptedTitle: "Surprise unlocked!",
    acceptedBody: "Hope this made the birthday moment feel a little more magical.",
    acceptedCaption: "Now turn it into a real birthday card link.",
    replayLabel: "Reset surprise",
    primaryCta: { href: "/birthday/", label: "Create a birthday card" },
    secondaryCta: { href: "/type/birthday/", label: "Browse birthday ideas" },
    theme: "amber",
  },
  {
    slug: "forgive-me",
    title: "Forgive Me? | Interactive Sorry Microsite",
    description:
      "A lightweight apology microsite built for surprise links and girlfriend or partner apology messages, with a direct CTA into the sorry card generator.",
    shareTitle: "Can I make it up to you?",
    shareUrl: "https://mewtrucard.com/forgive-me/",
    imageUrl: "https://store.celeprime.com/send-love.webp",
    imageAlt: "Heart-shaped apology illustration",
    eyebrow: "Interactive apology link",
    prompt: "Can I make it up to you?",
    primaryLabel: "Maybe",
    secondaryLabel: "Not yet",
    secondaryPhrases: [
      "Not yet",
      "Can we talk?",
      "Please hear me out",
      "I brought a peace offering",
      "One more chance?",
      "I can do better",
      "Let me fix this",
      "I'm really sorry",
    ],
    acceptedTitle: "Thank you for hearing me out.",
    acceptedBody: "Now say it properly with a thoughtful apology card and a shareable link.",
    acceptedCaption: "The best sorry is specific, sincere, and sent on time.",
    replayLabel: "Try again",
    primaryCta: { href: "/sorry/", label: "Create a sorry card" },
    secondaryCta: { href: "/type/sorry/", label: "Browse apology ideas" },
    theme: "mint",
  },
  {
    slug: "will-you-be-my-bridesmaid",
    title: "Will You Be My Bridesmaid? | Interactive Bridesmaid Ask",
    description:
      "A reusable wedding microsite for bridesmaid asks, bridal party reveals, and shareable wedding invitation moments.",
    shareTitle: "Will you be my bridesmaid?",
    shareUrl: "https://mewtrucard.com/will-you-be-my-bridesmaid/",
    imageUrl: "https://store.celeprime.com/wedding.svg",
    imageAlt: "Wedding card illustration",
    eyebrow: "Interactive wedding ask",
    prompt: "Will you be my bridesmaid?",
    primaryLabel: "Absolutely",
    secondaryLabel: "I need a minute",
    secondaryPhrases: [
      "I need a minute",
      "Check your calendar?",
      "You'd look great doing it",
      "This is your sign",
      "The bouquet says yes",
      "One tiny wedding favor",
      "We already picked your role",
      "Still thinking?",
    ],
    acceptedTitle: "Best bridal party decision ever.",
    acceptedBody: "Make it official with a wedding card and a shareable keepsake link.",
    acceptedCaption: "Perfect for bridesmaids, maid of honor asks, and wedding reveals.",
    replayLabel: "Ask again",
    primaryCta: { href: "/wedding/", label: "Create a wedding card" },
    secondaryCta: { href: "/type/wedding/", label: "Browse wedding ideas" },
    theme: "violet",
  },
];

export const VIRAL_MICROSITE_PATHS = VIRAL_MICROSITES.map(
  (microsite) => `/${microsite.slug}/`
);

export function getViralMicrosite(slug: string) {
  return VIRAL_MICROSITES.find((microsite) => microsite.slug === slug);
}

export function buildViralMicrositeMetadata(
  microsite: ViralMicrositeConfig
): Metadata {
  return {
    title: microsite.title,
    description: microsite.description,
    alternates: {
      canonical: `/${microsite.slug}/`,
    },
    openGraph: {
      title: microsite.shareTitle,
      description: microsite.description,
      images: [
        {
          url: microsite.imageUrl,
          alt: microsite.imageAlt,
        },
      ],
      type: "website",
      url: microsite.shareUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: microsite.shareTitle,
      description: microsite.description,
      images: [microsite.imageUrl],
    },
  };
}
