export type MemoryCategory = 'fact' | 'preference' | 'experience' | 'unverified' | 'correction'

export interface MemoryEntry {
  id: string
  category: MemoryCategory
  content: string
  source: string
  confidence: number
  createdAt: number
  updatedAt: number
}

export interface MemoryCategoryConfig {
  label: string
  description: string
  usesSourceAndConfidence: boolean
}

// Matches the handling table in spec Sec12 exactly - each category has a
// distinct truth status, never silently promoted to a higher one.
export const MEMORY_CATEGORIES: Record<MemoryCategory, MemoryCategoryConfig> = {
  fact: {
    label: 'Verified objective fact',
    description: 'Stored with source/provenance and confidence.',
    usesSourceAndConfidence: true,
  },
  preference: {
    label: 'User preference',
    description: "Attributed to you — it's a preference, not an objective fact.",
    usesSourceAndConfidence: false,
  },
  experience: {
    label: 'Personal experience',
    description: 'Your reported experience, not independently verified truth.',
    usesSourceAndConfidence: false,
  },
  unverified: {
    label: 'Unverified claim',
    description: 'Kept marked unverified — never promoted to verified knowledge automatically.',
    usesSourceAndConfidence: false,
  },
  correction: {
    label: 'Correction / detected mistake',
    description: 'A correction record — the mistaken value is never learned as truth.',
    usesSourceAndConfidence: false,
  },
}
