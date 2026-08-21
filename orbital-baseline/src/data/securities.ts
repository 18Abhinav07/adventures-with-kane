import type { PerformancePoint, Security } from '../types'
import { createRng, rngRange } from '../utils/rng'
import { getHoldings } from './holdings'

const FUNDAMENTALS: Record<
  string,
  { marketCap: number; peRatio: number; week52Low: number; week52High: number; dividendYield: number; eps: number }
> = {
  AAPL: { marketCap: 3.48e12, peRatio: 34.2, week52Low: 164.08, week52High: 237.23, dividendYield: 0.44, eps: 6.68 },
  MSFT: { marketCap: 3.28e12, peRatio: 36.1, week52Low: 385.58, week52High: 468.35, dividendYield: 0.68, eps: 12.22 },
  NVDA: { marketCap: 4.42e12, peRatio: 54.18, week52Low: 95.14, week52High: 184.49, dividendYield: 0.03, eps: 3.36 },
  AMZN: { marketCap: 2.08e12, peRatio: 41.7, week52Low: 151.61, week52High: 219.28, dividendYield: 0, eps: 4.76 },
  GOOGL: { marketCap: 2.16e12, peRatio: 24.6, week52Low: 130.67, week52High: 191.75, dividendYield: 0.42, eps: 7.16 },
  META: { marketCap: 1.56e12, peRatio: 27.3, week52Low: 414.5, week52High: 638.4, dividendYield: 0.34, eps: 22.45 },
  JPM: { marketCap: 638e9, peRatio: 12.9, week52Low: 178.32, week52High: 236.1, dividendYield: 2.18, eps: 17.38 },
  XOM: { marketCap: 478e9, peRatio: 13.6, week52Low: 98.02, week52High: 126.34, dividendYield: 3.42, eps: 8.71 },
}

const CONSENSUS: Record<string, 'BUY' | 'HOLD' | 'SELL'> = {
  AAPL: 'BUY',
  MSFT: 'BUY',
  NVDA: 'BUY',
  AMZN: 'BUY',
  GOOGL: 'HOLD',
  META: 'HOLD',
  JPM: 'HOLD',
  XOM: 'SELL',
}

const NEWS: Record<string, { headline: string; source: string; timestamp: string }[]> = {
  NVDA: [
    { headline: 'NVIDIA extends AI accelerator lead with next-gen architecture', source: 'MarketWire', timestamp: '2h ago' },
    { headline: 'Data center demand continues to outpace supply', source: 'Capital Desk', timestamp: '6h ago' },
    { headline: 'Analysts raise price targets ahead of earnings', source: 'Street Signal', timestamp: '1d ago' },
  ],
}

function defaultNews(name: string): { headline: string; source: string; timestamp: string }[] {
  return [
    { headline: `${name} trades in line with sector following broad market session`, source: 'MarketWire', timestamp: '3h ago' },
    { headline: `Institutional positioning in ${name} little changed week-over-week`, source: 'Capital Desk', timestamp: '9h ago' },
    { headline: `${name} included in latest sector rotation commentary`, source: 'Street Signal', timestamp: '1d ago' },
  ]
}

function buildMiniChart(ticker: string, price: number, changePct: number): PerformancePoint[] {
  const rng = createRng(ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 131)
  const steps = 30
  const startPrice = price / (1 + changePct / 100 / 4)
  const points: PerformancePoint[] = []
  let v = startPrice
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    v = v + (price - v) * (t / steps) * 2 + v * rngRange(rng, -0.006, 0.006)
    const date = new Date(2026, 6, 21 + i)
    points.push({
      date: date.toISOString(),
      label: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      portfolioValue: v,
      benchmarkValue: v * 0.98,
      portfolioReturnPct: ((v - startPrice) / startPrice) * 100,
      benchmarkReturnPct: (((v * 0.98) - startPrice * 0.98) / (startPrice * 0.98)) * 100,
    })
  }
  points[points.length - 1].portfolioValue = price
  return points
}

let cache: Record<string, Security> | null = null

export function getSecurities(): Record<string, Security> {
  if (cache) return cache
  const holdings = getHoldings()
  const result: Record<string, Security> = {}
  for (const h of holdings) {
    const f = FUNDAMENTALS[h.ticker]
    result[h.ticker] = {
      ticker: h.ticker,
      name: h.name,
      price: h.price,
      changePct: h.dayChangePct,
      fundamentals: f,
      analystConsensus: CONSENSUS[h.ticker] ?? 'HOLD',
      analystTargetPrice: h.price * 1.08,
      chart: buildMiniChart(h.ticker, h.price, h.dayChangePct),
      news: NEWS[h.ticker] ?? defaultNews(h.name),
    }
  }
  cache = result
  return result
}
