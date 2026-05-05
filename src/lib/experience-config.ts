export interface ExperienceLink {
  href: string;
  label: string;
  description: string;
}

export interface ExperienceMetric {
  value: string;
  label: string;
  description: string;
}

export interface CreationPath extends ExperienceLink {
  slug: string;
  eyebrow: string;
  preview: string;
}

export interface ShareAction {
  id: "copy" | "download" | "whatsapp" | "email" | "edit";
  label: string;
  description: string;
}

export const PRIMARY_CREATION_PATHS: CreationPath[] = [
  {
    slug: "birthday",
    href: "/birthday/",
    label: "Birthday",
    eyebrow: "Most used",
    description: "Start with the card people need most often, then personalize names, tone, and message.",
    preview: "/card/birthday.svg",
  },
  {
    slug: "valentine",
    href: "/valentine/",
    label: "Love & Valentine",
    eyebrow: "Romantic",
    description: "Create a sweet card or pair it with a playful surprise link before the reveal.",
    preview: "/card/valentine.svg",
  },
  {
    slug: "sorry",
    href: "/sorry/",
    label: "Sorry",
    eyebrow: "Repair moments",
    description: "Write a sincere apology card that is easy to edit, save, and send by link.",
    preview: "/card/sorry.svg",
  },
  {
    slug: "anniversary",
    href: "/anniversary/",
    label: "Anniversary",
    eyebrow: "Milestones",
    description: "Turn a relationship milestone into a polished card with a personal note.",
    preview: "/card/anniversary.svg",
  },
];

export const BROWSE_INTENT_LINKS: ExperienceLink[] = [
  {
    href: "/card-gallery/",
    label: "Browse public card ideas",
    description: "Use real examples to find a layout, tone, or message direction before creating.",
  },
  {
    href: "/type/birthday/for/friend/",
    label: "Birthday cards for a friend",
    description: "Start from friend-specific birthday ideas when the relationship matters most.",
  },
  {
    href: "/type/birthday/for/mother/",
    label: "Birthday cards for mom",
    description: "Find warmer family examples before writing your own message.",
  },
  {
    href: "/open-your-birthday-surprise/",
    label: "Birthday surprise link",
    description: "Send a reveal page first, then guide the recipient into the final card.",
  },
];

export const FUNNEL_METRICS: ExperienceMetric[] = [
  {
    value: "3 steps",
    label: "from idea to draft",
    description: "Recipient, message, then format.",
  },
  {
    value: "Link ready",
    label: "for everyday sharing",
    description: "Copy, download, or send from the editor.",
  },
  {
    value: "Mobile first",
    label: "for last-minute cards",
    description: "Create from the same phone you use to send.",
  },
];

export const SHARE_ACTIONS: ShareAction[] = [
  {
    id: "copy",
    label: "Copy link",
    description: "Best for texts, DMs, and quick personal sharing.",
  },
  {
    id: "download",
    label: "Download",
    description: "Save the finished image or video for any app.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Open WhatsApp with the card link already attached.",
  },
  {
    id: "email",
    label: "Email",
    description: "Send the card link through a simple email draft.",
  },
  {
    id: "edit",
    label: "Edit again",
    description: "Return to the editor before sending the final version.",
  },
];
