export interface PerformancePoint {
  label: string
  dateFull: string
  portfolioValue: number
  benchmarkValue: number
  portfolioReturn: number
  benchmarkReturn: number
}

export interface PerformanceSeries {
  points: PerformancePoint[]
  periodReturn: number
  benchmarkPeriodReturn: number
}

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
]

const RANGE_CONFIG: Record<string, { points: number; unit: 'hour' | 'day' | 'week' | 'month' }> = {
  '1D': { points: 24, unit: 'hour' },
  '1W': { points: 7, unit: 'day' },
  '1M': { points: 22, unit: 'day' },
  '3M': { points: 13, unit: 'week' },
  YTD: { points: 8, unit: 'month' },
  '1Y': { points: 12, unit: 'month' },
  ALL: { points: 24, unit: 'month' },
}

// Deterministic pseudo-random generator so the same range always renders the
// same series (no flake across re-renders or repeated runs).
function seededDelta(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function formatLabel(range: string, index: number, total: number): string {
  const day = 20 - (total - 1 - index)
  if (range === '1D') return `${String(index).padStart(2, '0')}:00`
  if (range === '1W' || range === '1M') return `AUG ${Math.max(1, day)}`
  if (range === '3M') return `WK ${index + 1}`
  return MONTHS[index % 12]
}

function formatDateFull(range: string, index: number, total: number): string {
  if (range === '1D') return `AUG 20, 2026 ${String(index).padStart(2, '0')}:00`
  const day = 20 - (total - 1 - index)
  if (range === '1W' || range === '1M') return `AUG ${Math.max(1, day)}, 2026`
  if (range === '3M') return `WEEK ${index + 1}, 2026`
  return `${MONTHS[index % 12]} 2026`
}

export function generatePerformanceSeries(range: string): PerformanceSeries {
  const config = RANGE_CONFIG[range] ?? RANGE_CONFIG['1M']
  const baseValue = 24_816_392.41
  const points: PerformancePoint[] = []

  for (let i = 0; i < config.points; i++) {
    const seed = range.charCodeAt(0) + range.length + i
    const drift = (seededDelta(seed) - 0.35) * 0.02
    const portfolioReturn = drift * (i + 1) * 4.2
    const benchmarkReturn = portfolioReturn * (0.8 + seededDelta(seed + 1) * 0.3)
    const portfolioValue = baseValue * (1 + portfolioReturn / 100)
    const benchmarkValue = baseValue * (1 + benchmarkReturn / 100)

    points.push({
      label: formatLabel(range, i, config.points),
      dateFull: formatDateFull(range, i, config.points),
      portfolioValue,
      benchmarkValue,
      portfolioReturn,
      benchmarkReturn,
    })
  }

  const last = points[points.length - 1]
  return {
    points,
    periodReturn: last.portfolioReturn,
    benchmarkPeriodReturn: last.benchmarkReturn,
  }
}
