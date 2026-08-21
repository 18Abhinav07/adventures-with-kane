# ORBITAL — Institutional Portfolio Intelligence Terminal

## Frontend Benchmark Product Requirements Document

### 1. Purpose

Build a single-page institutional financial dashboard called **ORBITAL**.

ORBITAL is a fictional portfolio-management and market-intelligence terminal used by an investment professional to monitor portfolio performance, holdings, allocation, risk, markets, alerts, transactions, and research context.

The application is a **static frontend benchmark**. It does not require authentication, backend services, real trading, external APIs, or real financial data.

All data must be deterministic local mock data.

The benchmark evaluates an agent's ability to translate a dense product specification into a coherent, visually precise, interactive frontend while maintaining consistency across layout, state, responsive behavior, animation, overlays, accessibility, and component architecture.

The application must feel like a serious institutional financial product, not a generic SaaS dashboard.

---

# 2. Core Product Constraint

The entire experience must be a **single page**.

There must be:

* no application routing
* no separate dashboard pages
* no navigation to another URL
* no multi-page workflow

Sidebar items may alter active navigation state or contextual content, but the application remains within the same page.

Modals, drawers, popovers, overlays, and expanded panels are allowed.

---

# 3. Technology

Use:

* React
* TypeScript
* Vite
* CSS / CSS Modules
* Framer Motion or equivalent for animation
* Recharts, SVG, Canvas, or equivalent for charts

Allowed:

* Lucide or equivalent icon library
* custom SVG icons
* seeded local data generation

Do not use:

* Material UI
* Chakra
* Ant Design
* Bootstrap
* prebuilt dashboard templates
* prebuilt financial-terminal templates
* externally hosted UI component collections

The visual system must be implemented specifically for ORBITAL.

---

# 4. Design Objective

The interface must communicate:

**precision / financial infrastructure / information density / control / monitoring**

The visual language is:

* dark
* compact
* restrained
* highly structured
* information-dense
* crisp
* professional
* institutional

It must not look like:

* a marketing landing page
* a crypto website
* a consumer banking app
* a generic analytics SaaS template
* a glassmorphism concept
* a neon dashboard
* a card-grid template with excessive whitespace

---

# 5. Reference Viewport

Primary evaluation viewport:

```text
1440 × 1100
```

The implementation must also support:

```text
1280 × 1000
1024 × 900
900 × 900
768 × 1024
640 × 900
390 × 844
```

---

# 6. Global Design Tokens

## 6.1 Colors

Use these semantic colors throughout the application.

### Base

```text
Background        #080B10
Primary Surface   #0D1118
Secondary Surface #111722
Elevated Surface  #161D29

Border            #252D3A
Strong Border     #323C4C

Primary Text      #F4F6F8
Secondary Text    #9AA4B2
Muted Text        #697383
```

### Semantic

```text
Positive          #35C98A
Negative          #F05D67
Warning           #E9B949
Information       #5DA9FF
Neutral           #7F8A9A
```

No arbitrary additional UI colors should be introduced without a clear semantic reason.

---

# 7. Typography

Primary font:

```text
Inter
```

Numeric financial values must use tabular numerals.

Use:

```css
font-variant-numeric: tabular-nums;
```

where appropriate.

### Hierarchy

```text
Page title       18px / 600
Section title    13px / 600
Body             12px / 400
Secondary        11px / 400
Micro label      10px / 500

Hero metric      28px / 600
Large metric     20px / 600
Standard metric  14px / 600
```

No element may use typography larger than 28px.

---

# 8. Spacing System

Use a 4px base spacing system.

Preferred spacing values:

```text
4
8
12
16
20
24
28
32
40
48
```

Avoid arbitrary spacing values unless required for chart geometry or typography.

---

# 9. Radius System

Use restrained rounding.

Allowed:

```text
2px
4px
6px
```

Primary cards:

```text
6px
```

Buttons:

```text
4px
```

Popovers:

```text
6px
```

Do not use large rounded SaaS-style containers.

---

# 10. Global Geometry

Application shell:

```text
┌──────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER                                                 │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│               │                                              │
│ LEFT SIDEBAR  │              MAIN WORKSPACE                  │
│               │                                              │
│               │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

Desktop:

```text
Header height: 64px
Sidebar width: 228px
```

Header is sticky.

Sidebar is fixed.

Main workspace scrolls independently.

---

# 11. Global Header

Header content from left to right.

## 11.1 Brand

Display a custom geometric logo mark with:

```text
ORBITAL
```

Do not use Unicode as the actual logo graphic.

The wordmark should use:

```text
font-weight: 600
letter-spacing: approximately 0.02em
```

Next to the logo:

```text
GLOBAL MARKET
```

Then:

```text
● OPEN
```

The status dot is positive green.

---

## 11.2 Global Search

Centered search field:

```text
Search assets, metrics, reports...
```

Width:

```text
420px
```

Height:

```text
36px
```

Right side:

```text
⌘ K
```

Requirements:

* focus changes border to information blue
* subtle focus ring
* keyboard shortcut works
* Cmd/Ctrl + K focuses the field
* Escape clears focus/search overlay
* search field remains visually stable when focused

---

## 11.3 Header Right

Display:

```text
UTC 14:37:22
```

Then:

* notification bell
* notification badge showing `3`
* avatar containing `AP`

Avatar click opens profile popover.

---

# 12. Sidebar

Sidebar sections.

## PRIMARY

```text
Overview
Portfolio
Markets
Watchlist
Transactions
```

## ANALYTICS

```text
Performance
Risk
Attribution
Scenarios
```

## RESEARCH

```text
Research Notes
Saved Views
Reports
```

## SYSTEM

```text
Alerts
Data Health
```

Bottom environment block:

```text
DEMO ENVIRONMENT
Market data simulated
```

### Sidebar behavior

Default selected item:

```text
Overview
```

Active navigation item must have:

* 3px left accent
* changed surface/background
* stronger text
* stronger icon

Items:

```text
height: 36px
```

Section headings:

```text
10px
uppercase
```

Hover:

* subtle surface change
* no layout shift
* icon must not move
* transition 160–180ms

Sidebar navigation does not route away.

Clicking an item changes active state and contextual page heading.

---

# 13. Workspace Header

Main workspace begins with:

```text
Portfolio Overview
```

Subtitle:

```text
Institutional Multi-Asset Strategy · As of Aug 20, 2026
```

Right side controls:

```text
1D
1W
1M
3M
YTD
1Y
ALL
```

Default:

```text
1M
```

Additional controls:

```text
Export
Customize
```

---

# 14. Time Range Control

Time-range control is segmented.

Exactly one value is active.

Changing the value must update:

* performance chart data range
* visible x-axis labels
* displayed period comparison

The summary cards should remain based on the current dashboard summary and must not change merely because the chart is hovered.

---

# 15. Portfolio Summary

Four metric cards.

## Total Portfolio

```text
TOTAL PORTFOLIO

$24,816,392.41

+$184,219.22
+0.75%
```

## Today

```text
TODAY

+$84,219.17

+0.34%
```

## YTD Return

```text
YTD RETURN

+11.84%

vs benchmark +9.62%
```

## Risk Score

```text
RISK SCORE

61 / 100

MODERATE
```

Cards include:

* micro label
* metric
* secondary metric
* context icon
* tiny trend visual

Hover:

```text
translateY(-2px)
```

Duration:

```text
180ms
```

No dramatic shadow.

No layout change.

---

# 16. Main Dashboard Grid

Use a 12-column grid.

Gap:

```text
12px
```

### Row 1

```text
8 columns: Performance
4 columns: Allocation
```

### Row 2

```text
7 columns: Holdings
5 columns: Risk Monitor
```

### Row 3

```text
8 columns: Market Overview
4 columns: Alerts
```

### Row 4

```text
12 columns: Recent Activity
```

---

# 17. Performance Card

Height:

```text
370px
```

Header:

```text
Portfolio Performance
```

Right:

```text
Benchmark: S&P 500
```

Chart contains:

* portfolio line
* benchmark line
* horizontal grid
* x-axis
* y-axis
* custom tooltip
* active point indicator
* portfolio area fill

The chart must not rely on a default browser/graph-library tooltip.

---

# 18. Performance Tooltip

Custom tooltip:

```text
AUG 18, 2026

Portfolio
$24,741,903
+10.91%

Benchmark
+9.38%
```

Position near active point.

The active point contains:

* outer ring
* inner dot

Tooltip appears on hover.

Pointer leaving chart hides tooltip.

---

# 19. Performance Chart State

Hovering updates:

* date
* portfolio value
* benchmark value
* return

Hovering must not modify summary-card data.

Clicking a chart point locks the selection.

Second click unlocks.

Locked state:

* point remains visible
* tooltip remains visible
* lock icon appears

Escape clears lock.

Changing time range clears the selected point.

---

# 20. Allocation Card

Display a donut chart.

Data:

```text
Equities       48%
Fixed Income   24%
Alternatives   13%
Cash            9%
Commodities     6%
```

Center:

```text
$24.8M
TOTAL
```

Legend shows:

```text
asset class
percentage
value
```

Hovering segment:

* expand segment 4px
* highlight matching legend item
* replace center label with selected allocation

Animation:

```text
220ms ease-out
```

Clicking locks segment.

Click same segment again to unlock.

Changing chart/time-range context clears selection.

---

# 21. Holdings Card

Header:

```text
Top Holdings
```

Action:

```text
View all →
```

Rows:

```text
AAPL
MSFT
NVDA
AMZN
GOOGL
META
JPM
XOM
```

Columns:

```text
ASSET
PRICE
DAY
POSITION
WEIGHT
P&L
```

Each asset contains:

* icon
* ticker
* company name

Row:

```text
48px
```

Hover:

* subtle background
* no height change
* no width changes

---

# 22. Security Preview Popover

Hovering or explicitly activating a ticker opens a small preview popover.

Example:

```text
NVDA
NVIDIA CORPORATION

$181.92

+3.14%

Market Cap
$4.42T

P/E
54.18

52W
$95.14 — $184.49

OPEN SECURITY →
```

Popover must not cause page reflow.

Popover has elevation via border/surface contrast, not heavy shadow.

---

# 23. Security Modal

Clicking `OPEN SECURITY` opens an in-page modal.

Dimensions:

```text
920 × 640
```

Backdrop:

```text
rgba(0, 0, 0, 0.68)
```

Modal contents:

* security name
* ticker
* price
* daily move
* chart
* fundamentals
* analyst consensus
* recent news

Modal entrance:

```text
opacity 0 → 1
scale 0.97 → 1
```

Duration:

```text
180ms
```

Closing:

* Escape
* close button
* backdrop click

Clicking modal body does not close it.

---

# 24. Risk Monitor

Header:

```text
Portfolio Risk
```

Metrics:

```text
Volatility      14.82%
Sharpe           1.74
Beta             0.93
Max Drawdown    -6.21%
VaR 95%          -2.48%
```

Risk gauge:

```text
LOW ───── MODERATE ───── HIGH
                ▲
```

Value:

```text
61
```

Status:

```text
MODERATE
```

Below:

```text
Risk concentration detected
Technology exposure exceeds target by 4.2%
```

Warning is interactive.

---

# 25. Risk Warning Popover

Displays:

```text
TECHNOLOGY OVERWEIGHT

Current allocation
31.7%

Target
27.5%

Deviation
+4.2%

Recommended action
Review sector concentration.
```

Popover is anchored to warning.

It must close when:

* clicking elsewhere
* Escape

---

# 26. Market Overview

Four market instruments:

```text
S&P 500
NASDAQ
DOW
BTC/USD
```

Each row includes:

* instrument
* value
* daily percentage
* sparkline

Example:

```text
S&P 500     +0.42%
NASDAQ      +0.81%
DOW         +0.17%
BTC/USD     -0.62%
```

Sparklines use deterministic mock data.

Hovering:

* emphasizes row
* subtly enlarges sparkline region
* must not change row height
* must not move neighboring content

---

# 27. Alerts Panel

Alerts:

```text
Technology concentration above target
NVDA crossed 52-week high
Portfolio volatility increased 7.2%
Fed rate decision tomorrow
Cash position below tactical minimum
```

Each alert contains:

* severity
* title
* timestamp
* dismiss control where applicable

Severity levels:

```text
critical
warning
info
```

Clicking an alert expands content inline.

Only one alert may be expanded at once.

Opening another collapses the previous alert.

The alert list itself must not become a modal.

---

# 28. Recent Activity

Full-width section.

Columns:

```text
TIME
TYPE
DESCRIPTION
ASSET
VALUE
STATUS
```

Sample events:

```text
14:31:09  BUY        Increased NVDA position       NVDA  $42,100   COMPLETED
13:58:41  SELL       Reduced XOM exposure           XOM   $18,400   COMPLETED
13:27:12  ALERT      Risk threshold triggered      TECH  —         OPEN
12:49:08  DIVIDEND   AAPL dividend received        AAPL  $1,284    COMPLETED
11:04:22  REBALANCE  Sector allocation adjusted    TECH  $72,300   COMPLETED
```

Statuses use compact pills.

---

# 29. Export Popover

Click Export.

Popover width:

```text
280px
```

Options:

```text
Export Current View
Export Holdings
Export Transactions
Export Risk Report
```

Each includes:

* icon
* title
* description

Bottom:

```text
Format

○ CSV
○ JSON
○ PDF
```

Default:

```text
CSV
```

Selecting an export action creates a fake success toast.

No real export is necessary.

---

# 30. Customize Drawer

Click Customize.

A right-side drawer opens.

Width:

```text
340px
```

Controls:

```text
DISPLAY DENSITY

○ Compact
● Comfortable
○ Spacious
```

Display section toggles:

```text
☑ Portfolio Summary
☑ Performance
☑ Allocation
☑ Holdings
☑ Risk
☑ Market Overview
☑ Alerts
☑ Activity
```

Chart options:

```text
☑ Benchmark
☑ Grid
☑ Hover Indicators
```

These controls must actually affect the interface.

Disabling a section removes the section and surrounding layout must reflow.

Disabling Benchmark removes benchmark line and related legend element.

Disabling Grid removes chart grid.

Disabling Hover Indicators removes the active hover marker behavior.

---

# 31. Profile Popover

Avatar click opens profile popover.

Display:

```text
ABHINAV PANGARIA

Portfolio Manager

Workspace
Institutional Demo

Status
Active
```

Actions:

```text
Preferences
Keyboard shortcuts
Sign out
```

No action should navigate away.

---

# 32. Toast System

Toasts appear bottom-right.

Example:

```text
Export queued

Your CSV export is being prepared.

×
```

Behavior:

* enters from right
* remains 3.5 seconds
* has timed progress indicator
* dismissible
* maximum 3 visible
* oldest toast removed first

Toasts must stack vertically without overlap.

---

# 33. Loading State

Simulate initial data loading:

```text
700ms
```

During loading:

* summary cards show skeletons
* charts show geometry-matching skeletons
* holdings shows skeleton rows
* activity shows skeleton rows

Do not use a full-screen spinner.

After loading:

* metrics animate from zero toward final values
* performance chart draws progressively
* donut animates into place
* table rows fade upward sequentially

Table row animation stagger:

```text
25ms
```

Loading must be deterministic.

---

# 34. Animation System

Micro interaction:

```text
120–180ms
```

Component transition:

```text
180–240ms
```

Panel transition:

```text
220–300ms
```

Chart entrance:

```text
700–1000ms
```

Do not use:

* bouncing animation
* elastic card motion
* excessive scaling
* decorative perpetual animation
* unnecessary spinning indicators

Honor:

```text
prefers-reduced-motion
```

With reduced motion:

* disable nonessential entrance animations
* disable decorative transitions
* keep functional state changes
* render charts immediately

---

# 35. Hover System

Every interactive component must define hover behavior.

Interactive categories include:

* buttons
* sidebar items
* table rows
* chart points
* donut segments
* alerts
* export options
* profile
* search
* customization options

Hover states must not:

* alter dimensions
* move surrounding layout
* alter table column widths
* create accidental overflow

---

# 36. Keyboard Requirements

The application must support:

```text
Tab
Shift + Tab
Enter
Space
Escape
Cmd/Ctrl + K
```

Focus indicators are required.

## Modal focus

When modal opens:

* focus moves inside modal
* Tab remains trapped in modal
* Escape closes modal
* focus returns to triggering element

## Popovers

Escape closes active popover.

---

# 37. Responsive Behavior

## Width ≥ 1200px

Use full desktop layout.

Sidebar:

```text
228px
```

12-column grid.

---

## Width 900–1199px

Sidebar:

```text
72px
```

Labels hidden.

Icons remain.

Major dashboard sections use:

```text
6 + 6 columns
```

where appropriate.

---

## Width 700–899px

Sidebar disappears.

Header compresses.

Dashboard becomes predominantly single-column.

---

## Width <700px

Use mobile layout.

No horizontal scrolling as a workaround.

All functionality must remain accessible.

Priority order:

1. workspace heading
2. portfolio summary
3. performance
4. allocation
5. risk
6. holdings
7. markets
8. alerts
9. activity

---

# 38. Data Requirements

Create strongly typed data structures for:

```typescript
PortfolioSummary
Holding
PerformancePoint
AllocationSlice
RiskMetric
MarketInstrument
Alert
Activity
Security
UserPreference
Toast
```

The same conceptual data must not have conflicting interfaces in different components.

No component should manufacture its own alternate version of a shared domain object.

---

# 39. Deterministic Data

All data must be deterministic.

Do not use unseeded:

```javascript
Math.random()
```

during rendering or data generation.

Given identical code and initial state, the same page load must produce identical financial values, charts, and visual distributions.

---

# 40. State Model

The application must maintain explicit state for at least:

```text
activeNavigation
timeRange
selectedPerformancePoint
lockedPerformancePoint
selectedAllocation
lockedAllocation
selectedSecurity
expandedAlert
profilePopoverOpen
exportPopoverOpen
customizeDrawerOpen
searchFocused
searchQuery
density
visibleSections
chartOptions
toasts
loading
```

Avoid unnecessary duplicated representations of the same state.

Mutually exclusive overlays should behave predictably.

Opening a security modal must not leave unrelated popovers visually active behind it.

---

# 41. Component Architecture

The project must be componentized.

Recommended structure:

```text
src/

components/
  shell/
  navigation/
  header/
  cards/
  charts/
  holdings/
  risk/
  markets/
  alerts/
  activity/
  overlays/
  controls/
  feedback/

data/

hooks/

types/

utils/

styles/
```

The main dashboard component must not become a monolithic implementation.

Shared visual primitives should be reused.

Examples:

```text
Card
SectionHeader
Metric
Badge
SegmentedControl
Popover
Modal
Drawer
Toast
```

---

# 42. Accessibility

Required:

* keyboard operation
* semantic buttons
* accessible headings
* visible focus
* icon button labels
* usable modal focus management
* usable popovers
* meaningful labels for financial controls
* interaction cannot depend exclusively on hover
* contrast must remain readable across surfaces

---

# 43. Visual Restrictions

The implementation must not contain:

* arbitrary gradient backgrounds
* oversized empty hero area
* giant typography
* purple/pink/blue SaaS gradients
* excessive glass effects
* large rounded cards
* inconsistent radii
* inconsistent borders
* excessive shadows
* decorative illustrations
* arbitrary accent colors
* excessive whitespace
* clipped charts
* overflowing tables
* broken icon alignment
* layout shifts caused by hover

---

# 44. Interaction Invariants

These behaviors are mandatory.

### Performance

```text
hover point
→ tooltip appears

click point
→ selection locks

Escape
→ selection clears
```

### Allocation

```text
hover segment
→ segment highlights

click segment
→ selection locks

click selected segment
→ unlock
```

### Alerts

```text
click alert A
→ A expands

click alert B
→ A collapses
→ B expands
```

### Security

```text
open security
→ modal opens

Escape
→ modal closes

focus returns to trigger
```

### Customize

```text
disable section
→ section disappears

re-enable section
→ section returns

layout reflows automatically
```

### Benchmark

```text
disable benchmark
→ benchmark line disappears

re-enable benchmark
→ benchmark line returns
```

### Grid

```text
disable grid
→ grid lines disappear
```

---

# 45. Responsive Invariants

At every target width:

* no unintended horizontal scrollbar
* no clipped interactive controls
* no overlapping cards
* no text extending outside containers
* no broken charts
* no inaccessible navigation
* no overlay extending beyond viewport without scroll strategy

At 900px breakpoint:

* sidebar collapses to icon mode

At 700px breakpoint:

* sidebar disappears

---

# 46. Overlay Invariants

Overlays must have correct stacking order.

Required conceptual order:

```text
Page
↓
Popover
↓
Drawer
↓
Modal backdrop
↓
Modal
↓
Toast
```

A modal must visually dominate the dashboard.

Modal backdrop must prevent accidental interaction with dashboard elements beneath it.

---

# 47. Final Acceptance Criteria

The implementation is complete only when all of the following are satisfied:

```text
[ ] One-page application
[ ] Institutional visual style
[ ] Header implemented
[ ] Sidebar implemented
[ ] Workspace header implemented
[ ] Time range control works
[ ] Portfolio summary works
[ ] Performance chart works
[ ] Custom chart tooltip works
[ ] Chart locking works
[ ] Allocation chart works
[ ] Allocation locking works
[ ] Holdings table works
[ ] Security preview popover works
[ ] Security detail modal works
[ ] Risk monitor works
[ ] Risk popover works
[ ] Market overview works
[ ] Alert expansion works
[ ] Only one alert can be expanded
[ ] Activity table works
[ ] Export popover works
[ ] Customize drawer works
[ ] Visibility controls work
[ ] Chart options work
[ ] Density control works
[ ] Profile popover works
[ ] Toast system works
[ ] Loading skeletons work
[ ] Deterministic data
[ ] Responsive behavior implemented
[ ] Keyboard navigation works
[ ] Modal focus management works
[ ] Escape handling works
[ ] Reduced-motion behavior works
[ ] No horizontal overflow
[ ] No console errors
[ ] No React warnings
[ ] No broken interaction states
[ ] Component architecture is maintainable
```

---

# 48. Quality Bar

The final result should feel like a **real institutional financial terminal**, not a prototype demonstrating that individual requirements exist.

The following are equally important:

1. Correctness of interactions.
2. Fidelity to the visual specification.
3. Consistency of the design system.
4. Absence of layout shifts.
5. Coherent state transitions.
6. Responsive correctness.
7. Accessibility.
8. Maintainable implementation.

A page that technically contains every requested element but has inconsistent spacing, incorrect hierarchy, broken overlays, crude charts, or generic visual styling should be considered unsuccessful.

Likewise, a visually impressive page that omits or incorrectly implements defined behavior should be considered unsuccessful.

The final artifact must satisfy the **combined specification**, not merely approximate the appearance of a financial dashboard.
