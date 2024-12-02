export type CardType = "birthday" | "love" | "congratulations" | "thankyou" | "holiday" | "anniversary" | "sorry";

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
      { name: "tone", type: "select", label: "Message Tone (optional)", options: [
        "Sincere and Warm", "Playful and Cute", "Romantic and Poetic", "Lighthearted and Joyful", "Inspirational and Encouraging"
      ], optional: true },
      { name: "bestWishes", type: "select", label: "Best Wishes (optional)", options: [
        "Success", "Happiness", "Good Health", "Love and Joy", "Adventures", "Career Advancement"
      ], optional: true },
      { name: "additionalInfo", type: "textarea", label: "Additional Information (optional)", placeholder: "Anything you want to say or your Story", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", placeholder: "Enter your name", optional: true },
    ],
  },
  love: {
    title: "Love Card Generator",
    label: "Love Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: [
        "Partner", "Spouse", "Crush", "Other"
      ], optional: false, defaultValue: "Partner" },
      { name: "occasion", type: "select", label: "Occasion (optional)", options: [
        "Valentine's Day", "Anniversary", "Just Because", "Other"
      ], optional: true },
      { name: "message", type: "textarea", label: "Love Message (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  congratulations: {
    title: "Congratulations Card Generator",
    label: "Congratulations Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Friend" },
      { name: "achievement", type: "select", label: "Achievement (optional)", options: [
        "Graduation", "New Job", "Promotion", "Wedding", "New Baby", "Other"
      ], optional: true },
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
      { name: "message", type: "textarea", label: "Personal Message (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  holiday: {
    title: "Holiday Card Generator",
    label: "Holiday Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Friend" },
      { name: "holiday", type: "select", label: "Holiday (optional)", options: [
        "Christmas", "New Year", "Easter", "Hanukkah", "Diwali", "Other"
      ], optional: true },
      { name: "message", type: "textarea", label: "Holiday Wishes (optional)", optional: true },
      { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  anniversary: {
    title: "Anniversary Card Generator",
    label: "Anniversary Card",
    fields: [
      { name: "recipientNames", type: "text", label: "Names of the Couple( A & B)", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Friend" },
      { name: "yearsMarried", type: "number", label: "Years Married (optional)", optional: true },
      { name: "message", type: "textarea", label: "Anniversary Wishes (optional)", optional: true },
      // { name: "senderName", type: "text", label: "Your Name (optional)", optional: true },
    ],
  },
  sorry: {
    title: "Sorry Card Generator",
    label: "Sorry Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name", optional: false },
      { name: "relationship", type: "select", label: "Relationship", options: relationshipOptions, optional: false, defaultValue: "Friend" },
      { name: "reason", type: "textarea", label: "Reason for Apology (optional)", optional: true },
      { name: "message", type: "textarea", label: "Apology Message (optional)", optional: true },
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