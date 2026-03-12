# Frontend Instructions — React / Vite / UI

> **Scope**: Frontend stack, CLEAN architecture layers, component hierarchy, styling, linting, formatting, and type checking.
> Subordinate to `AGENTS.md` §3 (architecture) and §4 (path discipline).

---

## Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI library |
| TypeScript | 5.9 | Static type checking (strict mode) |
| Vite | 7 | Build tool + dev server |
| ESLint | 10 | Linting |
| Prettier | 3 | Code formatting |
| CSS Modules | — | Scoped component styling |

---

## Architecture — CLEAN Layers

| Layer | Path | May Import | Must Not Import |
|---|---|---|---|
| **Domain** | `src/domain/` | `domain/` only | `app/`, `ui/`, React |
| **App** | `src/app/` | `domain/`, `app/` | `ui/` |
| **UI** | `src/ui/` | `domain/`, `app/`, `ui/` | — |
| **Workers** | `src/workers/` | `domain/` only | `app/`, `ui/`, React |
| **Themes** | `src/themes/` | nothing (pure CSS) | everything |

Boundaries enforced by `eslint-plugin-boundaries`.

### Domain Layer (`src/domain/`)

Pure, framework-agnostic game logic. Files: `types.ts`, `constants.ts`, `board.ts`, `rules.ts`, `ai.ts`, `themes.ts`, `layers.ts`, `sprites.ts`. All exported through barrel `index.ts`.

### App Layer (`src/app/`)

React hooks, context providers, and services. All exported through barrel `index.ts`.

### UI Layer (`src/ui/`)

Presentational React components: `atoms/` → `molecules/` → `organisms/`. All exported through barrel `index.ts`.

---

## Import Conventions

- **Path aliases**: `@/domain/...`, `@/app/...`, `@/ui/...`.
- **Barrel imports**: Always import from `index.ts`.
- **No cross-layer relative imports**.

---

## Entry Point

`src/index.tsx`: ThemeProvider > SoundProvider > ErrorBoundary > App

---

## Styling

- Global styles in `src/styles.css`.
- Themes in `src/themes/` (lazy-loaded CSS).
- Component-scoped via CSS Modules.

---

## Quality Workflow

All commands run in **Bash (WSL: Ubuntu)**. Run `pnpm validate` before pushing.

---

## Language Guardrails

Frontend code uses **TypeScript** for logic and **CSS** for styling.
Do not introduce orphaned helper scripts or alternate runtimes.
Modern ESM syntax; match existing code conventions.
