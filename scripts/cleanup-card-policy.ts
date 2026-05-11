export const DEFAULT_RETENTION_DAYS = 180;
export const CLEANUP_PROTECTED_ACTIONS = ['copy', 'download', 'send', 'up'] as const;

export type CleanupProtectedAction = (typeof CLEANUP_PROTECTED_ACTIONS)[number];
export type CleanupUserPlan = 'FREE' | 'PREMIUM' | string | null | undefined;

export interface EditedCardCleanupPolicyInput {
  createdAt: Date;
  deleted: boolean;
  customUrl: string | null;
  userPlan: CleanupUserPlan;
  actions: readonly string[];
}

export function getCleanupCutoffDate(
  now: Date = new Date(),
  retentionDays = DEFAULT_RETENTION_DAYS
): Date {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - retentionDays);
  return cutoff;
}

export function isProtectedAction(action: string): action is CleanupProtectedAction {
  return (CLEANUP_PROTECTED_ACTIONS as readonly string[]).includes(action);
}

export function isEditedCardCleanupCandidate(
  card: EditedCardCleanupPolicyInput,
  cutoff: Date
): boolean {
  if (card.createdAt >= cutoff) return false;
  if (card.deleted) return false;
  if (card.customUrl) return false;
  if (card.userPlan === 'PREMIUM') return false;
  return !card.actions.some(isProtectedAction);
}

export function dedupeById<T extends { id: string | number }>(items: readonly T[]): T[] {
  const seen = new Set<string | number>();
  const deduped: T[] = [];

  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  return deduped;
}
