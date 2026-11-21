import { useState, type KeyboardEvent } from 'react'

interface ChatComposerProps {
  isSending: boolean
  onSend: (text: string) => void
  onCancel: () => void
}

export function ChatComposer({ isSending, onSend, onCancel }: ChatComposerProps) {
  const [draft, setDraft] = useState('')

  function submit() {
    const text = draft.trim()
    if (!text || isSending) return
    onSend(text)
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    } else if (event.key === 'Escape') {
      if (draft) {
        setDraft('')
      } else if (isSending) {
        onCancel()
      }
    }
  }

  const rows = Math.min(Math.max(draft.split('\n').length, 1), 4)

  return (
    <div className="chat-composer">
      <textarea
        className="chat-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        rows={rows}
        aria-label="Message"
      />
      <button
        type="button"
        className="mic-button"
        disabled
        title="Voice input arrives in Phase 8"
        aria-label="Voice input (not yet available)"
      >
        Mic
      </button>
      {isSending ? (
        <button type="button" className="chat-send-button" onClick={onCancel}>
          Cancel
        </button>
      ) : (
        <button type="button" className="chat-send-button" disabled={!draft.trim()} onClick={submit}>
          Send
        </button>
      )}
    </div>
  )
}
