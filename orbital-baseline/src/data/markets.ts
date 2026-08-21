import type { MarketInstrument } from '../types'
import { createRng, rngRange } from '../utils/rng'

const RAW: Array<{ symbol: string; name: string; value: number; changePct: number; seed: number }> = [
  { symbol: 'S&P 500', name: 'S&P 500 Index', value: 5624.32, changePct: 0.42, seed: 1 },
  { symbol: 'NASDAQ', name: 'NASDAQ Composite', value: 19842.1, changePct: 0.81, seed: 2 },
  { symbol: 'DOW', name: 'Dow Jones Industrial Average', value: 41285.67, changePct: 0.17, seed: 3 },
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', value: 97412.5, changePct: -0.62, seed: 4 },
]

function buildSparkline(seed: number, changePct: number): number[] {
  const rng = createRng(seed * 9973 + 42)
  const points: number[] = []
  let v = 100
  const drift = changePct / 20 / 100
  for (let i = 0; i < 20; i++) {
    v *= 1 + drift + rngRange(rng, -0.004, 0.004)
    points.push(v)
  }
  return points
}

export function getMarketInstruments(): MarketInstrument[] {
  return RAW.map((m) => ({
    symbol: m.symbol,
    name: m.name,
    value: m.value,
    changePct: m.changePct,
    sparkline: buildSparkline(m.seed, m.changePct),
  }))
}
