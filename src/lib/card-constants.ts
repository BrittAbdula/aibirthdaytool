import { CardType } from './card-config'

export interface CardTypeOption {
  type: CardType
  label: string
}

export interface RelationshipOption {
  value: string
  label: string
}

export const CARD_TYPES: CardTypeOption[] = [
  { type: "birthday", label: "Birthday" },
  { type: "anniversary", label: "Anniversary" },
  { type: "love", label: "Love" },
  { type: "newyear", label: "New Year" },
  { type: "thankyou", label: "Thank You" },
  { type: "congratulations", label: "Congratulations" },
  { type: "wedding", label: "Wedding" },
  { type: "baby", label: "Baby" },
  { type: "graduation", label: "Graduation" },
  { type: "goodluck", label: "Good Luck" },
  { type: "sorry", label: "Sorry" },
  { type: "christmas", label: "Christmas" },
  { type: "valentine", label: "Valentine" },
  { type: "goodmorning", label: "Good Morning" },
  { type: "goodnight", label: "Good Night" },
  { type: "teacher", label: "Teacher" },
  { type: "easter", label: "Easter" },
  { type: "womensday", label: "Women's Day" },
  { type: "mothersday", label: "Mother's Day" },
  { type: "eidmubarak", label: "Eid Mubarak" },
]

export const RELATIONSHIPS: RelationshipOption[] = [
  { value: 'friend', label: 'Friend' },
  { value: 'sister', label: 'Sister' },
  { value: 'girlfriend', label: 'Girlfriend' },
  { value: 'husband', label: 'Husband' },
  { value: 'wife', label: 'Wife' },
  { value: 'brother', label: 'Brother' },
  { value: 'partner', label: 'Partner' },
  { value: 'boyfriend', label: 'Boyfriend' },
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'myself', label: 'Myself' },
  { value: 'crush', label: 'Crush' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'student', label: 'Student' },
  { value: 'classmate', label: 'Classmate' },
  { value: 'son', label: 'Son' },
  { value: 'other', label: 'Other' },
] 