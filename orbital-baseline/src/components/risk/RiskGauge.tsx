import styles from './RiskGauge.module.css'

export function RiskGauge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value))

  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div className={styles.zoneLow} />
        <div className={styles.zoneModerate} />
        <div className={styles.zoneHigh} />
      </div>
      <div className={styles.needle} style={{ left: `${pct}%` }} aria-hidden="true" />
      <div className={styles.labels}>
        <span>LOW</span>
        <span>MODERATE</span>
        <span>HIGH</span>
      </div>
    </div>
  )
}
