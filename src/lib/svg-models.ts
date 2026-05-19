export const SVG_GENERATION_MODEL = 'claude-opus-4-7';
export const FREE_SVG_MODEL = SVG_GENERATION_MODEL;
export const PREMIUM_SVG_MODEL = SVG_GENERATION_MODEL;

export function getSvgGenerationModel(modelLevel: string): string {
  return SVG_GENERATION_MODEL;
}
