import { useRef, useState } from 'react'
import { HOLDINGS, getHolding } from '../data/holdings'
import SecurityPreviewPopover from './SecurityPreviewPopover'
import SecurityModal from './SecurityModal'
import './HoldingsCard.css'

interface AnchorRect {
  top: number
  left: number
  bottom: number
  right: number
  placement: 'below' | 'above'
}

const ESTIMATED_POPOVER_HEIGHT = 200

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function HoldingsCard() {
  const [hoverTicker, setHoverTicker] = useState<string | null>(null)
  const [activeTicker, setActiveTicker] = useState<string | null>(null)
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null)
  const [modalTicker, setModalTicker] = useState<string | null>(null)
  const tickerRefs = useRef<Record<string, HTMLSpanElement | null>>({})

  const previewTicker = activeTicker ?? hoverTicker
  const previewHolding = previewTicker ? getHolding(previewTicker) : undefined
  const modalHolding = modalTicker ? getHolding(modalTicker) : undefined

  const measureAnchor = (ticker: string) => {
    const el = tickerRefs.current[ticker]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const fitsBelow = rect.bottom + ESTIMATED_POPOVER_HEIGHT + 8 <= window.innerHeight
    setAnchorRect({
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      placement: fitsBelow ? 'below' : 'above',
    })
  }

  const handleMouseEnter = (ticker: string) => {
    if (activeTicker) return
    setHoverTicker(ticker)
    measureAnchor(ticker)
  }

  const handleMouseLeave = () => {
    setHoverTicker(null)
  }

  const handleActivate = (ticker: string) => {
    setActiveTicker((current) => (current === ticker ? null : ticker))
    setHoverTicker(null)
    measureAnchor(ticker)
  }

  const handleOpenSecurity = () => {
    if (!previewTicker) return
    setModalTicker(previewTicker)
    setActiveTicker(null)
    setHoverTicker(null)
  }

  const handleCloseModal = () => {
    setModalTicker(null)
  }

  return (
    <div className="holdings-card">
      <div className="holdings-card-header">
        <h2 className="holdings-card-title">Top Holdings</h2>
        <button type="button" className="holdings-view-all">
          View all →
        </button>
      </div>

      <table className="holdings-table">
        <thead>
          <tr>
            <th className="col-asset">ASSET</th>
            <th className="col-price">PRICE</th>
            <th className="col-day">DAY</th>
            <th className="col-position">POSITION</th>
            <th className="col-weight">WEIGHT</th>
            <th className="col-pnl">P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {HOLDINGS.map((holding) => {
            const isPositiveDay = holding.dayChangePercent >= 0
            const isPositivePnl = holding.pnlPercent >= 0
            return (
              <tr key={holding.ticker} className="holdings-row">
                <td className="col-asset">
                  <div className="asset-cell">
                    <span className="asset-icon">{holding.ticker.slice(0, 1)}</span>
                    <div className="asset-names">
                      <span
                        ref={(el) => {
                          tickerRefs.current[holding.ticker] = el
                        }}
                        className="asset-ticker"
                        onMouseEnter={() => handleMouseEnter(holding.ticker)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleActivate(holding.ticker)}
                      >
                        {holding.ticker}
                      </span>
                      <span className="asset-company">{holding.company}</span>
                    </div>
                  </div>
                </td>
                <td className="col-price">${holding.price.toFixed(2)}</td>
                <td className={`col-day ${isPositiveDay ? 'positive' : 'negative'}`}>
                  {formatPercent(holding.dayChangePercent)}
                </td>
                <td className="col-position">{formatCurrency(holding.positionValue)}</td>
                <td className="col-weight">{holding.weightPercent.toFixed(2)}%</td>
                <td className={`col-pnl ${isPositivePnl ? 'positive' : 'negative'}`}>
                  {formatPercent(holding.pnlPercent)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {previewHolding && anchorRect && (
        <SecurityPreviewPopover
          holding={previewHolding}
          anchorRect={anchorRect}
          onOpenSecurity={handleOpenSecurity}
        />
      )}

      {modalHolding && <SecurityModal holding={modalHolding} onClose={handleCloseModal} />}
    </div>
  )
}

export default HoldingsCard
