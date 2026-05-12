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
    title: "Open Your Birthday Surprise | Chaotic Birthday Mini Game",
    description:
      "A chaotic birthday mini game where the 'later' button runs away and the birthday surprise keeps guilt-tripping you into opening it.",
    shareTitle: "Open your birthday surprise right now",
    shareUrl: "https://mewtrucard.com/open-your-birthday-surprise/",
    imageUrl: "/images/style-presets/birthday-bear-party.gif",
    imageAlt: "Cute birthday bear gif",
    eyebrow: "Chaotic birthday surprise game",
    prompt: "Tap to open your birthday surprise?",
    primaryLabel: "Open it",
    secondaryLabel: "Later",
    secondaryPhrases: [
      "Later",
      "Wait... later later?",
      "Birthday team is disappointed",
      "Cake is literally waiting",
      "One click won't hurt",
      "The candles are melting",
      "This is emotional damage",
      "Open it, birthday bestie",
    ],
    acceptedTitle: "Birthday surprise unlocked!",
    acceptedBody:
      "Excellent decision. The cake, balloons, and your future self all approve.",
    acceptedCaption: "Now make it official with a shareable birthday card.",
    replayLabel: "Reset surprise",
    primaryCta: { href: "/birthday/", label: "Create a birthday card" },
    secondaryCta: { href: "/type/birthday/", label: "Browse birthday ideas" },
    theme: "amber",
  },
  {
    slug: "forgive-me",
    title: "Forgive Me? | Interactive Apology Chaos",
    description:
      "A playful apology mini game where 'not yet' keeps running away and every click turns into a more dramatic apology.",
    shareTitle: "Can I make it up to you... please?",
    shareUrl: "https://mewtrucard.com/forgive-me/",
    imageUrl: "/images/style-presets/apology-sorry-kitten.gif",
    imageAlt: "Cute sorry kitten gif",
    eyebrow: "Interactive apology game",
    prompt: "Can I make it up to you?",
    primaryLabel: "Maybe",
    secondaryLabel: "Not yet",
    secondaryPhrases: [
      "Not yet",
      "Still not yet?",
      "I wrote an apology draft",
      "I can explain with slides",
      "I brought snacks and regret",
      "Please hear my TED talk",
      "One tiny second chance?",
      "Final apology mode activated",
    ],
    acceptedTitle: "Thank you. Peace restored.",
    acceptedBody:
      "You accepted the apology path. Now send a proper sorry card with style.",
    acceptedCaption: "Bonus points if you are specific, sincere, and on time.",
    replayLabel: "Try again",
    primaryCta: { href: "/sorry/", label: "Create a sorry card" },
    secondaryCta: { href: "/type/sorry/", label: "Browse apology ideas" },
    theme: "mint",
  },
  {
    slug: "will-you-be-my-bridesmaid",
    title: "Will You Be My Best Friend Forever? | Interactive Friendship Game",
    description:
      "A chaotic friendship mini game where the 'hmm' button keeps dodging while the yes button gets irresistibly tempting.",
    shareTitle: "Will you be my best friend forever?",
    shareUrl: "https://mewtrucard.com/will-you-be-my-bridesmaid/",
    imageUrl: "/images/style-presets/best-friend-hug.gif",
    imageAlt: "Cute best friend hug gif",
    eyebrow: "Interactive best friend game",
    prompt: "Will you be my best friend forever?",
    primaryLabel: "Obviously yes",
    secondaryLabel: "Hmm...",
    secondaryPhrases: [
      "Hmm...",
      "That sounded uncertain",
      "Friendship audit in progress",
      "We already share memes daily",
      "Bestie contract is ready",
      "Snacks are included",
      "Say yes, legend",
      "This is your final bestie warning",
    ],
    acceptedTitle: "Bestie status confirmed!",
    acceptedBody:
      "Elite choice. This friendship is now officially in legendary mode.",
    acceptedCaption: "Now turn it into a card and send it to your bestie.",
    replayLabel: "Ask again",
    primaryCta: { href: "/wedding/", label: "Create a keepsake card" },
    secondaryCta: { href: "/type/wedding/", label: "Browse card ideas" },
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
