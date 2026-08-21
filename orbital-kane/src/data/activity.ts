export type ActivityStatus = 'COMPLETED' | 'OPEN'

export interface ActivityEvent {
  id: string
  time: string
  type: string
  description: string
  asset: string
  value: string
  status: ActivityStatus
}

export const RECENT_ACTIVITY: ActivityEvent[] = [
  {
    id: 'evt-1',
    time: '14:31:09',
    type: 'BUY',
    description: 'Increased NVDA position',
    asset: 'NVDA',
    value: '$42,100',
    status: 'COMPLETED',
  },
  {
    id: 'evt-2',
    time: '13:58:41',
    type: 'SELL',
    description: 'Reduced XOM exposure',
    asset: 'XOM',
    value: '$18,400',
    status: 'COMPLETED',
  },
  {
    id: 'evt-3',
    time: '13:27:12',
    type: 'ALERT',
    description: 'Risk threshold triggered',
    asset: 'TECH',
    value: '—',
    status: 'OPEN',
  },
  {
    id: 'evt-4',
    time: '12:49:08',
    type: 'DIVIDEND',
    description: 'AAPL dividend received',
    asset: 'AAPL',
    value: '$1,284',
    status: 'COMPLETED',
  },
  {
    id: 'evt-5',
    time: '11:04:22',
    type: 'REBALANCE',
    description: 'Sector allocation adjusted',
    asset: 'TECH',
    value: '$72,300',
    status: 'COMPLETED',
  },
]
