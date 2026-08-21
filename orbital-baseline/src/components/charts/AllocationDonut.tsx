import { useMemo } from 'react'
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'
import { useAppState } from '../../hooks/useAppState'
import { getAllocation, getAllocationTotal } from '../../data/allocation'
import { formatCurrencyCompact, formatCurrency, formatPercentUnsigned } from '../../utils/format'
import { SectionHeader } from '../cards/SectionHeader'
import { Skeleton } from '../feedback/Skeleton'
import styles from './AllocationDonut.module.css'

const BASE_RADIUS = 78

function renderActiveShape(props: PieSectorDataItem) {
  return <Sector {...props} outerRadius={(props.outerRadius ?? BASE_RADIUS) + 4} />
}

export function AllocationDonut() {
  const { state, dispatch } = useAppState()
  const slices = useMemo(() => getAllocation(), [])
  const total = getAllocationTotal()

  const active = state.lockedAllocation ?? state.selectedAllocation
  const activeSlice = slices.find((s) => s.name === active)
  const activeIndex = active ? slices.findIndex((s) => s.name === active) : -1

  function handleClick(name: string) {
    dispatch({ type: 'CLICK_ALLOCATION', name })
  }

  return (
    <div className={styles.card}>
      <SectionHeader title="Allocation" />

      {state.loading ? (
        <Skeleton height={180} radius={6} />
      ) : (
        <div className={styles.body}>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="pct"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={BASE_RADIUS}
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                  activeIndex={activeIndex >= 0 ? activeIndex : undefined}
                  activeShape={renderActiveShape}
                  onClick={(entry) => handleClick(String(entry.name))}
                  onMouseEnter={(entry) => dispatch({ type: 'HOVER_ALLOCATION', name: String(entry.name) })}
                  onMouseLeave={() => dispatch({ type: 'HOVER_ALLOCATION', name: null })}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} style={{ cursor: 'pointer', outline: 'none' }} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className={styles.center}>
              {activeSlice ? (
                <>
                  <span className={styles.centerValue}>{formatPercentUnsigned(activeSlice.pct)}</span>
                  <span className={styles.centerLabel}>{activeSlice.name.toUpperCase()}</span>
                </>
              ) : (
                <>
                  <span className={styles.centerValue}>{formatCurrencyCompact(total)}</span>
                  <span className={styles.centerLabel}>TOTAL</span>
                </>
              )}
            </div>
          </div>

          <ul className={styles.legend}>
            {slices.map((slice) => (
              <li key={slice.name}>
                <button
                  type="button"
                  className={[styles.legendRow, active === slice.name ? styles.legendActive : ''].join(' ')}
                  onMouseEnter={() => dispatch({ type: 'HOVER_ALLOCATION', name: slice.name })}
                  onMouseLeave={() => dispatch({ type: 'HOVER_ALLOCATION', name: null })}
                  onClick={() => handleClick(slice.name)}
                >
                  <span className={styles.swatch} style={{ background: slice.color }} aria-hidden="true" />
                  <span className={styles.legendName}>{slice.name}</span>
                  <span className={styles.legendPct}>{formatPercentUnsigned(slice.pct)}</span>
                  <span className={styles.legendValue}>{formatCurrency(slice.value, 0)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
