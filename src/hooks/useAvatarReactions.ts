import { useCallback, useEffect, useRef, useState } from 'react'
import { REACTION_COOLDOWN_MS, type ZoneId } from '../types/interactionZones'

export interface ActiveReaction {
  zoneId: ZoneId
  startedAt: number
}

export function useAvatarReactions(touchReactionsEnabled: boolean) {
  const [activeReaction, setActiveReaction] = useState<ActiveReaction | null>(null)
  const cooldownUntilRef = useRef(0)
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current)
    }
  }, [])

  const triggerReaction = useCallback(
    (zoneId: ZoneId) => {
      if (!touchReactionsEnabled) return
      const now = performance.now()
      if (now < cooldownUntilRef.current) return
      cooldownUntilRef.current = now + REACTION_COOLDOWN_MS
      setActiveReaction({ zoneId, startedAt: now })
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current)
      clearTimeoutRef.current = setTimeout(() => setActiveReaction(null), REACTION_COOLDOWN_MS)
    },
    [touchReactionsEnabled],
  )

  return { activeReaction, triggerReaction }
}
