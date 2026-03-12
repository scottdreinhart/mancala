# WASM Instructions — AssemblyScript / WebAssembly

> **Scope**: AssemblyScript source, WASM build pipeline, runtime loader, and worker integration.
> Subordinate to `AGENTS.md` §6 (language governance).

---

## Overview

AssemblyScript compiles to WebAssembly, embedded as base64 and loaded at runtime in a Web Worker.

---

## Architecture

| Path | Purpose |
|---|---|
| `assembly/index.ts` | AssemblyScript source |
| `assembly/tsconfig.json` | AS compiler config |
| `scripts/build-wasm.js` | Build script: AS → WASM → base64 → `src/wasm/ai-wasm.ts` |
| `src/wasm/ai-wasm.ts` | Auto-generated base64 WASM module (do not edit) |
| `src/workers/ai.worker.ts` | Web Worker — WASM-first with JS fallback |

---

## Scripts

| Script | Shell |
|---|---|
| `pnpm wasm:build` | Bash (WSL: Ubuntu) |
| `pnpm wasm:build:debug` | Bash (WSL: Ubuntu) |

---

## Language Boundaries

- **AssemblyScript** for WASM source (`assembly/`).
- **JavaScript** for build script (`scripts/build-wasm.js`).
- **TypeScript** for runtime loader and worker.

Do not introduce Rust, C, C++, Go, or other WASM languages.
Do not manually edit `src/wasm/ai-wasm.ts`.

---

## Anti-Orphan-Script Policy

Single build path: `pnpm wasm:build` → `scripts/build-wasm.js`.
Do not create additional WASM build scripts or codegen helpers.
