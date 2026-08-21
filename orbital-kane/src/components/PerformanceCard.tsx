import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import type { CategoricalChartFunc } from 'recharts/types/chart/types'
import { Lock } from 'lucide-react'
import { generatePerformanceSeries, type PerformancePoint } from '../data/performance'
import './PerformanceCard.css'

interface PerformanceCardProps {
  timeRange: string
  showBenchmark?: boolean
  showGrid?: boolean
  showHoverIndicators?: boolean
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function parseActiveIndex(value: unknown): number | null {
  const index = typeof value === 'string' ? Number(value) : value
  return typeof index === 'number' && Number.isFinite(index) ? index : null
}

function PerformanceCard({
  timeRange,
  showBenchmark = true,
  showGrid = true,
  showHoverIndicators = true,
}: PerformanceCardProps) {
  const series = useMemo(() => generatePerformanceSeries(timeRange), [timeRange])
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [lockIndex, setLockIndex] = useState<number | null>(null)
  const [coordinate, setCoordinate] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHoverIndex(null)
    setLockIndex(null)
    setCoordinate(null)
  }, [timeRange])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && lockIndex !== null) {
        setLockIndex(null)
        setHoverIndex(null)
        setCoordinate(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lockIndex])

  const activeIndex = lockIndex ?? hoverIndex
  const activePoint: PerformancePoint | null =
    activeIndex !== null ? series.points[activeIndex] ?? null : null

  const handleMouseMove: CategoricalChartFunc = (state) => {
    if (lockIndex !== null || !showHoverIndicators) return
    const index = parseActiveIndex(state.activeTooltipIndex)
    if (state.isTooltipActive && index !== null && state.activeCoordinate) {
      setHoverIndex(index)
      setCoordinate({ x: state.activeCoordinate.x, y: state.activeCoordinate.y })
    }
  }

  const handleMouseLeave = () => {
    if (lockIndex !== null) return
    setHoverIndex(null)
    setCoordinate(null)
  }

  const handleClick: CategoricalChartFunc = (state) => {
    const index = parseActiveIndex(state.activeTooltipIndex)
    if (index === null || !state.activeCoordinate) return
    if (lockIndex === index) {
      setLockIndex(null)
      setHoverIndex(index)
    } else {
      setLockIndex(index)
      setCoordinate({ x: state.activeCoordinate.x, y: state.activeCoordinate.y })
    }
  }

  const isLocked = lockIndex !== null
  const periodPositive = series.periodReturn >= 0

  return (
    <div className="performance-card">
      <div className="performance-card-header">
        <h2 className="performance-card-title">Portfolio Performance</h2>
        <div className={`performance-card-period${periodPositive ? ' positive' : ' negative'}`}>
          {formatPercent(series.periodReturn)}
          {showBenchmark && <> · vs benchmark {formatPercent(series.benchmarkPeriodReturn)}</>}
        </div>
      </div>

      <div className="performance-chart-area" ref={containerRef}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart
            data={series.points}
            margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
            throttleDelay={0}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          >
            <defs>
              <linearGradient id="performanceAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5DA9FF" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#5DA9FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid stroke="#252D3A" vertical={false} />}
            <XAxis
              dataKey="label"
              tick={{ fill: '#697383', fontSize: 10 }}
              axisLine={{ stroke: '#252D3A' }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: '#697383', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={64}
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value: number) =>
                `$${(value / 1_000_000).toFixed(1)}M`
              }
            />
            <Area
              type="monotone"
              dataKey="portfolioValue"
              stroke="none"
              fill="url(#performanceAreaFill)"
              isAnimationActive={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="portfolioValue"
              stroke="#5DA9FF"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            {showBenchmark && (
              <Line
                type="monotone"
                dataKey="benchmarkValue"
                stroke="#7F8A9A"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {activePoint && coordinate && (
          <>
            {showHoverIndicators && (
              <div
                className="performance-active-point"
                style={{ left: coordinate.x, top: coordinate.y }}
              >
                <span className="performance-active-point-ring" />
                <span className="performance-active-point-dot" />
              </div>
            )}

            <div
              className="performance-tooltip"
              style={{
                left: coordinate.x,
                top: coordinate.y,
              }}
            >
              {isLocked && (
                <div className="performance-tooltip-lock">
                  <Lock size={11} strokeWidth={2} aria-hidden="true" />
                  <span>Locked</span>
                </div>
              )}
              <div className="performance-tooltip-date">{activePoint.dateFull}</div>
              <div className="performance-tooltip-row">
                <span className="performance-tooltip-label">Portfolio</span>
                <span className="performance-tooltip-value">
                  {formatCurrency(activePoint.portfolioValue)}
                </span>
              </div>
              <div className="performance-tooltip-row">
                <span className="performance-tooltip-label">Benchmark</span>
                <span className="performance-tooltip-value">
                  {formatPercent(activePoint.benchmarkReturn)}
                </span>
              </div>
              <div className="performance-tooltip-row">
                <span className="performance-tooltip-label">Return</span>
                <span
                  className={`performance-tooltip-value${
                    activePoint.portfolioReturn >= 0 ? ' positive' : ' negative'
                  }`}
                >
                  {formatPercent(activePoint.portfolioReturn)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PerformanceCard
