import { useGameState, useSoundEffects } from '@/app'
import type { Difficulty } from '@/domain'
import { MenuButton } from '@/ui/molecules'
import Menu from '@/ui/molecules/Menu'
import { useEffect, useState } from 'react'
import About from './About'
import GameEndNotification from './GameEndNotification'
import styles from './App.module.css'
import LoadingScreen from './LoadingScreen'
import Settings from './Settings'
import SplashScreen from './SplashScreen'

type AppScreen = 'splash' | 'loading' | 'game' | 'settings' | 'about'

export default function App() {
  const [difficulty, setLocalDifficulty] = useState<Difficulty>('medium')
  const [appScreen, setAppScreen] = useState<AppScreen>('splash')
  const [menuOpen, setMenuOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const game = useGameState(difficulty)
  const sounds = useSoundEffects()

  useEffect(() => {
    // Transition: splash (2.5s) → loading (0.8s) → game (0.6s)
    // Total: ~3.9s sequence
    const splashTimer = setTimeout(() => setAppScreen('loading'), 2500)
    const loadingTimer = setTimeout(() => {
      setAppScreen('game')
    }, 3300)

    return () => {
      clearTimeout(splashTimer)
      clearTimeout(loadingTimer)
    }
  }, [])

  // Activate/deactivate AI based on screen
  useEffect(() => {
    game.setGameActive(appScreen === 'game')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appScreen])

  const handlePitClick = (pit: number) => {
    if (!game.isHumanTurn || !game.validMoves.includes(pit)) {
      return
    }
    sounds.onSelect()
    game.makeMove(pit)
  }

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    sounds.onConfirm()
    setLocalDifficulty(newDifficulty)
    game.setGameActive(false) // Deactivate AI during difficulty change
    game.resetGame()
    // Re-activate after a small delay to ensure proper reset
    setTimeout(() => game.setGameActive(true), 100)
  }

  const handleNavigate = (screen: 'game' | 'settings' | 'about') => {
    setAppScreen(screen)
    setMenuOpen(false)
  }

  const handleNewGame = () => {
    sounds.onConfirm()
    game.resetGame()
    setAppScreen('game')
  }

  if (appScreen === 'splash') {
    return <SplashScreen />
  }

  if (appScreen === 'loading') {
    return <LoadingScreen />
  }

  if (appScreen === 'settings') {
    return (
      <Settings
        onBack={() => handleNavigate('game')}
        soundEnabled={soundEnabled}
        onSoundToggle={setSoundEnabled}
        darkMode={darkMode}
        onDarkModeToggle={setDarkMode}
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
      />
    )
  }

  if (appScreen === 'about') {
    return <About onBack={() => handleNavigate('game')} />
  }

  return (
    <div className={styles.app}>
      <Menu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigate}
        onNewGame={handleNewGame}
      />

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Mancala</h1>
          <p>Kalah — Two-row capture game with AI</p>
        </div>
        <MenuButton onClick={() => setMenuOpen(!menuOpen)} />
      </header>

      <section className={styles.gameBoard}>
        <Board game={game} onPitClick={handlePitClick} />
      </section>

      <GameEndNotification
        winner={game.winner as 0 | 1 | null}
        humanPlayer={game.humanPlayer as 0 | 1}
        isVisible={game.isGameOver}
      />
    </div>
  )
}

function Board({
  game,
  onPitClick,
}: {
  game: ReturnType<typeof useGameState>
  onPitClick: (pit: number) => void
  isGameOver?: boolean
  winner?: 0 | 1 | null
}) {
  const board = game.gameState.board
  const player0Pits = board.slice(0, 6)
  const player0Store = board[6]
  const player1Pits = board.slice(7, 13)
  const player1Store = board[13]

  return (
    <div className={styles.board}>
      {/* AI Store (left endcap) */}
      <div
        className={`${styles.storeEndcap} ${
          game.isGameOver ? (game.winner === 1 ? styles.winner : styles.loser) : ''
        }`}
        title="AI's Store"
      >
        <span className={styles.label}>AI</span>
        <span className={styles.score}>{player1Store}</span>
      </div>

      {/* Center: Both pit rows */}
      <div className={styles.center}>
        {/* Player 1 (opponent/AI) pits - top row */}
        <div className={styles.pits}>
          {player1Pits.map((stones, idx) => {
            const pitIndex = 12 - idx // Reverse order for opponent
            const isValid = game.validMoves.includes(pitIndex)
            const isDisabled = !game.isHumanTurn || game.isGameOver
            return (
              <button
                key={pitIndex}
                className={`${styles.pit} ${isValid && !isDisabled ? styles.validMove : ''} ${isDisabled ? styles.disabled : ''}`}
                onClick={() => onPitClick(pitIndex)}
                disabled={isDisabled}
                title={`Pit ${pitIndex + 1} (${stones} stones)`}
              >
                <span className={styles.stones}>{stones}</span>
              </button>
            )
          })}
        </div>

        {/* Player 0 (human) pits - bottom row */}
        <div className={styles.pits}>
          {player0Pits.map((stones, idx) => {
            const pitIndex = idx
            const isValid = game.validMoves.includes(pitIndex)
            const isDisabled = !game.isHumanTurn || game.isGameOver
            return (
              <button
                key={pitIndex}
                className={`${styles.pit} ${isValid && !isDisabled ? styles.validMove : ''} ${isDisabled ? styles.disabled : ''}`}
                onClick={() => onPitClick(pitIndex)}
                disabled={isDisabled}
                title={`Pit ${pitIndex + 1} (${stones} stones)`}
              >
                <span className={styles.stones}>{stones}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Player Store (right endcap) */}
      <div
        className={`${styles.storeEndcap} ${
          game.isGameOver ? (game.winner === 0 ? styles.winner : styles.loser) : ''
        }`}
        title="Your Store"
      >
        <span className={styles.label}>You</span>
        <span className={styles.score}>{player0Store}</span>
      </div>
    </div>
  )
}
