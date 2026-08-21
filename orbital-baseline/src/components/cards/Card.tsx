import type { CSSProperties, ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  padded?: boolean
}

export function Card({ children, className, style, padded = true }: CardProps) {
  return (
    <div className={[styles.card, padded ? styles.padded : '', className].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  )
}
