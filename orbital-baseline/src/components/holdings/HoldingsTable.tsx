import { useRef, type RefObject } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { getHoldings } from '../../data/holdings'
import { formatCurrency, formatPercent, formatSignedCurrency } from '../../utils/format'
import { SectionHeader } from '../cards/SectionHeader'
import { Skeleton } from '../feedback/Skeleton'
import { SecurityPreviewPopover } from './SecurityPreviewPopover'
import styles from './HoldingsTable.module.css'

function tickerColor(ticker: string): string {
  const hues = ['var(--color-information)', 'var(--color-positive)', 'var(--color-warning)', 'var(--color-neutral)']
  const idx = ticker.charCodeAt(0) % hues.length
  return hues[idx]
}

export function HoldingsTable() {
  const { state, dispatch } = useAppState()
  const holdings = getHoldings()
  const rowRefs = useRef<Map<string, RefObject<HTMLButtonElement>>>(new Map())

  function getRowRef(ticker: string): RefObject<HTMLButtonElement> {
    let ref = rowRefs.current.get(ticker)
    if (!ref) {
      ref = { current: null }
      rowRefs.current.set(ticker, ref)
    }
    return ref
  }

  return (
    <div className={styles.card}>
      <SectionHeader
        title="Top Holdings"
        right={
          <button type="button" className={styles.viewAll}>
            View all →
          </button>
        }
      />

      {state.loading ? (
        <div className={styles.skeletonList}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={32} radius={4} />
          ))}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <div className={[styles.row, styles.headRow].join(' ')}>
            <span className={styles.colAsset}>ASSET</span>
            <span className={styles.colNum}>PRICE</span>
            <span className={styles.colNum}>DAY</span>
            <span className={styles.colNum}>POSITION</span>
            <span className={styles.colNum}>WEIGHT</span>
            <span className={styles.colNum}>P&amp;L</span>
          </div>

          {holdings.map((h) => (
            <div key={h.ticker} className={styles.row}>
              <button
                ref={getRowRef(h.ticker)}
                type="button"
                className={styles.assetButton}
                onMouseEnter={() => dispatch({ type: 'OPEN_SECURITY_PREVIEW', ticker: h.ticker })}
                onMouseLeave={() => dispatch({ type: 'CLOSE_SECURITY_PREVIEW' })}
                onFocus={() => dispatch({ type: 'OPEN_SECURITY_PREVIEW', ticker: h.ticker })}
                onBlur={() => dispatch({ type: 'CLOSE_SECURITY_PREVIEW' })}
              >
                <span className={styles.tickerIcon} style={{ background: tickerColor(h.ticker) }} aria-hidden="true">
                  {h.ticker[0]}
                </span>
                <span className={styles.assetText}>
                  <span className={styles.ticker}>{h.ticker}</span>
                  <span className={styles.name}>{h.name}</span>
                </span>
              </button>

              <SecurityPreviewPopover ticker={h.ticker} anchorRef={getRowRef(h.ticker)} />

              <span className={styles.colNum}>{formatCurrency(h.price)}</span>
              <span className={[styles.colNum, h.dayChangePct >= 0 ? styles.positive : styles.negative].join(' ')}>
                {formatPercent(h.dayChangePct)}
              </span>
              <span className={styles.colNum}>{formatCurrency(h.position, 0)}</span>
              <span className={styles.colNum}>{h.weight.toFixed(1)}%</span>
              <span className={[styles.colNum, styles.negative].join(' ')}>{formatSignedCurrency(h.pnl, 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
