import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types/chat'

interface ChatLogProps {
  messages: ChatMessage[]
  isSending: boolean
  characterName: string
}

export function ChatLog({ messages, isSending, characterName }: ChatLogProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, isSending])

  if (messages.length === 0 && !isSending) {
    return (
      <div className="chat-log chat-log-empty">
        <p className="field-hint">No messages yet. Say hello — the reply will honestly show that no AI backend is connected.</p>
      </div>
    )
  }

  return (
    <div className="chat-log" role="log" aria-live="polite">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`chat-bubble chat-bubble-${message.role}${message.isError ? ' chat-bubble-error' : ''}`}
        >
          <span className="chat-bubble-author hud-mono">
            {message.role === 'user' ? 'YOU' : message.role === 'assistant' ? characterName.toUpperCase() : 'SYSTEM'}
          </span>
          <p>{message.text}</p>
        </div>
      ))}
      {isSending && (
        <div className="chat-bubble chat-bubble-assistant chat-bubble-pending">
          <span className="chat-bubble-author hud-mono">{characterName.toUpperCase()}</span>
          <p className="hud-mono">thinking…</p>
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}
