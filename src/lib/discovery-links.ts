import { getGalleryComboHref } from "@/lib/gallery-combos";

export interface DiscoveryLink {
  href: string;
  label: string;
  description: string;
}

export const EXPLORE_OCCASION_LINKS: DiscoveryLink[] = [
  {
    href: "/birthday/",
    label: "Birthday cards",
    description: "Start with the most popular card flow and personalize it fast.",
  },
  {
    href: "/valentine/",
    label: "Valentine cards",
    description: "Romantic cards, playful asks, and ready-to-share love notes.",
  },
  {
    href: "/sorry/",
    label: "Apology cards",
    description: "Say sorry with a specific message and a thoughtful card link.",
  },
  {
    href: "/anniversary/",
    label: "Anniversary cards",
    description: "Celebrate milestones with a polished card and signature message.",
  },
];

export const EXPLORE_RECIPIENT_LINKS: DiscoveryLink[] = [
  {
    href: getGalleryComboHref("birthday", "friend"),
    label: "For a friend",
    description: "Birthday ideas that feel warm, casual, and genuinely personal.",
  },
  {
    href: getGalleryComboHref("birthday", "mother"),
    label: "For mom",
    description: "Heartfelt birthday cards for mothers and family celebrations.",
  },
  {
    href: getGalleryComboHref("valentine", "girlfriend"),
    label: "For a girlfriend",
    description: "Romantic valentine ideas and sweet relationship cards.",
  },
  {
    href: getGalleryComboHref("anniversary", "husband"),
    label: "For a husband",
    description: "Anniversary messages and cards for long-term relationships.",
  },
];

export const EXPLORE_SURPRISE_LINKS: DiscoveryLink[] = [
  {
    href: "/open-your-birthday-surprise/",
    label: "Birthday surprise link",
    description: "Turn a birthday reveal into a playful page before the real card.",
  },
  {
    href: "/will-you-be-my-valentine/",
    label: "Valentine ask",
    description: "A shareable yes-or-no page for flirty, lightweight moments.",
  },
  {
    href: "/forgive-me/",
    label: "Forgive me",
    description: "Use a surprise apology page before sending the actual card.",
  },
  {
    href: "/will-you-be-my-bridesmaid/",
    label: "Bridesmaid ask",
    description: "A reusable special-moment page for bridal party reveals.",
  },
];

export const FEATURED_GENERATOR_LINKS: DiscoveryLink[] = [
  {
    href: "/birthday/",
    label: "Birthday",
    description: "Best for quick wins, repeat sending, and shareable links.",
  },
  {
    href: "/valentine/",
    label: "Valentine",
    description: "Ideal for romantic notes, playful asks, and surprise reveals.",
  },
  {
    href: "/sorry/",
    label: "Sorry",
    description: "Good for repair moments, apology links, and sincere messages.",
  },
  {
    href: "/anniversary/",
    label: "Anniversary",
    description: "Designed for milestone messages and relationship celebrations.",
  },
];
