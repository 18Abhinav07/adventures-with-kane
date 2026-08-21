import type { RiskSummary } from '../types'

export function getRiskSummary(): RiskSummary {
  return {
    score: 61,
    status: 'MODERATE',
    metrics: [
      { label: 'Volatility', value: '14.82%' },
      { label: 'Sharpe', value: '1.74' },
      { label: 'Beta', value: '0.93' },
      { label: 'Max Drawdown', value: '-6.21%' },
      { label: 'VaR 95%', value: '-2.48%' },
    ],
    warning: {
      title: 'TECHNOLOGY OVERWEIGHT',
      summary: 'Technology exposure exceeds target by 4.2%',
      currentAllocationPct: 31.7,
      targetPct: 27.5,
      deviationPct: 4.2,
      recommendedAction: 'Review sector concentration.',
    },
  }
}
