import { useMemo, useState } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useAppState } from '../../hooks/useAppState'
import { getPerformanceSeries } from '../../data/performance'
import type { PerformancePoint } from '../../types'
import { PerformanceTooltip } from './PerformanceTooltip'
import { SectionHeader } from '../cards/SectionHeader'
import { Skeleton } from '../feedback/Skeleton'
import styles from './PerformanceChart.module.css'

interface ChartMouseState {
  activeTooltipIndex?: number
  activeCoordinate?: { x: number; y: number }
}

function ActivePointDot({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx == null || cy == null) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill="var(--color-information)" fillOpacity={0.16} />
      <circle cx={cx} cy={cy} r={3.5} fill="var(--color-information)" stroke="var(--color-surface-primary)" strokeWidth={1.5} />
    </g>
  )
}

export function PerformanceChart() {
  const { state, dispatch } = useAppState()
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null)

  const data = useMemo(() => getPerformanceSeries(state.timeRange), [state.timeRange])
  const { chartOptions, loading } = state

  const activePoint = state.lockedPerformancePoint ?? state.selectedPerformancePoint
  const locked = Boolean(state.lockedPerformancePoint)

  function handleMove(chartState: ChartMouseState) {
    if (!chartState || chartState.activeTooltipIndex == null) {
      if (!locked) {
        dispatch({ type: 'HOVER_PERFORMANCE_POINT', point: null })
        setHoverCoord(null)
      }
      return
    }
    const point = data[chartState.activeTooltipIndex] as PerformancePoint | undefined
    if (!point) return
    if (!locked) {
      dispatch({ type: 'HOVER_PERFORMANCE_POINT', point })
    }
    if (chartState.activeCoordinate) {
      setHoverCoord({ x: chartState.activeCoordinate.x, y: chartState.activeCoordinate.y })
    }
  }

  function handleLeave() {
    if (!locked) {
      dispatch({ type: 'HOVER_PERFORMANCE_POINT', point: null })
      setHoverCoord(null)
    }
  }

  function handleClick(chartState: ChartMouseState) {
    if (!chartState || chartState.activeTooltipIndex == null) return
    const point = data[chartState.activeTooltipIndex] as PerformancePoint | undefined
    if (!point) return
    dispatch({ type: 'CLICK_PERFORMANCE_POINT', point })
  }

  const activeIndex = activePoint ? data.findIndex((p) => p.date === activePoint.date) : -1

  return (
    <div className={styles.card}>
      <SectionHeader title="Portfolio Performance" right={<span>Benchmark: S&P 500</span>} />

      {loading ? (
        <Skeleton height={300} radius={6} />
      ) : (
        <div className={styles.chartArea}>
          <ResponsiveContainer width={460} height={300}>
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
              onClick={handleClick}
            >
              <defs>
                <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-information)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--color-information)" stopOpacity={0} />
                </linearGradient>
              </defs>

              {chartOptions.grid && (
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="0" vertical />
              )}

              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis hide domain={['dataMin', 'dataMax']} />

              <Tooltip content={() => null} cursor={{ stroke: 'var(--color-border-strong)', strokeWidth: 1 }} />

              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke="none"
                fill="url(#portfolioFill)"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="portfolioValue"
                stroke="var(--color-information)"
                strokeWidth={2}
                dot={false}
                activeDot={chartOptions.hoverIndicators ? <ActivePointDot /> : false}
                isAnimationActive={false}
              />
              {chartOptions.benchmark && (
                <Line
                  type="monotone"
                  dataKey="benchmarkValue"
                  stroke="var(--color-information)"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {chartOptions.hoverIndicators && activePoint && activeIndex >= 0 && hoverCoord && (
            <PerformanceTooltip
              point={activePoint}
              showBenchmark={chartOptions.benchmark}
              locked={locked}
              style={{
                left: hoverCoord.x + 12,
                top: hoverCoord.y - 90,
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
