# Project Doppelgänger — Status

## Current phase
**Phase 2 — 3D test avatar.** Status: **WAITING** (implemented, tested, awaiting user approval to begin Phase 3).

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

## Tests actually run and results
- `npx tsc -b` → clean.
- `npx eslint .` → one error found and fixed (`react-refresh/only-export-components`: `AvatarModel.tsx` was exporting a non-component constant alongside the component; made the constant module-private). Clean after.
- `npm run build` → succeeds. Note: the production JS bundle is ~1.2 MB (three.js/R3F/drei), which triggers Vite's chunk-size warning. Not a Phase 2 blocker; flagged for the Phase 9 performance pass (code-splitting the 3D viewport).
- Live Playwright verification against `npm run dev`:
  - Companion screen: test model loads and renders (head/torso/arms/legs visible), zero console errors (one pre-existing library-level warning: `THREE.Clock` deprecation, emitted by the installed three.js/R3F versions themselves, not introduced by this phase's code).
  - **Deliberately broke the model path** (`DOES_NOT_EXIST.glb`) to verify error handling: confirmed the `ViewportErrorBoundary` fallback rendered ("MODEL LOAD FAILED") while the rest of the app (sidebar, status panel) stayed fully functional — then reverted to the real path and re-confirmed normal loading.
  - Checked the Character Settings screen under the new HUD styling — all fields remain legible and functional.
  - Camera framing was tuned by trial (first attempt over-zoomed and cropped the head; corrected by re-deriving the distance from the model's actual vertical extent).
  - All dev servers and test screenshots cleaned up after verification.

## Known errors
None outstanding. (One ESLint error and one camera-framing issue were found and fixed during this phase.)

## Decisions awaiting user approval
- Approval to proceed to Phase 3 (mouse tracking — cursor gaze, head follow, named hit zones and reactions, using placeholder clips if necessary).
- No other blocking decisions currently.

## Approved design/architecture decisions
- Visual direction: Iron Man/JARVIS-style HUD chrome (corner brackets, scanlines, grid background, mono telemetry readouts) layered onto the existing dark-navy/cyan palette from Phase 1 — user-requested, applied this phase.
- Phase 2's test asset was authored directly in Blender via MCP rather than downloading a third-party sample model, specifically to avoid any licensing ambiguity and to exercise the real Blender → GLB → R3F pipeline early.
- No `.blend` source file was kept for the disposable test placeholder (by design — see `TOOL_INVENTORY.md`).

## Files created or modified this session (Phase 2)
- Created: `src/components/AvatarModel.tsx`, `src/components/AvatarViewport.tsx`, `src/components/ViewportErrorBoundary.tsx`, `src/assets/avatar/models/test/placeholder_hologram_v001.glb`.
- Modified: `index.html` (fonts), `src/App.css` (HUD system), `src/components/CompanionScreen.tsx` (viewport embed + copy), `src/components/Sidebar.tsx` (status footer), `TOOL_INVENTORY.md`, `PROJECT_STATUS.md` (this file).
- No files deleted. No existing Blender scene content touched.

## Exact next action (requires approval before starting)
Phase 3 — cursor gaze, head follow, named hit zones and reactions (placeholder clips if needed), per spec §4 and §14. Not started.
