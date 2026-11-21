import type { CharacterProfile } from '../types/characterProfile'

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
      <div className="companion-stage">
        <div className="companion-placeholder">
          <p className="placeholder-label">3D avatar placeholder</p>
          <p className="placeholder-detail">
            The real-time rigged character loads here starting in Phase 2 (test model) and
            Phase 5 (final character). Nothing 3D is connected yet.
          </p>
        </div>
      </div>
      <div className="companion-status">
        <p>
          {profile.characterName} will call you{' '}
          <strong>{resolveAddressPreview(profile)}</strong>.
        </p>
        <p className="placeholder-note">
          Keyboard chat and voice are not implemented yet (Phases 7–8). This screen only
          reflects your saved Character Settings.
        </p>
      </div>
    </section>
  )
}
