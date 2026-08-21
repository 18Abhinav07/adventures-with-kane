import styles from './Badge.module.css'

export type BadgeTone = 'positive' | 'negative' | 'warning' | 'information' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  tone?: BadgeTone
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={[styles.badge, styles[tone]].join(' ')}>{children}</span>
}
