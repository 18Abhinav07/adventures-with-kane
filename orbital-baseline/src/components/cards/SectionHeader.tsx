import type { ReactNode } from 'react'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  title: string
  right?: ReactNode
}

export function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {right && <div className={styles.right}>{right}</div>}
    </div>
  )
}
