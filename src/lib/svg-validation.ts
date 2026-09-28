import { SaxesParser } from 'saxes';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const DRAWABLE_ELEMENTS = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'use', 'image']);
const DEFINITION_ELEMENTS = new Set(['defs', 'symbol', 'clipPath', 'mask', 'pattern', 'marker']);

/** Validate the actual stored XML, including namespaces; an SVG closing tag is not enough. */
export function validateSvgContent(svg: string): void {
  const parser = new SaxesParser({ xmlns: true });
  let depth = 0;
  let definitionDepth = 0;
  let hasDrawing = false;

  parser.on('doctype', () => { throw new Error('SVG must not contain a DOCTYPE'); });
  parser.on('opentag', tag => {
    // Scripts do not execute in <img> SVGs and cannot provide card content or animation.
    if (tag.local === 'script') throw new Error('SVG cards must render without scripts');
    if (depth === 0) {
      if (tag.local !== 'svg' || tag.uri !== SVG_NAMESPACE) {
        throw new Error('Root must be an SVG element in the SVG namespace');
      }
      const viewBox = tag.attributes.viewBox?.value;
      const width = tag.attributes.width?.value;
      const height = tag.attributes.height?.value;
      if (viewBox) {
        const values = viewBox.trim().split(/[\s,]+/).map(Number);
        if (values.length !== 4 || !values.every(Number.isFinite) || values[2] <= 0 || values[3] <= 0) {
          throw new Error('SVG viewBox must have positive width and height');
        }
      } else if (!width || !height) {
        throw new Error('SVG requires a viewBox or explicit width and height');
      }
      for (const value of [width, height]) {
        if (value !== undefined && (!/^\d*\.?\d+(?:px|pt|pc|mm|cm|in|em|ex|%)?$/.test(value.trim()) || parseFloat(value) <= 0)) {
          throw new Error('SVG dimensions must be positive lengths');
        }
      }
    }
    depth++;
    if (tag.uri === SVG_NAMESPACE && DEFINITION_ELEMENTS.has(tag.local)) definitionDepth++;
    if (!definitionDepth && tag.uri === SVG_NAMESPACE && DRAWABLE_ELEMENTS.has(tag.local)) hasDrawing = true;
  });
  parser.on('closetag', tag => {
    if (tag.uri === SVG_NAMESPACE && DEFINITION_ELEMENTS.has(tag.local)) definitionDepth--;
    depth--;
  });
  try {
    parser.write(svg).close();
    if (!hasDrawing) throw new Error('SVG contains no drawable content');
  } catch (error) {
    throw new Error(`Invalid SVG: ${error instanceof Error ? error.message : 'XML parsing failed'}`);
  }
}
