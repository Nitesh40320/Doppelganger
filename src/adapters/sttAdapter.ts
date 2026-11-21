export interface SttCallbacks {
  onInterim: (transcript: string) => void
  onFinal: (transcript: string) => void
  onError: (code: SttErrorCode) => void
  onEnd: () => void
}

export type SttErrorCode = 'not-supported' | 'permission-denied' | 'no-microphone' | 'no-speech' | 'network' | 'other'

export interface SttSession {
  stop: () => void
}

/** Speech-to-text goes behind this interface for the same reason chat and
 * TTS do (spec Sec6/Sec9): swap the provider without touching UI code. */
export interface SttAdapter {
  isSupported(): boolean
  start(callbacks: SttCallbacks): SttSession
}
