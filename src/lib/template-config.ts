import { prisma } from './prisma';
import { CardType } from './card-config';
import { unstable_cache } from 'next/cache';

export interface Template {
  id: string;
  cardType: string;
  promptVersion: string;
  name: string;
  description: string;
  previewSvg: string;
  promptContent: string;
}

export async function getTemplatesByCardType(cardType: CardType): Promise<Template[]> {
  return prisma.template.findMany({
    where: { cardType },
  });
}

export async function getTemplateById(id: string): Promise<Template | null> {
  return prisma.template.findUnique({
    where: { id },
  });
}

export const getTemplateByCardType = unstable_cache(
  async (cardType: CardType): Promise<Template | null> => {
    return prisma.template.findFirst({
      where: { cardType },
      orderBy: { createdAt: 'desc' },
    });
  },
  ['template-by-card-type'],
  { revalidate: 1800 } // 1800 秒 = 30 分钟
);