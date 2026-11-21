# Project Doppelgänger — Status

## Current phase
**Phase 4 — animation controller.** Status: **WAITING** (implemented, tested, awaiting user approval to begin Phase 5).

## User-approved future direction (not yet built)
User shared a reference image (`Astra's Neon AI Companion Interface.png`) as the target look for the **final product**, and confirmed two things explicitly:
1. **UI chrome/panel language**: floating glass HUD panels (profile card, quick-actions grid, memory graph, task tracker, wardrobe carousel, system monitor, bottom command bar, chat/mic composer) — adopt this as the target design system as more features land (mainly Phase 4 onward, fully assembled by Phase 9–10).
2. **Character design modesty level** (Phase 5–6, explicitly not yet started): user chose "match the reference closely" when asked, meaning Astra's actual outfits/proportions should trend toward that reference's style and coverage level rather than the more conservative "Cyber Elegance" sketch in the spec's wardrobe table. This **does not** relax the spec's separate, explicit behavioral rule that pointer/touch reactions stay non-explicit and that physical interaction is never treated as consent for intimate behavior (spec §4) — that constraint stays in place regardless of outfit design and is not being revisited.

## Completed tasks (Phase 0)

## Completed tasks (Phase 0)
- Read `Project_Doppelganger_Claude_Implementation_Spec.docx` in full.
- Inspected `D:\crazy_idea` (stock Vite + React + TS template; 3D-stack deps already present but unused).
- Verified live MCP/plugin connections: Blender MCP, R3 MCP, Figma MCP, Context7, Playwright MCP.
- Documented Kaggle's manual setup requirements (not an MCP integration).
- Created `TOOL_INVENTORY.md`, `PROJECT_STATUS.md`, `CLAUDE.md`.
- Initialized git, added remote `https://github.com/Nitesh40320/Doppelganger.git`, pushed initial commit (collaborator access granted after an initial 403).

## Completed tasks (Phase 1)
- `CharacterProfile` type + `localStorage`-backed persistence hook.
- Sidebar nav (Companion / Character Settings live; Wardrobe/Memory/Workspace/Activity visibly disabled, each labeled with its future phase).
- Companion screen placeholder and full Character Settings form (name, address mode, personality, interaction toggles), all with honest "not yet connected" hints where relevant.
- Verified with `tsc`, `eslint`, production build, and a live Playwright pass confirming settings survive a full page reload.
- Swapped the stock `Inter` font for `Sora` (body) + `Chakra Petch` (headings) — flagged as an overused-font design finding and fixed same session.

## Completed tasks (Phase 2)
- **Test asset:** Inspected the live Blender MCP session first (`get_scene_info`) — confirmed it held only the untouched default scene (Cube/Light/Camera), no user work at risk. Built a simple six-primitive placeholder figure in a new collection alongside the untouched defaults (nothing deleted/overwritten) and exported it to `src/assets/avatar/models/test/placeholder_hologram_v001.glb`. This is explicitly a disposable pipeline-test asset, not the real character (Phase 5).
- **R3F viewport:** `src/components/AvatarModel.tsx` (`useGLTF` loader + preload), `src/components/AvatarViewport.tsx` (Canvas, camera, two-light rig, `OrbitControls`, drei `<Loader />` for load progress), `src/components/ViewportErrorBoundary.tsx` (class-based error boundary — R3F/`useGLTF` throws on failure, which only a real React error boundary catches).
- **Wired into `CompanionScreen.tsx`:** the former static placeholder div is now the live R3F stage, with honest copy ("placeholder test figure verifying the Blender → GLB → React Three Fiber pipeline... real character arrives in Phase 5").
- **Iron Man/JARVIS HUD visual direction** (user-requested, applied across the existing Phase 1 UI, not just the new viewport):
  - Added `Orbitron` (display/headings) and `Share Tech Mono` (telemetry/technical labels) alongside `Sora` (body text) — loaded via Google Fonts in `index.html`.
  - Added a reusable HUD-frame system in `App.css`: animated corner brackets (`.hud-corner` / `.hud-frame-soft`), a subtle scanning-line sweep over the 3D stage, a faint grid background on the app shell, a sidebar "SYSTEM ONLINE" status readout with a pulsing indicator dot, mono-styled field labels and badges, cyan glow on focus/hover states.
  - All motion (`hud-scan`, `hud-pulse`, `hud-spin`) is wrapped in a `prefers-reduced-motion: reduce` guard that disables it.

## Completed tasks (Phase 3)
- **Mouse tracking / gaze:** `AvatarModel.tsx` reads R3F's per-frame `state.pointer` (no custom mousemove listeners — avoids the "reaction on every mousemove" anti-pattern) and smoothly damps the placeholder head's yaw/pitch toward the cursor, clamped to ±28°/±16°, only while the pointer is inside the stage and `cursorGaze` is enabled; otherwise it damps back to neutral.
- **Named hit zones:** `src/types/interactionZones.ts` maps the placeholder's four interactive meshes (head, left/right arm, torso) to zone ids and reaction copy. Documented inline that "hair"/"cheek"/"shoulder" from the spec's full zone list have no equivalent mesh on this primitive placeholder and will be added once the real rigged character (Phase 5) has separate meshes for them.
- **Reactions (placeholder clips):** `useAvatarReactions.ts` — click/tap a zone to trigger a brief scale-pulse (intensity scaled by the `touchIntensity` setting) with a cooldown (`REACTION_COOLDOWN_MS` = 650ms) that silently ignores further triggers — on any zone, not just the same one — until it expires. The reaction also auto-clears afterward so the status line doesn't linger forever (a real bug caught and fixed mid-phase — see below).
- **Settings wiring:** `cursorGaze`, `touchReactions`, and `touchIntensity` (already in the profile from Phase 1) now drive real behavior instead of being inert; updated their Settings-screen hint text accordingly. Added the still-missing `soundEffects` toggle the spec calls for in §4 (stores a preference; honestly labeled as not wired to any audio yet).
- **Accessibility:** added a "Pat head / Wave / Greet" button row under the viewport (spec §4: "Provide keyboard-accessible alternatives for all important controls") — real `<button>` elements, Tab/Enter operable, calling the same reaction dispatch as the 3D hit zones.
- **HUD integration:** the stage's telemetry overlay now shows `ZONE: <hovered zone>` live, and the status panel below shows the active reaction's line in place of the idle copy while it's playing.

## Tests actually run and results
- `npx tsc -b` → clean.
- `npx eslint .` → clean (no new violations this phase).
- `npm run build` → succeeds (same pre-existing bundle-size warning as Phase 2, still deferred to the Phase 9 performance pass).
- Live Playwright verification against `npm run dev`, using real `page.mouse.move`/`click` (not synthetic events) for trustworthy results:
  - Hovering the head mesh correctly shows `ZONE: TOP OF HEAD`; moving the pointer off the stage entirely correctly clears it.
  - Clicking the head zone triggers "Astra eyes soften for a moment."; clicking a **different** zone immediately after (within the 650ms cooldown) was correctly ignored (status unchanged); clicking again after the cooldown expired correctly registered ("Astra turns attention toward you.").
  - Found and fixed a real bug here: `activeReaction` was never cleared after the pulse finished, so the reaction line would have stayed on screen forever after the first click. Added a matching timeout to clear it; re-verified the status line reverts to idle copy after the cooldown window.
  - Turned `touchReactions` off via Character Settings and confirmed clicking the head zone no longer triggers a reaction; turned it back on and confirmed normal behavior resumed.
  - Activated the "Wave" keyboard button via `.focus()` + `Enter` (not a mouse click) and confirmed it triggers the same reaction as clicking the 3D zone.
  - `cursorGaze` toggle gating uses the identical conditional pattern already verified for `touchReactions`, but the visual effect itself (head rotation on a featureless placeholder sphere) can't be meaningfully confirmed by screenshot — there's no face/eyes to show gaze direction until the real character exists (Phase 5). Noted as a verification gap, not a known defect.
  - All dev servers and test artifacts cleaned up after verification.

## Known errors (Phase 3)
None outstanding. (One real state-management bug — reaction never clearing — found and fixed during this phase.)

## Completed tasks (Phase 4)
- **State machine:** `src/types/companionState.ts` defines the eight states from spec §5's diagram (boot/idle/attention/listening/thinking/speaking/reaction/error), a priority ranking per state, and the allowed-transition graph. `src/hooks/useCompanionStateMachine.ts` exposes `requestTransition` (priority-gated — rejects a lower-priority interruption, e.g. a hover reaction can't interrupt speaking, matching the spec's own example) and `completeFrom` (for a state's own natural exit — a reaction's pulse finishing, speech ending — which bypasses the priority gate but only fires if the machine is still in the expected source state, guarding against a stale timer clobbering a newer state). `error` is reachable from any state as a special case (asset/service-failure safety net, character stays visible).
- **Unified with Phase 3's reaction system:** removed `useAvatarReactions.ts` (now redundant) and routed hit-zone clicks through `requestTransition('reaction')` instead of a separate standalone cooldown timer — the state machine's own "can't re-enter the state you're already in" rule does that job now, which is more architecturally correct than two parallel mechanisms both claiming to represent "is a reaction playing."
- **Hover now drives a real state** (`attention`) instead of only being read ad hoc by the gaze code; `AvatarViewport` bubbles stage hover up via a new `onStageHoverChange` callback.
- **Visual cues per state** on the placeholder (`AvatarModel.tsx`): idle/attention get a very small procedural "breathing" scale oscillation (stands in for a real breathing clip); each state pulses the model's emissive glow differently (idle steady, listening/thinking/speaking at different rates, thinking in lavender to stay in-palette while being distinguishable, error in warning red) — all explicitly commented as a placeholder stand-in, not a claim that this is final facial/lip-sync behavior.
- **Dev test harness:** since nothing in the app yet produces real `listening`/`thinking`/`speaking` triggers (that's chat in Phase 7, voice in Phase 8), added a clearly-labeled "DEV: STATE MACHINE TEST" panel with a "Simulate conversation turn" button (chains listening → thinking → speaking → idle with realistic delays) and "Force error / safe mode" / "Recover to idle" buttons. Labeled honestly as a developer tool that Phases 7–8 will replace, not presented as a working chat/voice feature.
- A real lint-surfaced bug fixed along the way: `materials` from `useGLTF` is a shared, cached resource, and the glow-animation code was mutating it directly — on a React/eslint ruleset new enough to flag this (`react-hooks/immutability`, `react-hooks/refs`) as a correctness risk, since another component instance could share and be corrupted by that mutation. Fixed by cloning the material once after mount and swapping every mesh in the group onto the owned clone via `group.traverse`, rather than mutating the cached original.

## Tests actually run and results (Phase 4)
- `npx tsc -b` → clean.
- `npx eslint .` → found and fixed three real issues before the final clean run: (1) a ref written unconditionally during render (`stateRef.current = state` moved into a `useEffect`); (2) the `materials`-mutation issue above; (3) an exhaustive-deps warning on an unmount cleanup effect (fixed by capturing the ref's array into a local variable inside the effect, since the array is mutated via `push` rather than reassigned, so capturing the reference once is correct).
- `npm run build` → succeeds (same pre-existing bundle-size warning, still deferred to Phase 9).
- Live Playwright verification against `npm run dev`, all in single atomic scripts to avoid tool-round-trip latency contaminating the timing (a real lesson learned mid-session — see below):
  - BOOT → IDLE confirmed (state reads `BOOT` immediately after mount, `IDLE` ~600ms later).
  - Full simulated turn confirmed: IDLE → LISTENING → THINKING → SPEAKING, each state reached exactly when expected.
  - **Priority gate confirmed working exactly as spec §5 describes**: clicking a hit zone immediately after entering `SPEAKING` was rejected — state and status line stayed on "speaking," no reaction fired.
  - **Error/safe-mode confirmed**: "Force error" correctly entered `SAFE MODE` from idle with the character still visible; a reaction click during `SAFE MODE` was correctly rejected (error has the highest priority); "Recover to idle" correctly returned to `IDLE`.
  - One test-methodology mistake caught and corrected mid-session: an earlier attempt to verify the same priority gate by splitting waits/clicks across *separate* tool calls gave an inconsistent result, because real wall-clock time elapsing between calls (tool round-trip latency) let the simulated speaking duration legitimately expire before the click landed. Re-ran as a single atomic script and got a clean, trustworthy result — noted here so this isn't mistaken for a flaky app behavior later.
  - All dev servers and test artifacts cleaned up after verification.

## Known errors (Phase 4)
None outstanding. (Three real lint-surfaced bugs found and fixed — see above.)

## Decisions awaiting user approval
- Approval to proceed to Phase 5 (Blender rig, facial shape keys, default outfit, P0 animation clips, exported to GLB — the first phase that touches the *real* character asset).
- No other blocking decisions currently.

## Approved design/architecture decisions
- Visual direction: Iron Man/JARVIS-style HUD chrome (corner brackets, scanlines, grid background, mono telemetry readouts) layered onto the existing dark-navy/cyan palette from Phase 1 — user-requested, applied this phase.
- Phase 2's test asset was authored directly in Blender via MCP rather than downloading a third-party sample model, specifically to avoid any licensing ambiguity and to exercise the real Blender → GLB → R3F pipeline early.
- No `.blend` source file was kept for the disposable test placeholder (by design — see `TOOL_INVENTORY.md`).

## Files created or modified (Phase 2)
- Created: `src/components/AvatarModel.tsx`, `src/components/AvatarViewport.tsx`, `src/components/ViewportErrorBoundary.tsx`, `src/assets/avatar/models/test/placeholder_hologram_v001.glb`.
- Modified: `index.html` (fonts), `src/App.css` (HUD system), `src/components/CompanionScreen.tsx` (viewport embed + copy), `src/components/Sidebar.tsx` (status footer), `TOOL_INVENTORY.md`, `PROJECT_STATUS.md`.
- No files deleted. No existing Blender scene content touched.

## Files created or modified (Phase 3)
- Created: `src/types/interactionZones.ts`, `src/hooks/useAvatarReactions.ts` (superseded and removed in Phase 4).
- Modified: `src/components/AvatarModel.tsx` (gaze + per-zone pointer handlers + reaction-driven scale pulse), `src/components/AvatarViewport.tsx` (pointer-in-stage tracking, new props), `src/components/CompanionScreen.tsx` (reaction hook wiring, hover/status display, keyboard button row), `src/components/CharacterSettingsScreen.tsx` (live hint text, new Sound effects toggle), `src/types/characterProfile.ts` (`soundEffects` field), `src/App.css` (interact bar, canvas-wrap positioning), `PROJECT_STATUS.md`.
- No files deleted.

## Files created or modified (Phase 4)
- Created: `src/types/companionState.ts`, `src/hooks/useCompanionStateMachine.ts`.
- Modified: `src/components/AvatarModel.tsx` (state-driven glow + breathing + owned-material clone fix), `src/components/AvatarViewport.tsx` (`companionState`/`reactionZoneId` props replacing the old `activeReaction` prop, new `onStageHoverChange` callback), `src/components/CompanionScreen.tsx` (state machine wiring, per-state status text, dev test panel), `src/App.css` (dev panel styling), `PROJECT_STATUS.md`.
- Deleted: `src/hooks/useAvatarReactions.ts` — Phase 3's standalone reaction/cooldown hook, superseded by the unified state machine (its job is now done by the machine's own "can't re-enter the current state" rule). This is code I wrote in the previous phase of this same session, not user content; flagging it here per the project's "never delete without approval" rule even though it's a low-risk, git-tracked, same-session refactor.

## Exact next action (requires approval before starting)
Phase 5 — Blender rig, facial shape keys, default Cyber Elegance outfit, P0 animation clips, exported to GLB, per spec §11 and §14. Not started.
