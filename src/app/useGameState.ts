/**
 * useGameState — Game state management hook.
 * Encapsulates game logic, AI integration, and state transitions.
 */

import { preloadWasm, selectMoveWithWasm } from '@/app/wasmAIService'
import type { Difficulty, GameState, PlayerIndex } from '@/domain'
import {
  CPU_DELAY_MS,
  createGameState,
  executeMove,
  getGameWinner,
  getValidMoves,
  isGameOver,
} from '@/domain'
import { playCpuMove } from '@/app/sounds'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface GameStateHook {
  gameState: GameState
  isHumanTurn: boolean
  isAIThinking: boolean
  validMoves: number[]
  makeMove: (pit: number) => void
  resetGame: () => void
  difficulty: Difficulty
  setDifficulty: (d: Difficulty) => void
  humanPlayer: PlayerIndex
  isGameOver: boolean
  winner: PlayerIndex | null
  setGameActive: (active: boolean) => void // NEW: Control when AI can move
}

/**
 * Main game state hook for Mancala.
 * Manages game state, AI moves, and turn handling.
 */
export function useGameState(initialDifficulty: Difficulty = 'medium'): GameStateHook {
  const [gameState, setGameState] = useState<GameState>(() => createGameState(4))
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [gameActive, setGameActive] = useState(false) // NEW: Only run AI when game is active
  const aiTimeoutRef = useRef<number | null>(null)
  const humanPlayer: PlayerIndex = 0 // Human always plays as player 0

  const isGameOverFlag = isGameOver(gameState.board)
  const winner = isGameOverFlag ? getGameWinner(gameState.board) : null
  const isHumanTurn = gameState.currentPlayer === humanPlayer && !isGameOverFlag
  const validMoves = getValidMoves(gameState.board, gameState.currentPlayer)

  /**
   * Make a move for the human player or AI.
   */
  const makeMove = useCallback(
    (pit: number) => {
      if (gameState.phase !== 'playing') {
        return
      }
      if (isGameOverFlag) {
        return
      }

      // Execute the move
      const result = executeMove(gameState, pit)

      if (!result.isValid) {
        console.warn(`Invalid move: ${result.explanation}`)
        return
      }

      // Update game state
      const newGameState: GameState = {
        ...gameState,
        board: result.newBoard,
        currentPlayer: result.nextPlayer,
        phase: isGameOver(result.newBoard) ? 'ended' : 'playing',
        winner: isGameOver(result.newBoard) ? getGameWinner(result.newBoard) : null,
        moveHistory: [
          ...gameState.moveHistory,
          {
            player: gameState.currentPlayer,
            pit,
            timestamp: Date.now(),
            resultingBoard: result.newBoard,
          },
        ],
      }

      setGameState(newGameState)
    },
    [gameState, isGameOverFlag],
  )

  /**
   * Reset game to initial state.
   */
  const resetGame = useCallback(() => {
    setIsAIThinking(false)
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current)
    }
    setGameState(createGameState(4))
  }, [])

  /**
   * Handle AI turn (with delay for better UX).
   */
  useEffect(() => {
    if (!gameActive || isGameOverFlag || gameState.currentPlayer === humanPlayer || isAIThinking) {
      return
    }

    setIsAIThinking(true)

    // Pre-initialize WASM on first app mount (optional optimization)
    preloadWasm().catch(() => {
      // Silent fallback
    })

    aiTimeoutRef.current = setTimeout(async () => {
      try {
        // Use WASM-optimized AI with JavaScript fallback
        const bestMove = await selectMoveWithWasm(
          gameState.board,
          gameState.currentPlayer,
          difficulty,
        )

        if (bestMove !== null) {
          makeMove(bestMove)
          playCpuMove()
        }
      } catch (error) {
        console.error('[useGameState] AI move selection failed:', error)
      } finally {
        setIsAIThinking(false)
      }
    }, CPU_DELAY_MS)

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current)
      }
    }
  }, [
    gameActive,
    gameState.currentPlayer,
    gameState.board,
    difficulty,
    isGameOverFlag,
    humanPlayer,
    makeMove,
  ])

  return {
    gameState,
    isHumanTurn,
    isAIThinking,
    validMoves,
    makeMove,
    resetGame,
    difficulty,
    setDifficulty,
    humanPlayer,
    isGameOver: isGameOverFlag,
    winner,
    setGameActive,
  }
}
