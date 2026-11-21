import type { TtsAdapter, TtsCallbacks, TtsSession } from './ttsAdapter'

export const webSpeechTtsAdapter: TtsAdapter = {
  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  },

  speak(text: string, callbacks: TtsCallbacks): TtsSession {
    if (!this.isSupported()) {
      callbacks.onError?.('Speech synthesis is not supported in this browser.')
      callbacks.onEnd()
      return { cancel: () => {} }
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onstart = () => callbacks.onStart?.()
    utterance.onend = () => callbacks.onEnd()
    utterance.onerror = (event) => {
      if (event.error === 'canceled' || event.error === 'interrupted') {
        callbacks.onEnd()
        return
      }
      callbacks.onError?.(`Speech synthesis failed: ${event.error}`)
      callbacks.onEnd()
    }

    window.speechSynthesis.speak(utterance)

    return {
      cancel: () => window.speechSynthesis.cancel(),
    }
  },
}
