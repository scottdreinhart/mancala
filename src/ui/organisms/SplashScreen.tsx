import styles from './SplashScreen.module.css'

export default function SplashScreen() {
  return (
    <div className={styles.splash}>
      <div className={styles.container}>
        <div className={styles.logo}>
          {/* Animated Mancala board logo */}
          <div className={styles.board}>
            {/* Top row (opponent) */}
            <div className={`${styles.pit} ${styles.pit1}`} />
            <div className={`${styles.pit} ${styles.pit2}`} />
            <div className={`${styles.pit} ${styles.pit3}`} />
            <div className={`${styles.pit} ${styles.pit4}`} />
            <div className={`${styles.pit} ${styles.pit5}`} />
            <div className={`${styles.pit} ${styles.pit6}`} />
          </div>
          <div className={styles.board}>
            {/* Bottom row (player) */}
            <div className={`${styles.pit} ${styles.pit7}`} />
            <div className={`${styles.pit} ${styles.pit8}`} />
            <div className={`${styles.pit} ${styles.pit9}`} />
            <div className={`${styles.pit} ${styles.pit10}`} />
            <div className={`${styles.pit} ${styles.pit11}`} />
            <div className={`${styles.pit} ${styles.pit12}`} />
          </div>
        </div>

        <div className={styles.title}>
          <h1 className={styles.mainTitle}>Mancala</h1>
          <p className={styles.subtitle}>Kalah × AI</p>
        </div>

        <div className={styles.pulse} />
      </div>
    </div>
  )
}
