import type { Holding } from '../data/holdings'
import './SecurityPreviewPopover.css'

interface SecurityPreviewPopoverProps {
  holding: Holding
  anchorRect: { top: number; left: number; bottom: number; right: number; placement: 'below' | 'above' }
  onOpenSecurity: () => void
}

function SecurityPreviewPopover({ holding, anchorRect, onOpenSecurity }: SecurityPreviewPopoverProps) {
  const isPositive = holding.dayChangePercent >= 0
  const positionStyle =
    anchorRect.placement === 'above'
      ? { bottom: window.innerHeight - anchorRect.top + 8, left: anchorRect.left }
      : { top: anchorRect.bottom + 8, left: anchorRect.left }

  return (
    <div
      className="security-preview-popover"
      style={positionStyle}
      role="dialog"
      aria-label={`${holding.ticker} security preview`}
    >
      <div className="preview-header">
        <div className="preview-ticker-block">
          <span className="preview-ticker">{holding.ticker}</span>
          <span className="preview-company">{holding.company}</span>
        </div>
        <div className="preview-price-block">
          <span className="preview-price">${holding.price.toFixed(2)}</span>
          <span className={`preview-move ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}
            {holding.dayChangePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="preview-stats">
        <div className="preview-stat">
          <span className="preview-stat-label">Market Cap</span>
          <span className="preview-stat-value">{holding.marketCap}</span>
        </div>
        <div className="preview-stat">
          <span className="preview-stat-label">P/E</span>
          <span className="preview-stat-value">{holding.peRatio.toFixed(2)}</span>
        </div>
        <div className="preview-stat">
          <span className="preview-stat-label">52W Range</span>
          <span className="preview-stat-value">
            ${holding.week52Low.toFixed(2)} – ${holding.week52High.toFixed(2)}
          </span>
        </div>
      </div>

      <button type="button" className="preview-open-security" onClick={onOpenSecurity}>
        OPEN SECURITY →
      </button>
    </div>
  )
}

export default SecurityPreviewPopover
