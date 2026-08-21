import type { ExportOption, UserPreference } from '../types'

export function getDefaultPreferences(): UserPreference {
  return {
    density: 'comfortable',
    visibleSections: {
      summary: true,
      performance: true,
      allocation: true,
      holdings: true,
      risk: true,
      markets: true,
      alerts: true,
      activity: true,
    },
    chartOptions: {
      benchmark: true,
      grid: true,
      hoverIndicators: true,
    },
  }
}

export function getExportOptions(): ExportOption[] {
  return [
    { id: 'current-view', title: 'Export Current View', description: 'Snapshot of the active dashboard state.' },
    { id: 'holdings', title: 'Export Holdings', description: 'Full holdings list with weights and P&L.' },
    { id: 'transactions', title: 'Export Transactions', description: 'Recent activity and transaction history.' },
    { id: 'risk-report', title: 'Export Risk Report', description: 'Volatility, exposure, and concentration detail.' },
  ]
}
