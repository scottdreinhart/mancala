/**
 * Board operations — pure functions for creating and manipulating game state.
 * No React, no DOM — purely functional transformations.
 *
 * Board layout (14 pits):
 *  Player 0: pits 0-5 (left to right), store at 6
 *  Player 1: pits 7-12 (left to right), store at 13
 *
 * Sowing direction: counter-clockwise from player 0's perspective
 *  Player 0 sows: 0→1→2→3→4→5→store(6)→loop
 *  Player 1 sows: 7→8→9→10→11→12→store(13)→loop
 */

import type { PlayerIndex } from './types'

export const PITS_PER_SIDE = 6
export const STONES_PER_PIT = 4
export const TOTAL_PITS = 14
export const PLAYER0_STORE = 6
export const PLAYER1_STORE = 13

/**
 * Create a fresh game board with standard setup.
 * @param stones Number of stones per pit (default 4 for Kalah)
 * @returns Array of 14 pit values
 */
export function createBoard(stones: number = STONES_PER_PIT): number[] {
  const board = new Array(TOTAL_PITS).fill(0)

  // Fill player 0 pits (0-5)
  for (let i = 0; i < PITS_PER_SIDE; i++) {
    board[i] = stones
  }

  // Store 0 is empty (index 6)
  board[PLAYER0_STORE] = 0

  // Fill player 1 pits (7-12)
  for (let i = 7; i < 13; i++) {
    board[i] = stones
  }

  // Store 1 is empty (index 13)
  board[PLAYER1_STORE] = 0

  return board
}

/**
 * Get valid move indices for a player.
 * A pit is valid if it contains stones AND is on the player's side.
 */
export function getValidMoves(board: number[], player: PlayerIndex): number[] {
  const startPit = player === 0 ? 0 : 7
  const endPit = player === 0 ? PITS_PER_SIDE : 13

  const valid: number[] = []
  for (let pit = startPit; pit < endPit; pit++) {
    if (board[pit] > 0) {
      valid.push(pit)
    }
  }

  return valid
}

/**
 * Check if a player has any valid moves left.
 */
export function hasValidMoves(board: number[], player: PlayerIndex): boolean {
  return getValidMoves(board, player).length > 0
}

/**
 * Sow seeds from a pit and return the new board state and landing pit.
 * Handles skipping opponent stores.
 *
 * @param board Current board state
 * @param player Player making the move
 * @param pit Pit to sow from (0-5 for player 0, 7-12 for player 1)
 * @returns { newBoard, landingPit, storeBonus } where storeBonus indicates if player gets extra turn
 */
export function sowSeeds(
  board: number[],
  player: PlayerIndex,
  pit: number,
): { newBoard: number[]; landingPit: number; storeBonus: boolean } {
  // Validate pit belongs to player
  const startPit = player === 0 ? 0 : 7
  const endPit = player === 0 ? PITS_PER_SIDE : 13

  if (pit < startPit || pit >= endPit || board[pit] === 0) {
    throw new Error(`Invalid move: pit ${pit} for player ${player}`)
  }

  const newBoard = [...board]
  let seeds = newBoard[pit]
  newBoard[pit] = 0

  const ownStore = player === 0 ? PLAYER0_STORE : PLAYER1_STORE
  const opponentStore = player === 0 ? PLAYER1_STORE : PLAYER0_STORE

  let currentPit = pit
  let landingPit = pit

  // Sow seeds counter-clockwise
  while (seeds > 0) {
    currentPit = (currentPit + 1) % TOTAL_PITS

    // Skip opponent's store
    if (currentPit === opponentStore) {
      continue
    }

    // Place seed
    newBoard[currentPit]++
    seeds--
    landingPit = currentPit
  }

  // Check if last seed landed in own store (bonus turn)
  const storeBonus = landingPit === ownStore

  return { newBoard, landingPit, storeBonus }
}

/**
 * Check if a capture is possible and perform it if valid.
 * Capture: landing in empty pit on your side with opposite pit having seeds.
 *
 * @returns { newBoard, captured } where captured is number of stones taken
 */
export function checkAndApplyCapture(
  board: number[],
  player: PlayerIndex,
  landingPit: number,
): { newBoard: number[]; captured: number } {
  const newBoard = [...board]
  const ownStore = player === 0 ? PLAYER0_STORE : PLAYER1_STORE
  const startPit = player === 0 ? 0 : 7
  const endPit = player === 0 ? PITS_PER_SIDE : 13

  // Can only capture if:
  // 1. Landing pit is on your side (not store)
  // 2. Landing pit was empty before this seed
  // 3. Opposite pit has seeds

  const isOnOwnSide = landingPit >= startPit && landingPit < endPit
  const wasEmpty = newBoard[landingPit] === 1 // Now has 1 seed from sow
  // Calculate opposite pit: pit i is opposite to pit (12 - i)
  const oppositeIndex = 12 - landingPit
  const hasOppositeSeed = newBoard[oppositeIndex] > 0

  if (isOnOwnSide && wasEmpty && hasOppositeSeed) {
    // Capture!
    const capturedCount = newBoard[landingPit] + newBoard[oppositeIndex]
    newBoard[landingPit] = 0
    newBoard[oppositeIndex] = 0
    newBoard[ownStore] += capturedCount

    return { newBoard, captured: capturedCount }
  }

  return { newBoard, captured: 0 }
}

/**
 * Collect remaining stones to the player with stones left.
 * Called when one side is empty.
 *
 * @returns newBoard with remaining stones collected
 */
export function collectRemainingStones(board: number[]): number[] {
  const newBoard = [...board]

  // Check if player 0 side is empty
  const player0Empty = !hasValidMoves(newBoard, 0)
  if (player0Empty) {
    // Player 1 collects their side
    let collected = 0
    for (let i = 7; i < 13; i++) {
      collected += newBoard[i]
      newBoard[i] = 0
    }
    newBoard[PLAYER1_STORE] += collected
  } else {
    // Player 0 collects their side
    let collected = 0
    for (let i = 0; i < 6; i++) {
      collected += newBoard[i]
      newBoard[i] = 0
    }
    newBoard[PLAYER0_STORE] += collected
  }

  return newBoard
}

/**
 * Get the score for each player.
 */
export function getScores(board: number[]): [player0: number, player1: number] {
  return [board[PLAYER0_STORE], board[PLAYER1_STORE]]
}

/**
 * Determine winner (null if tie).
 */
export function determineWinner(board: number[]): 0 | 1 | null {
  const [score0, score1] = getScores(board)
  if (score0 > score1) {
    return 0
  }
  if (score1 > score0) {
    return 1
  }
  return null // Draw
}

/**
 * Human-readable pit name for debugging.
 */
export function pitName(pit: number): string {
  if (pit === PLAYER0_STORE) {
    return 'P0 Store'
  }
  if (pit === PLAYER1_STORE) {
    return 'P1 Store'
  }
  if (pit < PITS_PER_SIDE) {
    return `P0 Pit ${pit}`
  }
  return `P1 Pit ${pit - 7}`
}
