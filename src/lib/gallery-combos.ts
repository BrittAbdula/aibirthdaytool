import { CARD_TYPES, RELATIONSHIPS } from '@/lib/card-constants'
import { CardType } from '@/lib/card-config'

export interface GallerySeoCombo {
  type: CardType
  relationship: string
}

export const SEO_GALLERY_COMBOS: GallerySeoCombo[] = [
  { type: 'birthday', relationship: 'friend' },
  { type: 'birthday', relationship: 'girlfriend' },
  { type: 'birthday', relationship: 'boyfriend' },
  { type: 'birthday', relationship: 'wife' },
  { type: 'birthday', relationship: 'husband' },
  { type: 'birthday', relationship: 'mother' },
  { type: 'birthday', relationship: 'father' },
  { type: 'birthday', relationship: 'sister' },
  { type: 'birthday', relationship: 'brother' },
  { type: 'valentine', relationship: 'girlfriend' },
  { type: 'valentine', relationship: 'boyfriend' },
  { type: 'valentine', relationship: 'wife' },
  { type: 'valentine', relationship: 'husband' },
  { type: 'valentine', relationship: 'crush' },
  { type: 'valentine', relationship: 'partner' },
  { type: 'sorry', relationship: 'girlfriend' },
  { type: 'sorry', relationship: 'boyfriend' },
  { type: 'sorry', relationship: 'wife' },
  { type: 'sorry', relationship: 'husband' },
  { type: 'sorry', relationship: 'friend' },
  { type: 'sorry', relationship: 'partner' },
  { type: 'anniversary', relationship: 'wife' },
  { type: 'anniversary', relationship: 'husband' },
  { type: 'anniversary', relationship: 'girlfriend' },
  { type: 'anniversary', relationship: 'boyfriend' },
  { type: 'anniversary', relationship: 'partner' },
]

const typeLabelMap = new Map(CARD_TYPES.map((cardType) => [cardType.type, cardType.label]))
const relationshipLabelMap = new Map(
  RELATIONSHIPS.map((relationship) => [relationship.value, relationship.label])
)

export function getCardTypeLabel(type: CardType | string) {
  return typeLabelMap.get(type as CardType) || String(type)
}

export function getRelationshipValue(input: string) {
  const normalized = decodeURIComponent(input).trim().toLowerCase()
  const matched = RELATIONSHIPS.find(
    (relationship) =>
      relationship.value.toLowerCase() === normalized ||
      relationship.label.toLowerCase() === normalized
  )

  return matched?.value || normalized
}

export function getRelationshipLabel(input: string) {
  const value = getRelationshipValue(input)
  return relationshipLabelMap.get(value) || value.charAt(0).toUpperCase() + value.slice(1)
}

export function getGalleryComboHref(type: CardType | string, relationship: string) {
  return `/type/${type}/for/${getRelationshipValue(relationship)}/`
}

export function hasSeoGalleryCombo(type: CardType | string, relationship: string) {
  const relationshipValue = getRelationshipValue(relationship)
  return SEO_GALLERY_COMBOS.some(
    (combo) => combo.type === type && combo.relationship === relationshipValue
  )
}

export function getSeoRelationshipsForType(type: CardType | string) {
  return SEO_GALLERY_COMBOS.filter((combo) => combo.type === type).map(
    (combo) => combo.relationship
  )
}

export function getSeoTypesForRelationship(relationship: string) {
  const relationshipValue = getRelationshipValue(relationship)
  return SEO_GALLERY_COMBOS.filter(
    (combo) => combo.relationship === relationshipValue
  ).map((combo) => combo.type)
}

export function getGalleryComboStaticParams() {
  return SEO_GALLERY_COMBOS.map((combo) => ({
    type: combo.type,
    relationship: combo.relationship,
  }))
}
