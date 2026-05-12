export const FREE_SVG_MODEL = 'claude-sonnet-4-6';
export const PREMIUM_SVG_MODEL = 'claude-opus-4-7';

export function getSvgGenerationModel(modelLevel: string): string {
  return modelLevel === 'PREMIUM' ? PREMIUM_SVG_MODEL : FREE_SVG_MODEL;
}
