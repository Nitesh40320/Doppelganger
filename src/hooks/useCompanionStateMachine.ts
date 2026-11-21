import { useCallback, useEffect, useRef, useState } from 'react'
import { ALLOWED_TRANSITIONS, STATE_PRIORITY, type CompanionState } from '../types/companionState'

const BOOT_DURATION_MS = 400

export function useCompanionStateMachine() {
  const [state, setState] = useState<CompanionState>('boot')
  const stateRef = useRef<CompanionState>(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    const id = setTimeout(() => setState('idle'), BOOT_DURATION_MS)
    return () => clearTimeout(id)
  }, [])

  const canEnter = useCallback((target: CompanionState) => {
    const current = stateRef.current
    if (target === current) return false
    if (target === 'error') return true
    if (!ALLOWED_TRANSITIONS[current].includes(target)) return false
    return STATE_PRIORITY[target] >= STATE_PRIORITY[current]
  }, [])

  /** For externally-triggered transitions (hover, clicks, future chat/voice
   * events). Rejected if the target isn't reachable or is lower-priority
   * than whatever's currently playing. */
  const requestTransition = useCallback(
    (target: CompanionState) => {
      if (!canEnter(target)) return false
      // Update the ref synchronously (not just via the state-syncing effect
      // above) so a caller can immediately chain a completeFrom() in the same
      // tick — e.g. requestTransition('thinking') then completeFrom('thinking',
      // 'speaking') with no await between them. Safe here: this runs inside an
      // event handler/effect body, never during React's render pass itself.
      stateRef.current = target
      setState(target)
      return true
    },
    [canEnter],
  )

  /** For a state's OWN natural exit (a reaction's pulse finishing, speech
   * audio ending, a cancelled/failed request). Bypasses the priority gate,
   * but only fires if the machine is still in the expected "from" state —
   * guards against a stale timer clobbering a newer, higher-priority state. */
  const completeFrom = useCallback((fromState: CompanionState, target: CompanionState) => {
    if (stateRef.current !== fromState) return false
    stateRef.current = target
    setState(target)
    return true
  }, [])

  return { state, requestTransition, completeFrom }
}
