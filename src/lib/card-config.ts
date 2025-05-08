import { prisma } from './prisma'
import { cache } from 'react'

export type CardType = string;

// Special badge types for card display
export type CardBadge = 'hot' | 'new' | 'pop' | 'trending' | 'special' | 'soon';

export interface Field {
  name: string;
  type: "text" | "textarea" | "color" | "select" | "number" | "date" | "age";
  label: string;
  placeholder?: string;
  options?: string[];
  optional?: boolean;
  defaultValue?: string;
}

export interface CardSize {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  orientation: 'portrait' | 'landscape' | 'square';
}

export const CARD_SIZES: Record<string, CardSize> = {
  portrait: {
    id: 'portrait',
    name: 'Portrait',
    width: 480,
    height: 760,
    aspectRatio: '0.63',
    orientation: 'portrait'
  },
  landscape: {
    id: 'landscape',
    name: 'Landscape',
    width: 760,
    height: 480,
    aspectRatio: '1.58',
    orientation: 'landscape'
  },
  square: {
    id: 'square',
    name: 'Square',
    width: 600,
    height: 600,
    aspectRatio: '1',
    orientation: 'square'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    width: 1080,
    height: 1080,
    aspectRatio: '1',
    orientation: 'square'
  },
  story: {
    id: 'story',
    name: 'Story',
    width: 1080,
    height: 1920,
    aspectRatio: '0.56',
    orientation: 'portrait'
  }
};


export interface CardConfig {
  title: string;
  label: string;
  fields: Field[];
  templateInfo?: string;
  why?: string[];
  advancedFields?: Field[];
  promptContent: string;
  defaultSize?: string;
  isSystem: boolean;
}

// 类型守卫函数
function isField(field: unknown): field is Field {
  if (!field || typeof field !== 'object') return false;
  const f = field as any;
  return (
    typeof f.name === 'string' &&
    typeof f.label === 'string' &&
    ['text', 'textarea', 'color', 'select', 'number', 'date', 'age'].includes(f.type)
  );
}

function isFieldArray(fields: unknown): fields is Field[] {
  return Array.isArray(fields) && fields.every(isField);
}

// Replace unstable_cache with React's cache for more reliable caching
export const getCardConfig = cache(
  async (cardType: CardType): Promise<CardConfig | null> => {
    const generator = await prisma.cardGenerator.findFirst({
      where: {
        OR: [
          { isSystem: true, slug: cardType },
          { isPublic: true, slug: cardType }
        ]
      }
    });
    
    if (!generator) return null;

    // 类型安全的字段转换
    const fields = isFieldArray(generator.fields) ? generator.fields : [];
    const advancedFields = generator.advancedFields ? 
      (isFieldArray(generator.advancedFields) ? generator.advancedFields : []) 
      : undefined;
    const why = Array.isArray(generator.why) ? 
      generator.why.filter((item): item is string => typeof item === 'string')
      : undefined;

    return {
      title: generator.title,
      label: generator.label,
      fields,
      templateInfo: generator.templateInfo || undefined,
      why,
      advancedFields,
      promptContent: generator.promptContent,
      isSystem: generator.isSystem
    };
  }
);

// 获取所有公开的卡片类型
export const getAllCardTypes = cache(
  async (): Promise<{ type: CardType; label: string; badge?: CardBadge; description?: string }[]> => {
    const generators = await prisma.cardGenerator.findMany({
      where: {
        OR: [
          { isSystem: true },
        ]
      },
      select: {
        slug: true,
        label: true,
        description: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Current date for calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Defining holidays and special dates
    // Format: [month, day, days before to show badge, card type, badge type]
    const specialDates: [number, number, number, string, CardBadge][] = [
      // Western holidays
      [2, 14, 14, 'valentine', 'soon'], // Valentine's Day (14 days before)
      [6, 16, 7, 'fathersday', 'soon'], // Father's Day - third Sunday in June (approximate)
      [12, 25, 21, 'christmas', 'soon'], // Christmas (3 weeks before)
      [12, 31, 7, 'newyear', 'soon'], // New Year's Eve (7 days before)
      [10, 31, 7, 'halloween', 'soon'], // Halloween (7 days before)
      
      // Chinese holidays
      [1, 22, 14, 'chinesenewyear', 'soon'], // Chinese New Year (approximate - varies by year)
      [8, 15, 7, 'midautumn', 'soon'], // Mid-Autumn Festival (approximate - varies by year)
      
      // Other significant days
      [11, 11, 7, 'singlesday', 'soon'], // Singles Day
      [3, 8, 7, 'womensday', 'soon'], // International Women's Day
      [5, 12, 7, 'mothersday', 'soon'], // Mother's Day - second Sunday in May (approximate)

    ];
    
    // Calculate days until a specific date
    const daysUntil = (month: number, day: number): number => {
      const targetDate = new Date(currentYear, month - 1, day);
      
      // If the date has passed this year, use next year's date
      if (targetDate < now) {
        targetDate.setFullYear(currentYear + 1);
      }
      
      const diffTime = targetDate.getTime() - now.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    
    // Manually defined special cards
    const specialCards: Record<string, CardBadge> = {
      'birthday': 'hot',
      'valentine': 'pop',
      'anniversary': 'trending',
      'holiday': 'special'
    };
    
    return generators.map(generator => {
      // Calculate days since creation
      const daysSinceCreation = Math.floor((Date.now() - new Date(generator.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      
      // Assign badges based on criteria
      let badge: CardBadge | undefined = undefined;
      
      // New badge for cards created in the last 7 days
      if (daysSinceCreation < 7) {
        badge = 'new';
      }
      
      // Check for upcoming holidays
      for (const [month, day, daysBeforeToShow, cardType, badgeType] of specialDates) {
        const daysRemaining = daysUntil(month, day);
        
        // If this card matches a special date type and is within the badge window
        if (generator.slug === cardType && daysRemaining <= daysBeforeToShow) {
          badge = badgeType;
          break;
        }
      }
      
      // Specific type badges override the 'new' and 'soon' badges
      if (generator.slug in specialCards) {
        badge = specialCards[generator.slug];
      }
      
      // Convert null description to undefined to match the return type
      const description = generator.description === null ? undefined : generator.description;
      
      return {
        type: generator.slug,
        label: generator.label,
        description,
        badge
      };
    });
  }
);

// Utility function to validate slug
function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/; // Only allows lowercase letters, numbers, and dashes
  console.log(slug, slugRegex.test(slug))
  return slugRegex.test(slug);
}

// 获取所有卡片生成器的预览信息
export const getAllCardPreviews = cache(
  async () => {
    const generators = await prisma.cardGenerator.findMany({
      where: {
        OR: [
          { isSystem: true },
          { isPublic: true }
        ]
      },
      select: {
        slug: true,
        label: true,
        description: true,
        isSystem: true
      },
      orderBy: {
        updatedAt: 'asc'
      }
    });
    return generators
      .filter(generator => isValidSlug(generator.slug)) // Filter out invalid slugs
      .map(generator => ({
        image: generator.isSystem ? `https://store.celeprime.com/${generator.slug}.svg` : `/card/mewtrucard.svg`,
        title: generator.label,
        link: `/${generator.slug}/`,
        isSystem: generator.isSystem,
        description: generator.description
      }));
  }
);