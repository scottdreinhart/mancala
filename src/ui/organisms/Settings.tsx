import { useThemeContext } from '@/app'
import type { Difficulty } from '@/domain'
import { COLOR_THEMES } from '@/domain/themes'
import styles from './Settings.module.css'

const formatThemeLabel = (themeId: string): string =>
  themeId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

interface SettingsProps {
  onBack: () => void
  soundEnabled: boolean
  onSoundToggle: (enabled: boolean) => void
  darkMode: boolean
  onDarkModeToggle: (enabled: boolean) => void
  difficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
}

export default function Settings({
  onBack,
  soundEnabled,
  onSoundToggle,
  darkMode,
  onDarkModeToggle,
  difficulty,
  onDifficultyChange,
}: SettingsProps) {
  const { colorTheme, setColorTheme } = useThemeContext()

  return (
    <div className={styles.settings}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBack} aria-label="Back">
          ← Back
        </button>
        <h1>Settings</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Audio</h2>
          <div className={styles.setting}>
            <label htmlFor="sound-toggle">Sound Effects</label>
            <button
              id="sound-toggle"
              className={`${styles.toggle} ${soundEnabled ? styles.on : ''}`}
              onClick={() => onSoundToggle(!soundEnabled)}
              role="switch"
              aria-checked={soundEnabled}
              aria-label="Toggle sound effects"
            >
              <span className={styles.toggleCircle} />
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Display</h2>
          <div className={styles.setting}>
            <label htmlFor="dark-mode-toggle">Dark Mode</label>
            <button
              id="dark-mode-toggle"
              className={`${styles.toggle} ${darkMode ? styles.on : ''}`}
              onClick={() => onDarkModeToggle(!darkMode)}
              role="switch"
              aria-checked={darkMode}
              aria-label="Toggle dark mode"
            >
              <span className={styles.toggleCircle} />
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Theme</h2>
          <div className={styles.setting}>
            <label htmlFor="theme-select">Board Theme:</label>
            <select
              id="theme-select"
              value={colorTheme}
              onChange={(e) => setColorTheme(e.target.value as (typeof COLOR_THEMES)[number])}
              className={styles.select}
            >
              {COLOR_THEMES.map((theme) => (
                <option key={theme} value={theme}>
                  {formatThemeLabel(theme)}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Difficulty</h2>
          <div className={styles.setting}>
            <label htmlFor="difficulty-select">AI Difficulty:</label>
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
              className={styles.select}
            >
              <option value="veryEasy">Very Easy</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="mediumHard">Medium Hard</option>
              <option value="hard">Hard</option>
              <option value="veryHard">Very Hard</option>
            </select>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Game Rules</h2>
          <div className={styles.rulesBox}>
            <h3>Kalah Overview</h3>
            <ul>
              <li>2×6 board with 2 stores (one per player)</li>
              <li>Each pit starts with 4 stones</li>
              <li>Sow seeds counterclockwise</li>
              <li>Bonus turn if you land in your store</li>
              <li>Capture opponent&apos;s stones if you land empty</li>
              <li>Game ends when one side empties</li>
              <li>Winner: Most stones in store</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
