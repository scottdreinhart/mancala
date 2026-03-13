# Closure Compiler for Mancala — Setup & Trade-offs

> **Status**: Optional feature. Vite is recommended for Mancala.

## Overview

Google Closure Compiler is an advanced JavaScript optimizer that can reduce bundle size by 5-15% through:
- Aggressive dead code elimination
- Variable/property name mangling (in advanced mode)
- Unused code removal across dependencies

## Current Mancala Metrics

| Metric | Vite (Current) | Closure (Estimated) | Benefit |
|--------|----------------|---------------------|---------|
| **Bundle Size (gzipped)** | **66.61 KB** | ~63-65 KB | +3-5% smaller |
| **Build Time** | ~2.1s | ~30-60s | +28-58s slower |
| **Debuggability** | ✅ Good (readable code) | ⚠️ Hard (mangled names) | Tools needed |
| **Setup Complexity** | ✅ Simple (included) | ❌ Complex | Java + config |

## Recommendation: KEEP VITE ✅

For Mancala, **Vite is the optimal choice**:
- ✅ 66.61 KB is **excellent** (well under 100 KB limit)
- ✅ Build completes in **2.1 seconds** (fast feedback loop)
- ✅ Code is **readable** and debuggable
- ✅ No Java dependency required
- ✅ Marginal improvement (3-5%) doesn't justify trade-offs

**Closure Compiler shines for**:
- Large projects (500+ KB bundles)
- Production-only builds where build time is acceptable
- Projects needing maximum performance optimization

## Setup (if interested)

### 1. Install Java

**macOS:**
```bash
brew install openjdk
```

**Windows (PowerShell):**
```powershell
choco install openjdk
```

**Linux (Ubuntu):**
```bash
apt install openjdk-21-jdk
```

### 2. Install Closure Compiler

```bash
pnpm add -D google-closure-compiler
```

### 3. Run Analysis

```bash
pnpm build:closure
```

This will analyze your current build and show potential savings.

### 4. Run Comparison

```bash
pnpm compare:builds
```

This builds with Vite, then shows what Closure Compiler would do.

## Configuration for React + WASM

If you proceed with Closure Compiler, use **WHITESPACE_ONLY** mode (not ADVANCED):

```javascript
// Safe for React, WASM
{
  compilationLevel: 'WHITESPACE_ONLY',
  warningLevel: 'QUIET',
  outputWrapper: '',
  languageIn: 'ECMASCRIPT2020',
  languageOut: 'ECMASCRIPT2020'
}
```

**Why not ADVANCED mode?**
- Advanced mode renames properties → breaks React props
- Requires `@preserve` JSDoc annotations on React components
- Adds significant configuration complexity
- WHITESPACE_ONLY is safer: ~2-5% savings, no risk

## Implementation Path (if needed later)

If Mancala grows and bundle size becomes a concern:

1. Update `scripts/build-closure.js` to actually run Closure Compiler
2. Create `vite.config.closure.ts` with Whitespace-only config
3. Add `build:closure-full` script for production optimization
4. Set up source maps for debugging: `--create_source_map`

## References

- [Google Closure Compiler Docs](https://developers.google.com/closure/compiler)
- [Closure Compiler with npm](https://www.npmjs.com/package/google-closure-compiler)
- [React + Closure Compiler Best Practices](https://effectivetypescript.com/2023/09/27/closure-compiler/)

## Summary

```
┌─────────────────────────────────┐
│  Mancala Build Optimization     │
├─────────────────────────────────┤
│ Primary:  Vite ✅ (use this)    │
│ Optional: Closure Compiler      │
│   - Requires Java               │
│   - +30-60s build time          │
│   - +3-5% size improvement      │
│   - Complex setup for React     │
│                                 │
│ Recommendation: KEEP VITE       │
│ Current 66.61 KB is ideal      │
└─────────────────────────────────┘
```
