export const REFERENCE_EDIT_MODELS = [
  'google/nano-banana-edit',
] as const;

export const PREMIUM_QUALITY_MODELS = [
  'gpt4o-image',
  'google/nano-banana-pro',
  'hm-veo3-fast-video',
  'veo-veo3-fast-video',
  'luma-ray-v2-video',
] as const;

export const STRONG_QUALITY_MODELS = [
  'google/nano-banana',
  'gemini-2.0-flash-image',
  'hm-gpt4o-image',
] as const;

export const TEXT_QUALITY_MODELS = [
  'anthropic/claude-sonnet-4',
  'claude-sonnet-4-20250514',
  'claude-sonnet-4-5-20250929',
  'anthropic/claude-3.7-sonnet',
  'anthropic/claude-3.5-haiku',
  'claude-3-5-haiku-20241022',
  'claude-haiku-4-5-20251001',
  'gemini-3-flash-preview',
  'deepseek/deepseek-chat-v3-0324:free',
] as const;

export const ACTION_WEIGHTS = {
  up: 4,
  send: 3,
  download: 2,
  copy: 1,
} as const;

export type GalleryAction = keyof typeof ACTION_WEIGHTS;

const includesModel = (models: readonly string[], model: string | null) =>
  !!model && models.includes(model);

export function getModelQualityScore(model: string | null): number {
  if (includesModel(REFERENCE_EDIT_MODELS, model)) return 70;
  if (includesModel(PREMIUM_QUALITY_MODELS, model)) return 65;
  if (includesModel(STRONG_QUALITY_MODELS, model)) return 55;
  if (includesModel(TEXT_QUALITY_MODELS, model)) return 40;
  if (model) return 15;
  return 0;
}

export function getWeightedActionCount(actions: Partial<Record<GalleryAction, number>>): number {
  return (
    (actions.up || 0) * ACTION_WEIGHTS.up +
    (actions.send || 0) * ACTION_WEIGHTS.send +
    (actions.download || 0) * ACTION_WEIGHTS.download +
    (actions.copy || 0) * ACTION_WEIGHTS.copy
  );
}

export function getInteractionScore(actions: Partial<Record<GalleryAction, number>>): number {
  return Math.log1p(getWeightedActionCount(actions));
}

export function getRecencyBoost(createdAt: Date, now = new Date()): number {
  const ageHours = Math.max(0, now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  if (ageHours <= 48) return 30;
  if (ageHours <= 7 * 24) return 20;
  if (ageHours <= 30 * 24) return 10;
  if (ageHours <= 90 * 24) return 3;
  return 0;
}
