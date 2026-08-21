export type NavItemId =
  | 'overview'
  | 'portfolio'
  | 'markets'
  | 'watchlist'
  | 'transactions'
  | 'performance'
  | 'risk'
  | 'attribution'
  | 'scenarios'
  | 'research-notes'
  | 'saved-views'
  | 'reports'
  | 'alerts'
  | 'data-health'

export type TimeRange = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | 'ALL'

export type Density = 'compact' | 'comfortable' | 'spacious'

export type DashboardSectionId =
  | 'summary'
  | 'performance'
  | 'allocation'
  | 'holdings'
  | 'risk'
  | 'markets'
  | 'alerts'
  | 'activity'

export interface PortfolioSummary {
  totalValue: number
  totalChangeAbs: number
  totalChangePct: number
  todayChangeAbs: number
  todayChangePct: number
  ytdReturnPct: number
  ytdBenchmarkPct: number
  riskScore: number
  riskStatus: 'LOW' | 'MODERATE' | 'HIGH'
}

export interface Holding {
  ticker: string
  name: string
  price: number
  dayChangePct: number
  position: number
  weight: number
  pnl: number
}

export interface PerformancePoint {
  date: string // ISO date
  label: string // display label
  portfolioValue: number
  benchmarkValue: number
  portfolioReturnPct: number
  benchmarkReturnPct: number
}

export interface AllocationSlice {
  name: string
  pct: number
  value: number
  color: string
}

export interface RiskMetric {
  label: string
  value: string
}

export interface RiskWarning {
  title: string
  currentAllocationPct: number
  targetPct: number
  deviationPct: number
  recommendedAction: string
  summary: string
}

export interface RiskSummary {
  score: number
  status: 'LOW' | 'MODERATE' | 'HIGH'
  metrics: RiskMetric[]
  warning: RiskWarning
}

export interface MarketInstrument {
  symbol: string
  name: string
  value: number
  changePct: number
  sparkline: number[]
}

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface Alert {
  id: string
  severity: AlertSeverity
  title: string
  timestamp: string
  description: string
  dismissible: boolean
}

export type ActivityType = 'BUY' | 'SELL' | 'ALERT' | 'DIVIDEND' | 'REBALANCE'
export type ActivityStatus = 'COMPLETED' | 'OPEN' | 'PENDING'

export interface Activity {
  id: string
  time: string
  type: ActivityType
  description: string
  asset: string
  value: number | null
  status: ActivityStatus
}

export interface SecurityNews {
  headline: string
  source: string
  timestamp: string
}

export interface SecurityFundamentals {
  marketCap: number
  peRatio: number
  week52Low: number
  week52High: number
  dividendYield: number
  eps: number
}

export interface Security {
  ticker: string
  name: string
  price: number
  changePct: number
  fundamentals: SecurityFundamentals
  analystConsensus: 'BUY' | 'HOLD' | 'SELL'
  analystTargetPrice: number
  chart: PerformancePoint[]
  news: SecurityNews[]
}

export interface ChartOptions {
  benchmark: boolean
  grid: boolean
  hoverIndicators: boolean
}

export interface UserPreference {
  density: Density
  visibleSections: Record<DashboardSectionId, boolean>
  chartOptions: ChartOptions
}

export interface Toast {
  id: string
  title: string
  message: string
  createdAt: number
}

export type ExportFormat = 'CSV' | 'JSON' | 'PDF'

export interface ExportOption {
  id: 'current-view' | 'holdings' | 'transactions' | 'risk-report'
  title: string
  description: string
}
