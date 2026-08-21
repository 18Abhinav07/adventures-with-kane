export interface AllocationSegment {
  label: string
  percent: number
  value: number
  color: string
}

const TOTAL_VALUE = 24816392.41

export const ALLOCATION_SEGMENTS: AllocationSegment[] = [
  { label: 'Equities', percent: 48, value: TOTAL_VALUE * 0.48, color: '#5DA9FF' },
  { label: 'Fixed Income', percent: 24, value: TOTAL_VALUE * 0.24, color: '#35C98A' },
  { label: 'Alternatives', percent: 13, value: TOTAL_VALUE * 0.13, color: '#B98AFA' },
  { label: 'Cash', percent: 9, value: TOTAL_VALUE * 0.09, color: '#E9B949' },
  { label: 'Commodities', percent: 6, value: TOTAL_VALUE * 0.06, color: '#7F8A9A' },
]

export const ALLOCATION_TOTAL_VALUE = TOTAL_VALUE
