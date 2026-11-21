export type AddressMode = 'name' | 'master' | 'boss' | 'dear' | 'custom'

export type VoiceActivationMode = 'push-to-talk' | 'always-on'

export interface CharacterProfile {
  characterName: string
  userPreferredName: string
  addressMode: AddressMode
  customAddress: string
  personalityPreset: string
  cursorGaze: boolean
  touchReactions: boolean
  touchIntensity: number
  voiceActivation: VoiceActivationMode
  selectedOutfit: string
}

export const DEFAULT_CHARACTER_PROFILE: CharacterProfile = {
  characterName: 'Astra',
  userPreferredName: 'Rojin',
  addressMode: 'name',
  customAddress: '',
  personalityPreset: 'Warm / playful / intelligent',
  cursorGaze: true,
  touchReactions: true,
  touchIntensity: 50,
  voiceActivation: 'push-to-talk',
  selectedOutfit: 'Cyber Elegance',
}

export const ADDRESS_MODE_OPTIONS: { value: AddressMode; label: string }[] = [
  { value: 'name', label: 'By my name' },
  { value: 'master', label: 'Master' },
  { value: 'boss', label: 'Boss' },
  { value: 'dear', label: 'Dear' },
  { value: 'custom', label: 'Custom' },
]
