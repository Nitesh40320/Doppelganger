export type ZoneId = 'head' | 'armLeft' | 'armRight' | 'torso'

export interface ZoneConfig {
  id: ZoneId
  label: string
  reactionLine: string
}

export const INTERACTION_ZONES: ZoneConfig[] = [
  {
    id: 'head',
    label: 'Top of head',
    reactionLine: 'eyes soften for a moment.',
  },
  {
    id: 'armLeft',
    label: 'Hand (left)',
    reactionLine: 'gives a small wave.',
  },
  {
    id: 'armRight',
    label: 'Hand (right)',
    reactionLine: 'gives a small wave.',
  },
  {
    id: 'torso',
    label: 'Elsewhere',
    reactionLine: 'turns attention toward you.',
  },
]

// Matches the exported P0 clips' length (1.00s @ 24fps) so the reaction
// state and its visual clip finish together.
export const REACTION_COOLDOWN_MS = 1050
export const REACTION_DURATION_MS = 1000
