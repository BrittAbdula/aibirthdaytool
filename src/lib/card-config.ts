export type CardType = "birthday" | "love" | "congratulations" | "thankyou" | "holiday" | "anniversary" | "sorry" | "christmas" | "newyear" | "teacher" | "graduation";

interface Field {
  name: string;
  type: "text" | "textarea" | "color" | "select" | "number" | "date" | "age";
  label: string;
  placeholder?: string;
  options?: string[];
  optional?: boolean;
  defaultValue?: string; // 新增：默认值字段
}

export interface CardConfig {
  title: string;
  label: string;
  fields: Field[];
  templateInfo?: string;
  why?: string[];
  advancedFields?: Field[];
}

const relationshipOptions = [
  "Myself",
  "Friend",
  "Father",
  "Mother",
  "Wife",
  "Husband",
  "Boyfriend",
  "Girlfriend",
  "Brother",
  "Sister",
  "Daughter",
  "Grandparent",
  "Student",
  "Classmate",
  "Son",
  "Other"
];

const cardConfigs: Record<CardType, CardConfig> = {
  birthday: {
    title: "Birthday Card Generator",
    label: "Birthday Card",
    fields: [
      { name: "relationship", type: "select", label: "Recipient's Relationship", options: relationshipOptions, optional: false, defaultValue: "Friend" },
      { name: "recipientName", type: "text", label: "Recipient's Name", placeholder: "Enter name", optional: false },
    ],
    advancedFields: [
      { name: "age", type: "age", label: "Age (optional)", optional: true },
      {
        name: "tone", type: "select", label: "Message Tone (optional)", options: [
          "Sincere and Warm", "Playful and Cute", "Romantic and Poetic", "Lighthearted and Joyful", "Inspirational and Encouraging"
        ], optional: true
      },
      {
        name: "bestWishes", type: "select", label: "Best Wishes (optional)", options: [
          "Success", "Happiness", "Good Health", "Love and Joy", "Adventures", "Career Advancement"
        ], optional: true
      },
      { name: "additionalInfo", type: "textarea", label: "Additional Information (optional)", placeholder: "Anything you want to say or your Story", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", placeholder: "Enter your name", optional: true },
    ],
  },
  love: {
    title: "Love Card Generator",
    label: "Love Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      {
        name: "relationship", type: "select", label: "Relationship", options: [
          "Partner", "Spouse", "Crush",
        ].concat(relationshipOptions), optional: false, defaultValue: "Partner"
      },
      { name: "message", type: "textarea", label: "Love story (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  congratulations: {
    title: "Congratulations Card Generator",
    label: "Congratulations Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Friend" },
      { name: "message", type: "textarea", label: "Congratulatory Message (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  thankyou: {
    title: "Thank You Card Generator",
    label: "Thank You Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Friend" },
      { name: "reason", type: "textarea", label: "Reason for Thanks (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  holiday: {
    title: "Holiday Card Generator",
    label: "Holiday Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Friend" },
      {
        name: "holiday", type: "select", label: "Holiday (optional)", options: [
          "Christmas", "New Year", "Easter", "Hanukkah", "Diwali", "Other"
        ], optional: true
      },
      { name: "message", type: "textarea", label: "Holiday Wishes (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  anniversary: {
    title: "Anniversary Card Generator",
    label: "Anniversary Card",
    fields: [
      { name: "celebrantNames", type: "text", label: "Celebrants' Names (e.g., John & Mary Smith)", optional: false },
      { name: "Sender", type: "select", label: "Sender", options: relationshipOptions.filter(option => option !== "Myself"), optional: false, defaultValue: "Boyfriend" },
      { name: "yearsTogether", type: "age", label: "Years Together (optional)", optional: true },
      { name: "StoryOrWishes", type: "textarea", label: "Story or Wishes (optional)", optional: true },
    ],
    templateInfo: "Send your love and warm wishes on personalized, anniversary cards from MewtruCard collection of free customizable templates ✨",
    why: [
      "MewtruCard's AI generator creates truly unique anniversary designs for you - each card is an original masterpiece that tells your story.",
      "Your heartfelt messages become extraordinary with MewtruCard, as our AI crafts personalized anniversary greetings that reflect your special bond.",
      "With MewtruCard's anniversary cards, you maintain full creative control - edit and refine your AI-generated designs until they're perfect.",
      "Share your MewtruCard anniversary moments your way - download as free high-quality images or create musical greeting links that make your celebration unforgettable."
    ]
  },
  sorry: {
    title: "Sorry Card Generator",
    label: "Sorry Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Friend" },
      { name: "reason", type: "textarea", label: "Reason for Apology (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  christmas: {
    title: "Christmas Card Generator",
    label: "Christmas Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Friend" },
      { name: "message", type: "textarea", label: "Christmas Wishes (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  newyear: {
    title: "New Year Card Generator",
    label: "New Year Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Friend" },
      { name: "message", type: "textarea", label: "New Year Wishes (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  teacher: {
    title: "Teacher Card Generator",
    label: "Teacher Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Student" },
      { name: "message", type: "textarea", label: "Wishes (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  graduation: {
    title: "Graduation Card Generator",
    label: "Graduation Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Classmate" },
      { name: "message", type: "textarea", label: "Graduation Wishes (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  
};

export function getCardConfig(cardType: CardType): CardConfig | undefined {
  return cardConfigs[cardType];
}

export function getAllCardTypes(): { type: CardType; label: string }[] {
  return Object.entries(cardConfigs).map(([type, config]) => ({
    type: type as CardType,
    label: config.label
  }));
}