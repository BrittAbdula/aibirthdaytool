export const FREE_SVG_MODEL = 'openai/gpt-5.6-luna';
export const PREMIUM_SVG_MODEL = FREE_SVG_MODEL;

export function getSvgGenerationModel(modelLevel: string): string {
  return modelLevel === 'PREMIUM' ? PREMIUM_SVG_MODEL : FREE_SVG_MODEL;
}
