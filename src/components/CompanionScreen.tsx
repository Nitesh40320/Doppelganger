import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { CharacterProfile } from '../types/characterProfile'
import { ChatComposer } from './ChatComposer'
import { ChatLog } from './ChatLog'
import { useCompanionStateMachine } from '../hooks/useCompanionStateMachine'
import { useChat } from '../hooks/useChat'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useVoiceOutput } from '../hooks/useVoiceOutput'
import { notConnectedChatAdapter } from '../adapters/notConnectedChatAdapter'
import { webSpeechSttAdapter } from '../adapters/webSpeechSttAdapter'
import { webSpeechTtsAdapter } from '../adapters/webSpeechTtsAdapter'
import { INTERACTION_ZONES, REACTION_DURATION_MS, type ZoneId } from '../types/interactionZones'

// Code-split the 3D viewport: three.js/R3F/drei/postprocessing are the bulk
// of this app's JS weight (spec Sec10: "large first load"). This still loads
// right away since Phase 6 keeps the Companion screen mounted at all times,
// but splitting it into its own chunk lets the lightweight app shell parse
// and paint without waiting on ~1MB of 3D library code first.
const AvatarViewport = lazy(() =>
  import('./AvatarViewport').then((m) => ({ default: m.AvatarViewport })),
)

const SIMULATED_LISTEN_MS = 1200
const SIMULATED_THINK_MS = 1400
const SIMULATED_SPEAK_MS = 2200
const TTS_TEST_LINE =
  "Hello! This is a test of text to speech, independent of the chat backend, which still isn't connected."

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

interface CompanionScreenProps {
  profile: CharacterProfile
  isActiveScreen: boolean
}

export function CompanionScreen({ profile, isActiveScreen }: CompanionScreenProps) {
  const { state, requestTransition, completeFrom } = useCompanionStateMachine()
  const [draft, setDraft] = useState('')
  const [hoveredZone, setHoveredZone] = useState<ZoneId | null>(null)
  const [reactionZone, setReactionZone] = useState<ZoneId | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden)

  // Spec Sec10: "pause or reduce render loop when tab/window is hidden;
  // resume safely" - combined with isActiveScreen, this fully stops the R3F
  // frame loop (see AvatarViewport's frameloop prop) whenever the avatar
  // isn't actually visible, for either reason.
  useEffect(() => {
    function handleVisibilityChange() {
      setIsTabVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
  const isRenderActive = isActiveScreen && isTabVisible

  const voiceOutput = useVoiceOutput({ adapter: webSpeechTtsAdapter })

  const { messages, isSending, sendMessage, cancelSend, addSystemMessage } = useChat({
    adapter: notConnectedChatAdapter,
    requestTransition,
    completeFrom,
    onAssistantReply: (text) => voiceOutput.speak(text),
  })

  const voiceInput = useVoiceInput({
    adapter: webSpeechSttAdapter,
    requestTransition,
    completeFrom,
    onInterimTranscript: (text) => setDraft(text),
    onFinalTranscript: (text) => setDraft(text),
  })

  // Both voice hooks report errors as state rather than a callback, to avoid
  // a circular dependency (useChat needs voiceOutput.speak; a callback-based
  // voiceOutput.onError would need addSystemMessage from useChat right back).
  // Surfacing them into the chat log reactively here breaks that cycle.
  useEffect(() => {
    if (voiceInput.error) addSystemMessage(voiceInput.error)
  }, [voiceInput.error, addSystemMessage])

  useEffect(() => {
    if (voiceOutput.error) addSystemMessage(voiceOutput.error)
  }, [voiceOutput.error, addSystemMessage])

  // Reflects real TTS audio into the state machine (the dev-simulate button
  // drives 'speaking' on its own timer and never touches this).
  useEffect(() => {
    if (voiceOutput.isSpeaking) {
      requestTransition('thinking')
      completeFrom('thinking', 'speaking')
    } else {
      completeFrom('speaking', 'idle')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOutput.isSpeaking])

  // Ctrl+Space push-to-talk, scoped to while this is the visible screen (spec Sec6).
  useEffect(() => {
    if (!isActiveScreen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault()
        if (voiceInput.isListening) voiceInput.stop()
        else voiceInput.start()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveScreen, voiceInput.isListening])

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

  function testVoiceReply() {
    voiceOutput.speak(TTS_TEST_LINE)
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
    statusLine = voiceInput.isListening
      ? `${profile.characterName} is listening — speak now, or press Ctrl+Space / the Mic button to stop.`
      : `${profile.characterName} is listening… (dev-simulated)`
  } else if (state === 'thinking') {
    statusLine = `${profile.characterName} is thinking about your message…`
  } else if (state === 'speaking') {
    statusLine = voiceOutput.isSpeaking
      ? `${profile.characterName} is speaking.`
      : `${profile.characterName} is speaking… (dev-simulated, no audio)`
  } else if (state === 'error') {
    statusLine = 'Safe mode: something in the simulated pipeline failed. The companion stays visible and usable.'
  } else {
    statusLine =
      'This is the real rigged character with her first animation clips (Phase 5). Keyboard chat and voice input/output are fully wired up (Phase 7-8), but no AI backend is connected yet, so every message honestly gets a "not connected" reply.'
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
          {voiceInput.isListening && <span className="hud-mic-indicator">● MIC ACTIVE</span>}
        </div>
        <Suspense fallback={<div className="viewport-status-overlay hud-mono">LOADING 3D ENGINE…</div>}>
          <AvatarViewport
            touchIntensity={profile.touchIntensity}
            companionState={state}
            reactionZoneId={reactionZone}
            isSpeakingLive={voiceOutput.isSpeaking}
            qualityPreset={profile.qualityPreset}
            isRenderActive={isRenderActive}
            onZoneClick={handleZoneClick}
            onZoneHover={setHoveredZone}
            onStageHoverChange={handleStageHoverChange}
          />
        </Suspense>
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
      <div className="chat-panel hud-frame-soft">
        <ChatLog messages={messages} isSending={isSending} characterName={profile.characterName} />
        {voiceOutput.isSpeaking && (
          <div className="speaking-bar hud-mono">
            <span>🔊 {profile.characterName} is speaking</span>
            <button type="button" onClick={voiceOutput.stop}>
              Stop speaking
            </button>
          </div>
        )}
        <ChatComposer
          value={draft}
          onChange={setDraft}
          isSending={isSending}
          onSend={sendMessage}
          onCancelSend={cancelSend}
          isListening={voiceInput.isListening}
          micSupported={webSpeechSttAdapter.isSupported()}
          onToggleListening={() => (voiceInput.isListening ? voiceInput.stop() : voiceInput.start())}
        />
      </div>
      <div className="dev-state-panel hud-frame-soft hud-mono">
        <span className="dev-state-label">
          DEV: STATE MACHINE TEST — chat and voice above now drive real THINKING/LISTENING
          states; chat always ends in an honest "no backend" error since no AI backend is
          connected. SPEAKING only happens for real via the TTS test button below, since the
          chat backend never actually replies.
        </span>
        <div className="dev-state-buttons">
          <button type="button" onClick={simulateConversationTurn}>
            Simulate conversation turn
          </button>
          <button type="button" onClick={testVoiceReply}>
            Test voice reply (TTS)
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
