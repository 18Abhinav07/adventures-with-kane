import { X } from 'lucide-react'
import { Drawer } from '../overlays/Drawer'
import { useAppState } from '../../hooks/useAppState'
import type { ChartOptions, DashboardSectionId, Density } from '../../types'
import styles from './CustomizeDrawer.module.css'

const DENSITIES: readonly Density[] = ['compact', 'comfortable', 'spacious']

const SECTION_LABELS: Record<DashboardSectionId, string> = {
  summary: 'Portfolio Summary',
  performance: 'Performance',
  allocation: 'Allocation',
  holdings: 'Holdings',
  risk: 'Risk',
  markets: 'Market Overview',
  alerts: 'Alerts',
  activity: 'Activity',
}

const CHART_OPTION_LABELS: Record<keyof ChartOptions, string> = {
  benchmark: 'Benchmark',
  grid: 'Grid',
  hoverIndicators: 'Hover Indicators',
}

export function CustomizeDrawer() {
  const { state, dispatch } = useAppState()

  return (
    <Drawer
      open={state.customizeDrawerOpen}
      onClose={() => dispatch({ type: 'CLOSE_CUSTOMIZE_DRAWER' })}
      labelledBy="customize-drawer-title"
    >
      <div className={styles.header}>
        <h2 id="customize-drawer-title" className={styles.title}>
          Customize
        </h2>
        <button
          type="button"
          className={styles.close}
          aria-label="Close customize drawer"
          onClick={() => dispatch({ type: 'CLOSE_CUSTOMIZE_DRAWER' })}
        >
          <X size={16} />
        </button>
      </div>

      <div className={styles.body}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Display Density</h3>
          <div className={styles.radioList}>
            {DENSITIES.map((d) => (
              <label key={d} className={styles.radioRow}>
                <input
                  type="radio"
                  name="density"
                  checked={state.density === d}
                  onChange={() => dispatch({ type: 'SET_DENSITY', density: d })}
                />
                <span className={styles.radioLabel}>{d[0].toUpperCase() + d.slice(1)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Display Sections</h3>
          <div className={styles.checkList}>
            {(Object.keys(SECTION_LABELS) as DashboardSectionId[]).map((id) => (
              <label key={id} className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={state.visibleSections[id]}
                  onChange={() => dispatch({ type: 'TOGGLE_SECTION', id })}
                />
                <span className={styles.checkLabel}>{SECTION_LABELS[id]}</span>
              </label>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Chart Options</h3>
          <div className={styles.checkList}>
            {(Object.keys(CHART_OPTION_LABELS) as (keyof ChartOptions)[]).map((key) => (
              <label key={key} className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={state.chartOptions[key]}
                  onChange={() => dispatch({ type: 'TOGGLE_CHART_OPTION', key })}
                />
                <span className={styles.checkLabel}>{CHART_OPTION_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </section>
      </div>
    </Drawer>
  )
}
