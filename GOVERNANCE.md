# GOVERNANCE.md — Unified Game Project Governance

> **Authority**: Single source of truth for all game projects in this workspace.
> All other governance files (AGENTS.md, copilot-instructions.md) inherit from this document.

---

## 1. Project Identity

**Project Type**: Independent game projects (separate repositories, same patterns)

**Games** (current):
- mancala (Kalah, 2-player capture game)
- snake (Classic grid-based snake)
- checkers (Draughts variant)
- tictactoe (3×3 tic-tac-toe)
- battleship (Naval combat game)
- connect-four (Column-drop game)
- *(and others)*

**Governance Scope**:
- Each game is **independent** (separate folder, own node_modules, own git)
- All games **follow same patterns** (CLEAN architecture, menu/settings system, UI conventions)
- No consolidated monorepo (as per user request)
- Governance rules are **replicated** in each project (not symlinked)

---

## 2. Mandatory Package Manager

**ONLY**: `pnpm` (no npm, yarn, npx)

```
pnpm@10.31.0
node@24.14.0
```

**Commands**:
- `pnpm install` — Install dependencies
- `pnpm add pkg` — Add package
- `pnpm dev` — Development server
- `pnpm build` — Production build
- `pnpm check` — Lint + format + typecheck
- `pnpm lint` — ESLint
- `pnpm format:check` — Prettier
- `pnpm typecheck` — TypeScript

**FORBIDDEN**:
- ❌ `npm install`, `npm run`, `npx`
- ❌ `yarn install`, `yarn add`
- ❌ `package-lock.json`, `yarn.lock`

---

## 3. CLEAN Architecture (All Games)

### Layer Structure

| Layer | Path | Imports | Forbidden |
|---|---|---|---|
| **Domain** | `src/domain/` | `domain/` only | React, frameworks, `app/`, `ui/` |
| **App** | `src/app/` | `domain/`, `app/` | `ui/`, React |
| **UI** | `src/ui/` | `domain/`, `app/`, `ui/` | — |
| **Workers** | `src/workers/` | `domain/` only | React, `app/`, `ui/` |
| **WASM** | `src/wasm/` | `wasm/` only | `domain/`, `app/`, `ui/` |
| **Themes** | `src/themes/` | nothing (pure CSS) | everything |

### Component Hierarchy

```
atoms/        → molecules/        → organisms/
(primitives)    (composed)          (full features)
```

**Data Flow**: `Hooks → Organism → Molecules → Atoms` (unidirectional)

### Import Rules

- Use path aliases: `@/domain`, `@/app`, `@/ui`
- Import from barrel `index.ts` files **only**, never internal modules
- Never use `../../` cross-layer relative imports

---

## 4. UI/UX Standards (All Games)

### Required Screens

Every game must have:

1. **Splash Screen** (2.5s)
   - Animated logo
   - Game title with gradient
   - Auto-fade to loading

2. **Loading Screen** (0.8s)
   - Spinner animation
   - Progress bar
   - Auto-fade to game

3. **Game Screen**
   - Hamburger menu button (top-right corner) ← **REQUIRED**
   - Game board/UI
   - Difficulty selector
   - New Game button
   - Status display

4. **Settings Screen** (accessible via menu)
   - Sound toggle
   - Dark mode toggle
   - Game rules display
   - Back button

5. **About Screen** (accessible via menu)
   - Game description
   - Features list
   - Technology stack
   - Version number

### Menu System

**Button Position**: TOP-RIGHT CORNER ← **MANDATORY**

**Menu Drawer**:
- Slides in from left
- 3 navigation items: Game, Settings, About
- Semi-transparent overlay
- Responsive (280px desktop, 240px mobile)

**Navigation Flow**:
```
Game → [Settings | About] → Game (auto back)
```

### Responsive Design

- Mobile-first approach
- Breakpoints: 480px (mobile), 768px (tablet)
- Touch-friendly buttons (min 44px)
- Readable fonts at all sizes

### Accessibility

- ARIA labels on all buttons
- Semantic HTML (buttons, labels, sections)
- Keyboard navigation support
- Dark theme by default
- Sufficient color contrast

---

## 5. AI & Game Logic Standards

### Difficulty Tiers (6 levels - All Games Use Same Progression)

```
1. veryEasy   →  Random/heuristic, responsive
2. easy       →  Simple greedy, predictable
3. medium     →  Light search (JS minimax, 2-3 ply)
4. mediumHard →  Moderate search (WASM, 3-4 ply)
5. hard       →  Deep search (WASM, 4-5 ply)
6. veryHard   →  Expert search (WASM, 5-6 ply)
```

All games map their AI strategies to **exactly these 6 difficulty tiers**.

### AI Architecture

- Synchronous AI: Must complete within **100ms** for gameplay
- Asynchronous AI: Must complete within **500ms** including overhead
- WASM-first for medium+ difficulties
- JavaScript fallback for veryEasy/easy

---

## 6. Build & Quality Standards

### Scripts (Required in package.json)

```json
{
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "check": "eslint src/ && prettier --check . && tsc",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc"
  }
}
```

### Quality Gates (Before Commit)

✅ **TypeScript**: `pnpm typecheck` (0 errors)
✅ **ESLint**: `pnpm lint` (0 errors)
✅ **Prettier**: `pnpm format:check` (0 errors)
✅ **Build**: `pnpm build` (succeeds, <100KB gzipped)

All **4 gates must pass** before deployment.

---

## 7. File & Folder Conventions

### Must Exist in Every Game

```
├── AGENTS.md                     ← Repo-level governance (inherited from GOVERNANCE.md)
├── .github/
│   ├── copilot-instructions.md   ← Dev workflow rules
│   └── instructions/
│       ├── 01-build.instructions.md
│       ├── 02-frontend.instructions.md
│       ├── 03-ai-orchestration.instructions.md
│       ├── 08-input-controls.instructions.md
│       └── (other numbered instructions)
├── src/
│   ├── domain/                   ← Pure game logic
│   ├── app/                      ← React hooks
│   ├── ui/                       ← Components
│   ├── workers/                 ← Web Workers
│   ├── wasm/                    ← WASM loader
│   ├── themes/                  ← CSS themes
│   └── index.tsx               ← Root entry
├── assembly/                     ← AssemblyScript (if using WASM)
├── dist/                         ← Build output (gitignored)
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

### Must NOT Exist

- ❌ `src/components/` → Use `src/ui/atoms/molecules/organisms/`
- ❌ `src/utils/` → Put in domain-specific locations
- ❌ `src/lib/` → Same as above
- ❌ `src/hooks/` → Put in `src/app/`
- ❌ Top-level new directories without instruction

---

## 8. Documentation Standards

### Every Game Must Have

1. **README.md** — Game overview, how to play, tech stack
2. **GAMEPLAY.md** or equivalent — Rules, difficulty descriptions
3. **.github/instructions/*.md** — Numbered instruction files (01, 02, 03, ...)
4. **AGENTS.md** — Repository governance (copied from GOVERNANCE.md template)

### Markdown Cooperation Rules

- All *.md files **must reference GOVERNANCE.md** for authority
- Use consistent headers (## for sections, ### for subsections)
- Include status badges (✅, ❌, ⏳) for quick scanning
- Make sections copy-paste friendly for systems/docs
- Include examples and code snippets where applicable
- Keep language simple, avoid jargon

---

## 9. Versioning & Releases

Each game is independently versioned:

```
Format: major.minor.patch (semantic versioning)
Example: v1.0.0, v1.2.3, v2.1.0
```

Version bumps are **per-game**, not synchronized across projects.

---

## 10. Development Shell Routing

### Linux/WSL (Default)

Use **Bash** for:
- `pnpm dev`, `pnpm build`, `pnpm check`
- General development
- CI/CD pipelines

### Windows

Use **PowerShell** only for platform-specific builds (unlikely for web games)

### macOS

Use **Bash** for development, **Xcode tools** for native features

---

## 11. Deployment Standards

All games must:

1. **Build successfully** — `pnpm build` produces dist/
2. **Pass quality gates** — `pnpm check` returns 0 errors
3. **Be production-ready** — <100KB gzipped
4. **Support offline** — Service worker in public/sw.js
5. **Have PWA manifest** — public/manifest.json

---

## 12. Exceptions & Overrides

**Default Rule**: GOVERNANCE.md wins

**Exception Process**:
1. Document the exception in that game's AGENTS.md
2. Include rationale (why this game is different)
3. Mark with `[EXCEPTION]` tag
4. Must be explicitly approved (documented)

Example:
```markdown
## [EXCEPTION] Custom Theme System

**Reason**: This game requires real-time theme switching
**Implementation**: Custom theme hook instead of ThemeContext
**Approved**: Yes (noted in git commit)
```

---

## 13. Self-Check Checklist

Before submitting ANY code change:

- [ ] Using `pnpm`?
- [ ] Layer boundaries respected?
- [ ] Path aliases used (`@/`)?
- [ ] Menu button top-right?
- [ ] Settings screen implemented?
- [ ] All 6 difficulty tiers available?
- [ ] TypeScript: 0 errors?
- [ ] ESLint: 0 errors?
- [ ] Build: <100KB gzipped?
- [ ] README & governance docs updated?

---

## 14. Cooperative Visibility Rules

All markdown files must:

✅ **Be machine-readable** — Use headers, lists, code blocks
✅ **Reference governance** — Link to GOVERNANCE.md where applicable
✅ **Show status** — Include badges (✅ complete, ❌ blocked, ⏳ in progress)
✅ **Be discoverable** — Appear in `git ls-files` (not gitignored)
✅ **Use consistent format** — Same header levels, bullet styles
✅ **Include examples** — Real code from the project
✅ **Have update dates** — Last modified line in comments

Example:
```markdown
# Component Name

[Governance Reference: GOVERNANCE.md § UI/UX Standards]

## Overview

...

**Status**: ✅ Complete
**Last Updated**: 2026-03-13
```

---

## References

- **AGENTS.md** — Each game's specific governance (should reference GOVERNANCE.md)
- **.github/copilot-instructions.md** — Development workflow (per-game)
- **.github/instructions/** — Numbered instructions (01-08, specific to game)
- **README.md** — Game overview & quick start
- **docs/** — Detailed user documentation

---

**This is the source of truth. All other governance files inherit from here.**

Last Updated: 2026-03-13
