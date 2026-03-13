# Copilot Runtime Policy — Mancala

> **Authority**: This file is subordinate to [`GOVERNANCE.md`](../GOVERNANCE.md) and [`AGENTS.md`](../AGENTS.md)
> 
> For shared rules across all games, see [`GOVERNANCE.md`](../GOVERNANCE.md)

**Last Updated**: 2026-03-13

---

## Development Shell (Default: Bash)

Use **Bash (WSL Ubuntu)** for all development workflows.

Do not default to PowerShell unless the task is specifically a Windows packaging workflow.

---

## Package Manager

**pnpm only** (see GOVERNANCE.md § 2)

Never use npm, npx, yarn, or generate non-pnpm lockfiles.

---

## Architecture (CLEAN + Atomic Design)

See GOVERNANCE.md § 3 for full layer structure.

**Quick Reference**:
- Domain: Pure logic, no React
- App: React hooks, services
- UI: Components (atoms → molecules → organisms)
- Workers: Web Worker entry points
- WASM: WebAssembly loader

---

## Import Rules

- Use path aliases: `@/domain/...`, `@/app/...`, `@/ui/...`
- Import from barrel `index.ts` files only
- Never use `../../` cross-layer relative imports

---

## Key Scripts

| Task | Command |
|---|---|
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Quality gate | `pnpm check` |
| Auto-fix | `pnpm fix` (lint:fix + format) |
| TypeCheck | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Format | `pnpm format` |

---

## Shell Routing

See [GOVERNANCE.md](../GOVERNANCE.md) § 5 for full platform routing.

Default to **Bash (WSL: Ubuntu)** for all development work.

Use **PowerShell** only for: Windows packaging workflows
Use **macOS** only for: macOS/iOS builds
Use **Android SDK** only for: Android builds

---

## Language Guardrails

Approved languages: HTML, CSS, JavaScript, TypeScript, AssemblyScript, WebAssembly.
Do not introduce orphaned helper scripts or alternate runtimes.

---

## Behavioral Rules

1. **Minimal change** — modify only what was requested.
2. **Preserve style** — match existing conventions.
3. **Cite governance** — reference GOVERNANCE.md, AGENTS.md, or this file.
4. **No new top-level directories** without explicit instruction.
5. **Use existing scripts** from `package.json` before inventing CLI commands.

---

## Project Identity Rule

Preserve project identity. Never rename the project or product to a framework, runtime, or tool name.

---

## UI Standards

- ✅ Menu button **top-right corner** (see [GOVERNANCE.md](../GOVERNANCE.md) § 4)
- ✅ Settings and About screens accessible via menu
- ✅ 6 difficulty tiers available
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Semantic HTML with ARIA labels

---

## Input & UI Consistency

See [GOVERNANCE.md](../GOVERNANCE.md) § 11 for details.

- Use shared keyboard controller hooks in `src/app` rather than per-component listeners.
- Preserve standard game shell surfaces (splash, loading, game, settings, about).
- All input work must follow `.github/instructions/08-input-controls.instructions.md`.

---

## Self-Check Before Commit

- [ ] Used `pnpm`?
- [ ] Respected CLEAN layer boundaries?
- [ ] Used path aliases (`@/`)?
- [ ] Menu button top-right?
- [ ] `pnpm check` passes (0 errors)?
- [ ] `pnpm build` succeeds (<100KB gzipped)?
- [ ] Updated governance files if rules changed?

---

**Authority**: [`GOVERNANCE.md`](../GOVERNANCE.md) | [`AGENTS.md`](../AGENTS.md)

