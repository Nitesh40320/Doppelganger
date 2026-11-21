export interface OutfitConfig {
  id: string
  name: string
  direction: string
  available: boolean
  unavailableReason?: string
}

// Matches the wardrobe table in the spec (Sec3). Only Cyber Elegance has
// real meshes today (built in Phase 5) - the rest are honestly disabled
// rather than promised, per the spec's own rule: "Do not promise outfit
// changes until the required meshes are actually available and tested."
export const OUTFITS: OutfitConfig[] = [
  {
    id: 'Cyber Elegance',
    name: 'Cyber Elegance',
    direction: 'White/silver fitted futuristic outfit, cyan accents, sleek boots.',
    available: true,
  },
  {
    id: 'Midnight Gothic',
    name: 'Midnight Gothic',
    direction: 'Elegant black outfit with purple accents, gloves and boots.',
    available: false,
    unavailableReason: 'Meshes not modeled yet',
  },
  {
    id: 'Neo-Kimono',
    name: 'Neo-Kimono',
    direction: 'Modern Japanese-inspired silhouette with futuristic fabric patterns.',
    available: false,
    unavailableReason: 'Meshes not modeled yet',
  },
  {
    id: 'Executive',
    name: 'Executive',
    direction: 'Tailored futuristic blazer with skirt or trousers and accessories.',
    available: false,
    unavailableReason: 'Meshes not modeled yet',
  },
  {
    id: 'Casual Companion',
    name: 'Casual Companion',
    direction: 'Relaxed oversized hoodie and comfortable everyday styling.',
    available: false,
    unavailableReason: 'Meshes not modeled yet',
  },
  {
    id: 'Celestial Royalty',
    name: 'Celestial Royalty',
    direction: 'Flowing silver/blue ceremonial sci-fi dress and luminous ornaments.',
    available: false,
    unavailableReason: 'Meshes not modeled yet',
  },
]
