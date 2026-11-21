import { useState } from 'react'
import type { CharacterProfile } from '../types/characterProfile'
import { AvatarViewport } from './AvatarViewport'
import { useAvatarReactions } from '../hooks/useAvatarReactions'
import { INTERACTION_ZONES, type ZoneId } from '../types/interactionZones'

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
  const { activeReaction, triggerReaction } = useAvatarReactions(profile.touchReactions)
  const [hoveredZone, setHoveredZone] = useState<ZoneId | null>(null)

  const hoveredZoneLabel = hoveredZone
    ? INTERACTION_ZONES.find((zone) => zone.id === hoveredZone)?.label
    : null
  const lastReactionLine = activeReaction
    ? INTERACTION_ZONES.find((zone) => zone.id === activeReaction.zoneId)?.reactionLine
    : null

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
          {hoveredZoneLabel && <span>ZONE: {hoveredZoneLabel.toUpperCase()}</span>}
        </div>
        <AvatarViewport
          cursorGazeEnabled={profile.cursorGaze}
          touchIntensity={profile.touchIntensity}
          activeReaction={activeReaction}
          onZoneClick={triggerReaction}
          onZoneHover={setHoveredZone}
        />
        <div className="interact-bar hud-mono" role="group" aria-label="Keyboard-accessible interactions">
          <button type="button" onClick={() => triggerReaction('head')}>
            Pat head
          </button>
          <button type="button" onClick={() => triggerReaction('armLeft')}>
            Wave
          </button>
          <button type="button" onClick={() => triggerReaction('torso')}>
            Greet
          </button>
        </div>
      </div>
      <div className="companion-status hud-frame-soft">
        <p>
          {profile.characterName} will call you{' '}
          <strong>{resolveAddressPreview(profile)}</strong>.
        </p>
        <p className="placeholder-note">
          {lastReactionLine
            ? `${profile.characterName} ${lastReactionLine}`
            : 'This is a placeholder test figure verifying mouse-tracking and touch-zone reactions (Phase 3). The real character and real animation clips arrive in Phase 4–5. Keyboard chat and voice are not implemented yet (Phases 7–8).'}
        </p>
      </div>
    </section>
  )
}
