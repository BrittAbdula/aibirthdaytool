import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractTextFromSvg(svgContent: string): string {
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
  const textElements = svgDoc.querySelectorAll('text')
  
  return Array.from(textElements)
    .map(el => el.textContent?.trim())
    .filter(Boolean)
    .join(' ')
}

export function extractSvgFromResponse(responseContent: string): string {
  const svgRegex = /<svg[\s\S]*?<\/svg>/i;
  const match = responseContent.match(svgRegex);
  return match ? match[0] : '';
}