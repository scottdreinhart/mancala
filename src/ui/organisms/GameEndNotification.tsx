import { useSoundEffects } from '@/app'
import { useEffect } from 'react'
import styles from './GameEndNotification.module.css'

export interface GameEndNotificationProps {
  winner: 0 | 1 | null // 0 = human, 1 = AI, null = draw
  humanPlayer: 0 | 1
  isVisible: boolean
  onComplete?: () => void
}

export default function GameEndNotification({
  winner,
  humanPlayer,
  isVisible,
  onComplete,
}: GameEndNotificationProps) {
  const sounds = useSoundEffects()

  useEffect(() => {
    if (!isVisible) {
      return
    }

    // Play sound when game ends
    if (winner === null) {
      sounds.onConfirm()
    } else if (winner === humanPlayer) {
      sounds.onWin()
    } else {
      sounds.onLose()
    }
  }, [isVisible, winner, humanPlayer, sounds])

  if (!isVisible) {
    return null
  }

  let text = ''
  let outcomeClass = styles.draw

  if (winner === null) {
    text = 'DRAW!'
    outcomeClass = styles.draw
  } else if (winner === humanPlayer) {
    text = 'YOU WIN!'
    outcomeClass = styles.win
  } else {
    text = 'YOU LOSE!'
    outcomeClass = styles.loss
  }

  return (
    <div
      className={`${styles.root} ${outcomeClass}`}
      onAnimationEnd={onComplete}
      role="status"
      aria-live="assertive"
    >
      <span className={styles.text}>{text}</span>
    </div>
  )
}
