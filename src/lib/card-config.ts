import { prisma } from './prisma'
import { unstable_cache } from 'next/cache'

export type CardType = string;

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

// 使用 Next.js 的缓存机制
export const getCardConfig = unstable_cache(
  async (cardType: CardType): Promise<CardConfig | null> => {
    const generator = await prisma.cardGenerator.findFirst({
      where: {
        OR: [
          { isSystem: true, slug: cardType },
          { isPublic: true, slug: cardType }
        ]
      }
    });
    // console.log(generator)
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
  },
  ['card-config'],
  { revalidate: 3600 } // 1小时后重新验证
);

// 获取所有公开的卡片类型
export const getAllCardTypes = unstable_cache(
  async (): Promise<{ type: CardType; label: string }[]> => {
    const generators = await prisma.cardGenerator.findMany({
      where: {
        OR: [
          { isSystem: true },
        ]
      },
      select: {
        slug: true,
        label: true,
        description: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return generators.map(generator => ({
      type: generator.slug,
      label: generator.label,
      description: generator.description
    }));
  },
  ['all-card-types'],
  { revalidate: 3600 }
);

// Utility function to validate slug
function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/; // Only allows lowercase letters, numbers, and dashes
  console.log(slug, slugRegex.test(slug))
  return slugRegex.test(slug);
}

// 获取所有卡片生成器的预览信息
export const getAllCardPreviews = unstable_cache(
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
  },
  ['card-previews'],
  { revalidate: 3600 }
);