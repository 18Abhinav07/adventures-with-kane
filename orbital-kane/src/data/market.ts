export interface MarketInstrument {
  symbol: string
  value: string
  dayChangePercent: number
  sparkline: number[]
}

export const MARKET_INSTRUMENTS: MarketInstrument[] = [
  {
    symbol: 'S&P 500',
    value: '5,832.14',
    dayChangePercent: 0.42,
    sparkline: [5798, 5805, 5790, 5812, 5820, 5808, 5815, 5825, 5818, 5832],
  },
  {
    symbol: 'NASDAQ',
    value: '18,472.60',
    dayChangePercent: 0.81,
    sparkline: [18280, 18310, 18295, 18340, 18365, 18350, 18380, 18410, 18395, 18473],
  },
  {
    symbol: 'DOW',
    value: '41,205.30',
    dayChangePercent: 0.17,
    sparkline: [41120, 41135, 41110, 41150, 41160, 41140, 41170, 41180, 41165, 41205],
  },
  {
    symbol: 'BTC/USD',
    value: '61,840.00',
    dayChangePercent: -0.62,
    sparkline: [62300, 62150, 62240, 62050, 61980, 62100, 61920, 61850, 61900, 61840],
  },
]
