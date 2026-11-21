import type { SttAdapter, SttCallbacks, SttErrorCode, SttSession } from './sttAdapter'
import { getSpeechRecognitionConstructor } from './webSpeechTypes'

function mapError(code: string): SttErrorCode {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'permission-denied'
    case 'audio-capture':
      return 'no-microphone'
    case 'no-speech':
      return 'no-speech'
    case 'network':
      return 'network'
    default:
      return 'other'
  }
}

export const webSpeechSttAdapter: SttAdapter = {
  isSupported() {
    return getSpeechRecognitionConstructor() !== null
  },

  start(callbacks: SttCallbacks): SttSession {
    const Recognition = getSpeechRecognitionConstructor()
    if (!Recognition) {
      callbacks.onError('not-supported')
      callbacks.onEnd()
      return { stop: () => {} }
    }

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }
      if (interim) callbacks.onInterim(interim)
      if (final) callbacks.onFinal(final)
    }

    recognition.onerror = (event) => {
      callbacks.onError(mapError(event.error))
    }

    recognition.onend = () => {
      callbacks.onEnd()
    }

    recognition.start()

    return {
      stop: () => recognition.stop(),
    }
  },
}
