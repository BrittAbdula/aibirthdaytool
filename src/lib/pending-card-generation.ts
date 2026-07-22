export const PENDING_CARD_GENERATION_STORAGE_KEY = 'mewtrucard.pendingCardGeneration'

const PENDING_CARD_GENERATION_MAX_AGE_MS = 30 * 60 * 1000

export type PendingCardFormat = 'svg' | 'image' | 'video'
export type PendingCardTier = 'base' | 'pro'

export interface PendingCardGeneration {
  generatorCardType: string
  cardType: string
  formData: Record<string, unknown>
  customValues: Record<string, string>
  selectedSize: string
  selectedModelId: string
  selectedFormat: PendingCardFormat
  selectedStyleId: string | null
  selectedTier: PendingCardTier
  uploadedRefUrls: string[]
  isPrivateCard: boolean
  currentStep: number
  createdAt: number
}

type BuildPendingCardGenerationInput = Omit<PendingCardGeneration, 'createdAt'>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every(item => typeof item === 'string')
}

function isPendingCardFormat(value: unknown): value is PendingCardFormat {
  return value === 'svg' || value === 'image' || value === 'video'
}

function isPendingCardTier(value: unknown): value is PendingCardTier {
  return value === 'base' || value === 'pro'
}

export function buildPendingCardGeneration(
  input: BuildPendingCardGenerationInput
): PendingCardGeneration {
  return { ...input, createdAt: Date.now() }
}

export function parsePendingCardGeneration(
  raw: string | null | undefined,
  now = Date.now()
): PendingCardGeneration | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<PendingCardGeneration>
    if (typeof parsed.generatorCardType !== 'string' || !parsed.generatorCardType) return null
    if (typeof parsed.cardType !== 'string' || !parsed.cardType) return null
    if (!isRecord(parsed.formData) || !isStringRecord(parsed.customValues)) return null
    if (typeof parsed.selectedSize !== 'string' || !parsed.selectedSize) return null
    if (typeof parsed.selectedModelId !== 'string' || !parsed.selectedModelId) return null
    if (!isPendingCardFormat(parsed.selectedFormat)) return null
    if (parsed.selectedStyleId !== null && typeof parsed.selectedStyleId !== 'string') return null
    if (!isPendingCardTier(parsed.selectedTier)) return null
    if (!Array.isArray(parsed.uploadedRefUrls) || !parsed.uploadedRefUrls.every(url => typeof url === 'string')) return null
    if (typeof parsed.isPrivateCard !== 'boolean') return null
    if (typeof parsed.currentStep !== 'number' || !Number.isInteger(parsed.currentStep)) return null
    if (parsed.currentStep < 1 || parsed.currentStep > 3) return null
    if (typeof parsed.createdAt !== 'number' || !Number.isFinite(parsed.createdAt)) return null
    if (parsed.createdAt > now || now - parsed.createdAt > PENDING_CARD_GENERATION_MAX_AGE_MS) return null

    return parsed as PendingCardGeneration
  } catch {
    return null
  }
}
