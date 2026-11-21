export type CompanionState =
  | 'boot'
  | 'idle'
  | 'attention'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'reaction'
  | 'error'

/** Higher wins. A transition request is only honored if the target's priority
 * is >= the current state's priority — this is what stops e.g. a hover
 * reaction from interrupting a speaking animation (spec Sec5). */
export const STATE_PRIORITY: Record<CompanionState, number> = {
  boot: 0,
  idle: 0,
  attention: 20,
  reaction: 50,
  listening: 60,
  thinking: 70,
  speaking: 80,
  error: 100,
}

/** The state-machine diagram from spec Sec5. 'error' is reachable from every
 * state (handled as a special case, not listed here) since it's the
 * asset/service-failure safety net. */
export const ALLOWED_TRANSITIONS: Record<CompanionState, CompanionState[]> = {
  boot: ['idle'],
  idle: ['attention', 'listening', 'reaction', 'thinking'],
  attention: ['idle', 'listening', 'reaction', 'thinking'],
  listening: ['thinking', 'idle'],
  thinking: ['speaking', 'idle'],
  speaking: ['idle', 'reaction'],
  reaction: ['idle'],
  error: ['idle'],
}
