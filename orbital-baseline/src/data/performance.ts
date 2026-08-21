import type { PerformancePoint, TimeRange } from '../types'
import { createRng, rngRange } from '../utils/rng'
import { formatDateLabel } from '../utils/format'

const END_DATE = new Date('2026-08-20T00:00:00Z')
const ALL_START_DATE = new Date('2024-08-21T00:00:00Z')
const YEAR_START_DATE = new Date('2026-01-01T00:00:00Z')

const END_VALUE = 24_816_392.41
const YTD_RETURN_PCT = 11.84
const YTD_BENCHMARK_PCT = 9.62

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

/** Brownian-bridge style walk: adds noise but forces exact start/end values. */
function bridgeWalk(rng: () => number, steps: number, start: number, end: number, volatility: number): number[] {
  const raw: number[] = [start]
  for (let i = 1; i <= steps; i++) {
    const prev = raw[i - 1]
    const change = rngRange(rng, -volatility, volatility)
    raw.push(prev * (1 + change))
  }
  const rawEnd = raw[steps]
  const out: number[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const corrected = raw[i] + t * (end - rawEnd)
    out.push(corrected)
  }
  return out
}

interface FullSeries {
  dates: Date[]
  portfolio: number[]
  benchmark: number[]
}

let cached: FullSeries | null = null

function buildFullSeries(): FullSeries {
  if (cached) return cached

  const totalDays = daysBetween(ALL_START_DATE, END_DATE)
  const preYtdDays = daysBetween(ALL_START_DATE, YEAR_START_DATE)
  const ytdDays = totalDays - preYtdDays

  const rng = createRng(20260820)

  const yearStartValue = END_VALUE / (1 + YTD_RETURN_PCT / 100)
  const allStartValue = yearStartValue / 1.14 // gentle multi-year growth before the current year

  const yearStartBenchIndex = 100 / (1 + YTD_BENCHMARK_PCT / 100)
  const allStartBenchIndex = yearStartBenchIndex / 1.11
  const endBenchIndex = 100

  const preYtdPortfolio = bridgeWalk(rng, preYtdDays, allStartValue, yearStartValue, 0.012)
  const ytdPortfolio = bridgeWalk(rng, ytdDays, yearStartValue, END_VALUE, 0.011)

  const preYtdBench = bridgeWalk(rng, preYtdDays, allStartBenchIndex, yearStartBenchIndex, 0.009)
  const ytdBench = bridgeWalk(rng, ytdDays, yearStartBenchIndex, endBenchIndex, 0.008)

  const portfolio = [...preYtdPortfolio, ...ytdPortfolio.slice(1)]
  const benchIndex = [...preYtdBench, ...ytdBench.slice(1)]

  // rebase benchmark index to the same starting dollar amount as the portfolio
  // so both series can be plotted on one $-denominated chart
  const benchScale = allStartValue / allStartBenchIndex
  const benchmark = benchIndex.map((v) => v * benchScale)

  const dates: Date[] = []
  for (let i = 0; i <= totalDays; i++) {
    dates.push(new Date(ALL_START_DATE.getTime() + i * 86_400_000))
  }

  cached = { dates, portfolio, benchmark }
  return cached
}

function toPoints(series: FullSeries, fromIndex: number, toIndex: number): PerformancePoint[] {
  const baseP = series.portfolio[fromIndex]
  const baseB = series.benchmark[fromIndex]
  const points: PerformancePoint[] = []
  for (let i = fromIndex; i <= toIndex; i++) {
    const iso = series.dates[i].toISOString()
    points.push({
      date: iso,
      label: formatDateLabel(iso),
      portfolioValue: series.portfolio[i],
      benchmarkValue: series.benchmark[i],
      portfolioReturnPct: ((series.portfolio[i] - baseP) / baseP) * 100,
      benchmarkReturnPct: ((series.benchmark[i] - baseB) / baseB) * 100,
    })
  }
  return points
}

function buildIntradayPoints(series: FullSeries): PerformancePoint[] {
  const lastIdx = series.dates.length - 1
  const prevClose = series.portfolio[lastIdx - 1]
  const prevBenchClose = series.benchmark[lastIdx - 1]
  const todayClose = series.portfolio[lastIdx]
  const todayBenchClose = series.benchmark[lastIdx]
  const rng = createRng(20260820 + 1)
  const steps = 13 // 08:00 - 20:00 hourly
  const walk = bridgeWalk(rng, steps, prevClose, todayClose, 0.0035)
  const benchWalk = bridgeWalk(rng, steps, prevBenchClose, todayBenchClose, 0.003)
  const points: PerformancePoint[] = []
  for (let i = 0; i <= steps; i++) {
    const hour = 8 + i
    const label = `${String(hour).padStart(2, '0')}:00`
    points.push({
      date: `2026-08-20T${String(hour).padStart(2, '0')}:00:00Z`,
      label,
      portfolioValue: walk[i],
      benchmarkValue: benchWalk[i],
      portfolioReturnPct: ((walk[i] - prevClose) / prevClose) * 100,
      benchmarkReturnPct: ((benchWalk[i] - prevBenchClose) / prevBenchClose) * 100,
    })
  }
  return points
}

export function getPerformanceSeries(range: TimeRange): PerformancePoint[] {
  const series = buildFullSeries()
  const lastIdx = series.dates.length - 1

  if (range === '1D') return buildIntradayPoints(series)

  let fromIndex: number
  switch (range) {
    case '1W':
      fromIndex = lastIdx - 7
      break
    case '1M':
      fromIndex = lastIdx - 30
      break
    case '3M':
      fromIndex = lastIdx - 90
      break
    case 'YTD':
      fromIndex = daysBetween(ALL_START_DATE, YEAR_START_DATE)
      break
    case '1Y':
      fromIndex = lastIdx - 365
      break
    case 'ALL':
    default:
      fromIndex = 0
      break
  }
  fromIndex = Math.max(0, fromIndex)
  return toPoints(series, fromIndex, lastIdx)
}
