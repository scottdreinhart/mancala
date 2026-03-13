/**
 * Central type definitions — pure domain types, no framework dependencies.
 */

export type Difficulty = 'veryEasy' | 'easy' | 'medium' | 'mediumHard' | 'hard' | 'veryHard'
export type GamePhase = 'setup' | 'playing' | 'ended'
export type PlayerIndex = 0 | 1

export interface GameStats {
  wins: number
  losses: number
  streak: number
  bestStreak: number
}

export interface GameState {
  board: number[] // 14 pits: [0-5]=player0 pits, [6]=player0 store, [7-12]=player1 pits, [13]=player1 store
  currentPlayer: PlayerIndex
  phase: GamePhase
  winner: PlayerIndex | null
  moveHistory: MoveRecord[]
}

export interface MoveRecord {
  player: PlayerIndex
  pit: number
  timestamp: number
  resultingBoard: number[]
}

export interface MoveResult {
  isValid: boolean
  newBoard: number[]
  nextPlayer: PlayerIndex
  explanation?: string
}

export interface CaptureInfo {
  captured: number
  oppositePit: number
  landingPit: number
}
