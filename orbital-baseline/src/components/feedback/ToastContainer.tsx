import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { useAppState } from '../../hooks/useAppState'
import styles from './ToastContainer.module.css'

const DURATION_MS = 3500

function ToastItem({ id, title, message }: { id: string; title: string; message: string }) {
  const { dispatch } = useAppState()

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [id, dispatch])

  return (
    <motion.div
      className={styles.toast}
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.message}>{message}</span>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        className={styles.close}
        onClick={() => dispatch({ type: 'REMOVE_TOAST', id })}
      >
        <X size={14} />
      </button>
      <motion.div
        className={styles.progress}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: DURATION_MS / 1000, ease: 'linear' }}
      />
    </motion.div>
  )
}

export function ToastContainer() {
  const { state } = useAppState()

  return createPortal(
    <div className={styles.wrap} role="status" aria-live="polite">
      <AnimatePresence>
        {state.toasts.map((t) => (
          <ToastItem key={t.id} id={t.id} title={t.title} message={t.message} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
