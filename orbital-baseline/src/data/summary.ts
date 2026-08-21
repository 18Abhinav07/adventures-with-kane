import type { PortfolioSummary } from '../types'

export function getPortfolioSummary(): PortfolioSummary {
  return {
    totalValue: 24_816_392.41,
    totalChangeAbs: 184_219.22,
    totalChangePct: 0.75,
    todayChangeAbs: 84_219.17,
    todayChangePct: 0.34,
    ytdReturnPct: 11.84,
    ytdBenchmarkPct: 9.62,
    riskScore: 61,
    riskStatus: 'MODERATE',
  }
}
