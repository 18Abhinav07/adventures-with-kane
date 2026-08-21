import type { PerformancePoint } from '../../types'
import { formatCurrency, formatPercent } from '../../utils/format'
import styles from './PerformanceTooltip.module.css'

interface PerformanceTooltipProps {
  point: PerformancePoint
  showBenchmark: boolean
  locked: boolean
  style?: React.CSSProperties
}

export function PerformanceTooltip({ point, showBenchmark, locked, style }: PerformanceTooltipProps) {
  return (
    <div className={styles.tooltip} style={style} role="status">
      <div className={styles.header}>
        <span>{point.label}</span>
        {locked && <span className={styles.lockIcon} aria-label="Selection locked">🔒</span>}
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Portfolio</span>
        <span className={styles.value}>{formatCurrency(point.portfolioValue, 0)}</span>
        <span className={styles.positive}>{formatPercent(point.portfolioReturnPct)}</span>
      </div>

      {showBenchmark && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Benchmark</span>
          <span className={styles.secondaryValue}>{formatPercent(point.benchmarkReturnPct)}</span>
        </div>
      )}
    </div>
  )
}
