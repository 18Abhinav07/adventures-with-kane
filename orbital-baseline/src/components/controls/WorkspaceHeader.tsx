import { useRef } from 'react'
import { Download, SlidersHorizontal } from 'lucide-react'
import { SegmentedControl } from './SegmentedControl'
import { useAppState } from '../../hooks/useAppState'
import { NAV_HEADINGS } from '../navigation/navItems'
import { ExportPopover } from './ExportPopover'
import type { TimeRange } from '../../types'
import styles from './WorkspaceHeader.module.css'

const TIME_RANGES: readonly TimeRange[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL']

export function WorkspaceHeader() {
  const { state, dispatch } = useAppState()
  const exportBtnRef = useRef<HTMLButtonElement>(null)

  const title = state.activeNavigation === 'overview' ? 'Portfolio Overview' : NAV_HEADINGS[state.activeNavigation]

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>Institutional Multi-Asset Strategy · As of Aug 20, 2026</p>
      </div>

      <div className={styles.right}>
        <SegmentedControl
          options={TIME_RANGES}
          value={state.timeRange}
          onChange={(range) => dispatch({ type: 'SET_TIME_RANGE', range })}
          ariaLabel="Performance time range"
        />

        <button
          ref={exportBtnRef}
          type="button"
          className={styles.button}
          aria-expanded={state.exportPopoverOpen}
          onClick={() => dispatch({ type: 'TOGGLE_EXPORT_POPOVER' })}
        >
          <Download size={13} />
          Export
        </button>
        <ExportPopover anchorRef={exportBtnRef} />

        <button
          type="button"
          className={styles.button}
          aria-expanded={state.customizeDrawerOpen}
          onClick={() => dispatch({ type: 'TOGGLE_CUSTOMIZE_DRAWER' })}
        >
          <SlidersHorizontal size={13} />
          Customize
        </button>
      </div>
    </div>
  )
}
