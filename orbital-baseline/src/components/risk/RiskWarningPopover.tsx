import type { RefObject } from 'react'
import { Popover } from '../overlays/Popover'
import { useAppState } from '../../hooks/useAppState'
import { formatPercentUnsigned } from '../../utils/format'
import type { RiskWarning } from '../../types'
import styles from './RiskWarningPopover.module.css'

export function RiskWarningPopover({
  open,
  anchorRef,
  warning,
}: {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  warning: RiskWarning
}) {
  const { dispatch } = useAppState()

  return (
    <Popover open={open} anchorRef={anchorRef} onClose={() => dispatch({ type: 'CLOSE_RISK_WARNING' })} width={280}>
      <div className={styles.title}>{warning.title}</div>
      <p className={styles.summary}>{warning.summary}</p>

      <div className={styles.statGrid}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Current</span>
          <span className={styles.statValue}>{formatPercentUnsigned(warning.currentAllocationPct)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Target</span>
          <span className={styles.statValue}>{formatPercentUnsigned(warning.targetPct)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Deviation</span>
          <span className={[styles.statValue, styles.deviation].join(' ')}>
            +{formatPercentUnsigned(warning.deviationPct)}
          </span>
        </div>
      </div>

      <div className={styles.action}>
        <span className={styles.actionLabel}>Recommended Action</span>
        <span className={styles.actionValue}>{warning.recommendedAction}</span>
      </div>
    </Popover>
  )
}
