export const FREE_SVG_MODEL = 'claude-haiku-4-5-20251001';
export const PREMIUM_SVG_MODEL = FREE_SVG_MODEL;

export function getSvgGenerationModel(modelLevel: string): string {
  return modelLevel === 'PREMIUM' ? PREMIUM_SVG_MODEL : FREE_SVG_MODEL;
}
