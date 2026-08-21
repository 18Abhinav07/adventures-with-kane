# PRD Sections — Confirmed Use-Cases

Each section below is a confirmed use-case from the grilling conversation. All use-cases are
browser-observable UI on the ORBITAL single-page dashboard; none port or modify existing code
(the project was a bare Vite/React scaffold with no feature code), so no structural-preservation
assertions apply.

## UC-1: Monitor portfolio performance
verification_mode: kane
prd_ref: PRD.md §13, §14, §17, §18, §19

User views the portfolio-vs-benchmark performance chart with a time-range control (1D, 1W, 1M,
3M, YTD, 1Y, ALL — default 1M), a custom hover tooltip (date, portfolio value/return, benchmark
return), and click-to-lock point selection that persists the tooltip and shows a lock icon until
a second click or Escape clears it. Changing time range clears any locked point and updates the
chart data range, x-axis labels, and period comparison without altering the summary cards.

## UC-2: Review holdings and inspect securities
verification_mode: kane
prd_ref: PRD.md §21, §22, §23

User views the Top Holdings table (AAPL, MSFT, NVDA, AMZN, GOOGL, META, JPM, XOM) with columns
Asset/Price/Day/Position/Weight/P&L. Hovering or activating a ticker opens a Security Preview
Popover (price, daily move, market cap, P/E, 52-week range) without causing page reflow.
Clicking "OPEN SECURITY" opens a 920×640 in-page Security Detail Modal (chart, fundamentals,
analyst consensus, recent news) that closes via Escape, close button, or backdrop click, and does
not close on a click inside the modal body.

## UC-3: Monitor portfolio risk and concentration warnings
verification_mode: kane
prd_ref: PRD.md §24, §25

User views the Portfolio Risk card (Volatility, Sharpe, Beta, Max Drawdown, VaR 95%) and a risk
gauge (LOW–MODERATE–HIGH, value 61, status MODERATE). An interactive concentration warning
("Technology exposure exceeds target by 4.2%") opens a Risk Warning Popover (current allocation,
target, deviation, recommended action) anchored to the warning, closing on outside click or
Escape.

## UC-4: Analyze portfolio allocation
verification_mode: kane
prd_ref: PRD.md §20

User views the allocation donut chart (Equities 48%, Fixed Income 24%, Alternatives 13%, Cash
9%, Commodities 6%) with a center label showing total value. Hovering a segment expands it 4px,
highlights the matching legend item, and replaces the center label with the selected allocation
(220ms ease-out). Clicking locks the segment selection; clicking the same segment again unlocks
it. Changing chart/time-range context clears the selection.

## UC-5: Review and expand portfolio alerts
verification_mode: kane
prd_ref: PRD.md §27

User views the Alerts panel (severity, title, timestamp, dismiss control) and clicks an alert to
expand its content inline. Only one alert may be expanded at a time — opening another collapses
the previously expanded one. The alert list itself never becomes a modal.

## UC-6: Customize dashboard layout and chart display
verification_mode: kane
prd_ref: PRD.md §30, §44 (Customize/Benchmark/Grid invariants)

User opens the right-side Customize Drawer (340px) to set Display Density (Compact/Comfortable/
Spacious), toggle section visibility (Portfolio Summary, Performance, Allocation, Holdings, Risk,
Market Overview, Alerts, Activity), and toggle chart options (Benchmark, Grid, Hover Indicators).
Disabling a section removes it and the surrounding layout reflows; re-enabling restores it.
Disabling Benchmark removes the benchmark line and its legend entry; disabling Grid removes chart
gridlines; disabling Hover Indicators removes the active hover marker.

## UC-7: Navigate dashboard contexts
verification_mode: kane
prd_ref: PRD.md §12

User uses the left sidebar (Overview, Portfolio, Markets, Watchlist, Transactions; Performance,
Risk, Attribution, Scenarios; Research Notes, Saved Views, Reports; Alerts, Data Health) to
switch the active navigation item without leaving the single page. The active item shows a 3px
left accent, changed surface, and stronger text/icon; the workspace heading updates accordingly.
Default selected item is Overview.

## UC-8: Review market instruments
verification_mode: kane
prd_ref: PRD.md §26

User views the Market Overview card listing four instruments (S&P 500, NASDAQ, DOW, BTC/USD),
each with value, daily percentage change, and a deterministic sparkline. Hovering a row
emphasizes it and subtly enlarges its sparkline region without changing row height or moving
neighboring content.

## UC-9: Review recent portfolio activity
verification_mode: kane
prd_ref: PRD.md §28

User views the full-width Recent Activity table (Time, Type, Description, Asset, Value, Status)
listing recent buy/sell/alert/dividend/rebalance events, with status shown as compact pills.

## UC-10: Search assets, metrics, and reports
verification_mode: kane
prd_ref: PRD.md §11.2

User interacts with the centered global search field ("Search assets, metrics, reports...",
420×36px). Cmd/Ctrl+K focuses the field; focus changes the border to information blue with a
subtle focus ring; Escape clears focus/search overlay; the field remains visually stable while
focused.

## UC-11: Export portfolio views and reports
verification_mode: kane
prd_ref: PRD.md §29, §32

User clicks Export to open a 280px popover with four export options (Export Current View,
Holdings, Transactions, Risk Report), each with icon/title/description, and a format selector
(CSV/JSON/PDF, default CSV). Selecting an export action produces a fake success toast (no real
export is performed) that enters from bottom-right, remains ~3.5s with a timed progress
indicator, and is dismissible.

## UC-12: Review profile information and options
verification_mode: kane
prd_ref: PRD.md §31

User clicks the avatar ("AP") to open a Profile Popover showing identity (Abhinav Pangaria,
Portfolio Manager), workspace (Institutional Demo), and status (Active), plus actions
(Preferences, Keyboard shortcuts, Sign out) — none of which navigate away from the page.
