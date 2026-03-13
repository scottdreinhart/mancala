/**
 * Mancala AI — move selection logic (pure domain, no framework).
 *
 * Strategies by difficulty:
 * - veryEasy/easy: Random valid move
 * - medium: Greedy heuristic (prefer moves that land in store, lead to captures)
 * - mediumHard/hard/veryHard: Minimax with alpha-beta pruning (delegated to WASM)
 */

import {
  checkAndApplyCapture,
  getScores as getBoardScores,
  getValidMoves,
  PLAYER0_STORE,
  PLAYER1_STORE,
  sowSeeds,
} from './board'
import { isGameOver } from './rules'
import type { Difficulty } from './types'

/**
 * Select the best pit for the AI player based on difficulty.
 *
 * @param board Array of 14 pit values
 * @param player Player index (0 or 1)
 * @param difficulty AI difficulty level
 * @returns Pit index, or -1 if no valid move
 */
export function selectMove(board: number[], player: number, difficulty: Difficulty): number | null {
  const validMoves = getValidMoves(board, player as 0 | 1)

  if (validMoves.length === 0) {
    return null
  }

  // Map new difficulty tiers to classic strategies
  if (difficulty === 'veryEasy' || difficulty === 'easy') {
    return selectMoveEasy(validMoves)
  } else if (difficulty === 'medium') {
    return selectMoveMedium(board, player as 0 | 1, validMoves)
  } else {
    // mediumHard, hard, veryHard: use minimax (or delegate to WASM)
    return selectMoveHard(board, player as 0 | 1, validMoves)
  }
}

/**
 * Easy AI: Pick a random valid move.
 */
function selectMoveEasy(validMoves: number[]): number {
  return validMoves[Math.floor(Math.random() * validMoves.length)]
}

/**
 * Medium AI: Greedy heuristic scoring.
 * Prefer moves that:
 * 1. Land in own store (bonus turn)
 * 2. Result in captures
 * 3. Maximize immediate score gain
 */
function selectMoveMedium(board: number[], player: 0 | 1, validMoves: number[]): number {
  let bestMove = validMoves[0]
  let bestScore = -Infinity

  for (const pit of validMoves) {
    const { newBoard: boardAfterSow, landingPit, storeBonus } = sowSeeds(board, player, pit)
    const { captured } = checkAndApplyCapture(boardAfterSow, player, landingPit)

    // Score: bonus turn (10) + capture points (1 per stone) + future capture potential
    let moveScore = 0
    if (storeBonus) {
      moveScore += 10
    }
    if (captured > 0) {
      moveScore += captured * 2
    }
    // Add heuristic for future capture potential
    moveScore += detected(boardAfterSow, player)

    if (moveScore > bestScore) {
      bestScore = moveScore
      bestMove = pit
    }
  }

  return bestMove
}

/**
 * Hard AI: Minimax with alpha-beta pruning and depth limit.
 * Searches 3-4 plies ahead depending on branching factor.
 */
function selectMoveHard(board: number[], player: 0 | 1, validMoves: number[]): number {
  let bestMove = validMoves[0]
  let bestValue = -Infinity
  const maxDepth = 4

  for (const move of validMoves) {
    const value = minimax(board, player, move, 1, maxDepth, -Infinity, Infinity, player)
    if (value > bestValue) {
      bestValue = value
      bestMove = move
    }
  }

  return bestMove
}

/**
 * Minimax evaluation with alpha-beta pruning.
 */
function minimax(
  board: number[],
  player: 0 | 1,
  move: number,
  depth: number,
  maxDepth: number,
  alpha: number,
  beta: number,
  originalPlayer: 0 | 1,
): number {
  // Apply move
  const { newBoard, landingPit, storeBonus } = sowSeeds(board, player, move)
  const { newBoard: boardAfterCapture } = checkAndApplyCapture(newBoard, player, landingPit)

  const nextPlayer: 0 | 1 = storeBonus ? player : player === 0 ? 1 : 0

  // Terminal node or max depth reached?
  if (depth >= maxDepth || isGameOver(boardAfterCapture)) {
    return evaluateBoard(boardAfterCapture, originalPlayer)
  }

  // Recursively evaluate next moves
  const nextMoves = getValidMoves(boardAfterCapture, nextPlayer)

  if (nextMoves.length === 0) {
    return evaluateBoard(boardAfterCapture, originalPlayer)
  }

  if (nextPlayer === originalPlayer) {
    // Maximizing player
    let maxEval = -Infinity
    for (const nextMove of nextMoves) {
      const eval_ = minimax(
        boardAfterCapture,
        nextPlayer,
        nextMove,
        depth + 1,
        maxDepth,
        alpha,
        beta,
        originalPlayer,
      )
      maxEval = Math.max(maxEval, eval_)
      alpha = Math.max(alpha, eval_)
      if (beta <= alpha) {
        break // Beta cutoff
      }
    }
    return maxEval
  } else {
    // Minimizing player (opponent)
    let minEval = Infinity
    for (const nextMove of nextMoves) {
      const eval_ = minimax(
        boardAfterCapture,
        nextPlayer,
        nextMove,
        depth + 1,
        maxDepth,
        alpha,
        beta,
        originalPlayer,
      )
      minEval = Math.min(minEval, eval_)
      beta = Math.min(beta, eval_)
      if (beta <= alpha) {
        break // Alpha cutoff
      }
    }
    return minEval
  }
}

/**
 * Heuristic evaluation of board state.
 * Returns a score favoring the given player.
 *
 * Score = own store - opponent store + positional factors
 */
function evaluateBoard(board: number[], player: 0 | 1): number {
  const [score0, score1] = getScores(board)
  let score = player === 0 ? score0 - score1 : score1 - score0

  // Positional bonus: stones near own store are worth more
  // (more likely to contribute to future bonus turns)
  const ownSideStart = player === 0 ? 0 : 7
  for (let i = 0; i < 6; i++) {
    const pit = ownSideStart + i
    const distance = 5 - i // Distance to own store (5 to 0)
    score += board[pit] * (0.1 / (distance + 1)) // Bonus diminishes with distance
  }

  return score
}

/**
 * Get future capture potential (heuristic for medium AI).
 */
function detected(board: number[], player: 0 | 1): number {
  // Count opponent stones in pits directly across from our empty pits
  let potential = 0

  const ownStart = player === 0 ? 0 : 7
  const oppStart = player === 0 ? 7 : 0

  for (let i = 0; i < 6; i++) {
    const ownPit = ownStart + i
    const oppPit = oppStart + (5 - i) // Opposite pit

    if (board[ownPit] === 0 && board[oppPit] > 0) {
      potential += board[oppPit] * 0.5 // Potential future captures
    }
  }

  return potential
}

/**
 * Simple heuristic for immediate stone count advantage.
 */
export function evaluateBoardSimple(board: number[], player: 0 | 1): number {
  const ownStore = player === 0 ? PLAYER0_STORE : PLAYER1_STORE
  const oppStore = player === 0 ? PLAYER1_STORE : PLAYER0_STORE
  return board[ownStore] - board[oppStore]
}

/**
 * Helper: wrap board getScores for internal use.
 */
function getScores(board: number[]): [number, number] {
  return getBoardScores(board)
}
