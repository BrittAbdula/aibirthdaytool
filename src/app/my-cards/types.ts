export interface ApiLogEntry {
  id: number;
  cardId: string;
  cardType: string;
  responseContent: string;
  timestamp: Date;
  // Add other fields from ApiLog if used in the component
}

export interface EditedCardEntry {
  id: string; // Assuming EditedCard.id is a string (e.g., CUID)
  cardType: string | null;
  r2Url: string | null;
  editedContent: string | null;
  createdAt: Date;
  // Add other fields from EditedCard if used in the component
}

export interface RecipientRelationship {
  relationship: string;
  recipientName: string;
  senderName: string | null;
  lastSentDate: Date;
  cardCount: number;
} 