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

export function extractEditableFields(svgContent: string): Record<string, string> {
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
  const textElements = svgDoc.querySelectorAll('text')
  
  const editableFields: Record<string, string> = {}
  
  textElements.forEach((el, index) => {
    const id = el.id || `text-${index + 1}`
    let content = ''

    // 处理 tspan 元素
    const tspans = el.querySelectorAll('tspan')
    if (tspans.length > 0) {
      content = Array.from(tspans)
        .map(tspan => tspan.textContent?.trim())
        .filter(Boolean)
        .join('\n')
    } else {
      content = el.textContent?.trim() || ''
    }
    
    if (content) {
      editableFields[id] = content
    }
  })
  
  return editableFields
}

export function updateSvgContent(svgContent: string, updatedFields: Record<string, string>): string {
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
  
  Object.entries(updatedFields).forEach(([id, content]) => {
    const element = svgDoc.getElementById(id) || svgDoc.querySelector(`text:nth-of-type(${parseInt(id.split('-')[1])})`)
    if (element) {
      // 清除现有内容
      while (element.firstChild) {
        element.removeChild(element.firstChild)
      }

      // 添加新内容，处理换行
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        const tspan = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
        tspan.textContent = line
        tspan.setAttribute('x', element.getAttribute('x') || '0')
        tspan.setAttribute('dy', index === 0 ? '0' : '1.2em')
        element.appendChild(tspan)
      })
    }
  })
  
  return new XMLSerializer().serializeToString(svgDoc)
}

// 缓存已加载的SVG内容
const svgCache = new Map<string, string>()

export async function fetchSvgContent(r2Url: string | null, fallbackContent: string): Promise<string> {
  if (!r2Url) {
    return fallbackContent
  }

  // 检查缓存
  const cachedContent = svgCache.get(r2Url)
  if (cachedContent) {
    return cachedContent
  }

  try {
    // 设置超时时间
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

    const response = await fetch(r2Url, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'public, max-age=31536000', // 1年缓存
      },
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error('Failed to fetch SVG from R2:', response.statusText)
      return fallbackContent
    }
    
    const svgContent = await response.text()
    if (svgContent.includes('<svg')) {
      // 存入缓存
      svgCache.set(r2Url, svgContent)
      return svgContent
    }
    return fallbackContent
  } catch (error) {
    console.error('Error fetching SVG from R2:', error)
    return fallbackContent
  }
}

export function extractSvgFromResponse(responseContent: string): string {
  const svgRegex = /<svg[\s\S]*?<\/svg>/i;
  const match = responseContent.match(svgRegex);
  return match ? match[0] : '';
}