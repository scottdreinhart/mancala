import CloseIcon from './CloseIcon'
import styles from './Menu.module.css'
import MenuIcon from './MenuIcon'

interface MenuProps {
  onClose: () => void
  onNavigate: (screen: 'game' | 'settings' | 'about') => void
  onNewGame: () => void
  isOpen: boolean
}

export default function Menu({ onClose, onNavigate, onNewGame, isOpen }: MenuProps) {
  const handleNavigate = (screen: 'game' | 'settings' | 'about') => {
    onNavigate(screen)
    onClose()
  }

  const handleNewGame = () => {
    onNewGame()
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={onClose} aria-hidden="true" />}

      {/* Menu Drawer */}
      <nav className={`${styles.menu} ${isOpen ? styles.open : ''}`} role="navigation">
        <div className={styles.header}>
          <h2>Menu</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close menu"
            title="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <ul className={styles.navList}>
          <li>
            <button
              className={styles.navItem}
              onClick={() => handleNavigate('game')}
              aria-label="Back to game"
            >
              <span className={styles.icon}>🎮</span>
              <span>Game</span>
            </button>
          </li>
          <li>
            <button
              className={styles.navItem}
              onClick={handleNewGame}
              aria-label="Start new game"
            >
              <span className={styles.icon}>🔄</span>
              <span>New Game</span>
            </button>
          </li>
          <li>
            <button
              className={styles.navItem}
              onClick={() => handleNavigate('settings')}
              aria-label="Open settings"
            >
              <span className={styles.icon}>⚙️</span>
              <span>Settings</span>
            </button>
          </li>
          <li>
            <button
              className={styles.navItem}
              onClick={() => handleNavigate('about')}
              aria-label="Open about"
            >
              <span className={styles.icon}>ℹ️</span>
              <span>About</span>
            </button>
          </li>
        </ul>

        <div className={styles.footer}>
          <p className={styles.version}>Mancala v1.0.0</p>
          <p className={styles.subtitle}>Kalah × AI</p>
        </div>
      </nav>
    </>
  )
}

export function MenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.menuButton} onClick={onClick} aria-label="Open menu" title="Menu">
      <MenuIcon />
    </button>
  )
}
