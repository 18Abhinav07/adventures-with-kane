import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

export function useCountUp(target: number, active: boolean, durationMs = 900): number {
  const reducedMotion = useReducedMotion()
  const [value, setValue] = useState(reducedMotion ? target : 0)

  useEffect(() => {
    if (!active) return
    if (reducedMotion) {
      setValue(target)
      return
    }
    let frame: number
    const start = performance.now()
    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(target * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, active, durationMs, reducedMotion])

  return value
}
