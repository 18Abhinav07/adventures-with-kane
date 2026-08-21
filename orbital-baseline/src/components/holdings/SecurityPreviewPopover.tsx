import type { RefObject } from 'react'
import { Popover } from '../overlays/Popover'
import { useAppState } from '../../hooks/useAppState'
import { getSecurities } from '../../data/securities'
import { formatCurrency, formatCurrencyCompact, formatPercent } from '../../utils/format'
import styles from './SecurityPreviewPopover.module.css'

export function SecurityPreviewPopover({
  ticker,
  anchorRef,
}: {
  ticker: string
  anchorRef: RefObject<HTMLElement | null>
}) {
  const { state, dispatch } = useAppState()
  const security = getSecurities()[ticker]
  const open = state.previewSecurity === ticker

  if (!security) return null

  return (
    <Popover open={open} anchorRef={anchorRef} onClose={() => dispatch({ type: 'CLOSE_SECURITY_PREVIEW' })} width={260}>
      <div className={styles.header}>
        <span className={styles.ticker}>{security.ticker}</span>
        <span className={styles.name}>{security.name.toUpperCase()}</span>
      </div>

      <div className={styles.priceRow}>
        <span className={styles.price}>{formatCurrency(security.price)}</span>
        <span className={security.changePct >= 0 ? styles.positive : styles.negative}>
          {formatPercent(security.changePct)}
        </span>
      </div>

      <div className={styles.statGrid}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Market Cap</span>
          <span className={styles.statValue}>{formatCurrencyCompact(security.fundamentals.marketCap)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>P/E</span>
          <span className={styles.statValue}>{security.fundamentals.peRatio.toFixed(2)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>52W</span>
          <span className={styles.statValue}>
            {formatCurrency(security.fundamentals.week52Low, 2)} — {formatCurrency(security.fundamentals.week52High, 2)}
          </span>
        </div>
      </div>

      <button
        type="button"
        className={styles.openButton}
        onClick={() => dispatch({ type: 'OPEN_SECURITY_MODAL', ticker })}
      >
        OPEN SECURITY →
      </button>
    </Popover>
  )
}
