export type ExportFormat = 'CSV' | 'JSON' | 'PDF'

export const EXPORT_FORMATS: ExportFormat[] = ['CSV', 'JSON', 'PDF']
export const DEFAULT_EXPORT_FORMAT: ExportFormat = 'CSV'

export interface ExportAction {
  id: string
  icon: string
  title: string
  description: string
}

export const EXPORT_ACTIONS: ExportAction[] = [
  {
    id: 'current-view',
    icon: '🖥️',
    title: 'Export Current View',
    description: 'Export the dashboard exactly as currently displayed.',
  },
  {
    id: 'holdings',
    icon: '📊',
    title: 'Export Holdings',
    description: 'Export the full top holdings table with weightings.',
  },
  {
    id: 'transactions',
    icon: '🧾',
    title: 'Export Transactions',
    description: 'Export recent portfolio activity and transaction history.',
  },
  {
    id: 'risk-report',
    icon: '⚠️',
    title: 'Export Risk Report',
    description: 'Export risk metrics, gauge status, and concentration warnings.',
  },
]
