import { useEffect } from 'react'
import type { Holding } from '../data/holdings'
import './SecurityModal.css'

interface SecurityModalProps {
  holding: Holding
  onClose: () => void
}

function SecurityModal({ holding, onClose }: SecurityModalProps) {
  const isPositive = holding.dayChangePercent >= 0

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const chartMin = Math.min(...holding.chart)
  const chartMax = Math.max(...holding.chart)
  const chartRange = chartMax - chartMin || 1
  const points = holding.chart
    .map((value, index) => {
      const x = (index / (holding.chart.length - 1)) * 100
      const y = 100 - ((value - chartMin) / chartRange) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="security-modal-backdrop" onClick={onClose}>
      <div
        className="security-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${holding.ticker} security detail`}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="security-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="security-modal-header">
          <div className="security-modal-title-block">
            <h2 className="security-modal-name">{holding.company}</h2>
            <span className="security-modal-ticker">{holding.ticker}</span>
          </div>
          <div className="security-modal-price-block">
            <span className="security-modal-price">${holding.price.toFixed(2)}</span>
            <span className={`security-modal-move ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}
              {holding.dayChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="security-modal-chart">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={points}
              fill="none"
              stroke={isPositive ? 'var(--positive)' : 'var(--negative)'}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="security-modal-body">
          <div className="security-modal-section">
            <h3 className="security-modal-section-title">Fundamentals</h3>
            <div className="security-modal-stat-grid">
              <div className="security-modal-stat">
                <span className="stat-label">Market Cap</span>
                <span className="stat-value">{holding.marketCap}</span>
              </div>
              <div className="security-modal-stat">
                <span className="stat-label">P/E</span>
                <span className="stat-value">{holding.peRatio.toFixed(2)}</span>
              </div>
              <div className="security-modal-stat">
                <span className="stat-label">EPS</span>
                <span className="stat-value">${holding.eps.toFixed(2)}</span>
              </div>
              <div className="security-modal-stat">
                <span className="stat-label">Div Yield</span>
                <span className="stat-value">{holding.divYield}</span>
              </div>
              <div className="security-modal-stat">
                <span className="stat-label">52W Range</span>
                <span className="stat-value">
                  ${holding.week52Low.toFixed(2)} – ${holding.week52High.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="security-modal-section">
            <h3 className="security-modal-section-title">Analyst Consensus</h3>
            <div className="security-modal-consensus">
              <span className="consensus-rating">{holding.analystConsensus}</span>
              <span className="consensus-score">{holding.analystScore.toFixed(1)} / 5</span>
            </div>
          </div>

          <div className="security-modal-section">
            <h3 className="security-modal-section-title">Recent News</h3>
            <ul className="security-modal-news">
              {holding.news.map((item) => (
                <li key={item.headline} className="security-modal-news-item">
                  <span className="news-headline">{item.headline}</span>
                  <span className="news-meta">
                    {item.source} · {item.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityModal
