import { useCallback, useEffect, useRef, useState } from 'react'
import type { TtsAdapter, TtsSession } from '../adapters/ttsAdapter'

interface UseVoiceOutputOptions {
  adapter: TtsAdapter
}

export function useVoiceOutput({ adapter }: UseVoiceOutputOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<TtsSession | null>(null)

  useEffect(() => {
    return () => sessionRef.current?.cancel()
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!adapter.isSupported()) {
        setError("Speech playback isn't supported in this browser.")
        return
      }
      sessionRef.current?.cancel()
      setError(null)
      setIsSpeaking(true)
      sessionRef.current = adapter.speak(text, {
        onEnd: () => {
          setIsSpeaking(false)
          sessionRef.current = null
        },
        onError: (message) => setError(message),
      })
    },
    [adapter],
  )

  const stop = useCallback(() => {
    sessionRef.current?.cancel()
    setIsSpeaking(false)
    sessionRef.current = null
  }, [])

  return { isSpeaking, error, speak, stop }
}
