import { X, ChevronDown } from 'lucide-react'
import { Card } from '../cards/Card'
import { SectionHeader } from '../cards/SectionHeader'
import { Badge } from '../cards/Badge'
import { useAppState } from '../../hooks/useAppState'
import { getAlerts } from '../../data/alerts'
import type { AlertSeverity } from '../../types'
import styles from './AlertsPanel.module.css'

const SEVERITY_TONE: Record<AlertSeverity, 'negative' | 'warning' | 'information'> = {
  critical: 'negative',
  warning: 'warning',
  info: 'information',
}

export function AlertsPanel() {
  const { state, dispatch } = useAppState()
  const alerts = getAlerts().filter((a) => !state.dismissedAlerts.includes(a.id))

  return (
    <Card padded={false}>
      <div className={styles.headerWrap}>
        <SectionHeader title="Alerts" />
      </div>
      <ul className={styles.list}>
        {alerts.map((a) => {
          const expanded = state.expandedAlert === a.id
          return (
            <li key={a.id} className={styles.item}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={expanded}
                onClick={() => dispatch({ type: 'TOGGLE_ALERT', id: a.id })}
              >
                <Badge tone={SEVERITY_TONE[a.severity]}>{a.severity.toUpperCase()}</Badge>
                <span className={styles.title}>{a.title}</span>
                <span className={styles.timestamp}>{a.timestamp}</span>
                <ChevronDown size={14} className={expanded ? styles.chevronOpen : styles.chevron} />
              </button>

              {expanded && (
                <div className={styles.body}>
                  <p className={styles.description}>{a.description}</p>
                  {a.dismissible && (
                    <button
                      type="button"
                      className={styles.dismiss}
                      onClick={() => dispatch({ type: 'DISMISS_ALERT', id: a.id })}
                    >
                      <X size={12} />
                      Dismiss
                    </button>
                  )}
                </div>
              )}
            </li>
          )
        })}
        {alerts.length === 0 && <li className={styles.empty}>No active alerts.</li>}
      </ul>
    </Card>
  )
}
