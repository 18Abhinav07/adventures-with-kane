import { useEffect, type RefObject } from 'react'

export function useClickOutside(
  refs: Array<RefObject<HTMLElement | null>>,
  onOutside: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node
      const inside = refs.some((ref) => ref.current?.contains(target))
      if (!inside) onOutside()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [refs, onOutside, active])
}
