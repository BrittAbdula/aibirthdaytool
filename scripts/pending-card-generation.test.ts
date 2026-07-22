import assert from 'node:assert/strict'
import {
  PENDING_CARD_GENERATION_STORAGE_KEY,
  buildPendingCardGeneration,
  parsePendingCardGeneration,
} from '../src/lib/pending-card-generation'

assert.equal(PENDING_CARD_GENERATION_STORAGE_KEY, 'mewtrucard.pendingCardGeneration')

const pending = buildPendingCardGeneration({
  generatorCardType: 'birthday',
  cardType: 'birthday',
  formData: { recipientName: 'Lily', message: 'Happy birthday' },
  customValues: { relationship: 'Best friend' },
  selectedSize: 'portrait',
  selectedModelId: 'Free_SVG',
  selectedFormat: 'svg',
  selectedStyleId: null,
  selectedTier: 'base',
  uploadedRefUrls: [],
  isPrivateCard: false,
  currentStep: 3,
})

assert.deepEqual(parsePendingCardGeneration(JSON.stringify(pending), pending.createdAt), pending)
assert.equal(parsePendingCardGeneration('{bad json'), null)
assert.equal(parsePendingCardGeneration(JSON.stringify({ ...pending, selectedFormat: 'audio' })), null)
assert.equal(parsePendingCardGeneration(JSON.stringify({ ...pending, currentStep: 4 })), null)
assert.equal(
  parsePendingCardGeneration(JSON.stringify(pending), pending.createdAt + 31 * 60 * 1000),
  null
)

console.log('pending card generation rules ok')
