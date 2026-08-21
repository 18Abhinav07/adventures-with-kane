import { useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card } from '../cards/Card'
import { SectionHeader } from '../cards/SectionHeader'
import { RiskGauge } from './RiskGauge'
import { RiskWarningPopover } from './RiskWarningPopover'
import { useAppState } from '../../hooks/useAppState'
import { getRiskSummary } from '../../data/risk'
import styles from './RiskMonitor.module.css'

export function RiskMonitor() {
  const { state, dispatch } = useAppState()
  const risk = getRiskSummary()
  const warningRef = useRef<HTMLButtonElement>(null)

  return (
    <Card>
      <SectionHeader title="Portfolio Risk" />

      <div className={styles.gaugeBlock}>
        <RiskGauge value={risk.score} />
        <div className={styles.gaugeMeta}>
          <span className={styles.gaugeValue}>{risk.score}</span>
          <span className={styles.gaugeStatus}>{risk.status}</span>
        </div>
      </div>

      <dl className={styles.metricList}>
        {risk.metrics.map((m) => (
          <div key={m.label} className={styles.metricRow}>
            <dt className={styles.metricLabel}>{m.label}</dt>
            <dd className={styles.metricValue}>{m.value}</dd>
          </div>
        ))}
      </dl>

      <button
        ref={warningRef}
        type="button"
        className={styles.warning}
        onClick={() => dispatch({ type: 'OPEN_RISK_WARNING' })}
      >
        <AlertTriangle size={14} className={styles.warningIcon} />
        <span className={styles.warningText}>
          <strong>Risk concentration detected</strong>
          <span>{risk.warning.summary}</span>
        </span>
      </button>

      <RiskWarningPopover open={state.riskWarningOpen} anchorRef={warningRef} warning={risk.warning} />
    </Card>
  )
}
