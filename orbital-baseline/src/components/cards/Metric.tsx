import styles from './Metric.module.css'

interface MetricProps {
  label: string
  value: string
  size?: 'hero' | 'large' | 'standard'
  tone?: 'positive' | 'negative' | 'neutral'
}

export function Metric({ label, value, size = 'standard', tone = 'neutral' }: MetricProps) {
  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      <span className={[styles.value, styles[size], styles[tone]].join(' ')}>{value}</span>
    </div>
  )
}
