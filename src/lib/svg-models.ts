export const FREE_SVG_MODEL = 'gpt-6-luna';
export const PREMIUM_SVG_MODEL = 'gpt-6-sol';
export const FALLBACK_SVG_MODEL = 'grok-4-7';

export function getSvgGenerationModel(modelLevel: string): string {
  return modelLevel === 'PREMIUM' ? PREMIUM_SVG_MODEL : FREE_SVG_MODEL;
}
