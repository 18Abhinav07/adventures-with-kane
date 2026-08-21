import type { Activity } from '../types'

export function getActivity(): Activity[] {
  return [
    {
      id: 'act-1',
      time: '14:31:09',
      type: 'BUY',
      description: 'Increased NVDA position',
      asset: 'NVDA',
      value: 42_100,
      status: 'COMPLETED',
    },
    {
      id: 'act-2',
      time: '13:58:41',
      type: 'SELL',
      description: 'Reduced XOM exposure',
      asset: 'XOM',
      value: 18_400,
      status: 'COMPLETED',
    },
    {
      id: 'act-3',
      time: '13:27:12',
      type: 'ALERT',
      description: 'Risk threshold triggered',
      asset: 'TECH',
      value: null,
      status: 'OPEN',
    },
    {
      id: 'act-4',
      time: '12:49:08',
      type: 'DIVIDEND',
      description: 'AAPL dividend received',
      asset: 'AAPL',
      value: 1_284,
      status: 'COMPLETED',
    },
    {
      id: 'act-5',
      time: '11:04:22',
      type: 'REBALANCE',
      description: 'Sector allocation adjusted',
      asset: 'TECH',
      value: 72_300,
      status: 'COMPLETED',
    },
  ]
}
