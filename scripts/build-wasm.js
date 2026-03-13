// ═══════════════════════════════════════════════════════════════════════════
// WASM Build Pipeline
//
// 1. Compile AssemblyScript → .wasm binary
// 2. Encode .wasm to base64 → TypeScript module
//
// The base64-embedded approach eliminates fetch/URL issues across all
// platforms (browser, Electron file://, Capacitor WebView, blob Workers).
//
// Usage: pnpm wasm:build
// ═══════════════════════════════════════════════════════════════════════════

import { execSync } from 'child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// ── 1. Ensure output directories ──────────────────────────────────────────
mkdirSync('build', { recursive: true })
mkdirSync('src/wasm', { recursive: true })

// ── 2. Compile AssemblyScript → WASM ──────────────────────────────────────
console.log('Compiling AssemblyScript → WASM...')

const isDebug = process.argv.includes('--debug')
const ascFlags = isDebug
  ? '--debug --runtime stub'
  : '--optimize --runtime stub --noAssert'

const asc = resolve('node_modules/.bin/asc')

execSync(
  `${asc} assembly/index.ts --outFile build/ai.wasm ${ascFlags}`,
  { stdio: 'inherit' },
)

// ── 3. Encode WASM binary → base64 TypeScript module ──────────────────────
const wasm = readFileSync('build/ai.wasm')
const base64 = wasm.toString('base64')
const sizeBytes = wasm.length
const sizeKB = (sizeBytes / 1024).toFixed(1)

// Read existing loader code or create placeholder
let loaderCode = ''
try {
  loaderCode = readFileSync('src/wasm/ai-wasm.ts', 'utf8')
} catch {
  // File doesn't exist yet
  loaderCode = ''
}

// If loader code exists and has imports, preserve it; otherwise use default header
const hasLoaderCode = loaderCode.includes('export async function initWasm')
let outputContent

if (hasLoaderCode) {
  // Replace the BASE64_CONSTANT line while preserving the rest
  outputContent = loaderCode.replace(
    /export const AI_WASM_BASE64 = '[^']*'/,
    `export const AI_WASM_BASE64 = '${base64}'`,
  )
} else {
  // Generate full file with loader code (happens on first build)
  outputContent = loaderCode.includes('initWasm')
    ? loaderCode
    : `/**
 * WASM AI Module Loader — Mancala
 *
 * Auto-generated BASE64 constant by scripts/build-wasm.js.
 * Run \`pnpm wasm:build\` to update the binary.
 */

// Auto-generated BASE64 encoding of compiled WASM module
export const AI_WASM_BASE64 = '${base64}'
`
}

writeFileSync('src/wasm/ai-wasm.ts', outputContent)

console.log(
  `✓ WASM AI engine: ${sizeBytes} bytes (${sizeKB} KB) → src/wasm/ai-wasm.ts`,
)
