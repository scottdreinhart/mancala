import styles from './About.module.css'

interface AboutProps {
  onBack: () => void
}

export default function About({ onBack }: AboutProps) {
  return (
    <div className={styles.about}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBack} aria-label="Back">
          ← Back
        </button>
        <h1>About</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.logo}>
          <div className={styles.logoBoard}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={`top-${i}`} className={styles.logoPit} />
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={`bot-${i}`} className={styles.logoPit} />
            ))}
          </div>
        </div>

        <h2>Mancala</h2>
        <p className={styles.subtitle}>Kalah × AI</p>

        <div className={styles.section}>
          <h3>Game Description</h3>
          <p>
            Mancala is an ancient family of board games played around the world. This implementation
            features the Kalah variant with competitive AI opponents at multiple difficulty levels.
            The goal is to capture more stones in your store than your opponent.
          </p>
        </div>

        <div className={styles.section}>
          <h3>How to Play</h3>
          <ul>
            <li>Choose a pit on your side and sow seeds counter-clockwise</li>
            <li>Land in your store for an extra turn</li>
            <li>Land in an empty pit to capture opposite stones</li>
            <li>Collect remaining stones when one side is empty</li>
            <li>Highest store score wins</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3>Features</h3>
          <ul>
            <li>🎮 6 AI difficulty tiers (Very Easy to Very Hard)</li>
            <li>⚡ WebAssembly-accelerated minimax search</li>
            <li>🎨 Dark theme with smooth animations</li>
            <li>📱 Responsive mobile design</li>
            <li>🎛️ Customizable game settings</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3>Technology</h3>
          <p>
            Built with <strong>React 19</strong>, <strong>TypeScript</strong>, <strong>Vite</strong>
            , and <strong>WebAssembly</strong> for optimal performance.
          </p>
        </div>

        <div className={styles.section}>
          <h3>Credits</h3>
          <p>
            Game design inspired by traditional Mancala family of games. AI engine uses minimax
            algorithm with alpha-beta pruning and move ordering.
          </p>
        </div>

        <div className={styles.footer}>
          <p>Version 1.0.0</p>
          <p>© 2026 All Rights Reserved</p>
        </div>
      </div>
    </div>
  )
}
