/**
 * Game rules — win/loss/draw detection, move execution, turn management.
 * Pure functions operating on domain types only.
 */

import {
  checkAndApplyCapture,
  collectRemainingStones,
  determineWinner,
  getScores,
  getValidMoves,
  hasValidMoves,
  sowSeeds,
} from './board'
import type { GameState, MoveResult, PlayerIndex } from './types'

/**
 * Create a fresh game state for two-player game.
 */
export function createGameState(stones: number = 4): GameState {
  return {
    board: Array(14)
      .fill(0)
      .map((_, i) => {
        if (i === 6 || i === 13) {
          return 0 // Stores
        }
        if (i < 6 || (i > 6 && i < 13)) {
          return stones
        }
        return 0
      }),
    currentPlayer: 0 as PlayerIndex,
    phase: 'playing',
    winner: null,
    moveHistory: [],
  }
}

/**
 * Execute a move and return the result.
 * Handles sowing, capturing, bonus turns, and win/loss detection.
 *
 * @param state Current game state
 * @param pit Pit index to move from
 * @returns MoveResult with new board and next player
 */
export function executeMove(state: GameState, pit: number): MoveResult {
  // Validate pit is valid move for current player
  const validMoves = getValidMoves(state.board, state.currentPlayer)
  if (!validMoves.includes(pit)) {
    return {
      isValid: false,
      newBoard: state.board,
      nextPlayer: state.currentPlayer,
      explanation: `Pit ${pit} is not a valid move. Valid moves: ${validMoves.join(', ')}`,
    }
  }

  try {
    // Sow seeds
    const {
      newBoard: boardAfterSow,
      landingPit,
      storeBonus,
    } = sowSeeds(state.board, state.currentPlayer, pit)

    // Check and apply capture if applicable
    const { newBoard: boardAfterCapture } = checkAndApplyCapture(
      boardAfterSow,
      state.currentPlayer,
      landingPit,
    )

    // Check for game end
    const gameEnded = isGameOver(boardAfterCapture)
    let finalBoard = boardAfterCapture

    if (gameEnded) {
      // Collect remaining stones
      finalBoard = collectRemainingStones(boardAfterCapture)
    }

    // Determine next player
    let nextPlayer: PlayerIndex
    if (gameEnded) {
      nextPlayer = state.currentPlayer // Game over, no next player
    } else if (storeBonus) {
      nextPlayer = state.currentPlayer // Extra turn
    } else {
      nextPlayer = state.currentPlayer === 0 ? 1 : 0 // Alternate player
    }

    return {
      isValid: true,
      newBoard: finalBoard,
      nextPlayer,
      explanation: `Player ${state.currentPlayer} moved from pit ${pit}${storeBonus ? ' and gets a bonus turn!' : ''}`,
    }
  } catch (err) {
    return {
      isValid: false,
      newBoard: state.board,
      nextPlayer: state.currentPlayer,
      explanation: `Error executing move: ${err instanceof Error ? err.message : 'Unknown error'}`,
    }
  }
}

/**
 * Check if the game is over (one player's side is empty).
 */
export function isGameOver(board: number[]): boolean {
  return !hasValidMoves(board, 0) || !hasValidMoves(board, 1)
}

/**
 * Get the winner of a completed game.
 * Returns 0, 1, or null (for draw).
 */
export function getGameWinner(board: number[]): PlayerIndex | null {
  const winner = determineWinner(board)
  if (winner === null) {
    return null
  }
  return winner as PlayerIndex
}

/**
 * Get the final score as a human-readable string.
 */
export function getFinalScore(board: number[]): string {
  const [score0, score1] = getScores(board)
  return `Player 0: ${score0}, Player 1: ${score1}`
}

/**
 * Check which player has more stones left on their side.
 * Used to determine whose turn ends the game.
 */
export function whichSideIsEmpty(board: number[]): PlayerIndex | null {
  const player0HasMoves = hasValidMoves(board, 0)
  const player1HasMoves = hasValidMoves(board, 1)

  if (!player0HasMoves && player1HasMoves) {
    return 0 // Player 0's side is empty
  }
  if (!player1HasMoves && player0HasMoves) {
    return 1 // Player 1's side is empty
  }
  if (!player0HasMoves && !player1HasMoves) {
    return null // Both empty (shouldn't happen mid-game)
  }

  return null // Neither empty
}
