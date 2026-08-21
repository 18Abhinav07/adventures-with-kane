import { forwardRef } from 'react'
import { Search } from 'lucide-react'
import { useAppState } from '../../hooks/useAppState'
import styles from './SearchField.module.css'

export const SearchField = forwardRef<HTMLInputElement>(function SearchField(_props, ref) {
  const { state, dispatch } = useAppState()

  return (
    <div className={[styles.wrap, state.searchFocused ? styles.focused : ''].join(' ')}>
      <Search size={14} className={styles.icon} aria-hidden="true" />
      <input
        ref={ref}
        type="text"
        className={styles.input}
        placeholder="Search assets, metrics, reports..."
        aria-label="Search assets, metrics, and reports"
        value={state.searchQuery}
        onFocus={() => dispatch({ type: 'SET_SEARCH_FOCUSED', focused: true })}
        onBlur={() => dispatch({ type: 'SET_SEARCH_FOCUSED', focused: false })}
        onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value })}
      />
      <span className={styles.kbd}>⌘ K</span>
    </div>
  )
})
