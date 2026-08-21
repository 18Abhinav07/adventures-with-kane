import { Card } from '../cards/Card'
import { SectionHeader } from '../cards/SectionHeader'
import { MiniSparkline } from '../charts/MiniSparkline'
import { getMarketInstruments } from '../../data/markets'
import { formatNumber, formatPercent } from '../../utils/format'
import styles from './MarketOverview.module.css'

export function MarketOverview() {
  const instruments = getMarketInstruments()

  return (
    <Card>
      <SectionHeader title="Markets" />
      <div className={styles.list}>
        {instruments.map((m) => {
          const tone = m.changePct >= 0 ? 'positive' : 'negative'
          return (
            <div key={m.symbol} className={styles.row}>
              <div className={styles.identity}>
                <span className={styles.symbol}>{m.symbol}</span>
                <span className={styles.name}>{m.name}</span>
              </div>
              <div className={styles.sparkWrap}>
                <MiniSparkline points={m.sparkline} tone={tone} />
              </div>
              <div className={styles.figures}>
                <span className={styles.value}>{formatNumber(m.value, m.value > 1000 ? 2 : 2)}</span>
                <span className={tone === 'positive' ? styles.positive : styles.negative}>
                  {formatPercent(m.changePct)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
