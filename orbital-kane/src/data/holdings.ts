export interface NewsItem {
  headline: string
  source: string
  date: string
}

export interface Holding {
  ticker: string
  company: string
  price: number
  dayChangePercent: number
  positionValue: number
  weightPercent: number
  pnlPercent: number
  marketCap: string
  peRatio: number
  week52Low: number
  week52High: number
  divYield: string
  eps: number
  analystConsensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell'
  analystScore: number
  chart: number[]
  news: NewsItem[]
}

export const HOLDINGS: Holding[] = [
  {
    ticker: 'AAPL',
    company: 'Apple Inc.',
    price: 228.41,
    dayChangePercent: 1.24,
    positionValue: 3_218_940.12,
    weightPercent: 12.98,
    pnlPercent: 18.62,
    marketCap: '$3.48T',
    peRatio: 34.72,
    week52Low: 164.08,
    week52High: 234.99,
    divYield: '0.44%',
    eps: 6.58,
    analystConsensus: 'Buy',
    analystScore: 4.1,
    chart: [210, 214, 208, 216, 221, 219, 225, 222, 228, 226, 230, 228],
    news: [
      { headline: 'Apple ships record services revenue in fiscal Q3', source: 'MarketPulse', date: 'AUG 18' },
      { headline: 'Analysts raise price targets ahead of product cycle', source: 'Bloom Wire', date: 'AUG 15' },
    ],
  },
  {
    ticker: 'MSFT',
    company: 'Microsoft Corporation',
    price: 452.07,
    dayChangePercent: -0.38,
    positionValue: 2_954_112.55,
    weightPercent: 11.91,
    pnlPercent: 22.34,
    marketCap: '$3.36T',
    peRatio: 37.15,
    week52Low: 385.58,
    week52High: 468.35,
    divYield: '0.68%',
    eps: 12.17,
    analystConsensus: 'Strong Buy',
    analystScore: 4.6,
    chart: [430, 435, 438, 441, 447, 444, 450, 455, 449, 453, 458, 452],
    news: [
      { headline: 'Azure growth accelerates on enterprise AI demand', source: 'Sector Wire', date: 'AUG 19' },
      { headline: 'Microsoft expands datacenter footprint in APAC', source: 'MarketPulse', date: 'AUG 12' },
    ],
  },
  {
    ticker: 'NVDA',
    company: 'NVIDIA CORPORATION',
    price: 181.92,
    dayChangePercent: 3.14,
    positionValue: 2_611_003.9,
    weightPercent: 10.52,
    pnlPercent: 41.07,
    marketCap: '$4.42T',
    peRatio: 54.18,
    week52Low: 95.14,
    week52High: 184.49,
    divYield: '0.03%',
    eps: 3.36,
    analystConsensus: 'Strong Buy',
    analystScore: 4.8,
    chart: [150, 156, 148, 161, 168, 165, 172, 178, 174, 180, 176, 182],
    news: [
      { headline: 'NVIDIA data-center bookings extend into next fiscal year', source: 'Bloom Wire', date: 'AUG 20' },
      { headline: 'Next-gen accelerator platform samples ship to hyperscalers', source: 'Sector Wire', date: 'AUG 16' },
    ],
  },
  {
    ticker: 'AMZN',
    company: 'Amazon.com, Inc.',
    price: 212.55,
    dayChangePercent: 0.87,
    positionValue: 2_089_447.28,
    weightPercent: 8.42,
    pnlPercent: 15.29,
    marketCap: '$2.23T',
    peRatio: 41.36,
    week52Low: 151.61,
    week52High: 219.85,
    divYield: '—',
    eps: 5.14,
    analystConsensus: 'Buy',
    analystScore: 4.3,
    chart: [190, 195, 193, 198, 202, 200, 206, 204, 209, 207, 211, 213],
    news: [
      { headline: 'AWS margin expansion tops forecasts in latest quarter', source: 'MarketPulse', date: 'AUG 17' },
    ],
  },
  {
    ticker: 'GOOGL',
    company: 'Alphabet Inc.',
    price: 194.73,
    dayChangePercent: -1.05,
    positionValue: 1_874_220.03,
    weightPercent: 7.55,
    pnlPercent: 12.48,
    marketCap: '$2.39T',
    peRatio: 26.91,
    week52Low: 130.67,
    week52High: 201.42,
    divYield: '0.41%',
    eps: 7.24,
    analystConsensus: 'Buy',
    analystScore: 4.2,
    chart: [180, 183, 186, 184, 189, 192, 188, 195, 191, 197, 193, 195],
    news: [
      { headline: 'Search ad revenue steady despite AI answer-engine shift', source: 'Sector Wire', date: 'AUG 14' },
    ],
  },
  {
    ticker: 'META',
    company: 'Meta Platforms, Inc.',
    price: 612.88,
    dayChangePercent: 2.02,
    positionValue: 1_602_558.71,
    weightPercent: 6.46,
    pnlPercent: 27.91,
    marketCap: '$1.56T',
    peRatio: 28.44,
    week52Low: 414.5,
    week52High: 634.24,
    divYield: '0.32%',
    eps: 21.56,
    analystConsensus: 'Buy',
    analystScore: 4.0,
    chart: [560, 570, 565, 580, 575, 590, 585, 598, 602, 596, 608, 613],
    news: [
      { headline: 'Reality Labs losses narrow on device cost cuts', source: 'Bloom Wire', date: 'AUG 11' },
    ],
  },
  {
    ticker: 'JPM',
    company: 'JPMorgan Chase & Co.',
    price: 268.14,
    dayChangePercent: 0.31,
    positionValue: 1_311_886.4,
    weightPercent: 5.29,
    pnlPercent: 9.83,
    marketCap: '$766.2B',
    peRatio: 13.87,
    week52Low: 194.32,
    week52High: 279.61,
    divYield: '2.06%',
    eps: 19.33,
    analystConsensus: 'Hold',
    analystScore: 3.4,
    chart: [250, 252, 255, 253, 258, 256, 261, 259, 264, 262, 266, 268],
    news: [
      { headline: 'Net interest income holds steady amid rate cuts', source: 'MarketPulse', date: 'AUG 13' },
    ],
  },
  {
    ticker: 'XOM',
    company: 'Exxon Mobil Corporation',
    price: 118.62,
    dayChangePercent: -0.62,
    positionValue: 986_224.17,
    weightPercent: 3.97,
    pnlPercent: 4.11,
    marketCap: '$471.9B',
    peRatio: 14.22,
    week52Low: 98.53,
    week52High: 126.34,
    divYield: '3.28%',
    eps: 8.34,
    analystConsensus: 'Hold',
    analystScore: 3.2,
    chart: [112, 114, 113, 116, 115, 118, 117, 120, 119, 116, 118, 119],
    news: [
      { headline: 'Refining margins soften on seasonal demand slowdown', source: 'Sector Wire', date: 'AUG 09' },
    ],
  },
]

export function getHolding(ticker: string): Holding | undefined {
  return HOLDINGS.find((holding) => holding.ticker === ticker)
}
