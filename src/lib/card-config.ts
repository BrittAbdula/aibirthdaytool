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

export interface CardConfig {
  title: string;
  label: string;
  fields: Field[];
  templateInfo?: string;
  why?: string[];
  advancedFields?: Field[];
  promptContent: string;
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
      promptContent: generator.promptContent
    };
  },
  ['card-config'],
  { revalidate: 1 } // 1小时后重新验证
);

// 获取所有公开的卡片类型
export const getAllCardTypes = unstable_cache(
  async (): Promise<{ type: CardType; label: string }[]> => {
    const generators = await prisma.cardGenerator.findMany({
      where: {
        OR: [
          { isSystem: true },
          { isPublic: true }
        ]
      },
      select: {
        slug: true,
        label: true
      }
    });

    return generators.map(generator => ({
      type: generator.slug,
      label: generator.label
    }));
  },
  ['all-card-types'],
  { revalidate: 1 }
);

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
        label: true
      }
    });

    return generators.map(generator => ({
      image: `/card/${generator.slug}.svg`,
      title: generator.label,
      link: `/${generator.slug}/`
    }));
  },
  ['card-previews'],
  { revalidate: 1 }
);