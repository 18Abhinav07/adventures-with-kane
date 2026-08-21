export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface Alert {
  id: string
  severity: AlertSeverity
  title: string
  timestamp: string
  detail: string
  dismissible: boolean
}

export const ALERTS: Alert[] = [
  {
    id: 'tech-concentration',
    severity: 'warning',
    title: 'Technology concentration above target',
    timestamp: '9m ago',
    detail: 'Technology sector allocation is 31.7%, exceeding the 27.5% target by 4.2%. Review sector concentration.',
    dismissible: true,
  },
  {
    id: 'nvda-52w-high',
    severity: 'info',
    title: 'NVDA crossed 52-week high',
    timestamp: '34m ago',
    detail: 'NVIDIA CORPORATION (NVDA) traded above its prior 52-week high of $184.49.',
    dismissible: true,
  },
  {
    id: 'volatility-increase',
    severity: 'critical',
    title: 'Portfolio volatility increased 7.2%',
    timestamp: '1h ago',
    detail: 'Portfolio volatility rose 7.2% over the trailing session, driven by broader technology sector movement.',
    dismissible: true,
  },
  {
    id: 'fed-rate-decision',
    severity: 'info',
    title: 'Fed rate decision tomorrow',
    timestamp: '3h ago',
    detail: 'The Federal Reserve is scheduled to announce its rate decision tomorrow. Expect elevated volatility around the release.',
    dismissible: false,
  },
  {
    id: 'cash-below-minimum',
    severity: 'warning',
    title: 'Cash position below tactical minimum',
    timestamp: '5h ago',
    detail: 'Cash allocation has fallen below the tactical minimum threshold set for this strategy.',
    dismissible: true,
  },
]
