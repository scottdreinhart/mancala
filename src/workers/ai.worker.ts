/**
 * Mancala AI Worker — Off-main-thread WASM evaluation
 *
 * Receives board state + parameters, runs WASM minimax/iterative deepening,
 * returns best move pit. Keeps main thread responsive for hard AI levels.
 */

import type { Difficulty } from '@/domain/types'
import { initWasm, selectBestMoveIterativeWasm, selectBestMoveWasm } from '@/wasm/ai-wasm'

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

let wasmInitialized = false

/**
 * Initialize WASM on worker thread once.
 */
async function ensureWasm(): Promise<boolean> {
  if (wasmInitialized) {
    return true
  }

  try {
    const success = await initWasm()
    if (success) {
      wasmInitialized = true
    }
    return success
  } catch (error) {
    console.error('[AI Worker] WASM init failed:', error)
    return false
  }
}

/**
 * Handle incoming move calculation requests.
 */
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { board, player, difficulty, maxTimeMs, plyDepth } = event.data
  const startTime = performance.now()

  try {
    // Ensure WASM is ready
    const wasmReady = await ensureWasm()
    if (!wasmReady) {
      // Return invalid move, main thread will fall back to JS
      const response: WorkerResponse = {
        pit: 255,
        duration: performance.now() - startTime,
      }
      self.postMessage(response)
      return
    }

    // Choose algorithm based on difficulty
    let moveResult: number

    if (maxTimeMs > 0 && ['mediumHard', 'hard', 'veryHard'].includes(difficulty)) {
      // Time-bounded iterative deepening for hard difficulties
      moveResult = selectBestMoveIterativeWasm(board, player, maxTimeMs)
    } else {
      // Fixed-depth search for medium
      moveResult = selectBestMoveWasm(board, player, plyDepth)
    }

    const response: WorkerResponse = {
      pit: moveResult === -1 ? 255 : moveResult,
      duration: performance.now() - startTime,
    }

    self.postMessage(response)
  } catch (error) {
    console.error('[AI Worker] Move calculation failed:', error)

    // Return invalid move on error, main thread will use JS fallback
    const response: WorkerResponse = {
      pit: 255,
      duration: performance.now() - startTime,
    }
    self.postMessage(response)
  }
}

export {}
