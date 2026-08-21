export type DisplayDensity = 'Compact' | 'Comfortable' | 'Spacious'

export const DENSITY_OPTIONS: DisplayDensity[] = ['Compact', 'Comfortable', 'Spacious']
export const DEFAULT_DENSITY: DisplayDensity = 'Comfortable'

export interface SectionOption {
  id: string
  label: string
}

export const SECTION_OPTIONS: SectionOption[] = [
  { id: 'summary', label: 'Portfolio Summary' },
  { id: 'performance', label: 'Performance' },
  { id: 'allocation', label: 'Allocation' },
  { id: 'holdings', label: 'Holdings' },
  { id: 'risk', label: 'Risk' },
  { id: 'market', label: 'Market Overview' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'activity', label: 'Activity' },
]

export const DEFAULT_VISIBLE_SECTIONS: Record<string, boolean> = SECTION_OPTIONS.reduce(
  (acc, section) => {
    acc[section.id] = true
    return acc
  },
  {} as Record<string, boolean>,
)

export interface ChartOption {
  id: 'benchmark' | 'grid' | 'hoverIndicators'
  label: string
}

export const CHART_OPTIONS: ChartOption[] = [
  { id: 'benchmark', label: 'Benchmark' },
  { id: 'grid', label: 'Grid' },
  { id: 'hoverIndicators', label: 'Hover Indicators' },
]

export const DEFAULT_CHART_OPTIONS: Record<ChartOption['id'], boolean> = {
  benchmark: true,
  grid: true,
  hoverIndicators: true,
}
