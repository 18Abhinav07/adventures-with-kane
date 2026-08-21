import { Wallet, Zap, Target, Gauge } from 'lucide-react'
import { useAppState } from '../../hooks/useAppState'
import { useCountUp } from '../../hooks/useCountUp'
import { getPortfolioSummary } from '../../data/summary'
import { createRng, rngRange } from '../../utils/rng'
import { formatCurrency, formatPercent, formatSignedCurrency } from '../../utils/format'
import { MiniSparkline } from '../charts/MiniSparkline'
import { Skeleton } from '../feedback/Skeleton'
import styles from './PortfolioSummarySection.module.css'

function buildTrend(seed: number, positive: boolean): number[] {
  const rng = createRng(seed)
  const points: number[] = []
  let v = 100
  for (let i = 0; i < 10; i++) {
    v += (positive ? 1 : -1) * rngRange(rng, 0.2, 1.6)
    points.push(v)
  }
  return points
}

export function PortfolioSummarySection() {
  const { state } = useAppState()
  const summary = getPortfolioSummary()
  const loading = state.loading

  const totalValue = useCountUp(summary.totalValue, !loading)
  const todayAbs = useCountUp(summary.todayChangeAbs, !loading)
  const ytdReturn = useCountUp(summary.ytdReturnPct, !loading)
  const riskScore = useCountUp(summary.riskScore, !loading)

  if (loading) {
    return (
      <div className={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.card}>
            <Skeleton width={90} height={10} />
            <Skeleton width={140} height={28} style={{ marginTop: 10 }} />
            <Skeleton width={100} height={12} style={{ marginTop: 8 }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.top}>
          <span className={styles.label}>TOTAL PORTFOLIO</span>
          <Wallet size={14} className={styles.icon} aria-hidden="true" />
        </div>
        <span className={styles.hero}>{formatCurrency(totalValue)}</span>
        <div className={styles.footRow}>
          <span className={styles.positive}>
            {formatSignedCurrency(summary.totalChangeAbs)} · {formatPercent(summary.totalChangePct)}
          </span>
          <MiniSparkline points={buildTrend(1, true)} tone="positive" />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.top}>
          <span className={styles.label}>TODAY</span>
          <Zap size={14} className={styles.icon} aria-hidden="true" />
        </div>
        <span className={styles.hero}>{formatSignedCurrency(todayAbs)}</span>
        <div className={styles.footRow}>
          <span className={styles.positive}>{formatPercent(summary.todayChangePct)}</span>
          <MiniSparkline points={buildTrend(2, true)} tone="positive" />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.top}>
          <span className={styles.label}>YTD RETURN</span>
          <Target size={14} className={styles.icon} aria-hidden="true" />
        </div>
        <span className={styles.hero}>{formatPercent(ytdReturn)}</span>
        <div className={styles.footRow}>
          <span className={styles.secondary}>vs benchmark {formatPercent(summary.ytdBenchmarkPct)}</span>
          <MiniSparkline points={buildTrend(3, true)} tone="positive" />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.top}>
          <span className={styles.label}>RISK SCORE</span>
          <Gauge size={14} className={styles.icon} aria-hidden="true" />
        </div>
        <span className={styles.hero}>
          {Math.round(riskScore)}
          <span className={styles.heroSuffix}> / 100</span>
        </span>
        <div className={styles.footRow}>
          <span className={styles.warning}>{summary.riskStatus}</span>
          <MiniSparkline points={buildTrend(4, false)} tone="neutral" />
        </div>
      </div>
    </div>
  )
}
