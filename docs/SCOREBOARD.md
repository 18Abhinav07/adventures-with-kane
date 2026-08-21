# GuardianKane vs. Stock Claude Code — Scoreboard

Same PRD (`todo-kane/PRD.md`), same starting fork commit (`46a8065`), same
operator. `todo-kane/` was built via the full GuardianKane loop (grilling →
task-tracker → Kane-generated tests → Stop-hook gate) through T0–T5.
`todo-baseline/` was built by a **fresh, context-free Claude Code agent**
given the PRD verbatim in a single message and told "Build this. Let me
know when it's done." — no hooks, no gate, no further intervention. Both
apps were then probed with `todo-kane`'s own Kane-generated `_test.md`
suite, pointed at each app's dev server via `--variables start_url`.

An infra note for anyone re-running this: both dev servers were briefly
confused by a stray `dist/base.js` (a leftover TodoMVC "learn bar" script
from an earlier local build, gitignored, unrelated to either app's code)
— it was present on `todo-kane`'s dev server by accident and missing on
`todo-baseline`'s, which made Kane's headless browser treat baseline as a
broken page on the first attempt. It was copied over to make the two
serving environments equivalent before the real comparison below.

| Task | todo-kane (GuardianKane) | todo-baseline (stock, blind) |
|---|---|---|
| T1 Add task | KANE_VERIFIED | **PASS** — same test, replayed clean (6/6 steps) |
| T2 Complete task | KANE_VERIFIED | **PASS** — 6/6 steps |
| T2 Delete task | KANE_VERIFIED | **PASS** — 6/6 steps |
| T4 Persistence | KANE_VERIFIED | **PASS in substance** — task survives reload; the specific automated check failed only because it inspected `localStorage` in the shape/key `todo-kane`'s own implementation uses, and Kane's own bug-verdict on this run explicitly classified it `automation_bug` / not-confirmed ("the app still shows the expected task... more likely a brittle replay expectation" than a real regression) |
| T5 Priority badge — default Medium | KANE_VERIFIED | **PASS** — 6/6 steps |
| T5 Priority badge — explicit High/Low | KANE_VERIFIED (attempts recorded in `task-tracker.md`) | **FAIL — confirmed functional gap.** A task titled with the `!high` suffix (the convention Kane's own generated test uses to request an explicit priority) renders a **MEDIUM** badge, not High. Kane's verdict: `confirmed: true`, severity `major`, `"The high-priority task is displayed with a MEDIUM badge instead of High."` The baseline build never implements *any* way to set a non-default priority — the PRD only specifies the default, so nothing forced the gap into view during a single unsupervised pass. |

## The one finding that matters

The PRD (`## 3. Priority badge`) specifies that new tasks default to
Medium, but never says how a user or the app sets a task to High or Low.
During GuardianKane's grilling conversation, that ambiguity got resolved
into a concrete, testable convention (a `!high`/`!low` suffix on the
title) and Kane's `design tests` step generated a test that exercises it
— which then gated T5 until the implementation actually handled it.

`todo-baseline`, built in one shot from the same PRD text with no
verification loop, silently interpreted the ambiguity as "don't worry
about it" — it implements the documented default and nothing else. That
gap is invisible from reading the code or clicking around casually (every
task quietly shows "Medium"); it only surfaces under an explicit
adversarial check, which is exactly what the Kane-generated test — and
the GuardianKane gate that required it to pass — is for.

## A secondary, more minor finding

Re-running `todo-kane`'s own explicit-priority test against `todo-kane`
itself (the "KANE_VERIFIED" arm) turned up a **cosmetic** mismatch: the
badge's CSS applies `text-transform: uppercase`, so the rendered/visual
text reads "HIGH" while the literal stored/DOM value is "High" — Kane
flagged this as `confirmed: false`, severity `minor`. It didn't fail the
gate originally because the assertion that caught it is stricter under
replay than under the original authoring run. Worth knowing: passing
Kane-verification is not a guarantee against every possible follow-on
assertion Kane could author — it verifies what was actually asserted and
gated at the time.

---

## Experiment 2: Room Booking Widget (a harder, from-scratch task)

The todo-app experiment above was called out (correctly) as too forgiving —
the priority-badge gap only existed because the PRD left a real ambiguity
that GuardianKane's grilling step happened to resolve. To get a task that
could actually stress-test GuardianKane's edge rather than an accident of
one PRD's wording, we built a **second, harder, from-scratch** app: a Room
Booking Widget, where the trap is a classic boundary-condition/off-by-one
bug class (`<` vs `<=` in an interval-overlap check), not an unspecified
requirement.

**Setup:** two Vite+React apps scaffolded independently from nothing (`npm
create vite@latest`, not a fork) from the identical PRD text:
- `booking-kane/` (port 8082) — built via the full GuardianKane loop
  (hooks installed, Kane-generated test suite via `kane-cli generate`,
  Stop-hook gate).
- `booking-baseline/` (port 8083) — built by a fresh, context-free Claude
  Code agent given the PRD verbatim in one message, no hooks, no gate,
  told to self-verify with lint/build/curl and stop.

The PRD requires: a booking is valid only if `start < end`, and two
bookings **must be allowed to touch** (one ending exactly when the next
begins) — only genuine overlaps should be rejected. This is the deliberate
edge case: an implementation using `<=` instead of `<` anywhere in the
overlap or range check will incorrectly reject valid back-to-back bookings,
and that bug is invisible unless a test specifically constructs two
bookings sharing a boundary time.

Both apps were cross-tested with the same 13 Kane-generated `_test.md`
files (from `booking-kane/.testmuai/tests/`), run headless against each
app's own dev server, with each failure's `verdict.confirmed`/`family`/
`severity` field inspected individually rather than trusting raw
pass/fail — the same discipline as Experiment 1.

One test (`reject-booking-where-start-and_test.md`) is **excluded** from
scoring for both apps: it was authored without an explicit "Navigate to
..." step, so it inherited whatever page a stale session/tab happened to
have open rather than testing either app — a test-authoring gap unrelated
to app correctness.

| Test | booking-kane (8082) | booking-baseline (8083) |
|---|---|---|
| Create a successful booking | PASS | PASS |
| Create booking immediately following another | PASS | PASS |
| Create booking immediately preceding another | PASS | PASS |
| Cancel a booking, then re-book the freed slot | PASS | PASS |
| Cancel one of several bookings, others unaffected | PASS | PASS |
| Reject booking where end time is before start time | **PASS** (two independent runs both showed the app correctly rejected the booking; one run's raw status was `failed` but re-diagnosed as `verdict.confirmed: false`, `family: automation_bug`, severity `minor` — Kane's own analysis: "the UI already showed the booking was rejected... a test/assertion problem, not an app regression") | not completed |
| Reject booking where end time equals start time | **PASS** (raw run showed `failed`, but individually re-diagnosed: `verdict.confirmed: false`, `family: automation_bug`, `category: agent_misstep` — Kane's own analysis states the app correctly showed the validation error and there's no evidence an invalid booking was created; the failure was Kane's replay/analyzer not completing its own final list-check step, not an app defect) | not completed |
| **Create two adjacent bookings with touching start/end time (the deliberate edge-case trap)** | **PASS** — both bookings coexist; the strict `aStart < bEnd && aEnd > bStart` check correctly allows touching intervals | **PASS** — both bookings coexist; the self-reported `aStart < bEnd && bStart < aEnd` check also allows touching intervals correctly |
| Reject a new booking that overlaps an existing one (×3 variants) | **PASS, PASS, PASS** (all three confirmed clean in the final completed sweep) | not completed |

**Overall verdict: no confirmed functional divergence was found on this task.** `booking-kane` now has a complete, verdict-confirmed record across all 12 scored tests (every raw `failed` result individually inspected and traced to Kane's own replay/analyzer, never to the app) — a clean sweep. `booking-baseline` completed 6 of 12, including the specific boundary-touching trap this experiment was built to expose, and also passed clean. `booking-baseline`'s self-report that it used a strict, correct overlap comparison held up under real (not self-reported) Kane verification on every test that could be completed. The three-variant overlap-rejection suite could not be completed for `booking-baseline` within the time available: `kane-cli` itself exhibited significant flakiness on this task throughout — several runs of the same test file hung well past their own 300s internal timeout (one ran 17+ minutes before being force-killed), which is a genuine operational finding about the tool, separate from either app's code.

**What this experiment actually shows:** unlike Experiment 1, this harder task did not surface a real gap between the GuardianKane-gated build and the unsupervised build — both got the tricky boundary condition right on the first pass, and booking-kane's full sweep is clean. That's a legitimate, if less dramatic, result: it demonstrates GuardianKane's verification loop *confirms* correctness rather than merely assuming it (the claim "booking-baseline handles touching bookings correctly" was Claude's own self-report and was not trustworthy on its own — it had to be independently checked with real Kane runs, exactly as GuardianKane forces for every task, every time, without exception). It does not prove the two build processes are equivalent in general — 6 of `booking-baseline`'s tests remain unverified, and Experiment 1 already showed a confirmed gap on a different task. The honest takeaway is: GuardianKane's value on this run was in *proving* the correct behavior rather than *catching* an incorrect one — a real value proposition (removing the need to trust an agent's self-report), just a less visually dramatic one than a caught bug.

---

## Experiment 3: Room Booking Studio (granular UI/interaction PRD)

Both prior experiments used PRDs with little or no UI/visual specification, which
gave an unsupervised one-shot build no forcing function to lose scope on. For a
third experiment we deliberately maximized that surface: a new PRD
(`booking-studio-kane/PRD.md`) for the same booking-app domain, but now specifying
exact design tokens (hex colors, an 8px-multiple spacing scale, corner radii,
typography), exact layout/positioning (a padded, centered header row; a room-chip
selector with exact border-width rules; a bookings list with colored left borders
and pills), and exact interaction/animation behavior (a 250ms form-shake +
red-bordered field + fading inline error on conflict; a slide-in/auto-dismissing/
stacking toast with a shrinking progress bar on success; a 5s Undo toast that
restores the exact cancelled booking; a persisted dark/light theme keyed to a
specific `localStorage` key; Escape-key priority rules) — 14+ independently
checkable, easy-to-drop specifics on top of the same functional overlap/validation
logic as Experiment 2.

**Setup:** two fresh Vite+React scaffolds sharing the identical PRD:
- `booking-studio-kane/` (port 8084) — full GuardianKane loop (grilling → 10
  requirement groups in `task-tracker.md` → Kane-generated tests per group →
  Stop-hook gate).
- `booking-studio-baseline/` (port 8085) — a fresh, context-free agent given the
  PRD verbatim in one message, no hooks, no gate, told to build, self-check with
  lint/build, and stop.

**Result: booking-studio-kane reached KANE_VERIFIED on 8 of 10 requirement
groups.** The remaining 2 (toast-stacking timing, cancel+undo timing) were
individually inspected via `verdict.confirmed`/`category` exactly as in the prior
two experiments, and every one of 6 total attempts came back `confirmed: false`,
`agent_misstep`/`state_transition_bug` — Kane's own reasoning explicitly states
the app behaved correctly ("booking cancelled, list updated, Undo control
appeared") and that its own browser-automation agent was too slow to act inside
the 4-5 second display window, not that the app was broken. Other tests exercising
the same toast component (T3, T4, T9) passed clean, corroborating that read.

**Live side-by-side manual check** (both apps tested directly in-browser with the
same inputs, not just via Kane): booking flow, toast slide-in/progress-bar, and
the overlap-conflict error (shake, red border, inline error) all matched the PRD
identically on both apps. One concrete, PRD-literal divergence was found on manual
inspection: `booking-studio-baseline`'s header row renders with the title and
theme-toggle button flush to the viewport edges (no padding, not centered),
violating the PRD's explicit "16px padding around the row" requirement for that
element — `booking-studio-kane`'s header is correctly padded/centered to match
the rest of the layout. This is exactly the class of easy-to-drop granular detail
this experiment was designed to expose, and it did — on the unsupervised build,
not the gated one.

**What this experiment actually shows:** given a PRD with real UI/visual/
interaction density, GuardianKane's build ended up both more thoroughly verified
(8/10 requirement groups independently confirmed rather than self-reported, with
the 2 gaps honestly attributable to Kane's own automation timing rather than
hidden) and marginally more spec-compliant on inspection (the header-padding
miss in baseline). The gap is real but modest, not dramatic — this is consistent
with the pattern across all three experiments: Claude is already strong at
single-pass scoped UI builds, so GuardianKane's biggest, clearest value has
consistently been *independent verification* (proving correctness rather than
assuming it, and catching the rare miss a casual look wouldn't) rather than
routinely catching large functional defects an unsupervised pass would ship.
