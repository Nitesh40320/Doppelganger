# Project Doppelgänger — Status

## Current phase
**Phase 10 — integration, plus an out-of-band character-art pass.** Status: **WAITING** (Memory screen implemented and tested; character body/outfit rebuilt at v002 with a real quality improvement — see below; awaiting user direction on what's next).

## Character art: v002 rebuild (2026-11-21, after Phase 10)
User pushed back on the "I can't make it beautiful" framing from the AI-generation discussion, pointing out Blender access was available and asking for a real attempt rather than stopping there. Agreed to try a technique not used in Phase 5: Blender's **metaball** system, where overlapping smooth-blend shapes fuse into one continuous surface with no visible seams — a real, scriptable step up from Phase 5's blocky capsule-primitive body, while being upfront that it still wouldn't reach hand-illustrated reference-image quality.

- **Body**: rebuilt via a "ball-chain" metaball technique — multiple balls interpolated along each bone segment, spaced closely enough (radius-aware spacing, not a fixed count) to fuse into smooth tubes rather than a "pearl necklace" of separate beads. Caught and fixed that exact beading bug via a direct render check before proceeding, rather than assuming the first attempt had worked. Added facial structure hints (brow, cheek, jaw, nose) via small additional metaballs, and carved eye sockets using Blender's negative-metaball feature.
- **Eyes**: added for the first time — layered sclera/iris/pupil geometry (lavender-blue iris per spec §2), rigidly bone-parented to the head bone (not skinned — small rigid shapes don't need deformation).
- **Hair**: added for the first time — a scalp "cap" plus several long tapered strand chains, built the same metaball way, as a *separate* metaball object so it doesn't organically fuse with the skin.
- **Outfit**: Cyber Elegance top/boots rebuilt with the same smooth technique for visual consistency with the new body.
- **Materials**: proper skin material with subsurface scattering, glossy iris/sclera/pupil materials, an anisotropic silver-white hair material with a faint cyan tint — none of this existed in v1's flat materials.
- **Rig and animations fully reused, not rebuilt**: parented the new meshes to the *same* Phase 5 armature (identical bone names), so all 6 existing P0 animation clips worked immediately with zero re-keying. Re-verified the no-tearing pose test from Phase 5 on the new mesh before moving on.
- **Shape keys redone** (Blink/Mouth_Open/Smile/Frown) against the new mesh's different vertex layout — Phase 5's region-filters couldn't carry over directly. Caught a real gap during export verification: the `Speaking_Mouth` shape-key action was still tied to the *old* body's Key datablock (a different object), so it silently didn't export for v2 until rebuilt against the new body and re-exported.
- **A real tool-limitation lesson, resolved rather than worked around blindly**: spent significant back-and-forth confused about why `look` kept returning pixel-identical renders despite repositioning the scene's actual Camera object and changing viewport state — eventually confirmed `look` doesn't respect the scene camera or viewport changes at all; it appears to auto-frame a fixed default view regardless. Stopped fighting it once confirmed, and relied on numeric/structural verification (vertex counts, bounding boxes, GLB structure) plus whole-figure renders for the checks that mattered, rather than chasing a reliable close-up zoom that this tool doesn't support.
- Exported `astra_v002.glb` (654 KB — smaller than v1's 950 KB despite having more content: hair, eyes, an extra shape key — because the metaball-derived mesh has a lower polygon count than v1's primitive-based one). Versioned source retained at `assets/avatar/models/astra_v002.blend`; v001 files untouched, not deleted.
- Verified live in the browser: model loads with zero console errors, Wave/reaction animations play correctly on the new rig, and the TTS test correctly drives the rebuilt `Speaking_Mouth` shape key and returns to idle afterward.
- **Honest outcome**: a genuinely smoother, more detailed, more complete character (continuous seamless body, real eyes, real hair, better materials) than Phase 5 produced — and still a stylized/simplified 3D figure, not reference-image-quality art. That ceiling is real; this was a meaningfully better attempt within it, not a way past it.

## Scope decision for Phase 10 (confirmed with user before starting)
The spec's literal ask ("connect approved memory/workspace/task APIs") doesn't fully make sense yet: no AI backend exists to actually use memory or act on workspace files, and Workspace specifically runs into a real technical wall for a pure frontend app — browsers can't read/write arbitrary paths like `D:\crazy_idea` without either a backend server or the user manually granting a folder via the File System Access API (Chromium-only, re-granted every session, can't be pre-scoped to a fixed path). Presented three options; user chose **Memory screen only**, deferring Workspace/Activity until a real backend exists to make them meaningful.

## Character art: AI generation attempt (between Phase 9 and 10, 2026-11-21)
User asked for a timeline on finishing the polished character/outfit art. Answered honestly: procedural Blender scripting (used for the Phase 5 rig) cannot produce sculpted anime-quality art — that gap can only be closed by (a) an AI 3D generator, (b) a human 3D artist, or (c) a licensed/purchased asset. User chose (a) as a first step.

- Blender MCP's `generators` status had changed since the Phase 0 audit: `tripo` and `hyper3d` are now **on** (both were off in Phase 0) — the user enabled them independently between sessions.
- Learned a real constraint from `generate_3d`'s own tool description before spending anything: it makes **one fused object per call** (no separable body+clothing layers, no rig, no shape keys), and each call can cost real money or a generation credit. This means the eventual plan is one generated mesh per *complete outfit* (body+clothes together), not a shared nude base body with swappable clothing — generating a "nude base" would also be inappropriate to prompt for. Re-rigging and re-adding shape keys to each generated mesh remains manual work regardless of generator quality.
- Ran one test generation (prompt matching spec §2's design direction: adult 25+, silver-white hair, lavender-blue eyes, Cyber Elegance outfit, T-pose) via **Tripo** → failed: `insufficient credit`. Tried the same test via **Hyper3D** → failed: `API_INSUFFICIENT_FUNDS`. Neither call created anything or incurred charge (both failed before task creation).
- User decided: pause the art-generation path, continue with functional phases. Add credit to Tripo or Hyper3D whenever convenient, then ask to retry the single test generation — not a blocker for Phase 10+.

## Provider decision for Phase 8 (confirmed with user before starting)
Asked the user to choose between: (a) the browser-native Web Speech API (free, no backend, works today, but inconsistent cross-browser support and Chrome sends audio to Google's servers for recognition), (b) building the pipeline with the provider stubbed out, or (c) holding for a paid cloud provider + the backend server needed to keep its API key off the frontend. They chose (a). Everything below uses Web Speech API (`SpeechRecognition` + `SpeechSynthesis`) as the live adapter implementation, with the Chrome/Google privacy caveat disclosed directly in Character Settings, not buried.

## Scope decision for Phase 5 (confirmed with user before starting)
A fully sculpted, production-quality adult anime face/body — the "high-quality 3D anime
realism" in the spec's product vision — is not achievable through procedural Blender Python
scripting; that level of topology and facial detail is normally hand-sculpted by a 3D artist.
Asked the user how to proceed; they chose: build a clean, correctly-rigged, functional
humanoid now (satisfies Phase 5's technical pipeline criteria), and treat final visual
polish/sculpting as a separate later effort (human artist, licensed asset, or AI generation
once enabled and approved). Everything below was built to that explicit, agreed scope —
it is deliberately basic-looking, not a stand-in for final art.

## User-approved future direction (not yet built)
User shared a reference image (`Astra's Neon AI Companion Interface.png`) as the target look for the **final product**, and confirmed two things explicitly:
1. **UI chrome/panel language**: floating glass HUD panels (profile card, quick-actions grid, memory graph, task tracker, wardrobe carousel, system monitor, bottom command bar, chat/mic composer) — adopt this as the target design system as more features land (mainly Phase 4 onward, fully assembled by Phase 9–10).
2. **Character design modesty level** (Phase 5–6, explicitly not yet started): user chose "match the reference closely" when asked, meaning Astra's actual outfits/proportions should trend toward that reference's style and coverage level rather than the more conservative "Cyber Elegance" sketch in the spec's wardrobe table. This **does not** relax the spec's separate, explicit behavioral rule that pointer/touch reactions stay non-explicit and that physical interaction is never treated as consent for intimate behavior (spec §4) — that constraint stays in place regardless of outfit design and is not being revisited.

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

## Completed tasks (Phase 5)
- **Body:** built in Blender via MCP as overlapping capsule-shaped primitives (spheres at joints, tapered cylinders between them) joined into a single mesh — a more controllable technique than Blender's Skin modifier, which was tried first and abandoned after it produced bad topology at the high-valence chest joint (see "debugging notes" below). ~1.72m standing proportions, slight anime-style jaw taper via a crude vertex-region squash. One PBR skin material.
- **Skeleton:** a 21-bone armature (spine chain, both arms to the hand, both legs to the toe) matching the same joint layout as the body. Body parented with automatic weights. **Tested exactly as spec §11 requires**: posed shoulders, elbows, hips, knees, and neck in Blender and confirmed the mesh deforms without tearing, then reset to rest pose.
- **Facial shape keys:** Blink, Mouth_Open, Smile, Frown — crude vertex-region deformations (no real eye/mouth topology exists on this base mesh, so these are honestly basic, not final facial animation). Verified each has a non-trivial vertex count and the morph target data exports correctly.
- **Default outfit (Cyber Elegance):** a fitted "top" (hips→chest→shoulders) and "boots" (ankle→knee), built the same capsule way, each a separate object with its own material, both parented to the same armature with automatic weights — matching the spec's wardrobe architecture (separate swappable clothing meshes, same body/rig).
- **P0 animation clips:** Idle, Listening, Thinking, Speaking, Wave, LookAt — named Blender Actions with bone keyframes (1 second each at the default 24fps), plus a separate `Speaking_Mouth` shape-key action driving `Mouth_Open` during speech.
- **Versioned source retained:** `assets/avatar/models/astra_v001.blend` (2.1 MB, outside `src/` so Vite doesn't watch/process a large binary). Exported `src/assets/avatar/models/astra_v001.glb` (950 KB) with `export_animation_mode='ACTIONS'` so every action becomes its own named glTF animation clip.
- **App integration:** rewrote `AvatarModel.tsx` to load the real skinned/rigged/animated GLB via `useGLTF` + drei's `useAnimations`, replacing the Phase 2–4 static placeholder entirely. The animation-state-machine states (Phase 4) now play the matching *real* clip with crossfading instead of the old procedural scale-pulse/breathing stand-ins. Hit zones (head/torso/hand.L/hand.R) are now invisible proxy colliders that track each bone's live world position every frame, since the real character is one continuous skinned mesh rather than separate named meshes per zone like the old placeholder.
- **Known, disclosed regression:** continuous cursor-gaze head-follow (Phase 3) is temporarily disabled. Directly rotating the head bone would fight the real baked clips that now also drive it; doing this properly needs additive animation-layer blending, which is more work than this phase's scope. The Character Settings hint text for "Cursor gaze" was updated to say so honestly rather than leave a toggle that silently does nothing unexplained.
- The old Phase 2 test placeholder (`src/assets/avatar/models/test/placeholder_hologram_v001.glb`) is now unused/orphaned since nothing imports it anymore. Left in place rather than deleted, per the project's file-safety rule — the user can remove it whenever convenient.

## Debugging notes from Phase 5 (for future reference, not current defects)
- Blender's Skin modifier produced visibly broken geometry (an arm looping up over the head) at a 4-way bone junction (the chest, which connects to both shoulders, the neck, and the spine) — a known category of issue with that modifier at high-valence vertices. Abandoned in favor of the overlapping-capsule-primitives technique, which gave full, predictable control.
- Spent real time chasing what looked like an asymmetric-arm bug after that pivot, visible across several screenshots from different angles. Rigorously verified with hard numbers three separate times (joint positions, reconstructed cylinder endpoints from their transforms, and direct mesh vertex-region comparison between both arms) — all three checks came back perfectly symmetric. It was a visual misread of a small, low-sample (16-sample EEVEE quick preview), ambiguous-angle render, not a real defect. Lesson applied: verify 3D geometry questions numerically, not by eye, when the two disagree.

## Tests actually run and results (Phase 5)
- `npx tsc -b` → clean.
- `npx eslint .` → three real issues found with the same `react-hooks/immutability` family of rules as Phase 4; this time, after inspection, they were **not** bugs (unlike Phase 4's genuine shared-material mutation) — `THREE.AnimationAction` is an inherently mutable three.js control object by design, and the "owned materials" being mutated were already our own clones (made specifically to avoid the Phase-4-style shared-cache problem). Added narrow, commented `eslint-disable` lines explaining why, rather than mis-architecting correct code around a lint heuristic that doesn't model three.js's imperative-object API.
- `npm run build` → succeeds (950 KB GLB now bundled; same pre-existing large-JS-chunk warning, still deferred to Phase 9).
- Parsed the exported GLB's JSON chunk directly (Node) before touching any app code, to verify the Blender→GLB pipeline actually produced what it claimed: confirmed all 7 animations present and correctly named, a skin with 22 joints, 4 morph targets (Blink/Mouth_Open/Smile/Frown) on the body mesh, and all 3 materials present. Also confirmed every clip is exactly 1.00s, which is why `REACTION_DURATION_MS`/`REACTION_COOLDOWN_MS` were retuned from Phase 3/4's 550ms/650ms to 1000ms/1050ms to match.
- Live Playwright verification against `npm run dev`, zero console errors throughout:
  - Real character loads and renders (smooth continuous mesh, clear visual improvement over the Phase 2–4 placeholder).
  - Clicking a hand zone plays the real "Wave" clip (not a scale-pulse) and status text updates correctly; state returns to IDLE automatically once the clip's duration elapses.
  - Full simulated conversation turn (IDLE → LISTENING → THINKING → SPEAKING) confirmed driving the matching real clips in sequence.
  - Force error / Recover to idle still work correctly with the new rig.
  - Character Settings' "Cursor gaze" hint text correctly shows the new honest "temporarily paused" explanation.
  - Dev server and test screenshots cleaned up after verification; restored the Cube's viewport visibility in the live Blender session (hidden temporarily, for my own debugging, now reverted) and re-saved `astra_v001.blend`.

## Known errors (Phase 5)
None outstanding.

## Completed tasks (Phase 6)
- **Fixed a real architectural bug found while scoping this phase**: navigating between screens (e.g. Companion → Character Settings → Companion) was unmounting `CompanionScreen` entirely, resetting the Phase 4 animation state machine back to `BOOT` and reloading the whole 3D scene. This directly violated Phase 6's own acceptance criterion ("changing outfit... does not reset chat/state") and the spec's explicit "avoid rebuilding or reloading the whole avatar" rule (§3), so it had to be fixed before the Wardrobe screen could mean anything. Fixed in `App.tsx`: the Companion screen is now always mounted, hidden via CSS (`display: none`) rather than conditionally unmounted, while Settings/Wardrobe still mount/unmount normally (they have no expensive state to lose).
- **Outfit data + Wardrobe screen**: `src/types/outfits.ts` lists all six outfits from spec §3's wardrobe table. Only Cyber Elegance (built in Phase 5) is marked available; the other five are shown but clearly labeled "SOON — Meshes not modeled yet" with no select control at all, per the spec's explicit rule not to promise outfit changes before the meshes exist.
- Enabled the previously-disabled "Wardrobe" nav item. Selecting an outfit writes to the same `characterProfile.selectedOutfit` field and `localStorage` persistence Phase 1 already built — no new persistence code needed.
- Updated the Character Settings "Selected outfit" hint to point at the new Wardrobe screen instead of saying "arrives in Phase 6" (it has).

## Tests actually run and results (Phase 6)
- `npx tsc -b` / `npx eslint .` → clean.
- `npm run build` → succeeds (same pre-existing bundle-size warning, deferred to Phase 9).
- Live Playwright verification against `npm run dev`:
  - **Proved the mount-persistence fix with hard evidence, not assumption**: added temporary debug logging (a mount/unmount log, then a per-state-change timestamp log) and confirmed zero additional mounts of `CompanionScreen` occur across Wardrobe/Settings/Companion navigation — the only mount/unmount pair observed was React 19 StrictMode's deliberate double-invoke on initial page load, confirmed to happen identically on a fresh `page.goto()` (not an HMR artifact). Removed the debug logging afterward; `git diff` confirmed the file was left byte-identical to before.
  - **A real test-methodology mistake, caught and corrected in-session**: an early timing-based check made it look like navigating away during an active "reaction" animation reset it after only ~150ms (should last 1000ms) — timestamped logging proved the reaction actually completed at 1004ms, exactly on schedule. The root cause: in this environment, each `page.getByRole(...).click()` call inside `browser_run_code_unsafe` cost roughly 2 seconds of real wall-clock time (measured directly with `Date.now()`), not the near-instant latency assumed — so a sequence of a few clicks and small nominal waits actually consumed far more real time than intended. This is the same class of mistake made once already in Phase 4 (there, splitting a check across separate tool calls; here, chaining actions within one script) — filed as product feedback given it's now recurred. Lesson re-applied: always get an actual timestamp when a timing question matters, never estimate from nominal wait values when real UI actions are interleaved.
  - Wardrobe screen renders all six outfits correctly; Cyber Elegance shows a disabled "Currently worn" button, the other five show no button at all (only the "meshes not modeled yet" hint) — confirmed via accessibility snapshot, not just visually.
  - `localStorage` confirmed to contain `"selectedOutfit":"Cyber Elegance"` after visiting the Wardrobe screen.
  - Character Settings' outfit hint confirmed updated.
  - Companion screen confirmed rendering correctly (character visible, IDLE state, zero console errors) after a full navigation round-trip through Wardrobe and Settings.
  - Dev server and test screenshots cleaned up after verification.

## Known errors (Phase 6)
None outstanding. (One real architectural bug — screen navigation resetting companion state — found during scoping and fixed before building the feature that depended on it being fixed.)

## Completed tasks (Phase 7)
- **Adapter architecture** (`src/adapters/chatAdapter.ts`): a `ChatAdapter` interface (`sendMessage(text, signal) -> Promise<{ok:true,reply} | {ok:false,error}>`), matching the spec's explicit ask for swappable providers (§6/§9) so a real backend is a one-line swap later, not a UI rewrite. `notConnectedChatAdapter.ts` is the current implementation — it makes no network call, fabricates no reply, and always honestly returns "no AI backend is connected yet" after a short delay (long enough to make the loading state real and visible, not instant). This matches the spec's own Definition of Done for this phase (§16): "Keyboard chat UI is functional, even if AI backend integration is scheduled for a later phase."
- **`useChat` hook**: manages message history and an `AbortController`-based in-flight request, wired to the *same* Phase 4 state-machine instance (`requestTransition`/`completeFrom` passed in, not a separate copy) — sending a message requests `thinking`, a successful reply would complete to `speaking` (never exercised today since the adapter always errors), and an error or cancellation completes back to `idle`, matching the state diagram's own "THINKING → IDLE (request cancelled or failed)" transition exactly.
- **`ChatComposer`**: Enter sends, Shift+Enter inserts a newline, Escape clears the draft if there's text or cancels an in-flight send if not (spec §6's three required composer behaviors, all real). A disabled Mic button is shown with an honest tooltip/label ("Voice input arrives in Phase 8") rather than omitted or faked.
- **`ChatLog`**: renders user/assistant/system messages with distinct styling (error messages get a visibly different red-tinted treatment), an animated "thinking…" bubble while a request is in flight, auto-scrolls to the newest message, and uses `role="log"`/`aria-live="polite"` for accessibility.
- Wired into `CompanionScreen.tsx` between the status panel and the dev test panel. Updated the dev panel's own label to clarify that chat now drives real `THINKING`, while `LISTENING`/`SPEAKING` still need voice (Phase 8) and an actual backend to occur for real — the simulate button remains useful for exercising those until then.

## Tests actually run and results (Phase 7)
- `npx tsc -b` / `npx eslint .` → clean, no new issues this phase.
- `npm run build` → succeeds (same pre-existing bundle-size warning, deferred to Phase 9).
- Live Playwright verification against `npm run dev`, zero console errors throughout:
  - Typed a message, pressed Enter: user bubble appeared immediately, `STATE: THINKING` and a "thinking…" bubble appeared, and after the adapter's delay the honest "No AI backend is connected yet" system error appeared (red-tinted) with state correctly returning to `IDLE`.
  - Shift+Enter confirmed to insert a literal newline in the draft rather than sending.
  - Escape confirmed to clear a non-empty draft first; confirmed separately (empty draft, message already sent and in flight) to cancel the in-flight request — state returned to `IDLE` immediately, and after waiting past when the (cancelled) adapter would have resolved, confirmed **no** error message appeared for that cancelled message — the dropped response is truly dropped, not silently shown later.
  - Mic button confirmed disabled via accessibility snapshot, with the honest label "Voice input (not yet available)".
  - **Verified the state-machine integration is correctly decoupled where it should be**: forced `SAFE MODE` (highest priority), then sent a chat message — confirmed the visual state correctly stayed `SAFE MODE` throughout (the `thinking` request was correctly rejected by the priority gate) while the message was still genuinely processed and answered (the honest error still appeared in the chat log) — chat functionality isn't blocked by avatar animation state, but it also doesn't wrongly override a higher-priority animation.
  - Dev server and test screenshots cleaned up after verification.

## Known errors (Phase 7)
None outstanding.

## Completed tasks (Phase 8)
- **STT adapter** (`sttAdapter.ts` interface, `webSpeechSttAdapter.ts` implementation): wraps `SpeechRecognition`, maps its error codes to a small typed set (`permission-denied`, `no-microphone`, `no-speech`, `network`, `not-supported`, `other`), each with an honest, specific user-facing message — spec §15's testing checklist explicitly calls out all of these ("Microphone permission denied, unavailable microphone, silence, and network failure are handled").
- **TTS adapter** (`ttsAdapter.ts` interface, `webSpeechTtsAdapter.ts` implementation): wraps `SpeechSynthesis`/`SpeechSynthesisUtterance`.
- **`useVoiceInput`**: push-to-talk capture wired to the *same* state-machine instance as chat/reactions (`requestTransition('listening')` on start, `completeFrom('listening','idle')` on end) — not a separate copy. Exposes `start`/`stop`/`isListening`/`error`.
- **`useVoiceOutput`**: `speak`/`stop`/`isSpeaking`/`error`. A real circular-dependency problem surfaced while wiring this up — see "debugging notes" below — fixed by having both voice hooks report errors as plain state rather than callbacks, with the chat log subscribing to that state reactively instead.
- **Transcript UX**: chose "transcript preview / optional confirmation" (spec §6) over auto-send — speech fills the chat composer live as interim/final results arrive, but the user still presses Enter/Send themselves. Consistent with this project's consent-first posture elsewhere.
- **Push-to-talk**: Ctrl+Space toggles listening (spec §6), scoped to only fire while the Companion screen is actually visible (a new `isActiveScreen` prop from `App.tsx`) — confirmed it does *not* fire while on Settings/Wardrobe.
- **Lip-sync**: real TTS audio drives the `Mouth_Open` morph target directly with a simple oscillation — spec §6's own "lightweight approximate fallback," since Web Speech API gives no phoneme-level timing to sync precisely to. Snaps to 0 immediately when speech ends or is stopped (spec: "stop mouth animation immediately"), without disturbing the Phase 5 baked `Speaking_Mouth` clip still used by the dev-simulate button.
- **Continuous blink**: added a periodic blink (random 2.5-6s interval, ~120ms pulse) driven directly in `AvatarModel`'s frame loop, independent of the discrete state machine — spec §6 explicitly asks to "keep blinking and eye movement active while speaking," and this project had no blink loop of any kind before this phase.
- **Mute/stop control**: a "Stop speaking" button appears whenever TTS is actually playing, calling `speechSynthesis.cancel()` immediately.
- **Mic-active indicator**: a clearly visible `● MIC ACTIVE` badge in the stage telemetry whenever listening, satisfying spec §6/§13's requirement for an unambiguous recording indicator — never hidden or silent.
- **Full pipeline wiring for the future**: a successful chat reply (`useChat`'s `onAssistantReply` callback) automatically gets spoken via TTS — unreachable today since the adapter always errors, but means connecting a real backend later needs zero changes here for voice output to start working.
- **Settings disclosure**: rewrote the "Voice activation" hint to honestly state that only explicit push-to-talk is implemented regardless of the stored preference (continuous "always-on" listening was deliberately not built, to avoid anything resembling hidden recording — spec §13), and added a new "Voice privacy note" field disclosing plainly that Chrome/Edge sends microphone audio to Google's servers for recognition, while TTS runs entirely on-device.

## Debugging notes from Phase 8 (for future reference, not current defects)
- **A real circular-dependency bug caught during design, before writing broken code**: the natural design had `useChat` call `voiceOutput.speak()` on a successful reply, and `useVoiceOutput` call `addSystemMessage()` (from `useChat`) on error — each hook needing the other's return value before either could be constructed. Fixed by having both voice hooks expose `error` as plain state instead of taking an `onError` callback, with `CompanionScreen` subscribing to that state via a `useEffect` after both hooks exist. No circular reference, same end result.
- **A second real bug, caught by live testing, not assumed**: wiring the TTS test button to the state machine via `requestTransition('thinking')` immediately followed by `completeFrom('thinking','speaking')` (no `await` between them, unlike every other place in this codebase that chains these calls) silently failed — `completeFrom` always saw a stale `stateRef.current` and rejected the transition, because the ref was only ever synced via a reactive `useEffect` that hadn't run yet in the same tick. This had been latent since Phase 4; every existing call site happened to have a natural delay (a `setTimeout`, an `await` on the chat adapter) between chained transitions, which gave React time to commit and sync the ref first. Fixed properly in `useCompanionStateMachine.ts`: `requestTransition`/`completeFrom` now update the ref synchronously themselves (safe — they only ever run inside event handlers/effects, never during React's render pass), rather than relying solely on the separate reactive sync effect. Verified live afterward: `STATE: SPEAKING` now shows correctly during the TTS test, confirmed via Playwright before and after the fix.

## Tests actually run and results (Phase 8)
- `npx tsc -b` / `npx eslint .` → clean. Fixed three real issues along the way: `Math.random()` called in a ref initializer during render (React's purity rule) — moved into a mount effect; a morph-target-array write flagged as mutating a hook-derived value, same category as Phase 4/5's material-clone case and justified the same way (our own ref, standard three.js imperative API); and a `setState` called synchronously inside an effect for interim-transcript syncing — fixed by routing it through a callback (`onInterimTranscript`) from the point the data actually arrives, rather than mirroring derived state reactively.
- `npm run build` → succeeds (same pre-existing bundle-size warning, deferred to Phase 9).
- Live Playwright verification against `npm run dev`, zero console errors throughout:
  - **TTS pipeline confirmed fully working end-to-end**: pressing "Test voice reply" correctly entered `STATE: SPEAKING`, showed the speaking bar, and — after waiting long enough for the ~7-second test sentence to actually finish playing at normal speech rate (an early check at a too-short wait misleadingly suggested it hadn't ended; waiting longer showed it had) — correctly returned to idle/attention with the speaking bar gone.
  - **Mic start/stop confirmed working both via the Mic button and Ctrl+Space**: each correctly toggled `STATE: LISTENING` with the mic-active indicator, and correctly stopped back to `IDLE` on request.
  - **Ctrl+Space confirmed correctly scoped**: pressing it while on Character Settings did not start listening; returning to Companion afterward showed `IDLE`, not `LISTENING`.
  - **A real limitation of this testing method, disclosed rather than glossed over**: this automated browser environment has no real microphone input, so actual speech-to-transcript accuracy could not be verified end-to-end here — `SpeechRecognition.start()` entered the listening state without error (no permission prompt blocked it in this environment) but never produced a result or a natural `no-speech` timeout within a generous wait, most likely because the environment provides silence indefinitely rather than timing out the way a real microphone would. This was not treated as a pass; the manual stop path was verified instead, and a reliability caveat is recorded here honestly rather than claiming full voice-conversation testing that didn't actually happen.
  - Character Settings' updated voice-activation hint and new privacy-disclosure field confirmed rendering correctly.
  - Dev server and test screenshots cleaned up after verification.

## Known errors (Phase 8)
None outstanding. (Two real bugs — the circular dependency, caught before writing it, and the stale-ref state-machine chaining bug, caught by live testing — found and fixed this phase; see debugging notes above.)

## Completed tasks (Phase 9)
- **Code-split the 3D viewport**: `AvatarViewport` (and everything it imports — three.js, R3F, drei, postprocessing) now loads via `React.lazy`/`Suspense` instead of being part of the main bundle. Measured effect: the main entry chunk dropped from ~1.26 MB to 246 KB (77 KB gzipped); the 3D library code now lives in its own ~1.13 MB chunk that loads in parallel rather than blocking the app shell's parse/paint. Directly addresses spec §10's "large first load" and "long startup" mitigations. The 3D chunk itself is still large because three.js/R3F/drei/postprocessing genuinely are that size — splitting moves the weight out of the critical path, it doesn't make the underlying libraries smaller; further reduction (tree-shaking individual three.js modules, a lighter post-processing path) is a further, more invasive effort not attempted here.
- **Render-loop pausing** (spec §10: "pause or reduce render loop when tab/window is hidden; resume safely"): `AvatarViewport`'s `Canvas` now sets `frameloop="never"` whenever the Companion screen isn't the active screen *or* the browser tab is hidden (`document.visibilitychange`), and `"always"` otherwise. This stops all `requestAnimationFrame` activity, GPU work, and the animation mixer/lip-sync/blink logic entirely while not visible — not just a cosmetic CSS hide, as it was before this phase (a gap Phase 6's "always mounted" fix had introduced without addressing).
- **Quality presets** (`qualityPreset: 'low' | 'balanced' | 'high'`, new `CharacterProfile` field, defaults to `'balanced'` per spec's explicit recommendation): controls pixel-ratio range and antialiasing per spec §10's preset table, plus a subtle Bloom post-processing effect (via the already-installed-but-previously-unused `@react-three/postprocessing`) exclusive to High, synergizing with the existing emissive state-glow material. **No preset enables real-time shadows** — a deliberate interpretation given the target hardware has no dedicated GPU and shadow mapping is one of the more expensive features to add back in; documented here rather than left implicit.
- Added a "Render quality" selector to Character Settings, persisted through the same mechanism as every other setting since Phase 1.
- Confirmed already-compliant items from spec §10 needed no new work: the avatar was never pre-rendered as video (real rig + real clips throughout), a loading screen with progress feedback already existed (drei's `<Loader />`, built in Phase 2), and there's nothing to "dispose on outfit swap" yet since Wardrobe (Phase 6) only has one real outfit — revisit when a second one exists.

## Tests actually run and results (Phase 9)
- `npx tsc -b` / `npx eslint .` → clean, no new issues.
- `npm run build` → succeeds; confirmed the chunk split numerically (see above) rather than assuming the `React.lazy` call worked.
- Live Playwright verification against `npm run dev`, zero console errors throughout:
  - **Proved the render-loop pausing with hard measurements, not inference**: instrumented `window.requestAnimationFrame` via an init script before the app loaded, to count actual rAF calls. Confirmed ~63 calls/second while the Companion screen is active, and **exactly 0** for a full second immediately after switching to Character Settings. Separately simulated the tab being backgrounded (mocked `document.hidden` + dispatched `visibilitychange`) and confirmed the same: 0 frames while "hidden", resumed correctly (122 frames, catching up) once restored.
  - Confirmed the quality-preset selector switches cleanly between Low/Balanced/High at runtime with zero console errors on each change (the `Canvas` fully re-configures dpr/antialias/frameloop/bloom without crashing).
  - Visually confirmed the Bloom effect actually renders in High (soft glow halos around the brightest specular highlights, absent in Low) rather than just trusting the prop was set.
  - Confirmed `qualityPreset` persists through `localStorage` the same way every other setting does.
  - Dev server and test screenshots cleaned up after verification.
- **Honestly out of scope**: this was all verified in a standard dev-machine Chromium instance. No actual profiling or stability testing happened on the spec's named target hardware (a 16 GB RAM, Intel-integrated-graphics Windows laptop) — I don't have access to that specific machine from this session. The acceptance criterion "stable on target laptop under realistic use" is **not yet independently confirmed on real target hardware**; what's been verified is that the mechanisms (code-splitting, frameloop pausing, preset switching) function correctly in principle.

## Known errors (Phase 9)
None outstanding.

## Completed tasks (Phase 10)
- **Memory types and store** (`src/types/memory.ts`, `src/hooks/useMemoryStore.ts`): a `MemoryEntry` persisted via the same `localStorage` pattern as every other setting since Phase 1, with the five categories from spec §12's handling table reproduced exactly — Verified objective fact (source + confidence), User preference, Personal experience, Unverified claim, and Correction/detected mistake — each with its own description shown inline so the distinction is visible, not just internal.
- **Memory screen** (`src/components/MemoryScreen.tsx`): add/edit/delete individual entries, a "Clear all memory" control (spec §13's explicit privacy-control requirement), and a category-colored accent per entry. Since no AI backend exists to populate this automatically, entries are only ever added by hand — the screen says so plainly rather than implying automatic learning that isn't happening. Both delete actions require a native confirm dialog before proceeding (destructive-action confirmation, consistent with the project's broader safety rules).
- Enabled the previously-disabled "Memory" nav item. Left Workspace/Activity disabled with updated reasons ("needs a backend/file-access decision" / "needs a backend to have anything to log") rather than the old generic "Arrives in Phase 10", since Phase 10 as delivered doesn't include them.

## Tests actually run and results (Phase 10)
- `npx tsc -b` / `npx eslint .` → clean.
- `npm run build` → succeeds (same pre-existing bundle-size warning, deferred — the main chunk is still 246 KB from Phase 9's split; Memory added negligible weight).
- Live Playwright verification against `npm run dev`, zero real application errors:
  - Added a "Verified objective fact" entry with source + confidence — confirmed the source/confidence fields only appear for that category (confirmed by counting form rows, not just visually).
  - Edited that entry's content in place and confirmed the saved text updated correctly.
  - Added a "User preference" entry and confirmed entry count incremented correctly.
  - Deleted a single entry and separately cleared all entries, each behind a native `confirm()` — confirmed the resulting empty state (disabled "Clear all" button, "No memory entries yet" message) both times.
  - **Confirmed persistence across a real full-page reload**, not just in-memory state: added an entry, reloaded, navigated back to Memory, and found the entry intact with the correct category/timestamp/content.
  - One console error appeared during testing (`Cannot accept dialog which is already handled`) — traced to my own test script redundantly calling `dialog.accept()` on a confirm dialog the test harness had already resolved; confirmed via a follow-up snapshot that the actual delete had gone through correctly regardless. Not an application bug — noted here so it isn't mistaken for one later.
  - Dev server and test screenshots cleaned up after verification.

## Known errors (Phase 10)
None outstanding in the application. (One test-script-only race noted above, not a product defect.)

## Decisions awaiting user approval
- Approval to move beyond Phase 10. Workspace and Activity remain deliberately unbuilt until a backend exists — revisit when choosing one (see Phase 8/9's recurring flag that a real backend decision is still pending).
- Open item, not blocking: real-hardware validation on the actual target laptop (flagged since Phase 9) still hasn't happened.
- Open item, not blocking: the AI 3D generation path (Tripo/Hyper3D) is paused on account credit — retry whenever convenient.

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

## Files created or modified (Phase 5)
- Created: `assets/avatar/models/astra_v001.blend` (Blender source, project root, outside `src/`), `src/assets/avatar/models/astra_v001.glb` (exported character asset).
- Modified: `src/components/AvatarModel.tsx` (rewritten to load the real rig/clips instead of the placeholder), `src/components/AvatarViewport.tsx` (dropped the now-removed `cursorGazeEnabled`/`isPointerInStage` props), `src/components/CompanionScreen.tsx` (updated telemetry/status copy for the real asset), `src/components/CharacterSettingsScreen.tsx` (honest "Cursor gaze" hint update), `src/types/interactionZones.ts` (dropped the placeholder-only `nodeName` field, retuned reaction timing to match real clip length), `PROJECT_STATUS.md`.
- No files deleted from the web app; the orphaned Phase 2 placeholder GLB was left in place (see above).

## Files created or modified (Phase 6)
- Created: `src/types/outfits.ts`, `src/components/WardrobeScreen.tsx`.
- Modified: `src/App.tsx` (Companion screen now always-mounted/CSS-hidden instead of conditionally unmounted — the architectural fix), `src/components/Sidebar.tsx` (Wardrobe nav enabled, phase counter corrected), `src/components/CharacterSettingsScreen.tsx` (outfit hint text), `src/App.css` (wardrobe grid/card styling), `PROJECT_STATUS.md`.
- No files deleted.

## Files created or modified (Phase 7)
- Created: `src/types/chat.ts`, `src/adapters/chatAdapter.ts`, `src/adapters/notConnectedChatAdapter.ts`, `src/hooks/useChat.ts`, `src/components/ChatComposer.tsx`, `src/components/ChatLog.tsx`.
- Modified: `src/components/CompanionScreen.tsx` (chat wiring, updated status/dev-panel copy), `src/App.css` (chat panel/log/bubble/composer styling), `PROJECT_STATUS.md`.
- No files deleted.

## Files created or modified (Phase 8)
- Created: `src/adapters/sttAdapter.ts`, `src/adapters/webSpeechSttAdapter.ts`, `src/adapters/webSpeechTypes.ts`, `src/adapters/ttsAdapter.ts`, `src/adapters/webSpeechTtsAdapter.ts`, `src/hooks/useVoiceInput.ts`, `src/hooks/useVoiceOutput.ts`.
- Modified: `src/hooks/useChat.ts` (`onAssistantReply` hook for future TTS auto-speak, `addSystemMessage` export), `src/hooks/useCompanionStateMachine.ts` (the stale-ref chaining fix), `src/components/AvatarModel.tsx` (live lip-sync + periodic blink), `src/components/AvatarViewport.tsx` (`isSpeakingLive` prop), `src/components/ChatComposer.tsx` (now a controlled component, Mic button live), `src/components/CompanionScreen.tsx` (voice wiring, Ctrl+Space, speaking bar, TTS test button), `src/components/CharacterSettingsScreen.tsx` (voice-activation hint + new privacy note), `src/App.tsx` (`isActiveScreen` prop), `src/App.css` (mic/speaking-bar styling), `PROJECT_STATUS.md`.
- No files deleted.

## Files created or modified (Phase 9)
- Created: `src/types/qualityPreset.ts`.
- Modified: `src/types/characterProfile.ts` (`qualityPreset` field), `src/components/AvatarViewport.tsx` (lazy-load boundary moved to its call site, preset-driven dpr/antialias/bloom, `frameloop` control), `src/components/CompanionScreen.tsx` (tab-visibility tracking, `React.lazy` import, Suspense fallback), `src/components/CharacterSettingsScreen.tsx` (Render quality selector), `PROJECT_STATUS.md`.
- No files deleted.

## Files created or modified (Phase 10)
- Created: `src/types/memory.ts`, `src/hooks/useMemoryStore.ts`, `src/components/MemoryScreen.tsx`.
- Modified: `src/App.tsx` (Memory route), `src/components/Sidebar.tsx` (Memory nav enabled, Workspace/Activity reasons updated, phase counter corrected), `src/App.css` (memory screen/form/card styling), `PROJECT_STATUS.md`.
- No files deleted.

## Exact next action (requires approval before starting)
All ten spec-numbered phases now have at least an honest first pass. What's left is mostly: (a) choosing and connecting a real AI backend (unblocks real chat replies, TTS auto-speak, and would make Workspace/Activity meaningful), (b) the paused AI 3D art-generation retry once credit is available, and (c) real-hardware validation on the target laptop. None of these are scripted next steps in the spec's phase list — they're decisions for the user to prioritize. Awaiting direction on which to tackle first.
