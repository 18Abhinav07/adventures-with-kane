# GuardianKane — Design Spec

Built for the Kane CLI Online Hackathon (TestMu AI), 19–21 Aug 2026.

## Problem

AI coding agents drift from the spec they were given, especially on tasks that
modify or port existing code rather than write it from scratch — a feature
gets built, but not the feature that was asked for, and nothing in the normal
Claude Code loop checks fidelity to the PRD before the agent calls it done.
The agent's own "this is finished" claim is the only signal, and it's not a
trustworthy one.

## What GuardianKane is

A Claude Code skill (`/guardian-kane`) plus a Stop hook that turns a PRD into
a sequence of Kane-verified tasks. Kane CLI's own PRD pipeline
(`context ingest → context extract → design tests → cover`) generates the
tests from the PRD text itself, not from the agent that will be graded by
them. A deterministic state machine — not the agent — decides when a task is
actually done, when to retry, when to give up and ask a human, and when to
let Claude's turn genuinely end.

## Roles, precisely

| Actor | Does |
|---|---|
| Human | Writes/edits `PRD.md` in normal conversation with Claude. Types `/guardian-kane start`, `sync`, `open-pr` — the only manual entry points. Resolves `BLOCKED_NEEDS_HUMAN` tasks. |
| Claude (via the `guardian-kane` skill) | Executes `start`/`sync`/`open-pr` protocols, including calling `kane-cli` itself for setup. Implements each task's code. Owns `state ∈ {IN_PROGRESS, CLAIMED_DONE}` only. |
| Stop hook (`.claude/hooks/guardian-kane-stop.sh`) | Deterministic script, not a skill, not LLM reasoning. Fires automatically after every Claude turn. Owns `state ∈ {KANE_VERIFYING, KANE_VERIFIED, KANE_FAILED, BLOCKED_NEEDS_HUMAN}` and `attempts`. Calls `kane-cli` directly. Decides block/allow. |
| PostToolUse hook | Observe-only. Appends every file touched by Edit/Write to the active task's `files[]`. No decision-making. |
| Kane CLI | Three distinct hats: (1) spec-to-test author during setup, (2) verification gate inside the loop, (3) neutral external judge in the baseline comparison. Never writes app code, never interprets PRD intent beyond what's in the generated test file. |

## Task schema — `.testmuai/task-tracker.md`

```yaml
- id: T3
  title: "Priority badge, existing card preserved"
  prd_ref: "PRD.md#L20-27"
  verification_mode: kane        # kane | manual
  test_file: ".testmuai/tests/T3_test.md"
  depends_on: [T1]
  state: PLANNED
  attempts: 0
  files: []
  last_run: null
  last_verdict: null
```

`verification_mode: manual` (set during grilling for any task with no
browser-observable surface) skips Kane entirely — `CLAIMED_DONE` routes to a
human confirmation instead of a `kane-cli` call.

## State machine

```
PLANNED → IN_PROGRESS → CLAIMED_DONE → KANE_VERIFYING → KANE_VERIFIED  (terminal)
              ↑                              ↓ fail
              └──────────────────────── KANE_FAILED
                                              ↓ attempts ≥ 3
                                        BLOCKED_NEEDS_HUMAN            (terminal)
```

Invariant: exactly one task may be non-terminal at a time. Claude may not
start the next `PLANNED` task until the current one reaches `KANE_VERIFIED`
or `BLOCKED_NEEDS_HUMAN`.

Ownership is exhaustive and non-overlapping (see Roles table). Claude never
writes a `KANE_*` state or `attempts`; the hook never writes `IN_PROGRESS` or
`CLAIMED_DONE`.

## Stop hook logic

On every fire:

1. Read tracker. If no task is `CLAIMED_DONE`, exit 0, allow stop (nothing to
   verify — normal conversational turn).
2. If the found task is `verification_mode: manual`: allow stop, surface "confirm T-N manually" as `additionalContext`. No `kane-cli` call.
3. Otherwise, staleness check: any task stuck in `KANE_VERIFYING` for >5 min
   is treated as a crashed run and reset to `IN_PROGRESS`.
4. Readiness probe: curl the configured dev URL (one retry after a few
   seconds for hot-reload flakiness). Fails → **allow stop**, emit
   `systemMessage` to the human. This is never routed to Claude as "your code
   is wrong" — an agent told to keep working on a dead dev server will edit
   working code.
5. Set `state: KANE_VERIFYING`, run `kane-cli testmd run <test_file> --agent --headless`, capture exit code + `run_end`.
6. Exit 0 → `KANE_VERIFIED`. Look up next `PLANNED` task whose `depends_on`
   are all `KANE_VERIFIED`. If one exists: **deny stop**, `permissionDecisionReason`
   names it and its objective. If none (all terminal): run `kane-cli cover`,
   write HANDOFF summary, **allow stop** — this is the only true "done" exit.
7. Exit 1 → `attempts += 1`. If `< 3`: `KANE_FAILED`, **deny stop**, reason
   includes the failing step's `remark` and `run_end.reason` verbatim (never
   generic — an agent given a vague reason will retry the same mistake).
   Claude's protocol requires it to flip the task to `IN_PROGRESS` itself as
   its first tracker write next turn. If `≥ 3`: `BLOCKED_NEEDS_HUMAN`,
   **allow stop** — no further auto-retry, ever.
8. Exit 2/3 (infra/timeout) → do not touch task state. **Allow stop**,
   `systemMessage` to the human. Same reasoning as step 4.
9. Every retry re-runs the *unchanged* `test_file` — cached replay, not
   re-authoring, so it's fast and near-zero credit cost. If a replay failure
   looks like a broken selector rather than a false assertion, the skill
   protocol tells Claude to consider the cached recording stale (code
   structure changed) before assuming the feature itself is still broken.

## `/guardian-kane` skill — three entry points

- **`start ./PRD.md`**: `kane-cli whoami` → spawn dev server as background
  process, PID to `.testmuai/devserver.pid` → `context ingest`/`extract` →
  grilling conversation (confirm/edit/split use-cases; for any
  modify/port-existing-code task, explicitly ask whether a
  structural-preservation assertion is needed) → write `prd-sections.md` →
  seed `task-tracker.md` (T0 = scaffold, ad-hoc Kane check, always first) →
  `design tests --use-case` per confirmed task → install the Stop hook +
  PostToolUse hook in `.claude/settings.local.json` → report task count and
  begin.
- **`sync`**: re-run `ingest`/`extract` only on the PRD diff, re-grill only
  what changed, append new rows to the tracker. Never touches `PRD.md`
  itself — only a human edits the spec of record.
- **`open-pr <task-id>`**: refuse if the task's files have uncommitted
  changes. Otherwise `gh pr create` with a body composed from the task's
  passing `run_end.summary`/`reason`, its PRD reference, and the `cover`
  delta it contributed.

## Commit guard (should-build)

Standard git `pre-commit` hook installed by `start`. Pure state check, no
`kane-cli` call: blocks the commit if the staged diff touches any file
belonging to a task whose state is `CLAIMED_DONE` or `KANE_FAILED` (claimed
but not yet `KANE_VERIFIED`). Guarantees code for an unverified task can
never be committed, even if the Stop-hook loop is bypassed by hand.

## Observability — `/__kane`

Every Stop-hook `kane-cli` invocation appends to
`.testmuai/kane-activity.jsonl` (task id, objective, step remarks, verdict,
timestamp). A dev-only route in the demo app, `/__kane`, polls this file and
renders it live — the visual proof of Kane reasoning and acting during the
build, and the demo's answer to "show us that moment." Gated behind
`SHOW_KANE_PANEL=true`; the log file itself is the retained evidence
artifact regardless.

## Demo product — Todo app, forked not scaffolded

Forked from a small existing open-source Todo template (mirrors the
port/modify scenario honestly rather than starting from a blank slate).

- **T0 — Scaffold**: clone + boot. Ad-hoc `kane-cli run`, not a PRD use-case.
- **T1 — Add task**: functional.
- **T2 — Complete/delete task**: functional.
- **T3 — Priority badge, existing card preserved**: the deliberately real
  fidelity-risk task — worded with the same ambiguity that caused the
  original incident this project is a response to, not staged to fail.
- **T4 — Persistence (localStorage)**: functional, checked via Kane's
  native cookie/localStorage inspection.

## The A/B proof (this is the submission's spine, not a nice-to-have)

Two `git worktree`s of the forked template, same repo, run by the same
operator to remove any confound:

- `todo-baseline/` — no `.claude` hook config. One message: paste the PRD,
  ask Claude to build it. No further intervention until it self-reports
  done — this has to represent stock Claude Code's unsupervised first pass.
- `todo-kane/` — `/guardian-kane start ./PRD.md`, full loop.

Screen-recorded concurrently (two panes/two windows). Closing beat: the same
`_test.md` suite generated only from `todo-kane` is pointed at
`todo-baseline`'s running app via `kane-cli testrun run` — Kane as a blind
judge scoring a build it had no part in. Scoreboard, not narration.

## Known, disclosed limitations (not solved by this design)

- Long autonomous deny-loops across many tasks can consume a large fraction
  of a real session's context window — an inherent Claude Code
  characteristic, disclosed in the demo narrative rather than hidden.
- `verification_mode: manual` tasks get no Kane coverage at all — by
  construction, since Kane cannot observe non-browser-surfaced behavior.

## Build priority given the clock (~24–26h at spec time)

Must-build: T0–T4 state machine, Stop + PostToolUse hooks, `/__kane` panel,
the A/B scoreboard. Cut first if behind schedule: commit guard, `open-pr`.
