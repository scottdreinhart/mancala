/**
 * Mancala AI Service — Orchestration for WASM + JS + Worker
 *
 * Three-tier approach:
 * 1. WASM minimax (medium+) — 10-50x faster than JS, time-bounded iterative deepening
 * 2. JS fallback — When WASM unavailable, instant heuristic for easy levels
 * 3. Web Worker — Offloads hard/veryHard to separate thread (keeps UI at 60 FPS)
 *
 * Difficulty mapping:
 *   veryEasy  → JS random, sync, <5ms
 *   easy      → JS greedy, sync, <10ms
 *   medium    → WASM ply 3, sync, ~50ms
 *   mediumHard → WASM ply 4, worker, ~200ms
 *   hard      → WASM ply 5, worker, ~1000ms
 *   veryHard  → WASM ply 6+, worker, ~2000ms
 */

import { selectMove as selectMoveJS } from '@/domain/ai'
import type { Difficulty } from '@/domain/types'
import { initWasm, selectBestMoveWasm } from '@/wasm/ai-wasm'

export interface AiResult {
  pit: number | null
  difficulty: Difficulty
  duration: number
  source: 'sync-js' | 'sync-wasm' | 'async-wasm'
}

// ── Difficulty configuration ───────────────────────────────────────────

interface DifficultyConfig {
  useWorker: boolean
  plyDepth: number
  maxTimeMs: number
}

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  veryEasy: { useWorker: false, plyDepth: 1, maxTimeMs: 0 },
  easy: { useWorker: false, plyDepth: 2, maxTimeMs: 0 },
  medium: { useWorker: false, plyDepth: 3, maxTimeMs: 0 },
  mediumHard: { useWorker: true, plyDepth: 4, maxTimeMs: 200 },
  hard: { useWorker: true, plyDepth: 5, maxTimeMs: 1000 },
  veryHard: { useWorker: true, plyDepth: 6, maxTimeMs: 2000 },
}

// ── WASM initialization ────────────────────────────────────────────────

let wasmReady: Promise<boolean> | null = null
let wasmInitialized = false

async function ensureWasmReady(): Promise<boolean> {
  if (wasmInitialized) {
    return true
  }
  if (wasmReady) {
    return wasmReady
  }

  wasmReady = (async () => {
    try {
      const success = await initWasm()
      wasmInitialized = success
      return success
    } catch (error) {
      console.error('[AI] WASM init failed:', error)
      return false
    }
  })()

  return wasmReady
}

// ── Web Worker management ──────────────────────────────────────────────

let worker: Worker | null = null
let workerReady: Promise<boolean> | null = null

function ensureWorkerReady(): Promise<boolean> {
  if (worker) {
    return Promise.resolve(true)
  }
  if (workerReady) {
    return workerReady
  }

  workerReady = (async () => {
    try {
      worker = new Worker(new URL('@/workers/ai.worker.ts', import.meta.url), {
        type: 'module',
      })
      return true
    } catch (error) {
      console.error('[AI] Worker init failed:', error)
      worker = null
      return false
    }
  })()

  return workerReady
}

function terminateWorker(): void {
  if (worker) {
    worker.terminate()
    worker = null
    workerReady = null
  }
}

// ── Sync paths (main thread) ───────────────────────────────────────────

/**
 * Compute move using WASM (sync, main thread).
 * For medium difficulty or when worker unavailable.
 */
async function computeMoveWasmSync(
  board: number[],
  player: number,
  difficulty: Difficulty,
): Promise<AiResult> {
  const startTime = performance.now()

  // Timeout protection for WASM init (2 second max)
  const wasmTimeoutPromise = new Promise<boolean>((resolve) => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    timeout = setTimeout(() => {
      console.warn('[AI] WASM init timeout, falling back to JS')
      resolve(false)
    }, 2000)

    ensureWasmReady()
      .then((ready) => {
        if (timeout) {clearTimeout(timeout)}
        resolve(ready)
      })
      .catch((err) => {
        if (timeout) {clearTimeout(timeout)}
        console.error('[computeMoveWasmSync] WASM ready error:', err)
        resolve(false)
      })
  })

  const ready = await wasmTimeoutPromise
  if (!ready) {
    return computeMoveJS(board, player, difficulty)
  }

  try {
    const config = DIFFICULTY_CONFIG[difficulty]

    // Safety timeout for WASM computation (500ms max for sync operations)
    let timedOut = false

    const result = await new Promise<number | null>((resolve) => {
      let computationTimeout: ReturnType<typeof setTimeout> | null = null
      computationTimeout = setTimeout(() => {
        console.warn('[AI] WASM computation timeout (>500ms), using JS fallback')
        timedOut = true
        resolve(null)
      }, 500)

      try {
        const moveResult =
          config.plyDepth > 0
            ? selectBestMoveWasm(board, player, config.plyDepth)
            : selectMoveJS(board, player, difficulty)

        if (computationTimeout) {clearTimeout(computationTimeout)}
        resolve(moveResult === -1 ? null : moveResult)
      } catch (err) {
        if (computationTimeout) {clearTimeout(computationTimeout)}
        console.error('[AI] WASM computation error:', err)
        resolve(null)
      }
    })

    if (result === null || timedOut) {
      const fallback = selectMoveJS(board, player, difficulty)
      return {
        pit: fallback,
        difficulty,
        duration: performance.now() - startTime,
        source: 'sync-js',
      }
    }

    return {
      pit: result,
      difficulty,
      duration: performance.now() - startTime,
      source: 'sync-wasm',
    }
  } catch (error) {
    console.error('[AI] WASM move failed:', error)
    return computeMoveJS(board, player, difficulty)
  }
}

/**
 * Compute move using JS fallback (instant, heuristic).
 */
function computeMoveJS(board: number[], player: number, difficulty: Difficulty): AiResult {
  const startTime = performance.now()
  const pit = selectMoveJS(board, player, difficulty)
  const duration = performance.now() - startTime

  return {
    pit,
    difficulty,
    duration,
    source: 'sync-js',
  }
}

// ── Async path (worker) ────────────────────────────────────────────────

interface WorkerRequest {
  board: number[]
  player: number
  difficulty: Difficulty
  maxTimeMs: number
  plyDepth: number
}

interface WorkerResponse {
  pit: number
  duration: number
}

/**
 * Compute move using Web Worker (async, off-main-thread).
 * For hard/veryHard difficulties to keep UI responsive.
 */
function computeMoveWorker(
  board: number[],
  player: number,
  difficulty: Difficulty,
): Promise<AiResult> {
  return new Promise((resolve) => {
    if (!worker) {
      resolve(computeMoveJS(board, player, difficulty))
      return
    }

    const config = DIFFICULTY_CONFIG[difficulty]
    const startTime = performance.now()

    const timeoutHandle = setTimeout(() => {
      console.warn('[AI Worker] Timeout, using JS fallback')
      resolve(computeMoveJS(board, player, difficulty))
    }, config.maxTimeMs + 500) // 500ms grace period

    const messageHandler = (e: MessageEvent<WorkerResponse>) => {
      clearTimeout(timeoutHandle)
      worker?.removeEventListener('message', messageHandler)

      if (e.data.pit === 255) {
        resolve(computeMoveJS(board, player, difficulty))
      } else {
        resolve({
          pit: e.data.pit,
          difficulty,
          duration: performance.now() - startTime,
          source: 'async-wasm',
        })
      }
    }

    const errorHandler = (e: ErrorEvent) => {
      clearTimeout(timeoutHandle)
      worker?.removeEventListener('error', errorHandler)
      console.error('[AI Worker] Error:', e.message)
      resolve(computeMoveJS(board, player, difficulty))
    }

    worker.addEventListener('message', messageHandler)
    worker.addEventListener('error', errorHandler)

    const request: WorkerRequest = {
      board,
      player,
      difficulty,
      maxTimeMs: config.maxTimeMs,
      plyDepth: config.plyDepth,
    }

    worker.postMessage(request)
  })
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Select AI move with automatic routing:
 * - veryEasy/easy: JS sync (instant)
 * - medium: WASM sync (50ms)
 * - mediumHard+: Worker async (200-2000ms, off-main-thread)
 */
export async function selectAiMove(
  board: number[],
  player: number,
  difficulty: Difficulty,
): Promise<AiResult> {
  const config = DIFFICULTY_CONFIG[difficulty]

  // Route based on difficulty and worker availability
  if (difficulty === 'veryEasy' || difficulty === 'easy') {
    return computeMoveJS(board, player, difficulty)
  } else if (difficulty === 'medium') {
    return computeMoveWasmSync(board, player, difficulty)
  } else {
    // Hard: try worker, fallback to WASM sync if worker unavailable
    const workerOk = await ensureWorkerReady()
    if (workerOk && config.useWorker) {
      return computeMoveWorker(board, player, difficulty)
    } else {
      return computeMoveWasmSync(board, player, difficulty)
    }
  }
}

/**
 * Initialize async worker pool.
 * Call once at app startup for best performance.
 */
export async function ensureAsyncWorkerReady(): Promise<void> {
  await ensureWorkerReady()
}

/**
 * Terminate async worker (cleanup).
 */
export function terminateAsyncWorker(): void {
  terminateWorker()
}
