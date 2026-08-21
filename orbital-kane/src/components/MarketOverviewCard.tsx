import { useState } from 'react'
import { MARKET_INSTRUMENTS } from '../data/market'
import './MarketOverviewCard.css'

function buildSparklinePoints(sparkline: number[]): string {
  const min = Math.min(...sparkline)
  const max = Math.max(...sparkline)
  const range = max - min || 1
  return sparkline
    .map((value, index) => {
      const x = (index / (sparkline.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')
}

function MarketOverviewCard() {
  const [hoverSymbol, setHoverSymbol] = useState<string | null>(null)

  return (
    <div className="market-overview-card">
      <div className="market-overview-header">
        <h2 className="market-overview-title">Market Overview</h2>
      </div>

      <ul className="market-overview-list">
        {MARKET_INSTRUMENTS.map((instrument) => {
          const isPositive = instrument.dayChangePercent >= 0
          const isHovered = hoverSymbol === instrument.symbol
          return (
            <li
              key={instrument.symbol}
              className={`market-row${isHovered ? ' hovered' : ''}`}
              onMouseEnter={() => setHoverSymbol(instrument.symbol)}
              onMouseLeave={() => setHoverSymbol(null)}
            >
              <span className="market-row-symbol">{instrument.symbol}</span>
              <span className="market-row-value">{instrument.value}</span>
              <span className={`market-row-change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '+' : ''}
                {instrument.dayChangePercent.toFixed(2)}%
              </span>
              <span className="market-row-sparkline">
                <svg
                  className="market-sparkline-svg"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points={buildSparklinePoints(instrument.sparkline)}
                    fill="none"
                    stroke={isPositive ? 'var(--positive)' : 'var(--negative)'}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default MarketOverviewCard
