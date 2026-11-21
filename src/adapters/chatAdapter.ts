export type ChatAdapterResult = { ok: true; reply: string } | { ok: false; error: string }

/**
 * Conversation orchestration goes behind this interface (spec Sec9) so a real
 * backend can be swapped in later without touching the chat UI at all - same
 * principle the spec asks for with STT/TTS providers (Sec6).
 */
export interface ChatAdapter {
  sendMessage(text: string, signal: AbortSignal): Promise<ChatAdapterResult>
}
