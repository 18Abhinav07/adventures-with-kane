import type { Alert } from '../types'

export function getAlerts(): Alert[] {
  return [
    {
      id: 'alert-1',
      severity: 'critical',
      title: 'Cash position below tactical minimum',
      timestamp: '08:12 UTC',
      description:
        'Cash allocation has fallen to 9.0%, below the 10.0% tactical minimum threshold. Consider rebalancing from equities or fixed income to restore liquidity buffer.',
      dismissible: true,
    },
    {
      id: 'alert-2',
      severity: 'warning',
      title: 'Technology concentration above target',
      timestamp: '09:47 UTC',
      description:
        'Technology sector exposure is currently 31.7% against a target allocation of 27.5%, a deviation of +4.2%. Review sector concentration to reduce single-sector risk.',
      dismissible: true,
    },
    {
      id: 'alert-3',
      severity: 'warning',
      title: 'Portfolio volatility increased 7.2%',
      timestamp: '11:03 UTC',
      description:
        '30-day realized volatility has increased 7.2% week-over-week, driven primarily by technology and semiconductor holdings. Monitor for continued regime shift.',
      dismissible: true,
    },
    {
      id: 'alert-4',
      severity: 'info',
      title: 'NVDA crossed 52-week high',
      timestamp: '13:21 UTC',
      description:
        'NVDA touched a new 52-week high of $184.49 intraday before settling near $181.92. Position remains within target weight.',
      dismissible: true,
    },
    {
      id: 'alert-5',
      severity: 'info',
      title: 'Fed rate decision tomorrow',
      timestamp: '14:05 UTC',
      description:
        'The Federal Reserve is scheduled to announce its rate decision tomorrow at 14:00 ET. Elevated volatility is expected across rate-sensitive holdings.',
      dismissible: false,
    },
  ]
}
