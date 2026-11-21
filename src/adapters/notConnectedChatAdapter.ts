import type { ChatAdapter, ChatAdapterResult } from './chatAdapter'

/**
 * Honest stand-in used until a real backend is chosen and approved (spec
 * Sec9/Sec19.2 - don't silently pick a paid AI provider). Makes no network
 * call and returns no fabricated reply; it only exercises the same
 * async/cancellable shape a real adapter will use, so swapping one in later
 * is a one-line change, not a UI rewrite.
 */
export const notConnectedChatAdapter: ChatAdapter = {
  async sendMessage(_text, signal): Promise<ChatAdapterResult> {
    await new Promise<void>((resolve, reject) => {
      const id = setTimeout(resolve, 650)
      signal.addEventListener('abort', () => {
        clearTimeout(id)
        reject(new DOMException('Cancelled', 'AbortError'))
      })
    })
    return {
      ok: false,
      error: 'No AI backend is connected yet. This conversation flow is UI-only until a backend is chosen and approved.',
    }
  },
}
