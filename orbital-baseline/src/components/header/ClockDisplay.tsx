import { useEffect, useState } from 'react'
import styles from './ClockDisplay.module.css'

function formatUtc(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, '0')
  const m = String(date.getUTCMinutes()).padStart(2, '0')
  const s = String(date.getUTCSeconds()).padStart(2, '0')
  return `UTC ${h}:${m}:${s}`
}

export function ClockDisplay() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <span className={styles.clock} aria-label={`Current UTC time ${formatUtc(now)}`}>
      {formatUtc(now)}
    </span>
  )
}
