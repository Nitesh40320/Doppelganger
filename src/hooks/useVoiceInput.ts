import { useCallback, useEffect, useRef, useState } from 'react'
import type { SttAdapter, SttErrorCode, SttSession } from '../adapters/sttAdapter'
import type { CompanionState } from '../types/companionState'

const ERROR_MESSAGES: Record<SttErrorCode, string> = {
  'not-supported': "Voice input isn't supported in this browser. Try typing instead.",
  'permission-denied': 'Microphone permission was denied. Allow mic access in your browser/site settings to use voice input.',
  'no-microphone': 'No microphone was found. Check that one is connected and enabled.',
  'no-speech': "Didn't catch anything — no speech was detected. Try again, or type your message.",
  network: 'Voice recognition needs a network connection and one isn\'t available right now.',
  other: 'Voice input failed for an unknown reason. Try again, or type your message.',
}

interface UseVoiceInputOptions {
  adapter: SttAdapter
  requestTransition: (state: CompanionState) => boolean
  completeFrom: (from: CompanionState, to: CompanionState) => boolean
  onInterimTranscript: (text: string) => void
  onFinalTranscript: (text: string) => void
}

export function useVoiceInput({
  adapter,
  requestTransition,
  completeFrom,
  onInterimTranscript,
  onFinalTranscript,
}: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<SttSession | null>(null)

  useEffect(() => {
    return () => sessionRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    if (isListening) return
    if (!adapter.isSupported()) {
      setError(ERROR_MESSAGES['not-supported'])
      return
    }
    setError(null)
    setIsListening(true)
    requestTransition('listening')

    sessionRef.current = adapter.start({
      onInterim: (text) => onInterimTranscript(text),
      onFinal: (text) => {
        onFinalTranscript(text)
      },
      onError: (code) => {
        setError(ERROR_MESSAGES[code])
      },
      onEnd: () => {
        setIsListening(false)
        completeFrom('listening', 'idle')
        sessionRef.current = null
      },
    })
  }, [adapter, isListening, requestTransition, completeFrom, onInterimTranscript, onFinalTranscript])

  const stop = useCallback(() => {
    sessionRef.current?.stop()
  }, [])

  return { isListening, error, start, stop }
}
