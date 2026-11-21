# Project Doppelgänger — Status

## Current phase
**Phase 3 — mouse tracking.** Status: **WAITING** (implemented, tested, awaiting user approval to begin Phase 4).

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

## Known errors
None outstanding. (One real state-management bug — reaction never clearing — found and fixed during this phase.)

## Decisions awaiting user approval
- Approval to proceed to Phase 4 (idle/listening/thinking/speaking/reaction animation state machine, per spec §5).
- Character design modesty level for Phase 5–6 is now settled (see "User-approved future direction" above) — no longer a pending decision, recorded for when those phases start.
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
- Created: `src/types/interactionZones.ts`, `src/hooks/useAvatarReactions.ts`.
- Modified: `src/components/AvatarModel.tsx` (gaze + per-zone pointer handlers + reaction-driven scale pulse), `src/components/AvatarViewport.tsx` (pointer-in-stage tracking, new props), `src/components/CompanionScreen.tsx` (reaction hook wiring, hover/status display, keyboard button row), `src/components/CharacterSettingsScreen.tsx` (live hint text, new Sound effects toggle), `src/types/characterProfile.ts` (`soundEffects` field), `src/App.css` (interact bar, canvas-wrap positioning), `PROJECT_STATUS.md` (this file).
- No files deleted.

## Exact next action (requires approval before starting)
Phase 4 — idle/listening/thinking/speaking/reaction animation state machine, per spec §5 and §14. Not started.
