# CLAUDE.md — Project Doppelgänger

**MANDATORY:** Follow the Approval, Clarification & Error-Resolution Protocol in the Project Doppelgänger specification (`Project_Doppelganger_Claude_Implementation_Spec.docx`, §19–21). Work only on the currently approved phase. Ask before material decisions or when required information/permission is missing. Diagnose and resolve errors within scope; never hide failures or bypass tests. Stop on blocking issues. After each phase, update `PROJECT_STATUS.md`, report verified results, and wait for explicit user approval before starting the next phase. Never perform destructive, external, or data-exposing actions without explicit approval.

## Project
Target: `D:\crazy_idea` — an expressive 3D AI companion ("Astra", working name) built on the existing React + TypeScript + Vite app. Full spec lives in the docx above; see `TOOL_INVENTORY.md` for verified tool/MCP status and `PROJECT_STATUS.md` for current phase and history.

## Target hardware
Windows laptop, 16 GB RAM, Intel integrated graphics — no dedicated GPU. Every feature needs a low-performance mode and a graceful fallback.

## Hard rules (see spec for full detail)
- One phase at a time; stop and wait for approval after each.
- Never delete/overwrite/rename source files, Blender files, assets, or user data without explicit approval. Use versioned filenames for Blender saves (`astra_v001.blend`, `astra_v002.blend`, ...).
- No fake/placeholder features presented as working. Label anything unconnected (voice, AI backend, animation) as a placeholder.
- No API keys/credentials in frontend code, commits, logs, or prompts.
- No publishing, uploading, or external data transfer without explicit approval.
- No training on raw conversation data.
