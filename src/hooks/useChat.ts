import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../types/chat'
import type { ChatAdapter } from '../adapters/chatAdapter'
import type { CompanionState } from '../types/companionState'

interface UseChatOptions {
  adapter: ChatAdapter
  requestTransition: (state: CompanionState) => boolean
  completeFrom: (from: CompanionState, to: CompanionState) => boolean
  /** Called with a successful reply's text, so a TTS hook can speak it. Wired
   * now even though the current adapter never succeeds, so connecting a real
   * backend later needs no changes here. */
  onAssistantReply?: (text: string) => void
}

function makeMessage(role: ChatMessage['role'], text: string, isError = false): ChatMessage {
  return { id: crypto.randomUUID(), role, text, isError, timestamp: Date.now() }
}

export function useChat({ adapter, requestTransition, completeFrom, onAssistantReply }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim()
      if (!text || isSending) return

      setMessages((prev) => [...prev, makeMessage('user', text)])
      setIsSending(true)
      requestTransition('thinking')

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const result = await adapter.sendMessage(text, controller.signal)
        if (controller.signal.aborted) return
        if (result.ok) {
          setMessages((prev) => [...prev, makeMessage('assistant', result.reply)])
          completeFrom('thinking', 'speaking')
          onAssistantReply?.(result.reply)
        } else {
          setMessages((prev) => [...prev, makeMessage('system', result.error, true)])
          completeFrom('thinking', 'idle')
        }
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return
        setMessages((prev) => [...prev, makeMessage('system', 'Something went wrong sending that message.', true)])
        completeFrom('thinking', 'idle')
      } finally {
        if (!controller.signal.aborted) setIsSending(false)
      }
    },
    [adapter, isSending, requestTransition, completeFrom, onAssistantReply],
  )

  const cancelSend = useCallback(() => {
    if (!abortRef.current) return
    abortRef.current.abort()
    setIsSending(false)
    completeFrom('thinking', 'idle')
  }, [completeFrom])

  const addSystemMessage = useCallback((text: string, isError = true) => {
    setMessages((prev) => [...prev, makeMessage('system', text, isError)])
  }, [])

  return { messages, isSending, sendMessage, cancelSend, addSystemMessage }
}
