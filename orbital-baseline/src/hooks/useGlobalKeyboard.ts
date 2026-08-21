import { useEffect } from 'react'
import { useAppState } from './useAppState'

export function useGlobalKeyboard(searchInputRef: React.RefObject<HTMLInputElement | null>) {
  const { dispatch, closeTopOverlay } = useAppState()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (isCmdK) {
        e.preventDefault()
        searchInputRef.current?.focus()
        dispatch({ type: 'SET_SEARCH_FOCUSED', focused: true })
        return
      }
      if (e.key === 'Escape') {
        const handled = closeTopOverlay()
        if (!handled && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch, closeTopOverlay, searchInputRef])
}
