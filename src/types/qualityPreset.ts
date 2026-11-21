export type QualityPreset = 'low' | 'balanced' | 'high'

export interface QualityConfig {
  label: string
  description: string
  dpr: [number, number]
  antialias: boolean
  bloom: boolean
}

// Spec Sec10's preset table. No preset enables real-time shadows - this
// targets integrated graphics with no dedicated GPU, where shadow mapping is
// one of the more expensive features to add back, so all three presets stay
// shadow-free and differ in resolution/AA/post-processing instead.
export const QUALITY_PRESETS: Record<QualityPreset, QualityConfig> = {
  low: {
    label: 'Low',
    description: 'Reduced render resolution, no post-processing. Best for integrated graphics.',
    dpr: [0.75, 1],
    antialias: false,
    bloom: false,
  },
  balanced: {
    label: 'Balanced',
    description: 'Moderate resolution, standard materials. Recommended default.',
    dpr: [1, 1.5],
    antialias: true,
    bloom: false,
  },
  high: {
    label: 'High',
    description: 'Higher resolution plus a subtle bloom effect on the glow accents.',
    dpr: [1, 2],
    antialias: true,
    bloom: true,
  },
}
