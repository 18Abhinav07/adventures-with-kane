import type { Holding } from '../types'
import { createRng, rngRange } from '../utils/rng'

const NAMES: Record<string, string> = {
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft Corporation',
  NVDA: 'NVIDIA Corporation',
  AMZN: 'Amazon.com, Inc.',
  GOOGL: 'Alphabet Inc.',
  META: 'Meta Platforms, Inc.',
  JPM: 'JPMorgan Chase & Co.',
  XOM: 'Exxon Mobil Corporation',
}

const BASE_PRICE: Record<string, number> = {
  AAPL: 228.41,
  MSFT: 441.73,
  NVDA: 181.92,
  AMZN: 198.34,
  GOOGL: 176.22,
  META: 612.85,
  JPM: 224.11,
  XOM: 118.47,
}

const WEIGHTS: Record<string, number> = {
  AAPL: 12.4,
  MSFT: 11.8,
  NVDA: 14.1,
  AMZN: 8.9,
  GOOGL: 7.2,
  META: 6.5,
  JPM: 5.8,
  XOM: 4.1,
}

let cache: Holding[] | null = null

export function getHoldings(): Holding[] {
  if (cache) return cache
  const rng = createRng(7734221)
  const tickers = Object.keys(NAMES)
  cache = tickers.map((ticker) => {
    const price = BASE_PRICE[ticker]
    const dayChangePct = rngRange(rng, -3.2, 3.4)
    const weight = WEIGHTS[ticker]
    const position = getAllocationTotalStub() * (weight / 100)
    const pnl = position * rngRange(rng, 0.02, 0.34)
    return {
      ticker,
      name: NAMES[ticker],
      price,
      dayChangePct,
      position,
      weight,
      pnl,
    }
  })
  return cache
}

function getAllocationTotalStub(): number {
  return 24_816_392.41
}
