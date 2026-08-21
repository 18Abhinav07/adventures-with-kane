import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useClickOutside } from '../../hooks/useClickOutside'
import styles from './Popover.module.css'

interface PopoverProps {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  onClose: () => void
  children: ReactNode
  width?: number
  align?: 'start' | 'end'
  className?: string
}

export function Popover({ open, anchorRef, onClose, children, width = 280, align = 'start', className }: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!open) return
    function update() {
      const anchor = anchorRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const left = align === 'end' ? rect.right - width : rect.left
      const clampedLeft = Math.min(Math.max(left, 8), window.innerWidth - width - 8)
      setCoords({ top: rect.bottom + 8, left: clampedLeft })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, anchorRef, align, width])

  useClickOutside([panelRef, anchorRef], onClose, open)

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && coords && (
        <motion.div
          ref={panelRef}
          role="dialog"
          className={[styles.popover, className].filter(Boolean).join(' ')}
          style={{ top: coords.top, left: coords.left, width }}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
