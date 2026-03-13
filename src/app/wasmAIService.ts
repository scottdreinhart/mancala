/**
 * WASM AI Service — Mancala (Compatibility layer)
 *
 * Delegates to new aiService which provides:
 * - WASM minimax with alpha-beta pruning
 * - Web Worker integration for hard difficulties
 * - Time-bounded iterative deepening
 * - Graceful JS fallback chain
 *
 * This module maintained for backward compatibility.
 */

import { ensureAsyncWorkerReady, selectAiMove, terminateAsyncWorker } from '@/app/aiService'
import type { Difficulty } from '@/domain'

/**
 * Select AI move with WASM acceleration and worker support.
 * Delegates to new aiService for optimal performance.
 *
 * @param board - Game board array (14 elements)
 * @param player - Current player (0 or 1)
 * @param difficulty - Difficulty level
 * @returns Pit index to move from, or null if no valid moves
 */
export async function selectMoveWithWasm(
  board: number[],
  player: number,
  difficulty: Difficulty,
): Promise<number | null> {
  try {
    const result = await selectAiMove(board, player, difficulty)
    return result.pit ?? null
  } catch (error) {
    console.warn('[WASM AI Service] Move selection failed:', error)
    return null
  }
}

/**
 * Pre-initialize WASM and worker pool.
 * Call at app startup for best performance.
 */
export async function preloadWasm(): Promise<void> {
  try {
    await ensureAsyncWorkerReady()
  } catch (error) {
    console.warn('[WASM AI Service] Preload failed (non-critical):', error)
  }
}

/**
 * Cleanup: Terminate worker thread when done.
 */
export function cleanupWasm(): void {
  terminateAsyncWorker()
}
