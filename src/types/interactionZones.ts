export type ZoneId = 'head' | 'armLeft' | 'armRight' | 'torso'

export interface ZoneConfig {
  id: ZoneId
  /** Name of the mesh/node in the current placeholder GLB. Swap when the real rig arrives (Phase 5). */
  nodeName: string
  label: string
  reactionLine: string
}

export const INTERACTION_ZONES: ZoneConfig[] = [
  {
    id: 'head',
    nodeName: 'Placeholder_Head',
    label: 'Top of head',
    reactionLine: 'eyes soften for a moment.',
  },
  {
    id: 'armLeft',
    nodeName: 'Placeholder_ArmL',
    label: 'Hand (left)',
    reactionLine: 'gives a small wave.',
  },
  {
    id: 'armRight',
    nodeName: 'Placeholder_ArmR',
    label: 'Hand (right)',
    reactionLine: 'gives a small wave.',
  },
  {
    id: 'torso',
    nodeName: 'Placeholder_Torso',
    label: 'Elsewhere',
    reactionLine: 'turns attention toward you.',
  },
]

export const REACTION_COOLDOWN_MS = 650
export const REACTION_DURATION_MS = 550
