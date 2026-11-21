import type { KeyboardEvent } from 'react'

interface ChatComposerProps {
  value: string
  onChange: (text: string) => void
  isSending: boolean
  onSend: (text: string) => void
  onCancelSend: () => void
  isListening: boolean
  micSupported: boolean
  onToggleListening: () => void
}

export function ChatComposer({
  value,
  onChange,
  isSending,
  onSend,
  onCancelSend,
  isListening,
  micSupported,
  onToggleListening,
}: ChatComposerProps) {
  function submit() {
    const text = value.trim()
    if (!text || isSending) return
    onSend(text)
    onChange('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    } else if (event.key === 'Escape') {
      if (isListening) {
        onToggleListening()
      } else if (value) {
        onChange('')
      } else if (isSending) {
        onCancelSend()
      }
    }
  }

  const rows = Math.min(Math.max(value.split('\n').length, 1), 4)

  return (
    <div className="chat-composer">
      <textarea
        className="chat-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? 'Listening…' : 'Type a message…'}
        rows={rows}
        aria-label="Message"
      />
      <button
        type="button"
        className={`mic-button${isListening ? ' mic-active' : ''}`}
        disabled={!micSupported}
        onClick={onToggleListening}
        title={
          micSupported
            ? isListening
              ? 'Stop listening (Ctrl+Space)'
              : 'Push to talk (Ctrl+Space)'
            : "Voice input isn't supported in this browser"
        }
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        aria-pressed={isListening}
      >
        {isListening ? 'Listening…' : 'Mic'}
      </button>
      {isSending ? (
        <button type="button" className="chat-send-button" onClick={onCancelSend}>
          Cancel
        </button>
      ) : (
        <button type="button" className="chat-send-button" disabled={!value.trim()} onClick={submit}>
          Send
        </button>
      )}
    </div>
  )
}
