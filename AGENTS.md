# AGENTS.md — Mancala Game Governance

> **Authority**: This file is **subordinate to** [`GOVERNANCE.md`](GOVERNANCE.md)
>
> For shared rules (all games), see [`GOVERNANCE.md`](GOVERNANCE.md)
>
> This file contains **Mancala-specific** governance.

**Last Updated**: 2026-03-13
**Status**: ✅ Production Ready

---

## Quick Reference

| Rule | Value |
|---|---|
| **Package Manager** | pnpm only (see GOVERNANCE.md § 2) |
| **Architecture** | CLEAN + Atomic Design (see GOVERNANCE.md § 3) |
| **Menu Button** | TOP-RIGHT corner (see GOVERNANCE.md § 4) |
| **Build Size** | <100KB gzipped (current: 65.95 KB) |
| **Quality Gates** | TypeScript ✅ ESLint ✅ Build ✅ |
| **AI Difficulty** | 6 tiers (veryEasy → veryHard) |

---

## 1. Authority & Precedence

1. **GOVERNANCE.md** — Shared rules (all games inherit)
2. **AGENTS.md** (this file) — Mancala-specific overrides
3. **.github/copilot-instructions.md** — Dev workflow
4. **.github/instructions/*.md** — Numbered instructions
5. **docs/** — Reference docs

❗ **If GOVERNANCE.md contradicts this file, GOVERNANCE.md wins.**

---

## 2. Game Overview

**Title**: Mancala (Kalah variant)
**Players**: 1 human vs 1 AI
**Board**: 2×6 pits + 2 stores
**AI Tiers**: 6 difficulty levels
**Tech Stack**: React 19, TypeScript, Vite, WASM (AssemblyScript)

---

## 3. Mandatory Features (All Implemented)

✅ Splash screen (2.5s animated logo)
✅ Loading screen (0.8s progress bar)
✅ Game screen with board UI
✅ Hamburger menu (TOP-RIGHT corner)
✅ Settings screen (toggles + rules)
✅ About screen (description + credits)
✅ All 6 AI difficulty tiers
✅ Responsive design (mobile/tablet/desktop)

---

## 4. Architecture & File Locations

**See GOVERNANCE.md § 3 for full structure**

Key Mancala files:

```
src/
├── domain/
│   ├── board.ts         - Pit ops, sowing, captures
│   ├── rules.ts         - Game state transitions
│   ├── ai.ts            - JavaScript minimax (fallback)
│   ├── types.ts         - GameState, Difficulty types
│   ├── constants.ts     - Rules constants
│   └── index.ts         - Barrel export
│
├── app/
│   ├── useGameState.ts  - Main game hook
│   ├── wasmAIService.ts - WASM orchestration
│   ├── ThemeContext.tsx
│   ├── SoundContext.tsx
│   └── index.ts         - Barrel export
│
└── ui/
    ├── atoms/
    │   ├── ErrorBoundary.tsx
    │   └── OfflineIndicator.tsx
    │
    ├── molecules/
    │   ├── Menu.tsx      - Hamburger menu drawer
    │   ├── MenuIcon.tsx  - Hamburger icon
    │   ├── CloseIcon.tsx - Close icon
    │   └── index.ts
    │
    └── organisms/
        ├── App.tsx       - Main app + menu integration
        ├── SplashScreen.tsx
        ├── LoadingScreen.tsx
        ├── Settings.tsx  - Settings screen
        ├── About.tsx     - About screen
        └── index.ts
```

---

## 5. AI Difficulty System

All 6 tiers implemented in `src/app/wasmAIService.ts`:

```javascript
DIFFICULTY_MAP = {
  veryEasy:   { type: 'jsOnly', time: 0ms,    maxPly: 1 },
  easy:       { type: 'jsOnly', time: 0ms,    maxPly: 2 },
  medium:     { type: 'wasm',   time: 200ms,  maxPly: 3 },
  mediumHard: { type: 'wasm',   time: 500ms,  maxPly: 4 },
  hard:       { type: 'wasm',   time: 1000ms, maxPly: 5 },
  veryHard:   { type: 'wasm',   time: 2000ms, maxPly: 6 },
}
```

**Key features**:
- Heuristic-based JS for easy/veryEasy (instant, predictable)
- Minimax with move ordering for medium+ (WASM-optimized)
- Time-bounded iterative deepening (adaptive ply depth)
- Graceful fallback to JS if WASM unavailable

---

## 6. Menu System & UI

**Button Position**: TOP-RIGHT CORNER (mandatory, per GOVERNANCE.md § 4)

**Navigation Flow**:
```
Game screen
  ↓
[Menu button (top-right)]
  ↓
Menu drawer (slide-in from left)
  ├── 🎮 Game → back to game
  ├── ⚙️ Settings → settings screen
  └── ℹ️ About → about screen
```

**Screens Implemented**:
1. Splash (2.5s) → animated logo
2. Loading (0.8s) → progress bar
3. Game → board + menu button
4. Settings → sound/theme toggles, rules
5. About → game info, features, credits

**Responsive**:
- Desktop: 1024px+ (full layout)
- Tablet: 768-1023px (stacked layout)
- Mobile: <768px (menu button, full-width)

---

## 7. Quality Standards

### Build Requirements

```bash
pnpm typecheck    # Must pass (0 TypeScript errors)
pnpm lint         # Must pass (0 ESLint errors)
pnpm format:check # Must pass (0 Prettier errors)
pnpm build        # Must succeed, <100KB gzipped
```

### Current Status

✅ TypeScript: 0 errors
✅ ESLint: 0 errors
✅ Build: 206 KB → 65.95 KB gzipped
✅ Modules: 71 transformed

### Performance Metrics

- **Splash**: 2.5s → Loading: 0.8s → Game: 0.6s total transition
- **Easy AI move**: <50ms
- **Hard AI move**: ~1000ms (includes 400ms UX delay)
- **Bundle size**: 65.95 KB gzipped
- **Time-to-interactive**: ~3.9s (splash → loading → playable)

---

## 8. Development Commands

**All use pnpm** (never npm, yarn, npx):

```bash
# Development
pnpm dev          # Vite dev server (hot reload)
pnpm build        # Production build
pnpm preview      # Preview production build

# Quality gates
pnpm check        # Lint + format:check + typecheck
pnpm lint         # ESLint
pnpm lint:fix     # ESLint auto-fix
pnpm format       # Prettier auto-format
pnpm typecheck    # TypeScript compile check

# WASM (if building AI from scratch)
pnpm wasm:build   # Compile AssemblyScript → WASM
```

---

## 9. Known Limitations & Future Work

**Not Yet Implemented**:
- ⏳ Sowing animation (seed distribution visual)
- ⏳ Capture highlighting
- ⏳ Game move history
- ⏳ Sound effects connection (hooks ready, not wired)
- ⏳ Dark mode connection (state ready, not wired)
- ⏳ Settings persistence (localStorage not implemented)

**Nice-to-Have**:
- 📅 Statistics tracking (wins, losses, streaks)
- 🎬 Animated sowing
- 🔊 Sound effects
- 🌙 Dark mode toggle
- 📱 Touch haptics (on mobile)
- 🎮 Keyboard controls (arrow keys)

---

## 10. Package Dependencies

**Core**:
- React 19.0.0-rc
- TypeScript 5.9
- Vite 7.3.1
- React DOM 19.0.0-rc

**Development**:
- ESLint (with React/TypeScript plugins)
- Prettier
- Vitest (testing framework)
- Capacitor (mobile wrapper, optional)

**No additional** theme, animation, or UI libraries (custom CSS only)

---

## 11. Accessibility & Compliance

✅ ARIA labels on all interactive elements
✅ Semantic HTML (buttons, labels, nav, sections)
✅ Keyboard navigation (menu, settings, difficulty)
✅ Color contrast (WCAG AA minimum)
✅ Mobile-friendly (touch targets ≥44px)
✅ Offline support (service worker)

---

## 12. Platform & Browser Support

✅ Chrome 88+ (latest)
✅ Firefox 85+ (latest)
✅ Safari 14+ (latest)
✅ Edge 88+ (latest)
✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements**:
- JavaScript enabled
- WebAssembly support (for medium+ AI)
- localStorage (optional, for settings)

---

## 13. Cooperative Markdown Files

All .md files in this project:

✅ Reference [`GOVERNANCE.md`](GOVERNANCE.md) for shared rules
✅ Include status badges (✅, ⏳, ❌) for quick scanning
✅ Are machine-readable (headers, lists, code blocks)
✅ Show last update date
✅ Use consistent formatting
✅ Provide real code examples
✅ Link to related files

**Files in this project**:
- [`GOVERNANCE.md`](GOVERNANCE.md) — Shared rules (all games)
- [`AGENTS.md`](AGENTS.md) — Mancala-specific (this file)
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — Dev workflow
- [`.github/instructions/`](.github/instructions/) — Numbered instructions
- [`README.md`](README.md) — Game overview
- [`HAMBURGER_MENU_TEMPLATE.md`](HAMBURGER_MENU_TEMPLATE.md) — Menu template for other games

---

## 14. Next Steps (Priority Order)

1. **Hook up sound** — Wire `soundEnabled` → `useSoundEffects` hook
2. **Hook up dark mode** — Wire `darkMode` → `ThemeContext`
3. **Persist settings** — Save toggles to localStorage on change
4. **Animate sowing** — Add seed distribution animation (optional)
5. **Replicate menu to other games** — Use [`HAMBURGER_MENU_TEMPLATE.md`](HAMBURGER_MENU_TEMPLATE.md)

---

## 15. Self-Check Before Commits

Before pushing code:

- [ ] Used `pnpm` (not npm)?
- [ ] Respected layer boundaries (`src/domain/`, `src/app/`, `src/ui/`)?
- [ ] Used path aliases (`@/`)?
- [ ] Menu button on top-right corner?
- [ ] Settings screen works?
- [ ] All 6 difficulty tiers available?
- [ ] TypeScript: `pnpm typecheck` passes?
- [ ] ESLint: `pnpm lint` passes?
- [ ] Prettier: `pnpm format:check` passes?
- [ ] Build: `pnpm build` succeeds, <100KB gzipped?
- [ ] Updated relevant .md files?

---

## 16. Exceptions to GOVERNANCE.md

**Currently**: None. Mancala follows all shared governance rules exactly.

**If needed**, document exceptions in this format:
```markdown
### [EXCEPTION] Custom Feature

**Reason**: Why this game differs
**Implementation**: How it's implemented
**Approved**: Yes (approved in commit hash)
```

---

**See [`GOVERNANCE.md`](GOVERNANCE.md) for shared rules across all games.**

**Status**: ✅ Ready for production and as a template for other games.
