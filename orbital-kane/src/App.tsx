import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import WorkspaceHeader, { DEFAULT_TIME_RANGE } from './components/WorkspaceHeader'
import SummaryCards from './components/SummaryCards'
import PerformanceCard from './components/PerformanceCard'
import AllocationCard from './components/AllocationCard'
import HoldingsCard from './components/HoldingsCard'
import RiskMonitorCard from './components/RiskMonitorCard'
import MarketOverviewCard from './components/MarketOverviewCard'
import AlertsCard from './components/AlertsCard'
import RecentActivityCard from './components/RecentActivityCard'
import { NAV_SECTIONS, DEFAULT_NAV_LABEL } from './data/navigation'
import {
  DEFAULT_DENSITY,
  DEFAULT_VISIBLE_SECTIONS,
  DEFAULT_CHART_OPTIONS,
  type DisplayDensity,
  type ChartOption,
} from './data/customize'
import './App.css'

const ALL_ITEMS = NAV_SECTIONS.flatMap((section) => section.items)
const WORKSPACE_SUBTITLE = 'Institutional Multi-Asset Strategy · As of Aug 20, 2026'

function App() {
  const [activeLabel, setActiveLabel] = useState(DEFAULT_NAV_LABEL)
  const [timeRange, setTimeRange] = useState(DEFAULT_TIME_RANGE)
  const [density, setDensity] = useState<DisplayDensity>(DEFAULT_DENSITY)
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>(
    DEFAULT_VISIBLE_SECTIONS,
  )
  const [chartOptions, setChartOptions] = useState<Record<ChartOption['id'], boolean>>(
    DEFAULT_CHART_OPTIONS,
  )
  const activeItem = ALL_ITEMS.find((item) => item.label === activeLabel) ?? ALL_ITEMS[0]
  const isOverview = activeLabel === DEFAULT_NAV_LABEL

  const handleToggleSection = (id: string) => {
    setVisibleSections((current) => ({ ...current, [id]: !current[id] }))
  }

  const handleToggleChartOption = (id: ChartOption['id']) => {
    setChartOptions((current) => ({ ...current, [id]: !current[id] }))
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar activeLabel={activeLabel} onActivate={setActiveLabel} />
        <main className="main-workspace">
          <WorkspaceHeader
            heading={activeItem.heading}
            subtitle={WORKSPACE_SUBTITLE}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            density={density}
            onDensityChange={setDensity}
            visibleSections={visibleSections}
            onToggleSection={handleToggleSection}
            chartOptions={chartOptions}
            onToggleChartOption={handleToggleChartOption}
          />
          <div className="workspace-content">
            {isOverview && (
              <div className={`dashboard-stack density-${density.toLowerCase()}`}>
                {visibleSections.summary && <SummaryCards />}
                {(visibleSections.performance || visibleSections.allocation) && (
                  <div className="dashboard-grid-row">
                    {visibleSections.performance && (
                      <PerformanceCard
                        timeRange={timeRange}
                        showBenchmark={chartOptions.benchmark}
                        showGrid={chartOptions.grid}
                        showHoverIndicators={chartOptions.hoverIndicators}
                      />
                    )}
                    {visibleSections.allocation && <AllocationCard timeRange={timeRange} />}
                  </div>
                )}
                {visibleSections.holdings && <HoldingsCard />}
                {visibleSections.risk && <RiskMonitorCard />}
                {visibleSections.market && <MarketOverviewCard />}
                {visibleSections.alerts && <AlertsCard />}
                {visibleSections.activity && <RecentActivityCard />}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
