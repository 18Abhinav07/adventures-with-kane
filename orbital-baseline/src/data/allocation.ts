import type { AllocationSlice } from '../types'

const TOTAL = 24_816_392.41

const RAW: Array<{ name: string; pct: number; color: string }> = [
  { name: 'Equities', pct: 48, color: 'var(--color-information)' },
  { name: 'Fixed Income', pct: 24, color: 'var(--color-positive)' },
  { name: 'Alternatives', pct: 13, color: 'var(--color-warning)' },
  { name: 'Cash', pct: 9, color: 'var(--color-neutral)' },
  { name: 'Commodities', pct: 6, color: 'var(--color-negative)' },
]

export function getAllocation(): AllocationSlice[] {
  return RAW.map((slice) => ({
    ...slice,
    value: TOTAL * (slice.pct / 100),
  }))
}

export function getAllocationTotal(): number {
  return TOTAL
}
