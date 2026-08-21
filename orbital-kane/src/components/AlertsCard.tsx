import { useState } from 'react'
import { ALERTS } from '../data/alerts'
import './AlertsCard.css'

function AlertsCard() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggle = (id: string) => {
    setExpandedId((current) => (current === id ? null : id))
  }

  return (
    <div className="alerts-card">
      <div className="alerts-card-header">
        <h2 className="alerts-card-title">Alerts</h2>
      </div>

      <ul className="alerts-list">
        {ALERTS.map((alert) => {
          const isExpanded = expandedId === alert.id
          return (
            <li key={alert.id} className={`alert-row${isExpanded ? ' expanded' : ''}`}>
              <button
                type="button"
                className="alert-summary"
                onClick={() => handleToggle(alert.id)}
                aria-expanded={isExpanded}
              >
                <span className={`alert-severity ${alert.severity}`}>{alert.severity}</span>
                <span className="alert-title">{alert.title}</span>
                <span className="alert-timestamp">{alert.timestamp}</span>
              </button>
              {isExpanded && (
                <div className="alert-detail">
                  <p className="alert-detail-text">{alert.detail}</p>
                  {alert.dismissible && (
                    <button type="button" className="alert-dismiss">
                      Dismiss
                    </button>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default AlertsCard
