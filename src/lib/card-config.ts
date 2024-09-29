export type CardType = "birthday" | "love" | "congratulations" | "thankyou" | "holiday" | "anniversary" | "sorry";

interface Field {
  name: string;
  type: "text" | "textarea" | "color" | "select" | "number" | "date" | "age";
  label: string;
  placeholder?: string;
  options?: string[];
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
      { name: "relationship", type: "select", label: "To", options: relationshipOptions},
      { name: "recipientName", type: "text", label: "Recipient's Name", placeholder: "Enter name" },
    ],
    advancedFields: [
      { name: "age", type: "age", label: "Age" },
      { name: "tone", type: "select", label: "Message Tone", options: [
        "Sincere and Warm", "Playful and Cute", "Romantic and Poetic", "Lighthearted and Joyful", "Inspirational and Encouraging"
      ]},
      { name: "bestWishes", type: "select", label: "Best Wishes", options: [
        "Success", "Happiness", "Good Health", "Love and Joy", "Adventures", "Career Advancement"
      ]},
      { name: "additionalInfo", type: "textarea", label: "Additional Information", placeholder: "Anything you want to say or your Story" },
      { name: "senderName", type: "text", label: "Your Name", placeholder: "Enter your name" },
    ],
  },
  love: {
    title: "Love Card Generator",
    label: "Love Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name" },
      { name: "relationship", type: "select", label: "Relationship", options: [
        "Partner", "Spouse", "Crush", "Other"
      ]},
      { name: "occasion", type: "select", label: "Occasion", options: [
        "Valentine's Day", "Anniversary", "Just Because", "Other"
      ]},
      { name: "message", type: "textarea", label: "Love Message" },
      { name: "senderName", type: "text", label: "Your Name" },
    ],
  },
  congratulations: {
    title: "Congratulations Card Generator",
    label: "Congratulations Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name" },
      { name: "achievement", type: "select", label: "Achievement", options: [
        "Graduation", "New Job", "Promotion", "Wedding", "New Baby", "Other"
      ]},
      { name: "message", type: "textarea", label: "Congratulatory Message" },
      { name: "senderName", type: "text", label: "Your Name" },
    ],
  },
  thankyou: {
    title: "Thank You Card Generator",
    label: "Thank You Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name" },
      { name: "reason", type: "textarea", label: "Reason for Thanks" },
      { name: "message", type: "textarea", label: "Personal Message" },
      { name: "senderName", type: "text", label: "Your Name" },
    ],
  },
  holiday: {
    title: "Holiday Card Generator",
    label: "Holiday Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name" },
      { name: "holiday", type: "select", label: "Holiday", options: [
        "Christmas", "New Year", "Hanukkah", "Eid", "Diwali", "Other"
      ]},
      { name: "message", type: "textarea", label: "Holiday Wishes" },
      { name: "senderName", type: "text", label: "Your Name" },
    ],
  },
  anniversary: {
    title: "Anniversary Card Generator",
    label: "Anniversary Card",
    fields: [
      { name: "recipientNames", type: "text", label: "Names of the Couple" },
      { name: "yearsMarried", type: "number", label: "Years Married" },
      { name: "message", type: "textarea", label: "Anniversary Wishes" },
      { name: "senderName", type: "text", label: "Your Name" },
    ],
  },
  sorry: {
    title: "Sorry Card Generator",
    label: "Sorry Card",
    fields: [
      { name: "recipientName", type: "text", label: "Recipient's Name" },
      { name: "reason", type: "textarea", label: "Reason for Apology" },
      { name: "message", type: "textarea", label: "Apology Message" },
      { name: "senderName", type: "text", label: "Your Name" },
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