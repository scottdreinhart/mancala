import styles from './LoadingScreen.module.css'

export default function LoadingScreen() {
  return (
    <div className={styles.loading}>
      <div className={styles.container}>
        <div className={styles.spinner}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={styles.spinnerSegment}
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        <div className={styles.text}>
          <p className={styles.loadingText}>Loading Game</p>
          <div className={styles.dots}>
            <span className={styles.dot} style={{ animationDelay: '0s' }} />
            <span className={styles.dot} style={{ animationDelay: '0.3s' }} />
            <span className={styles.dot} style={{ animationDelay: '0.6s' }} />
          </div>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progress} />
        </div>
      </div>
    </div>
  )
}
