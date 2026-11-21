import { useEffect, useRef, useState } from 'react'
import type { CharacterProfile } from '../types/characterProfile'
import { AvatarViewport } from './AvatarViewport'
import { useCompanionStateMachine } from '../hooks/useCompanionStateMachine'
import { INTERACTION_ZONES, REACTION_DURATION_MS, type ZoneId } from '../types/interactionZones'

const SIMULATED_LISTEN_MS = 1200
const SIMULATED_THINK_MS = 1400
const SIMULATED_SPEAK_MS = 2200

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

const STATE_LABELS: Record<string, string> = {
  boot: 'BOOT',
  idle: 'IDLE',
  attention: 'ATTENTION',
  listening: 'LISTENING',
  thinking: 'THINKING',
  speaking: 'SPEAKING',
  reaction: 'REACTION',
  error: 'SAFE MODE',
}

export function CompanionScreen({ profile }: { profile: CharacterProfile }) {
  const { state, requestTransition, completeFrom } = useCompanionStateMachine()
  const [hoveredZone, setHoveredZone] = useState<ZoneId | null>(null)
  const [reactionZone, setReactionZone] = useState<ZoneId | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function schedule(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
  }

  useEffect(() => {
    const timeouts = timeoutsRef.current
    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [])

  function handleZoneClick(zoneId: ZoneId) {
    if (!profile.touchReactions) return
    if (!requestTransition('reaction')) return
    setReactionZone(zoneId)
    schedule(() => completeFrom('reaction', 'idle'), REACTION_DURATION_MS)
  }

  function handleStageHoverChange(hovering: boolean) {
    if (hovering) {
      requestTransition('attention')
    } else {
      completeFrom('attention', 'idle')
    }
  }

  function simulateConversationTurn() {
    if (!requestTransition('listening')) return
    schedule(() => {
      if (!requestTransition('thinking')) return
      schedule(() => {
        if (!completeFrom('thinking', 'speaking')) return
        schedule(() => completeFrom('speaking', 'idle'), SIMULATED_SPEAK_MS)
      }, SIMULATED_THINK_MS)
    }, SIMULATED_LISTEN_MS)
  }

  function forceErrorState() {
    requestTransition('error')
  }

  function recoverFromError() {
    completeFrom('error', 'idle')
  }

  const hoveredZoneLabel = hoveredZone
    ? INTERACTION_ZONES.find((zone) => zone.id === hoveredZone)?.label
    : null
  const reactionLine =
    state === 'reaction' && reactionZone
      ? INTERACTION_ZONES.find((zone) => zone.id === reactionZone)?.reactionLine
      : null

  let statusLine: string
  if (reactionLine) {
    statusLine = `${profile.characterName} ${reactionLine}`
  } else if (state === 'listening') {
    statusLine = `${profile.characterName} is listening… (simulated — real voice input arrives in Phase 8)`
  } else if (state === 'thinking') {
    statusLine = `${profile.characterName} is thinking… (simulated — no AI backend is connected yet)`
  } else if (state === 'speaking') {
    statusLine = `${profile.characterName} is speaking… (simulated — no voice/TTS is connected yet)`
  } else if (state === 'error') {
    statusLine = 'Safe mode: something in the simulated pipeline failed. The companion stays visible and usable.'
  } else {
    statusLine =
      'This is the real rigged character with her first animation clips (Phase 5) — base body, default Cyber Elegance outfit, and basic facial shape keys. Final sculpted art, more outfits, and richer expressions are later passes. Keyboard chat and voice are not implemented yet (Phases 7–8).'
  }

  return (
    <section className="companion-screen">
      <div className="companion-stage hud-frame">
        <span className="hud-corner tl" />
        <span className="hud-corner tr" />
        <span className="hud-corner bl" />
        <span className="hud-corner br" />
        <div className="hud-scanline" aria-hidden="true" />
        <div className="hud-telemetry hud-mono">
          <span>ASSET: astra_v001.glb</span>
          <span>STATE: {STATE_LABELS[state]}</span>
          {hoveredZoneLabel && <span>ZONE: {hoveredZoneLabel.toUpperCase()}</span>}
        </div>
        <AvatarViewport
          touchIntensity={profile.touchIntensity}
          companionState={state}
          reactionZoneId={reactionZone}
          onZoneClick={handleZoneClick}
          onZoneHover={setHoveredZone}
          onStageHoverChange={handleStageHoverChange}
        />
        <div className="interact-bar hud-mono" role="group" aria-label="Keyboard-accessible interactions">
          <button type="button" onClick={() => handleZoneClick('head')}>
            Pat head
          </button>
          <button type="button" onClick={() => handleZoneClick('armLeft')}>
            Wave
          </button>
          <button type="button" onClick={() => handleZoneClick('torso')}>
            Greet
          </button>
        </div>
      </div>
      <div className="companion-status hud-frame-soft">
        <p>
          {profile.characterName} will call you{' '}
          <strong>{resolveAddressPreview(profile)}</strong>.
        </p>
        <p className="placeholder-note">{statusLine}</p>
      </div>
      <div className="dev-state-panel hud-frame-soft hud-mono">
        <span className="dev-state-label">DEV: STATE MACHINE TEST (Phases 7–8 will replace these)</span>
        <div className="dev-state-buttons">
          <button type="button" onClick={simulateConversationTurn}>
            Simulate conversation turn
          </button>
          <button type="button" onClick={forceErrorState}>
            Force error / safe mode
          </button>
          <button type="button" onClick={recoverFromError}>
            Recover to idle
          </button>
        </div>
      </div>
    </section>
  )
}
