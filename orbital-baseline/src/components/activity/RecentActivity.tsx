import { motion } from 'framer-motion'
import { Card } from '../cards/Card'
import { SectionHeader } from '../cards/SectionHeader'
import { Badge } from '../cards/Badge'
import { Skeleton } from '../feedback/Skeleton'
import { useAppState } from '../../hooks/useAppState'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { getActivity } from '../../data/activity'
import { formatCurrency } from '../../utils/format'
import type { ActivityStatus } from '../../types'
import styles from './RecentActivity.module.css'

const STATUS_TONE: Record<ActivityStatus, 'positive' | 'warning' | 'neutral'> = {
  COMPLETED: 'positive',
  OPEN: 'warning',
  PENDING: 'neutral',
}

export function RecentActivity() {
  const { state } = useAppState()
  const reducedMotion = useReducedMotion()
  const activity = getActivity()

  return (
    <Card>
      <SectionHeader title="Recent Activity" />

      {state.loading ? (
        <div className={styles.skeletonList}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={36} radius={4} />
          ))}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <div className={[styles.row, styles.headRow].join(' ')}>
            <span className={styles.colTime}>TIME</span>
            <span className={styles.colType}>TYPE</span>
            <span className={styles.colDesc}>DESCRIPTION</span>
            <span className={styles.colAsset}>ASSET</span>
            <span className={styles.colValue}>VALUE</span>
            <span className={styles.colStatus}>STATUS</span>
          </div>

          {activity.map((a, i) => (
            <motion.div
              key={a.id}
              className={styles.row}
              initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: i * 0.025, ease: [0.4, 0, 0.2, 1] }}
            >
              <span className={styles.colTime}>{a.time}</span>
              <span className={styles.colType}>{a.type}</span>
              <span className={styles.colDesc}>{a.description}</span>
              <span className={styles.colAsset}>{a.asset}</span>
              <span className={styles.colValue}>{a.value !== null ? formatCurrency(a.value, 0) : '—'}</span>
              <span className={styles.colStatus}>
                <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  )
}
