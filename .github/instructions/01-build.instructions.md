# Build & Packaging Instructions

> **Scope**: Build scripts, packaging, shell/environment routing, output directories.
> Subordinate to `AGENTS.md` §2 (pnpm-only) and §5 (shell routing).

---

## Script Routing Matrix

| Script | What It Does | Shell |
|---|---|---|
| `pnpm build` | Vite production build → `dist/` | Bash (WSL: Ubuntu) |
| `pnpm build:preview` | Build + local preview server | Bash (WSL: Ubuntu) |
| `pnpm electron:build` | Vite build + electron-builder → `release/` | Platform-dependent |
| `pnpm electron:build:win` | Windows build → `release/` | **PowerShell** |
| `pnpm electron:build:linux` | Linux `.AppImage` → `release/` | Bash (WSL: Ubuntu) |
| `pnpm electron:build:mac` | macOS `.dmg` → `release/` | **macOS / Apple** |
| `pnpm cap:sync` | Vite build + Capacitor sync | Bash (WSL: Ubuntu) |
| `pnpm wasm:build` | AssemblyScript → WASM → base64 | Bash (WSL: Ubuntu) |
| `pnpm wasm:build:debug` | WASM debug build | Bash (WSL: Ubuntu) |

---

## Electron Builder Configuration

| Field | Value |
|---|---|
| `appId` | `com.scottreinhart.mancala` |
| `productName` | `Mancala` |
| `directories.output` | `release` |
| `files` | `dist/**/*`, `electron/**/*` |
| `win.target` | `portable` |
| `mac.target` | `dmg` |
| `linux.target` | `AppImage` |

---

## Output Directories

| Directory | Contents | Gitignored |
|---|---|---|
| `dist/` | Vite production build output | Yes |
| `release/` | Electron Builder distributables | Yes |
| `node_modules/` | Dependencies | Yes |

---

## Cleanup Scripts

| Script | Effect |
|---|---|
| `pnpm clean` | Removes `dist/` and `release/` |
| `pnpm clean:node` | Removes `node_modules/` |
| `pnpm clean:all` | Removes `dist/`, `release/`, and `node_modules/` |
| `pnpm reinstall` | `clean:all` + `pnpm install` |

---

## Quality Gate Scripts

| Script | Effect |
|---|---|
| `pnpm check` | `lint` + `format:check` + `typecheck` |
| `pnpm fix` | `lint:fix` + `format` |
| `pnpm validate` | `check` + `build` (full pre-push gate) |

Always run `pnpm validate` before pushing changes.

---

## WSL / NTFS Platform Switching

Native binaries in `node_modules/` are platform-specific. A `.node-platform.md` tracking file
in the project root records `platform: linux` or `platform: windows`.

| Step | Bash → Linux | PowerShell → Windows |
|---|---|---|
| 1 | `rm -rf node_modules` | Delete `node_modules` |
| 2 | `pnpm install` (retry if EACCES) | `pnpm install` |
| 3 | `pnpm rebuild` (creates `.bin/`) | — |
| 4 | Update `.node-platform.md` → `linux` | Update `.node-platform.md` → `windows` |
| 5 | `pnpm check` | `pnpm check` |

**Always check `.node-platform.md` before running any command.** See `AGENTS.md` §10.

---

## Language Guardrails

Build scripts use **JavaScript** (Node) in `scripts/`. Do not introduce side-language build helpers.
