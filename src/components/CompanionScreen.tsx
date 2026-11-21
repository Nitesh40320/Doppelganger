import type { CharacterProfile } from '../types/characterProfile'
import { AvatarViewport } from './AvatarViewport'

function resolveAddressPreview(profile: CharacterProfile): string {
  switch (profile.addressMode) {
    case 'name':
      return profile.userPreferredName || 'you'
    case 'custom':
      return profile.customAddress || '(custom address not set)'
    default:
      return profile.addressMode.charAt(0).toUpperCase() + profile.addressMode.slice(1)
  }
}

interface CompanionScreenProps {
  profile: CharacterProfile
}

export function CompanionScreen({ profile }: CompanionScreenProps) {
  return (
    <section className="companion-screen">
      <div className="companion-stage hud-frame">
        <span className="hud-corner tl" />
        <span className="hud-corner tr" />
        <span className="hud-corner bl" />
        <span className="hud-corner br" />
        <div className="hud-scanline" aria-hidden="true" />
        <div className="hud-telemetry hud-mono">
          <span>ASSET: placeholder_hologram_v001.glb</span>
          <span>STATUS: TEST RENDER — NOT FINAL CHARACTER</span>
        </div>
        <AvatarViewport />
      </div>
      <div className="companion-status hud-frame-soft">
        <p>
          {profile.characterName} will call you{' '}
          <strong>{resolveAddressPreview(profile)}</strong>.
        </p>
        <p className="placeholder-note">
          This is a placeholder test figure verifying the Blender → GLB → React Three Fiber
          pipeline (Phase 2). The real character arrives in Phase 5. Keyboard chat and voice
          are not implemented yet (Phases 7–8).
        </p>
      </div>
    </section>
  )
}
