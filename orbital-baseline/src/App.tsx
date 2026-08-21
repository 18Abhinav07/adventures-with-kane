import { useRef } from 'react'
import { AppStateProvider, useAppState } from './hooks/useAppState'
import { useGlobalKeyboard } from './hooks/useGlobalKeyboard'
import { GlobalHeader } from './components/header/GlobalHeader'
import { Sidebar } from './components/navigation/Sidebar'
import { WorkspaceHeader } from './components/controls/WorkspaceHeader'
import { PortfolioSummarySection } from './components/cards/PortfolioSummarySection'
import { PerformanceChart } from './components/charts/PerformanceChart'
import { AllocationDonut } from './components/charts/AllocationDonut'
import { HoldingsTable } from './components/holdings/HoldingsTable'
import { RiskMonitor } from './components/risk/RiskMonitor'
import { MarketOverview } from './components/markets/MarketOverview'
import { AlertsPanel } from './components/alerts/AlertsPanel'
import { RecentActivity } from './components/activity/RecentActivity'
import { SecurityModal } from './components/holdings/SecurityModal'
import { CustomizeDrawer } from './components/controls/CustomizeDrawer'
import { ToastContainer } from './components/feedback/ToastContainer'
import styles from './App.module.css'

function Dashboard() {
  const { state } = useAppState()
  const searchInputRef = useRef<HTMLInputElement>(null)
  useGlobalKeyboard(searchInputRef)

  const s = state.visibleSections

  return (
    <div className={styles.shell} data-density={state.density}>
      <GlobalHeader searchInputRef={searchInputRef} />

      <div className={styles.body}>
        <Sidebar />

        <main className={styles.main}>
          <WorkspaceHeader />

          {s.summary && <PortfolioSummarySection />}

          <div className={styles.grid}>
            {s.performance && (
              <div className={styles.colSpan8}>
                <PerformanceChart />
              </div>
            )}
            {s.allocation && (
              <div className={styles.colSpan4}>
                <AllocationDonut />
              </div>
            )}

            {s.holdings && (
              <div className={styles.colSpan7}>
                <HoldingsTable />
              </div>
            )}
            {s.risk && (
              <div className={styles.colSpan4}>
                <RiskMonitor />
              </div>
            )}

            {s.markets && (
              <div className={styles.colSpan8}>
                <MarketOverview />
              </div>
            )}
            {s.alerts && (
              <div className={styles.colSpan4}>
                <AlertsPanel />
              </div>
            )}

            {s.activity && (
              <div className={styles.colSpan12}>
                <RecentActivity />
              </div>
            )}
          </div>
        </main>
      </div>

      <SecurityModal />
      <CustomizeDrawer />
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <Dashboard />
    </AppStateProvider>
  )
}
