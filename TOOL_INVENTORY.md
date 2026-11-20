# Tool Inventory — Project Doppelgänger

Date verified: 2026-11-21
Verified by: Claude Code, live session discovery (Phase 0 audit). This is a live-session snapshot, not a permanent guarantee — recheck at the start of any phase that depends on a given tool.

## Connected MCP servers / plugins

### Blender MCP (`mcp-for-blender`)
- **Status:** Connected. Blender 3.6.23, addon v2.0, protocol v16 (up to date).
- **Libraries enabled:** Poly Haven = on. Sketchfab = off. Poly Pizza = off.
- **Generators enabled:** none (tripo/hunyuan3d/hyper3d/meshy all off). No premium generators.
- **Capabilities exposed:** `bpy_api_lookup`, `describe_node_type`, `execute_code`, `get_addon_info`, `get_object_info`, `get_scene_info`, `get_viewport_screenshot`, `get_world_state_snapshot`, `list_scene_items`, `pick_viewport_object`, plus telemetry/activity helpers.
- **Risk classification:** `execute_code` = DESTRUCTIVE WRITE (arbitrary Python inside the user's Blender session — treat every script as privileged, save versioned `.blend` files before use). Scene/object queries and screenshots = READ-ONLY. Asset search via Poly Haven = EXTERNAL/NETWORK ACTION (downloads from a third party).
- **Phases that may use it:** 5 (real character asset), optionally 2.
- **Note:** 3D generation providers and Sketchfab/Poly Pizza are off — do not assume they're available. Only Poly Haven asset search is live.

### R3 MCP
- **Status:** Connected as `claude362880@gmail.com`, app connection "Claude Code". API reachable.
- **Capabilities granted:** project:read, project:write, code:write, editor:dispose, editor:run, project:delete:created, asset:read, asset:write, publish:preview, support:write, roadmap:suggest/vote.
- **Not granted:** no publish-live, no deletion of non-self-created projects.
- **Account state:** 0 projects currently. No R3 editor tab currently open (required for live preview interaction). Free plan: up to 3 live projects until 25 Dec 2026, otherwise needs a paid plan to go live.
- **Risk classification:** project/code write = REVERSIBLE WRITE (versioned, user-owned). `publish:preview` = EXTERNAL/NETWORK ACTION (creates a shareable link) — ask before use. No live-publish capability is granted, so that risk is currently moot.
- **Phases that may use it:** Optional only, per spec §20.3 — not a replacement for the React/Three.js app. Not currently planned for any phase unless the user asks for it specifically.

### Figma MCP/plugin
- **Status:** Connected as `claude362880` (claude362880@gmail.com). Seat: "View" tier on team "Nitesh Tanawade's team". `code_layers_enabled: true`.
- **Risk classification:** Reading design context = READ-ONLY. Writing to canvas = REVERSIBLE WRITE, but a "View" seat may restrict edit/write operations — unverified until a write is attempted.
- **Phases that may use it:** UI/layout reference only (spec §20.4). Not required for implementation; React code is the real UI.

### Context7 MCP/plugin
- **Status:** Installed and connected (confirmed via `/mcp` during this session: "Connected to plugin:context7:context7").
- **Capability:** Documentation lookup only (`resolve-library-id`, `query-docs`) for React, Three.js, R3F, Vite, etc.
- **Risk classification:** READ-ONLY, external network lookup of public docs.
- **Phases that may use it:** Any phase needing current library API reference (e.g., R3F/Drei APIs in Phase 2+).

## Not MCP — needs separate setup

### Kaggle
- **Status:** Account reportedly created; **not** connected through any MCP server or plugin in this session (confirmed — no Kaggle tool appears in the live tool/plugin list).
- **What it would need (plain CLI/API, not an agent tool):**
  1. A Kaggle account (have).
  2. An API token: Kaggle → Settings → "Create New API Token" → downloads `kaggle.json` (`{"username": "...", "key": "..."}`).
  3. That file placed at `%USERPROFILE%\.kaggle\kaggle.json` on this Windows machine (or `KAGGLE_CONFIG_DIR` env var pointing elsewhere).
  4. The `kaggle` Python CLI installed (`pip install kaggle`) to run/manage notebooks and datasets from the terminal.
  5. For GPU-accelerated notebooks specifically, Kaggle requires phone verification on the account before it grants GPU quota.
- **Risk classification:** EXTERNAL/NETWORK ACTION — any file sent to Kaggle leaves the local machine. Per spec §20.6/21.1, treat as upload and ask before sending project files.
- **Credential handling:** `kaggle.json` is a credential file — never commit it, never print its contents, never place it inside the project repo.
- **Role in this project:** optional, offline-only (batch rendering / model experiments). Not used for any Phase 0–9 deliverable; not a live rendering target.

## Available but outside MCP scope (local tools used directly)
- Node v24.9.0 / npm 11.6.0 — confirmed installed, used for the existing Vite/React app. READ/REVERSIBLE WRITE (local dev only).
- Git — **not yet initialized** in `D:\crazy_idea` (`git status` reports "not a git repository"). Needs `git init` + remote add once the user provides the repo URL. EXTERNAL/NETWORK ACTION once a remote push happens — ask before pushing.

## Not installed / not found in this session
- No Playwright MCP or other browser-automation MCP detected — do not assume it exists for later browser testing; a `run`/`playwright-cli` skill path exists instead and will be used if needed.
- No STT/TTS provider, no backend (FastAPI or otherwise), no database — all to be chosen/built in later phases per spec §6/§9.

## Recommended tool map (subject to phase-by-phase confirmation)
| Capability | Tool |
|---|---|
| Repo inspection & coding | Local file tools, Bash/PowerShell, git (once connected) |
| 3D modelling/rigging/animation | Blender MCP (`execute_code`, versioned `.blend` files) |
| Asset discovery | Blender MCP → Poly Haven only (Sketchfab/Poly Pizza off) |
| Library/API docs | Context7 |
| UI/design reference | Figma MCP (read-only use expected given "View" seat) |
| Interactive 3D authoring | R3 MCP — not used unless explicitly requested (spec says optional, not a replacement for the app) |
| Cloud GPU experiments | Kaggle CLI, manual setup, explicit approval before any upload |

## Permission risks summary
- Blender `execute_code` — arbitrary Python in the user's Blender process.
- Any Poly Haven download — pulls third-party assets; check license before use.
- R3 `publish:preview` — creates a shareable link (not public release, but still external).
- Git remote push — once configured, pushes code to a shared/external location.
- Kaggle upload — sends local files to a third-party cloud service.

## Missing capabilities
- No connected STT/TTS/voice provider — Phase 8 blocked until one is chosen and approved.
- No connected backend/database — Phase 9/10 blocked until approved.
- No git remote configured yet — waiting on the repo URL from the user.
