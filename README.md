# GuardianKane

**A Claude Code Stop-hook that refuses to let "done" mean "I say it's done."**

GuardianKane sits between a coding agent and the word *done*. It intercepts Claude Code's own `Stop` event, reads a structured task-tracker, and — instead of trusting the agent's self-report — drives [`kane-cli`](https://testmuai.com) to actually open a browser, replay a generated test against the running app, run a second ad-hoc defect sweep against the relevant PRD section, and only then decides whether Claude is allowed to stop. If it isn't, Claude gets denied with a structured reason and has to go fix the real thing, not the test.

This repo is both the harness itself (`lib/`, `.claude/hooks/`, `.claude/skills/guardian-kane/`) and four live A/B experiments proving it changes outcomes — including **ORBITAL**, a dense institutional-dashboard build where the GuardianKane-gated run visibly outperforms an unassisted one shot, chart rendering and all.

---

## The problem

Ask a coding agent "is this done?" and it will tell you yes. It read its own code, it believes its own code, and its confidence is not evidence. The failure mode isn't usually "the agent lied" — it's subtler: an ambiguous requirement gets silently resolved in whatever direction is easiest, a boundary condition never gets exercised, a chart component ships with two overlapping data series because nothing forced anyone to actually look at it running in a browser.

GuardianKane's answer: never take the agent's word for a task being finished. Make "done" a state that can only be reached by external, adversarial, browser-level verification — and make it a hard gate, not a suggestion.

---

## How it works — the full loop

```
PRD.md
  │
  ▼
grilling (a structured Q&A pass over the PRD to surface every
ambiguity — "what happens when start == end?", "what does the
priority badge default to?" — before a single line of code exists)
  │
  ▼
task-tracker.md  (YAML front-matter per task: id, title, prd_ref,
                   verification_mode, test_file, depends_on, state)
  │
  ▼
kane-cli generate / kane-cli design tests
  → produces runnable *_test.md files, one (or more) per task,
    scoped to that task's PRD section
  │
  ▼
Claude Code implements the task, marks it CLAIMED_DONE
  │
  ▼
┌─────────────────── Stop hook fires ───────────────────┐
│                                                          │
│  guardian-kane-stop.js  decide({ tasks }, deps)          │
│                                                          │
│  1. any task stuck > 5min in KANE_VERIFYING?             │
│     → reset to IN_PROGRESS, deny (crash recovery)        │
│  2. nothing CLAIMED_DONE?  → allow, Claude keeps going    │
│  3. verification_mode: manual?                           │
│     → wait for an explicit manual_confirmed: true flag    │
│  4. dev server not responding?  → allow + warn (can't      │
│     verify what isn't running)                            │
│  5. run kane-cli against the task's generated test file(s) │
│     exit 0  → pass, go to step 6                          │
│     exit 1  → FAIL, go to step 7                          │
│     exit 2/3 → infra/timeout, state untouched, allow +     │
│                warn (never punish the app for kane-cli's   │
│                own flakiness)                              │
│  6. scripted test passed — now run a SECOND, ad-hoc         │
│     general-defect sweep against the live app, scoped to    │
│     this task's PRD section. A scripted test only checks    │
│     what it was told to check; the sweep looks for anything │
│     else that's visibly wrong.                              │
│     issue found → treat exactly like step 7 (shares the      │
│                    same 3-attempt cap)                        │
│     clean        → KANE_VERIFIED, advance to next task        │
│  7. FAILED (scripted test or sweep) — check GuardianKane's    │
│     bug memory: does this defect resemble one already fixed   │
│     on an earlier task? If so, append that as extra context    │
│     to the denial reason.                                      │
│     attempts < 3 → KANE_FAILED, deny with the failure summary   │
│                     + memory note, Claude must flip the task     │
│                     back to IN_PROGRESS and actually fix it       │
│     attempts = 3 → BLOCKED_NEEDS_HUMAN, allow (stop asking the    │
│                     agent to keep guessing — a human looks now)    │
│                                                                      │
└──────────────────────────────────────────────────────────────────┘
  │
  ▼
repeat per task until every row in task-tracker.md is KANE_VERIFIED
  │
  ▼
/guardian-kane sync / open-pr
```

Every decision above is made by a pure function (`decide()`) with injected dependencies (`probeReady`, `runKane`, `runSweep`, `log`, `bugMemory`) — the whole state machine is unit-tested without ever opening a real browser, and the same logic runs identically whether the browser calls are real or mocked.

### The state machine

```
PLANNED → IN_PROGRESS → CLAIMED_DONE → KANE_VERIFYING ─┬─→ KANE_VERIFIED
                              ▲                          │
                              │                          ├─→ KANE_FAILED (attempts < 3)
                              └──────────────────────────┘
                                                          │
                                                          └─→ BLOCKED_NEEDS_HUMAN (attempts = 3)
```

`KANE_FAILED` always routes back to `IN_PROGRESS` — there is no path from "the browser proved this is broken" straight back to `CLAIMED_DONE` without the agent actually touching the code again.

### Bug memory — the project's error-surface memory

A dependency-free, local-JSON memory store (`lib/bug-memory.js`) sits behind every failed verification. When a scripted test or a defect sweep produces a confirmed `bug_title`/`root_cause`, GuardianKane records it. The next time *any* task's verification fails, it's checked with Jaccard token-set similarity against everything recorded so far — if a new failure resembles an old one closely enough (similarity ≥ 0.5), the denial reason Claude receives gets an extra line:

> *GuardianKane memory: this resembles a bug previously seen on T-4 ("Chart lock sign inverted", similarity 0.71) — check whether that earlier fix regressed or this is the same defect resurfacing elsewhere.*

No LLM call, no external service, no vector DB — just structured local state that outlives a single Claude Code session, so a bug that was fixed once and quietly reintroduced doesn't get re-diagnosed from zero.

### Defect sweep — going beyond the scripted assertion

The scripted test only checks what it was explicitly told to check. The sweep is a second, independent `kane-cli` pass that looks at the live app against the task's actual PRD section and asks "is anything else here wrong?" — this is what caught, among other things, ORBITAL's chart-lock state being misread and an export flow that raced a toast notification that hadn't been queued yet. It's the difference between "the test I wrote passes" and "the feature actually works."

---

## Proof: four A/B experiments, same pattern each time

Every experiment below built the **same PRD** twice from the same starting point: once through the full GuardianKane loop (`*-kane/`), once by a fresh, context-free Claude Code agent given the PRD in a single message and told "build this, let me know when done" — no hooks, no gate, no further intervention (`*-baseline/`). Both builds were then cross-tested with the *same* Kane-generated test suite, and every result below was independently re-verified rather than trusted at face value — see `docs/SCOREBOARD.md` for the full run-by-run evidence.

| # | Experiment | PRD density | Result |
|---|---|---|---|
| 1 | **Todo app** | Low — mostly CRUD, one real ambiguity | Both builds worked. Kane's grilling step turned an unspecified "how do you set High/Low priority?" into a concrete, testable convention — baseline never implemented any way to do it at all, a gap invisible from reading the code, caught only by an adversarial replay. |
| 2 | **Room Booking Widget** | Medium — one deliberate boundary-condition trap (`<` vs `<=` on touching intervals) | No confirmed divergence — both got the trap right. The value here wasn't catching a bug, it was *proving* correctness that had only ever been self-reported. |
| 3 | **Room Booking Studio** | High — 14+ exact design tokens, spacing, animation/toast timing, theme persistence | Kane-gated build reached 8/10 independently verified requirement groups; baseline shipped with a PRD-literal padding violation on the header row (title/toggle flush to the viewport edge instead of the spec's 16px padding) that a casual look wouldn't catch. |
| 4 | **ORBITAL — Institutional Portfolio Terminal** | Very high — a dense, single-page financial dashboard: performance chart with lock state, donut allocation, holdings table with popovers, risk monitor, alerts, activity feed, export flow, layout customization, global search | **The flagship result.** See below. |

### ORBITAL: the flagship comparison

ORBITAL is deliberately the hardest PRD in the set — a full institutional dashboard with 12+ interactive subsystems, dense visual specification, and multiple stateful overlays. It's where the gap between gated and unassisted builds stopped being subtle.

**Portfolio Performance chart**

| Kane (gated) | Baseline (unassisted) |
|---|---|
| Single clean solid trend line, plus a visually distinct dashed benchmark-comparison line | **Two overlapping, differently-weighted line traces rendered simultaneously on the same series** — a visibly broken, double-layered chart |

![ORBITAL kane — clean single-line performance chart](docs/images/orbital-kane-1.png)

![ORBITAL baseline — doubled/overlapping chart lines](docs/images/orbital-baseline-2.png)

**Alerts panel layout**

The PRD calls for a full-width, vertically-stacked alert list with single-expand behavior. Kane's build matches it exactly — full-width cards, one expanded with its action visible. Baseline drifted from the spec into a cramped side-by-side/two-column layout instead:

![ORBITAL kane — full-width, vertically stacked alert cards](docs/images/orbital-kane-3.png)

![ORBITAL baseline — side-by-side alert cards, a PRD deviation](docs/images/orbital-baseline-1.png)

Baseline's card layout is also visibly inconsistent in spacing/gaps across panels in the same screenshot — compare the gap between the alert rows to the gap around the holdings/risk cards below them. Kane's build (`docs/images/orbital-kane-2.png`) keeps a uniform gap scale throughout.

Full task-by-task tracker evidence for ORBITAL — including the sweep-caught chart-lock and export-toast defects that never reached the user in the gated build — lives in `orbital-kane/.testmuai/task-tracker.md` and is summarized in `OBSERVATIONS-AND-REPORTINGS.md`.

---

## How to use this in any project

### 1. Install

From a clone of this repo, point the installer at any git-initialized target project:

```bash
git clone https://github.com/18Abhinav07/adventures-with-kane.git
cd adventures-with-kane
./install.sh /path/to/your/project
```

What it does:
- Copies `lib/*.js` (minus GuardianKane's own test files), the six `.claude/hooks/guardian-kane-*.{js,sh}` files, and `.claude/skills/guardian-kane/SKILL.md` into your project.
- Merges (never overwrites) `Stop` and `PostToolUse` hook entries into your project's tracked `.claude/settings.json` — existing hooks you already have are left alone.
- Adds `"type": "module"` and the `js-yaml` dependency to your `package.json` if they're missing (refuses to touch a project explicitly set to `"type": "commonjs"` — it prints a manual workaround instead of silently breaking your build).
- Runs `npm install`.

Prerequisites: `git`, `node`, and [`kane-cli`](https://testmuai.com) authenticated (`kane-cli login --oauth`, verify with `kane-cli whoami`). If `kane-cli` isn't on `PATH` yet, `install.sh` warns but still finishes — install it before your first `/guardian-kane start`.

If you'd rather wire it in by hand (or your `package.json` really is CommonJS), copy the same files listed above manually and add the two hook entries yourself — see `.claude/skills/guardian-kane/SKILL.md` Step 9 in this repo for the exact JSON shape.

### 2. Start a project

Inside your target project, in Claude Code:

```
/guardian-kane start ./PRD.md
```

This runs the grilling pass over your PRD, writes `.testmuai/task-tracker.md`, and generates the per-task Kane test files. From here, just tell Claude Code to work through the tracker — the Stop hook enforces the rest automatically. You do not need to invoke Kane yourself; the hook does it every time Claude tries to stop with a `CLAIMED_DONE` task pending.

### 3. Day-to-day commands

| Command | What it does |
|---|---|
| `/guardian-kane start <prd-path>` | Grill the PRD, generate `task-tracker.md` + tests, begin the loop |
| `/guardian-kane sync` | Re-sync tracker state against the current codebase (e.g. after manual edits) |
| `/guardian-kane open-pr` | Open a PR once every task is `KANE_VERIFIED` |
| `kane-cli whoami` | Check auth status |
| `kane-cli login --oauth` | Authenticate `kane-cli` |

### 4. What you'll see while it's running

When Claude tries to stop with a task still open, you'll see a denial with a concrete reason instead of a silent pass:

```json
{
  "decision": "block",
  "reason": "T-9 failed verification (attempt 2/3). Summary: export toast never appeared.
  Reason: the agent waited for a toast without queuing the export first. GuardianKane memory:
  this resembles a bug previously seen on T-3 (\"Donut segment lock reads inverted\",
  similarity 0.58) — check whether that earlier fix regressed or this is the same defect
  resurfacing elsewhere. Flip T-9 to IN_PROGRESS first, then fix and re-claim done."
}
```

Claude reads that, fixes the actual defect, and re-claims the task — GuardianKane runs the whole check again automatically the next time it tries to stop.

### 5. Verifying the harness itself

```bash
npm test
```

135+ tests cover the full decision table (`decide()`), the tracker YAML parser/writer, the bug-memory similarity matcher, and the config resolver — all with mocked `kane-cli` calls, so the suite runs in seconds with no browser and no network.

---

For the full build story — PRD review, the grilling conversation, planning, phases, implementation, test generation, browser verification, the fix-loop state machine in practice, and a detailed walkthrough of what the ORBITAL comparison actually proves — see **[`OBSERVATIONS-AND-REPORTINGS.md`](OBSERVATIONS-AND-REPORTINGS.md)**.
