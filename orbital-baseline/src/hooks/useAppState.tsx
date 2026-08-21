import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import type {
  ChartOptions,
  DashboardSectionId,
  Density,
  NavItemId,
  PerformancePoint,
  TimeRange,
  Toast,
  UserPreference,
} from '../types'
import { getDefaultPreferences } from '../data/preferences'

interface AppState {
  loading: boolean
  activeNavigation: NavItemId
  timeRange: TimeRange
  selectedPerformancePoint: PerformancePoint | null
  lockedPerformancePoint: PerformancePoint | null
  selectedAllocation: string | null
  lockedAllocation: string | null
  previewSecurity: string | null
  modalSecurity: string | null
  expandedAlert: string | null
  dismissedAlerts: string[]
  riskWarningOpen: boolean
  profilePopoverOpen: boolean
  exportPopoverOpen: boolean
  customizeDrawerOpen: boolean
  searchFocused: boolean
  searchQuery: string
  density: Density
  visibleSections: Record<DashboardSectionId, boolean>
  chartOptions: ChartOptions
  toasts: Toast[]
}

type Action =
  | { type: 'FINISH_LOADING' }
  | { type: 'SET_NAV'; id: NavItemId }
  | { type: 'SET_TIME_RANGE'; range: TimeRange }
  | { type: 'HOVER_PERFORMANCE_POINT'; point: PerformancePoint | null }
  | { type: 'CLICK_PERFORMANCE_POINT'; point: PerformancePoint }
  | { type: 'HOVER_ALLOCATION'; name: string | null }
  | { type: 'CLICK_ALLOCATION'; name: string }
  | { type: 'OPEN_SECURITY_PREVIEW'; ticker: string }
  | { type: 'CLOSE_SECURITY_PREVIEW' }
  | { type: 'OPEN_SECURITY_MODAL'; ticker: string }
  | { type: 'CLOSE_SECURITY_MODAL' }
  | { type: 'TOGGLE_ALERT'; id: string }
  | { type: 'DISMISS_ALERT'; id: string }
  | { type: 'OPEN_RISK_WARNING' }
  | { type: 'CLOSE_RISK_WARNING' }
  | { type: 'TOGGLE_PROFILE_POPOVER' }
  | { type: 'CLOSE_PROFILE_POPOVER' }
  | { type: 'TOGGLE_EXPORT_POPOVER' }
  | { type: 'CLOSE_EXPORT_POPOVER' }
  | { type: 'TOGGLE_CUSTOMIZE_DRAWER' }
  | { type: 'CLOSE_CUSTOMIZE_DRAWER' }
  | { type: 'SET_SEARCH_FOCUSED'; focused: boolean }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_DENSITY'; density: Density }
  | { type: 'TOGGLE_SECTION'; id: DashboardSectionId }
  | { type: 'TOGGLE_CHART_OPTION'; key: keyof ChartOptions }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'CLOSE_ALL_OVERLAYS' }

function initialState(): AppState {
  const prefs: UserPreference = getDefaultPreferences()
  return {
    loading: true,
    activeNavigation: 'overview',
    timeRange: '1M',
    selectedPerformancePoint: null,
    lockedPerformancePoint: null,
    selectedAllocation: null,
    lockedAllocation: null,
    previewSecurity: null,
    modalSecurity: null,
    expandedAlert: null,
    dismissedAlerts: [],
    riskWarningOpen: false,
    profilePopoverOpen: false,
    exportPopoverOpen: false,
    customizeDrawerOpen: false,
    searchFocused: false,
    searchQuery: '',
    density: prefs.density,
    visibleSections: prefs.visibleSections,
    chartOptions: prefs.chartOptions,
    toasts: [],
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'FINISH_LOADING':
      return { ...state, loading: false }
    case 'SET_NAV':
      return { ...state, activeNavigation: action.id }
    case 'SET_TIME_RANGE':
      return {
        ...state,
        timeRange: action.range,
        selectedPerformancePoint: null,
        lockedPerformancePoint: null,
      }
    case 'HOVER_PERFORMANCE_POINT':
      return { ...state, selectedPerformancePoint: action.point }
    case 'CLICK_PERFORMANCE_POINT': {
      const isSame = state.lockedPerformancePoint?.date === action.point.date
      return { ...state, lockedPerformancePoint: isSame ? null : action.point }
    }
    case 'HOVER_ALLOCATION':
      return { ...state, selectedAllocation: action.name }
    case 'CLICK_ALLOCATION': {
      const isSame = state.lockedAllocation === action.name
      return { ...state, lockedAllocation: isSame ? null : action.name }
    }
    case 'OPEN_SECURITY_PREVIEW':
      return { ...state, previewSecurity: action.ticker }
    case 'CLOSE_SECURITY_PREVIEW':
      return { ...state, previewSecurity: null }
    case 'OPEN_SECURITY_MODAL':
      return { ...state, modalSecurity: action.ticker, previewSecurity: null }
    case 'CLOSE_SECURITY_MODAL':
      return { ...state, modalSecurity: null }
    case 'TOGGLE_ALERT':
      return { ...state, expandedAlert: state.expandedAlert === action.id ? null : action.id }
    case 'DISMISS_ALERT':
      return {
        ...state,
        dismissedAlerts: [...state.dismissedAlerts, action.id],
        expandedAlert: state.expandedAlert === action.id ? null : state.expandedAlert,
      }
    case 'OPEN_RISK_WARNING':
      return { ...state, riskWarningOpen: true }
    case 'CLOSE_RISK_WARNING':
      return { ...state, riskWarningOpen: false }
    case 'TOGGLE_PROFILE_POPOVER':
      return { ...state, profilePopoverOpen: !state.profilePopoverOpen, exportPopoverOpen: false }
    case 'CLOSE_PROFILE_POPOVER':
      return { ...state, profilePopoverOpen: false }
    case 'TOGGLE_EXPORT_POPOVER':
      return { ...state, exportPopoverOpen: !state.exportPopoverOpen, profilePopoverOpen: false }
    case 'CLOSE_EXPORT_POPOVER':
      return { ...state, exportPopoverOpen: false }
    case 'TOGGLE_CUSTOMIZE_DRAWER':
      return { ...state, customizeDrawerOpen: !state.customizeDrawerOpen }
    case 'CLOSE_CUSTOMIZE_DRAWER':
      return { ...state, customizeDrawerOpen: false }
    case 'SET_SEARCH_FOCUSED':
      return { ...state, searchFocused: action.focused }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query }
    case 'SET_DENSITY':
      return { ...state, density: action.density }
    case 'TOGGLE_SECTION':
      return {
        ...state,
        visibleSections: { ...state.visibleSections, [action.id]: !state.visibleSections[action.id] },
      }
    case 'TOGGLE_CHART_OPTION':
      return {
        ...state,
        chartOptions: { ...state.chartOptions, [action.key]: !state.chartOptions[action.key] },
      }
    case 'ADD_TOAST': {
      const next = [...state.toasts, action.toast]
      const trimmed = next.length > 3 ? next.slice(next.length - 3) : next
      return { ...state, toasts: trimmed }
    }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }
    case 'CLOSE_ALL_OVERLAYS':
      return {
        ...state,
        profilePopoverOpen: false,
        exportPopoverOpen: false,
        customizeDrawerOpen: false,
        previewSecurity: null,
        modalSecurity: null,
        riskWarningOpen: false,
      }
    default:
      return state
  }
}

interface AppStateContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  addToast: (title: string, message: string) => void
  closeTopOverlay: () => boolean
}

const AppStateContext = createContext<AppStateContextValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const toastIdRef = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch({ type: 'FINISH_LOADING' }), 700)
    return () => window.clearTimeout(timer)
  }, [])

  const addToast = useCallback((title: string, message: string) => {
    toastIdRef.current += 1
    dispatch({
      type: 'ADD_TOAST',
      toast: { id: `toast-${toastIdRef.current}-${Date.now()}`, title, message, createdAt: Date.now() },
    })
  }, [])

  const closeTopOverlay = useCallback((): boolean => {
    let handled = false
    if (state.modalSecurity) {
      dispatch({ type: 'CLOSE_SECURITY_MODAL' })
      handled = true
    } else if (state.customizeDrawerOpen) {
      dispatch({ type: 'CLOSE_CUSTOMIZE_DRAWER' })
      handled = true
    } else if (state.exportPopoverOpen) {
      dispatch({ type: 'CLOSE_EXPORT_POPOVER' })
      handled = true
    } else if (state.profilePopoverOpen) {
      dispatch({ type: 'CLOSE_PROFILE_POPOVER' })
      handled = true
    } else if (state.riskWarningOpen) {
      dispatch({ type: 'CLOSE_RISK_WARNING' })
      handled = true
    } else if (state.previewSecurity) {
      dispatch({ type: 'CLOSE_SECURITY_PREVIEW' })
      handled = true
    } else if (state.lockedPerformancePoint) {
      dispatch({ type: 'HOVER_PERFORMANCE_POINT', point: null })
      dispatch({ type: 'CLICK_PERFORMANCE_POINT', point: state.lockedPerformancePoint })
      handled = true
    } else if (state.lockedAllocation) {
      dispatch({ type: 'CLICK_ALLOCATION', name: state.lockedAllocation })
      handled = true
    } else if (state.searchFocused) {
      dispatch({ type: 'SET_SEARCH_FOCUSED', focused: false })
      dispatch({ type: 'SET_SEARCH_QUERY', query: '' })
      handled = true
    }
    return handled
  }, [state])

  const value = useMemo(
    () => ({ state, dispatch, addToast, closeTopOverlay }),
    [state, addToast, closeTopOverlay],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

export type { AppState, Action }
