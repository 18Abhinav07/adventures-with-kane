import { X } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { Modal } from '../overlays/Modal'
import { useAppState } from '../../hooks/useAppState'
import { getSecurities } from '../../data/securities'
import { formatCurrency, formatCurrencyCompact, formatPercent, formatPercentUnsigned } from '../../utils/format'
import { Badge } from '../cards/Badge'
import styles from './SecurityModal.module.css'

const CONSENSUS_TONE = {
  BUY: 'positive',
  HOLD: 'warning',
  SELL: 'negative',
} as const

export function SecurityModal() {
  const { state, dispatch } = useAppState()
  const ticker = state.modalSecurity
  const security = ticker ? getSecurities()[ticker] : null

  return (
    <Modal open={Boolean(security)} onClose={() => dispatch({ type: 'CLOSE_SECURITY_MODAL' })} labelledBy="security-modal-title">
      {security && (
        <>
          <div className={styles.header}>
            <div>
              <h2 id="security-modal-title" className={styles.title}>
                {security.name}
                <span className={styles.ticker}>{security.ticker}</span>
              </h2>
              <div className={styles.priceRow}>
                <span className={styles.price}>{formatCurrency(security.price)}</span>
                <span className={security.changePct >= 0 ? styles.positive : styles.negative}>
                  {formatPercent(security.changePct)}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={styles.close}
              aria-label="Close security detail"
              onClick={() => dispatch({ type: 'CLOSE_SECURITY_MODAL' })}
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={security.chart} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Line
                  type="monotone"
                  dataKey="portfolioValue"
                  stroke="var(--color-information)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.grid}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Fundamentals</h3>
              <div className={styles.fundGrid}>
                <div className={styles.fundItem}>
                  <span className={styles.fundLabel}>Market Cap</span>
                  <span className={styles.fundValue}>{formatCurrencyCompact(security.fundamentals.marketCap)}</span>
                </div>
                <div className={styles.fundItem}>
                  <span className={styles.fundLabel}>P/E Ratio</span>
                  <span className={styles.fundValue}>{security.fundamentals.peRatio.toFixed(2)}</span>
                </div>
                <div className={styles.fundItem}>
                  <span className={styles.fundLabel}>EPS</span>
                  <span className={styles.fundValue}>{formatCurrency(security.fundamentals.eps)}</span>
                </div>
                <div className={styles.fundItem}>
                  <span className={styles.fundLabel}>Dividend Yield</span>
                  <span className={styles.fundValue}>{formatPercentUnsigned(security.fundamentals.dividendYield)}</span>
                </div>
                <div className={styles.fundItem}>
                  <span className={styles.fundLabel}>52 Week Range</span>
                  <span className={styles.fundValue}>
                    {formatCurrency(security.fundamentals.week52Low)} — {formatCurrency(security.fundamentals.week52High)}
                  </span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Analyst Consensus</h3>
              <div className={styles.consensusRow}>
                <Badge tone={CONSENSUS_TONE[security.analystConsensus]}>{security.analystConsensus}</Badge>
                <span className={styles.targetLabel}>Target</span>
                <span className={styles.fundValue}>{formatCurrency(security.analystTargetPrice)}</span>
              </div>
            </section>

            <section className={[styles.section, styles.newsSection].join(' ')}>
              <h3 className={styles.sectionTitle}>Recent News</h3>
              <ul className={styles.newsList}>
                {security.news.map((n) => (
                  <li key={n.headline} className={styles.newsItem}>
                    <span className={styles.newsHeadline}>{n.headline}</span>
                    <span className={styles.newsMeta}>
                      {n.source} · {n.timestamp}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </Modal>
  )
}
