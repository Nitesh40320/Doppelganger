export interface TtsCallbacks {
  onStart?: () => void
  onEnd: () => void
  onError?: (message: string) => void
}

export interface TtsSession {
  cancel: () => void
}

export interface TtsAdapter {
  isSupported(): boolean
  speak(text: string, callbacks: TtsCallbacks): TtsSession
}
