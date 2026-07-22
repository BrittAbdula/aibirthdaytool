import { z } from 'zod';

export const FREE_CREATOR_RECIPIENT_LIMIT = 3;
export const CREATOR_BATCH_LIMIT = 50;
export const CREATOR_IMPORT_LIMIT = 200;

export const CREATOR_OCCASION_TYPES = [
  'birthday',
  'work-anniversary',
  'welcome',
  'appreciation',
] as const;

export const CREATOR_TONES = [
  'warm-professional',
  'celebratory',
  'playful',
  'minimal',
] as const;

export type CreatorOccasionType = typeof CREATOR_OCCASION_TYPES[number];
export type CreatorTone = typeof CREATOR_TONES[number];

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateInput(value: string): boolean {
  if (!datePattern.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export const creatorRecipientInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  occasionType: z.enum(CREATOR_OCCASION_TYPES),
  occasionDate: z.string().refine(isValidDateInput, 'Use a valid date in YYYY-MM-DD format'),
  notes: z.string().trim().max(280).optional().default(''),
});

export const creatorBrandPresetInputSchema = z.object({
  organizationName: z.string().trim().min(1).max(100),
  primaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
  tone: z.enum(CREATOR_TONES),
  logoUrl: z.union([z.string().trim().url().max(500), z.literal('')]).optional().default(''),
});

export const creatorBatchInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  recipientIds: z.array(z.string().trim().min(1)).min(1).max(CREATOR_BATCH_LIMIT),
});

export const creatorBatchItemUpdateSchema = z.object({
  itemId: z.string().trim().min(1),
  cardId: z.string().trim().min(1).max(120).optional(),
  status: z.enum(['pending', 'generating', 'completed', 'failed']),
  errorMessage: z.string().trim().max(500).optional(),
});

export interface CreatorRecipientCsvRecord {
  name: string;
  occasionType: CreatorOccasionType;
  occasionDate: string;
  notes: string;
}

export interface CreatorCsvError {
  row: number;
  message: string;
}

function parseCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (character === ',' && !quoted) {
      row.push(field.trim());
      field = '';
      continue;
    }

    if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += character;
  }

  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function normalizeOccasionType(value: string): CreatorOccasionType | null {
  const normalized = value.trim().toLowerCase().replace(/[\s_]+/g, '-');
  const aliases: Record<string, CreatorOccasionType> = {
    birthday: 'birthday',
    anniversary: 'work-anniversary',
    'work-anniversary': 'work-anniversary',
    workanniversary: 'work-anniversary',
    welcome: 'welcome',
    onboarding: 'welcome',
    appreciation: 'appreciation',
    thanks: 'appreciation',
    'thank-you': 'appreciation',
  };
  return aliases[normalized] || null;
}

export function parseCreatorRecipientCsv(csv: string): {
  records: CreatorRecipientCsvRecord[];
  errors: CreatorCsvError[];
} {
  const rows = parseCsvRows(csv.replace(/^\uFEFF/, ''));
  if (rows.length === 0) {
    return { records: [], errors: [{ row: 1, message: 'The CSV is empty.' }] };
  }

  const headers = rows[0].map(normalizeHeader);
  const indices = {
    name: headers.findIndex((header) => ['name', 'recipient', 'recipientname'].includes(header)),
    occasionType: headers.findIndex((header) => ['occasion', 'occasiontype', 'type'].includes(header)),
    occasionDate: headers.findIndex((header) => ['date', 'occasiondate'].includes(header)),
    notes: headers.findIndex((header) => ['notes', 'note'].includes(header)),
  };

  if (indices.name < 0 || indices.occasionType < 0 || indices.occasionDate < 0) {
    return {
      records: [],
      errors: [{ row: 1, message: 'Headers must include name, occasionType, and occasionDate.' }],
    };
  }

  const records: CreatorRecipientCsvRecord[] = [];
  const errors: CreatorCsvError[] = [];
  const seen = new Set<string>();

  rows.slice(1, CREATOR_IMPORT_LIMIT + 1).forEach((columns, index) => {
    const rowNumber = index + 2;
    const occasionType = normalizeOccasionType(columns[indices.occasionType] || '');
    const parsed = creatorRecipientInputSchema.safeParse({
      name: columns[indices.name] || '',
      occasionType,
      occasionDate: columns[indices.occasionDate] || '',
      notes: indices.notes >= 0 ? columns[indices.notes] || '' : '',
    });

    if (!parsed.success) {
      errors.push({ row: rowNumber, message: parsed.error.issues[0]?.message || 'Invalid row.' });
      return;
    }

    const key = `${parsed.data.name.toLowerCase()}|${parsed.data.occasionType}|${parsed.data.occasionDate}`;
    if (seen.has(key)) {
      errors.push({ row: rowNumber, message: 'Duplicate recipient and occasion in this file.' });
      return;
    }

    seen.add(key);
    records.push(parsed.data);
  });

  if (rows.length - 1 > CREATOR_IMPORT_LIMIT) {
    errors.push({ row: CREATOR_IMPORT_LIMIT + 2, message: `Import is limited to ${CREATOR_IMPORT_LIMIT} rows at a time.` });
  }

  return { records, errors };
}

export function toCreatorDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function getNextOccurrence(occasionDate: Date, now = new Date()): Date {
  const month = occasionDate.getUTCMonth();
  const day = occasionDate.getUTCDate();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  let next = new Date(Date.UTC(now.getUTCFullYear(), month, day));

  if (month === 1 && day === 29 && next.getUTCMonth() !== 1) {
    next = new Date(Date.UTC(now.getUTCFullYear(), 1, 28));
  }
  if (next < startOfToday) {
    next = new Date(Date.UTC(now.getUTCFullYear() + 1, month, day));
    if (month === 1 && day === 29 && next.getUTCMonth() !== 1) {
      next = new Date(Date.UTC(now.getUTCFullYear() + 1, 1, 28));
    }
  }
  return next;
}

export function getDaysUntil(occasionDate: Date, now = new Date()): number {
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((getNextOccurrence(occasionDate, now).getTime() - startOfToday) / 86_400_000);
}

export function getWorkAnniversaryYears(startDate: Date, now = new Date()): number {
  return Math.max(0, getNextOccurrence(startDate, now).getUTCFullYear() - startDate.getUTCFullYear());
}

export function getCardTypeForOccasion(occasionType: string): string {
  const mapping: Record<string, string> = {
    birthday: 'birthday',
    'work-anniversary': 'anniversary',
    welcome: 'congratulations',
    appreciation: 'thankyou',
  };
  return mapping[occasionType] || 'birthday';
}

export function getCreatorDevice(userAgent: string | null): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  if (!userAgent) return 'unknown';
  if (/ipad|tablet|kindle/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|android/i.test(userAgent)) return 'mobile';
  return 'desktop';
}
