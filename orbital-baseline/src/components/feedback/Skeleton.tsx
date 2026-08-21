import type { CSSProperties } from 'react'
import styles from './Skeleton.module.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  radius?: number
  style?: CSSProperties
}

export function Skeleton({ width = '100%', height = 16, radius = 4, style }: SkeletonProps) {
  return <div className={styles.skeleton} style={{ width, height, borderRadius: radius, ...style }} />
}
