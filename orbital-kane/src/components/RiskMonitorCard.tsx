import { useRef, useState } from 'react'
import { CONCENTRATION_WARNING, RISK_GAUGE_VALUE, RISK_METRICS, RISK_STATUS } from '../data/risk'
import RiskWarningPopover from './RiskWarningPopover'
import './RiskMonitorCard.css'

function RiskMonitorCard() {
  const [warningOpen, setWarningOpen] = useState(false)
  const [anchorRect, setAnchorRect] = useState<{ top: number; left: number; bottom: number } | null>(
    null,
  )
  const warningRef = useRef<HTMLButtonElement | null>(null)

  const handleToggleWarning = () => {
    if (warningOpen) {
      setWarningOpen(false)
      return
    }
    const el = warningRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      setAnchorRect({ top: rect.top, left: rect.left, bottom: rect.bottom })
    }
    setWarningOpen(true)
  }

  return (
    <div className="risk-monitor-card">
      <div className="risk-monitor-header">
        <h2 className="risk-monitor-title">Portfolio Risk</h2>
      </div>

      <div className="risk-gauge">
        <div className="risk-gauge-legend">
          <span>LOW</span>
          <span>MODERATE</span>
          <span>HIGH</span>
        </div>
        <div className="risk-gauge-track">
          <div className="risk-gauge-marker" style={{ left: `${RISK_GAUGE_VALUE}%` }} />
        </div>
        <div className="risk-gauge-readout">
          <span className="risk-gauge-value">{RISK_GAUGE_VALUE}</span>
          <span className="risk-gauge-status">{RISK_STATUS}</span>
        </div>
      </div>

      <ul className="risk-metrics">
        <li className="risk-metric">
          <span className="risk-metric-label">Volatility</span>
          <span className="risk-metric-value">{RISK_METRICS.volatility.toFixed(2)}%</span>
        </li>
        <li className="risk-metric">
          <span className="risk-metric-label">Sharpe</span>
          <span className="risk-metric-value">{RISK_METRICS.sharpe.toFixed(2)}</span>
        </li>
        <li className="risk-metric">
          <span className="risk-metric-label">Beta</span>
          <span className="risk-metric-value">{RISK_METRICS.beta.toFixed(2)}</span>
        </li>
        <li className="risk-metric">
          <span className="risk-metric-label">Max Drawdown</span>
          <span className="risk-metric-value negative">{RISK_METRICS.maxDrawdown.toFixed(2)}%</span>
        </li>
        <li className="risk-metric">
          <span className="risk-metric-label">VaR 95%</span>
          <span className="risk-metric-value negative">{RISK_METRICS.var95.toFixed(2)}%</span>
        </li>
      </ul>

      <button
        type="button"
        ref={warningRef}
        className="risk-warning-trigger"
        onClick={handleToggleWarning}
      >
        <span className="risk-warning-headline">{CONCENTRATION_WARNING.headline}</span>
        <span className="risk-warning-detail">{CONCENTRATION_WARNING.detail}</span>
      </button>

      {warningOpen && anchorRect && (
        <RiskWarningPopover anchorRect={anchorRect} onClose={() => setWarningOpen(false)} />
      )}
    </div>
  )
}

export default RiskMonitorCard
