# AGENTS.md — Repository Governance Constitution

> **Scope**: Repository-wide. This file is the top-level authority for every AI agent,
> IDE assistant, CLI tool, and CI pipeline operating in this repository.
> All other governance files inherit from and must not contradict this document.

---

## 1. Governance Precedence

1. **AGENTS.md** (this file) — supreme authority; overrides all other governance files.
2. `.github/copilot-instructions.md` — repo-wide Copilot runtime policy.
3. `.github/instructions/*.instructions.md` — scoped, numbered instruction files.
4. `docs/**` — human-readable reference documents (informational, not directive).

If any scoped file contradicts AGENTS.md, AGENTS.md wins.

---

## 2. Absolute Package-Manager Rule

This repository uses **pnpm exclusively**.

| Field | Value |
|---|---|
| `packageManager` | `pnpm@10.31.0` |
| `engines.node` | `24.14.0` |
| `engines.pnpm` | `10.31.0` |

### Mandatory

- Use `pnpm install`, `pnpm add`, `pnpm remove`, `pnpm update`, `pnpm exec`, `pnpm run <script>`.
- Preserve `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

### Forbidden

- Never use `npm`, `npx`, `yarn`, or any non-pnpm package manager.
- Never generate `package-lock.json` or `yarn.lock`.
- Never suggest `npm install`, `npm run`, `npx`, or Yarn workflows.

---

## 3. Architecture Preservation

This project enforces **CLEAN Architecture** with three layers:

| Layer | Path | May Import | Must Not Import |
|---|---|---|---|
| **Domain** | `src/domain/` | `domain/` only | `app/`, `ui/`, React, any framework |
| **App** | `src/app/` | `domain/`, `app/` | `ui/` |
| **UI** | `src/ui/` | `domain/`, `app/`, `ui/` | — |
| **Workers** | `src/workers/` | `domain/` only | `app/`, `ui/`, React |
| **Themes** | `src/themes/` | nothing (pure CSS) | everything |

### Component Hierarchy (Atomic Design)

ui/atoms/ → ui/molecules/ → ui/organisms/

Data flows unidirectionally: **Hooks → Organism → Molecules → Atoms**.

### Import Conventions

- Use path aliases: `@/domain`, `@/app`, `@/ui` (configured in `tsconfig.json` and `vite.config.js`).
- Every directory exposes a barrel `index.ts`. Import from the barrel, not internal files.
- Never introduce `../../` cross-layer relative imports.

---

## 4. Path Discipline

| Path | Purpose |
|---|---|
| `src/domain/` | Pure, framework-agnostic game logic |
| `src/app/` | React hooks, context providers, services |
| `src/ui/atoms/` | Smallest reusable UI primitives |
| `src/ui/molecules/` | Composed atom groups |
| `src/ui/organisms/` | Full feature components |
| `src/themes/` | Lazy-loaded CSS theme files |
| `src/wasm/` | WASM AI loader + fallback |
| `src/workers/` | Web Worker entry points |
| `electron/` | Electron main + preload |
| `assembly/` | AssemblyScript source |
| `scripts/` | Build-time Node scripts |
| `public/` | Static assets (manifest, SW, offline page) |
| `dist/` | Vite build output (gitignored) |
| `release/` | Electron Builder output (gitignored) |
| `docs/` | Human-readable documentation |

Do not invent new top-level directories without explicit user instruction.

---

## 5. Cross-platform shell governance

This repository enforces strict shell usage rules to ensure builds and scripts run in the correct environment and to prevent cross-shell command drift.

### Linux builds and development

Linux builds and general development workflows must use **Bash**.

In this repository, Bash is normally provided through:

- **WSL: Ubuntu** (default on Windows development machines)
- native Linux environments
- CI Linux runners

Use Bash for:

- dependency installation (`pnpm install`)
- development server execution (`pnpm run dev`, `pnpm run start`)
- Vite builds (`pnpm run build`, `pnpm run preview`, `pnpm run build:preview`)
- WASM builds (`pnpm run wasm:build`, `pnpm run wasm:build:debug`)
- linting (`pnpm run lint`, `pnpm run lint:fix`)
- formatting (`pnpm run format`, `pnpm run format:check`)
- typechecking (`pnpm run typecheck`)
- validation (`pnpm run check`, `pnpm run fix`, `pnpm run validate`)
- cleanup (`pnpm run clean`, `pnpm run clean:node`, `pnpm run clean:all`, `pnpm run reinstall`)
- Electron development mode (`pnpm run electron:dev`, `pnpm run electron:preview`)
- Linux Electron packaging (`pnpm run electron:build:linux`)
- Capacitor sync (`pnpm run cap:sync`)
- general source editing, documentation, and repository maintenance

If the task is not explicitly a Windows-native or macOS-native packaging task, use Bash.

### Windows builds

Use **PowerShell** only when the task is explicitly Windows-native Electron packaging:

- `pnpm run electron:build:win`

PowerShell is **not** the default shell.

### macOS and iOS builds

Use a **native or remote macOS** environment only for:

- `pnpm run electron:build:mac`
- `pnpm run cap:init:ios`
- `pnpm run cap:open:ios`
- `pnpm run cap:run:ios`

iOS builds require Apple hardware. Never suggest iOS commands unless macOS availability is confirmed.

### Android builds

Use an **Android-capable environment** (with Android SDK) only for:

- `pnpm run cap:init:android`
- `pnpm run cap:open:android`
- `pnpm run cap:run:android`

### Shell routing summary

| Environment | Tasks |
|---|---|
| **Bash** (WSL / Linux / CI) | All general development, builds, quality checks, WASM, Electron dev, Linux packaging, Capacitor sync |
| **PowerShell** | `electron:build:win` only |
| **macOS** | `electron:build:mac`, iOS Capacitor tasks |
| **Android SDK** | Android Capacitor tasks |

### Hard-stop rules

Never:
- default to PowerShell for routine development
- present PowerShell as interchangeable with Bash for ordinary tasks
- switch to PowerShell unless the task is Windows-native Electron packaging
- claim iOS tasks can run fully from Windows or WSL
- introduce cross-shell command drift

---

## 6. Language, Syntax, and Script Governance

### Approved primary languages

- HTML, CSS, JavaScript, TypeScript, AssemblyScript, WebAssembly

### Language priority order

1. TypeScript  2. JavaScript  3. HTML  4. CSS  5. AssemblyScript  6. WebAssembly

### Rules

- Do not create one-off scripts in random languages.
- Do not create parallel implementations of the same concern.
- New files must live in the correct existing directory.
- Prefer repository-native tooling (Vite, TypeScript, ESLint, Prettier, Electron, Capacitor, AssemblyScript, pnpm).

### Anti-orphan-script policy

Every new script must: solve a real need, belong to approved languages, fit existing structure, not duplicate existing tooling, have clear purpose.

### Hard-stop rules

Never: introduce non-approved languages, create helper scripts in random languages, create duplicate build paths, scatter automation across runtimes.

---

## 7. Minimal-Change Principle

- Modify only what the user requested.
- Do not refactor beyond the scope of the task.
- Do not add dependencies unless explicitly asked.
- Preserve existing code style and organization.

---

## 8. Response Contract

1. **Use pnpm** — never npm, npx, or yarn.
2. **Respect layer boundaries** — per §3.
3. **Use path aliases** — `@/domain/...`, `@/app/...`, `@/ui/...`.
4. **Use existing scripts** — prefer `pnpm <script>` over raw CLI.
5. **Target the correct shell** — per §5.
6. **Cite governance** — explain which rule blocks a request and suggest alternatives.

---

## 9. Self-Check Before Every Response

- [ ] Am I using `pnpm` (not npm/npx/yarn)?
- [ ] Does my import respect layer boundaries in §3?
- [ ] Am I using path aliases, not relative cross-layer imports?
- [ ] Am I targeting the correct shell per §5?
- [ ] Am I using an approved language per §6?
- [ ] Am I avoiding orphaned scripts per §6?
- [ ] Am I modifying only what was requested per §7?
- [ ] Does my output match an existing `package.json` script where applicable?

If any check fails, fix it before responding.
