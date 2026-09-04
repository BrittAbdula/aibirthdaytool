export function extractSvgContent(content: string): string | null {
  const normalizedContent = normalizeSvgCandidateText(content);
  const svgMatch = normalizedContent.match(/<svg\b[\s\S]*<\/svg>/i);
  if (!svgMatch) return null;

  let svgContent = svgMatch[0]
    .replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, '')
    // Escape bare ampersands, but leave existing named and numeric entities alone —
    // re-escaping &#8212; renders the literal text instead of an em dash.
    .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');

  const openingTagEnd = svgContent.indexOf('>');
  const openingTag = openingTagEnd >= 0 ? svgContent.slice(0, openingTagEnd + 1) : '';
  if (openingTag && !/\sxmlns=/.test(openingTag)) {
    svgContent = svgContent.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return repairDuplicateAttributes(svgContent);
}

const TAG_PATTERN = /<([A-Za-z][\w:-]*)((?:\s+[^\s=<>"']+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
const ATTRIBUTE_PATTERN = /([^\s=<>"']+)\s*=\s*("[^"]*"|'[^']*')/g;

/**
 * A model occasionally writes the same attribute twice on one element
 * (`class="a" ... class="b"`). Browsers treat the SVG as malformed XML and
 * render nothing, so merge class lists and keep the first value of anything else.
 */
export function repairDuplicateAttributes(svg: string): string {
  return svg.replace(TAG_PATTERN, (whole, name: string, attributes: string, selfClose: string) => {
    if (!attributes) return whole;
    const seen = new Map<string, string>();
    let duplicated = false;
    for (const match of attributes.matchAll(ATTRIBUTE_PATTERN)) {
      const key = match[1];
      const value = match[2];
      if (!seen.has(key)) {
        seen.set(key, value);
        continue;
      }
      duplicated = true;
      if (key === 'class') {
        const quote = value[0];
        const merged = `${seen.get(key)!.slice(1, -1)} ${value.slice(1, -1)}`.trim();
        seen.set(key, `${quote}${merged}${quote}`);
      }
    }
    if (!duplicated) return whole;
    const rebuilt = Array.from(seen.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
    return `<${name} ${rebuilt}${selfClose ? ' /' : ''}>`;
  });
}

function normalizeSvgCandidateText(content: string): string {
  let text = content.trim();
  const fencedSvg = text.match(/```(?:svg|xml|html)?\s*([\s\S]*?)```/i);
  if (fencedSvg?.[1] && /(?:<svg\b|&lt;svg\b)/i.test(fencedSvg[1])) {
    text = fencedSvg[1].trim();
  }

  if (!/<svg\b/i.test(text) && /&lt;svg\b/i.test(text)) {
    text = text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&amp;/g, '&');
  }

  return text;
}
