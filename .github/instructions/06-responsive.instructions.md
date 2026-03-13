# Responsive UI/UX Instructions

> **Scope**: Responsive design, viewport adaptation, breakpoints, device-aware hooks.
> Subordinate to `AGENTS.md` §3 (architecture) — domain logic is framework-agnostic.

---

## Architecture

| Concern | Layer | File | Purpose |
|---|---|---|---|
| Breakpoint tokens | Domain | `src/domain/responsive.ts` | Single source of truth for all breakpoint values |
| Media query tokens | Domain | `src/domain/responsive.ts` | Capability-based CSS media query strings |
| Semantic types | Domain | `src/domain/responsive.ts` | `NavMode`, `ContentDensity`, `DialogMode`, `InteractionMode` |
| Derivation functions | Domain | `src/domain/responsive.ts` | Pure functions: capabilities → semantic state |
| Tests | Domain | `src/domain/responsive.test.ts` | 40+ tests covering all derivations and boundaries |
| Media query hook | App | `src/app/useMediaQuery.ts` | SSR-safe `matchMedia` wrapper (event-driven) |
| Window size hook | App | `src/app/useWindowSize.ts` | SSR-safe `innerWidth`/`innerHeight` (resize-driven) |
| Responsive hook | App | `src/app/useResponsiveState.ts` | Centralized entry point combining all capabilities |
| UI breakpoints | UI | `src/ui/ui-constants.ts` | Re-exports domain breakpoints for component use |

---

## Single Entry Point

Components consume `useResponsiveState()` — never raw `matchMedia`, `innerWidth`, or ad-hoc breakpoint checks.

```tsx
const { compactViewport, navMode, touchOptimized } = useResponsiveState()
```

---

## Breakpoint Tokens

| Token | Width (px) | Device Class |
|---|---|---|
| `xs` | 0 | Small phone |
| `sm` | 375 | Phone |
| `md` | 600 | Tablet / mobile boundary |
| `lg` | 900 | Desktop boundary |
| `xl` | 1200 | Wide desktop |
| `xxl` | 1800 | Ultrawide |

Height thresholds: `short` (500px), `medium` (700px).

---

## ResponsiveState Fields

### Breakpoint Flags (mutually exclusive)
`isXs`, `isSm`, `isMd`, `isLg`, `isXl`, `isXxl`

### Device Categories (mutually exclusive)
`isMobile` (< md), `isTablet` (md–lg), `isDesktop` (≥ lg)

### Composite Flags
`compactViewport`, `shortViewport`, `wideViewport`, `ultrawideViewport`, `touchOptimized`, `denseLayoutAllowed`, `fullscreenDialogPreferred`

### Layout Modes
`navMode` (bottom-tabs / drawer / sidebar), `contentDensity` (compact / comfortable / spacious), `dialogMode` (fullscreen / bottom-sheet / centered-modal), `interactionMode` (touch / hybrid / pointer-precise), `gridColumns` (1–4)

### Raw Capabilities
`width`, `height`, `isPortrait`, `isLandscape`, `supportsHover`, `hasCoarsePointer`, `hasFinePointer`, `prefersReducedMotion`

---

## SSR Safety

Both `useMediaQuery` and `useWindowSize` guard with `typeof window !== 'undefined'`. Default: `false` for queries, `{ width: 0, height: 0 }` for dimensions.

---

## Performance Rules

1. `useMediaQuery` — event-driven via `matchMedia('change')`. Does **not** fire on every resize.
2. `useWindowSize` — fires on resize. Use only when exact pixel dimensions are needed.
3. `useResponsiveState` — `useMemo` prevents re-derivation when inputs are stable.

---

## Rules

1. **Never scatter raw breakpoint values** in components — import from `@/domain/responsive`.
2. **Never use `window.innerWidth` directly** — use `useResponsiveState()` or `useWindowSize()`.
3. **Domain functions must stay pure** — no React, no browser APIs.
4. **Add tests** for any new derivation function in `responsive.test.ts`.
5. **One hook** — extend `ResponsiveState` rather than creating parallel responsive hooks.
