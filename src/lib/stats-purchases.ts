export interface PurchaseSummaryRow {
  sku: string;
  currency: string;
  orders: number;
  buyers: number;
  revenueCents: number;
  cardsGranted: number;
  refundedOrders: number;
}

export interface PurchaseUserRow {
  id: string;
  name: string | null;
  email: string | null;
  packCredits: number;
  orders: number;
  skus: string[];
  lastPurchaseAt: string;
}

export interface PurchaseStatsResponse {
  summary: PurchaseSummaryRow[];
  users: PurchaseUserRow[];
  page: number;
  hasMore: boolean;
}

export function parseStatsPage(value: string | null): number | null {
  if (value === null) return 1;
  if (!/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) && page <= 1000000 ? page : null;
}

export type UserStatsSection = 'credits' | 'generations' | 'purchases' | 'usage';

export interface UserStatsResponse {
  user: { id: string; name: string | null; email: string | null; packCredits: number; createdAt: string };
  credits: Array<{ id: number; amount: number; balanceAfter: number; reason: string; createdAt: string }>;
  generations: Array<{
    id: number; cardId: string; cardType: string; promptVersion: string; timestamp: string;
    status: string; isError: boolean; errorMessage: string | null; r2Url: string | null;
  }>;
  purchases: Array<{
    id: string; sku: string; amountCents: number; currency: string; cardsGranted: number;
    status: string; stripeLivemode: boolean | null; createdAt: string;
  }>;
  usage: Array<{ id: number; date: string; cards: number; adCards: number; count: number }>;
  hasMore: boolean;
}
