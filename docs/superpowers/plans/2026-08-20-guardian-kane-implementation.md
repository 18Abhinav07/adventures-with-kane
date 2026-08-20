# GuardianKane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build GuardianKane — a Claude Code skill + deterministic Stop/PostToolUse hooks that turn a PRD into a sequence of Kane-CLI-verified tasks, so Claude cannot claim a task "done" without an external, non-LLM verification gate — and prove it beats stock Claude Code on a real fidelity-risk build via an A/B `git worktree` comparison.

**Architecture:** A YAML task tracker (`.testmuai/task-tracker.md`) is the single source of truth for build state, with strictly disjoint write ownership between Claude (`IN_PROGRESS`, `CLAIMED_DONE`) and a deterministic Node.js Stop hook (`KANE_VERIFYING`, `KANE_VERIFIED`, `KANE_FAILED`, `BLOCKED_NEEDS_HUMAN`, `attempts`). The Stop hook fires after every Claude turn, reads the tracker, and either denies the stop (forcing Claude to keep working — fixing a failure or starting the next task) or allows it (true completion or infra failure). A PostToolUse hook mechanically appends touched files to the active task's `files[]`. Kane CLI is invoked only by the hook and by the skill's setup protocol, never by Claude directly mid-build.

**Tech Stack:** Node.js (hook scripts + tracker library, no framework — hooks must start in <1s), `js-yaml` (tracker parsing), `kane-cli` v0.8.4 (verification engine, via its official Claude Code skill for exact syntax), bash (Stop hook is a thin bash entrypoint calling Node), Claude Code hooks (`.claude/settings.local.json`), forked TodoMVC React app (demo product), `git worktree` (A/B comparison).

**Spec:** `docs/superpowers/specs/2026-08-20-guardian-kane-design.md`

## Global Constraints

- Hackathon deadline: 21 Aug 2026 11:59 PM IST. Today is 20 Aug — **hard cut line at end of Phase 6**; Phase 7 is the only phase allowed to be dropped.
- kane-cli commands: consult the official `kane-cli` Claude Code skill (loaded at `~/.claude/skills/kane-cli`) for exact current flags before writing any `kane-cli` invocation — do not hardcode syntax from memory or from the design spec's prose, which may be imprecise.
- State ownership is strictly disjoint (spec "Roles, precisely" + "State machine" sections): Claude never writes a `KANE_*` state or `attempts`; the hook never writes `IN_PROGRESS` or `CLAIMED_DONE`; `files[]` is written only by the PostToolUse hook, never self-reported.
- Invariant: exactly one task may be non-terminal at a time.
- The Stop hook denies stop on every outcome except two genuine terminals: all tasks `KANE_VERIFIED`/terminal, or an infra/timeout failure (exit 2/3) surfaced to the human.
- Exit code contract from Kane CLI test runs: 0 = pass, 1 = functional fail, 2 = infra/auth error, 3 = timeout. 2/3 must never be routed to Claude as "your code is wrong."
- No native Kane CLI hooks/MCP server exist — all orchestration is Claude Code's own hook system.

---

## Phase 1 — Smoke Test: Prove the Hook Mechanics (throwaway)

**Timebox: 2 hours.** Goal: prove Claude Code's Stop/PostToolUse hook contract (deny/allow, `permissionDecisionReason`, `additionalContext`, JSON stdin/stdout) actually behaves as documented, on a trivial one-task project, before building anything real on top of it. Discard this directory after Task 3's checkpoint passes.

### Task 1: Scaffold the throwaway smoke-test project

**Files:**
- Create: `smoke-test/task-tracker.json` (JSON, not YAML — smoke test only, to avoid pulling in `js-yaml` before it's needed)
- Create: `smoke-test/.claude/settings.local.json`
- Create: `smoke-test/.claude/hooks/stop-smoke.sh`

**Interfaces:**
- Produces: proof that a Stop hook receiving `{"session_id":..., "last_assistant_message":..., "stop_reason":...}` on stdin, and exiting 2 with a stderr message, actually blocks Claude's turn from ending and the stderr text reaches the model as the block reason (per the Claude Code hooks doc: exit code 2 + stderr = block reason).

- [ ] **Step 1: Create the throwaway project directory and tracker**

```bash
mkdir -p /Users/18abhinav07/Documents/GuardianKane/smoke-test/.claude/hooks
cat > /Users/18abhinav07/Documents/GuardianKane/smoke-test/task-tracker.json <<'EOF'
{ "done": false }
EOF
```

- [ ] **Step 2: Write the Stop hook script**

```bash
cat > /Users/18abhinav07/Documents/GuardianKane/smoke-test/.claude/hooks/stop-smoke.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
TRACKER="$(dirname "$0")/../../task-tracker.json"
DONE=$(node -e "console.log(require('$TRACKER').done)")
if [ "$DONE" != "true" ]; then
  echo "Smoke test: tracker not marked done=true yet. Write {\"done\": true} to task-tracker.json, then stop again." >&2
  exit 2
fi
exit 0
EOF
chmod +x /Users/18abhinav07/Documents/GuardianKane/smoke-test/.claude/hooks/stop-smoke.sh
```

- [ ] **Step 3: Register the hook in settings.local.json**

```bash
cat > /Users/18abhinav07/Documents/GuardianKane/smoke-test/.claude/settings.local.json <<'EOF'
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command", "command": ".claude/hooks/stop-smoke.sh" } ] }
    ]
  }
}
EOF
```

- [ ] **Step 4: Commit nothing yet — this directory is discarded at the end of Phase 1, not committed to `main`.**

### Task 2: Run the smoke test live and verify block/allow both work

**Files:** none new — this is a manual verification task run from a **separate terminal Claude Code session** opened in `smoke-test/`.

- [ ] **Step 1: Open a new Claude Code session with `cwd` = `smoke-test/`**

Run in a fresh terminal: `cd /Users/18abhinav07/Documents/GuardianKane/smoke-test && claude`

- [ ] **Step 2: In that session, ask Claude to do nothing but reply "ok" and stop**

Type: `Just say ok, nothing else.`

Expected: Claude replies "ok", then the Stop hook fires, tracker still has `done: false`, hook exits 2 — **the turn should NOT end**; Claude should receive the stderr text as context and continue (it will likely say something like "I see the tracker isn't marked done, let me check" — that reaction itself is proof the block reached the model).

- [ ] **Step 3: Manually edit `task-tracker.json` to `{"done": true}` from the outer session (not the smoke-test session) and tell the smoke-test session to try stopping again**

In the smoke-test session, type: `Try again.`

Expected: hook exits 0, turn ends normally, no further block.

- [ ] **Step 4: Record the observed behavior**

Write one line to `docs/superpowers/plans/PHASE1-RESULT.md` (temporary, deleted in Task 3): `PASS: exit 2 blocked stop and stderr reached Claude; exit 0 allowed stop.` — or `FAIL: <what actually happened>` if it diverged.

### Task 3: Checkpoint — decide go/no-go on the hook contract, then discard

**Files:**
- Delete: `smoke-test/` (entire directory)
- Delete: `docs/superpowers/plans/PHASE1-RESULT.md`

- [ ] **Step 1: If Task 2 recorded PASS, remove the throwaway directory**

```bash
rm -rf /Users/18abhinav07/Documents/GuardianKane/smoke-test
rm -f /Users/18abhinav07/Documents/GuardianKane/docs/superpowers/plans/PHASE1-RESULT.md
```

- [ ] **Step 2: If Task 2 recorded FAIL, STOP the plan here**

Do not proceed to Phase 2. The entire GuardianKane design depends on exit-code-2-blocks-stop behaving as documented. Re-read `https://code.claude.com/docs/en/hooks` (or the `claude-code-guide` agent) to find the actual current contract, update the spec's Stop hook logic section accordingly, and only then resume.

**Checkpoint (must pass before Phase 2):** Task 2 recorded PASS.

---

## Phase 2 — The `guardian-kane` Skill + Task Tracker Schema + Grilling Protocol

**Timebox: 3 hours.**

### Task 4: Write the tracker read/write library

**Files:**
- Create: `lib/tracker.js`
- Test: `lib/tracker.test.js`

**Interfaces:**
- Produces: `readTracker(path) -> {tasks: Task[]}`, `writeTracker(path, data)`, `findTask(tasks, id) -> Task|undefined`, `activeTask(tasks) -> Task|undefined` (the single non-terminal task, per the invariant), `nextPlannedTask(tasks) -> Task|undefined` (first `PLANNED` task whose `depends_on` are all `KANE_VERIFIED`). A `Task` object has exactly the fields from the spec's schema: `id, title, prd_ref, verification_mode, test_file, depends_on, state, attempts, files, last_run, last_verdict`.
- Consumes: `js-yaml` npm package.

- [ ] **Step 1: Initialize the Node project and install js-yaml**

```bash
cd /Users/18abhinav07/Documents/GuardianKane
npm init -y
npm install js-yaml
npm install --save-dev vitest
```

- [ ] **Step 2: Write the failing test**

```javascript
// lib/tracker.test.js
import { describe, it, expect } from 'vitest';
import { readTracker, writeTracker, findTask, activeTask, nextPlannedTask } from './tracker.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function tmpTracker(tasks) {
  const p = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'gk-')), 'task-tracker.md');
  writeTracker(p, { tasks });
  return p;
}

describe('tracker', () => {
  it('round-trips tasks through YAML', () => {
    const p = tmpTracker([
      { id: 'T0', title: 'Scaffold', prd_ref: null, verification_mode: 'kane',
        test_file: null, depends_on: [], state: 'PLANNED', attempts: 0, files: [],
        last_run: null, last_verdict: null }
    ]);
    const { tasks } = readTracker(p);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('T0');
  });

  it('findTask locates by id', () => {
    const tasks = [{ id: 'T1', state: 'PLANNED' }, { id: 'T2', state: 'PLANNED' }];
    expect(findTask(tasks, 'T2').id).toBe('T2');
    expect(findTask(tasks, 'T9')).toBeUndefined();
  });

  it('activeTask returns the single non-terminal task', () => {
    const tasks = [
      { id: 'T1', state: 'KANE_VERIFIED' },
      { id: 'T2', state: 'CLAIMED_DONE' },
      { id: 'T3', state: 'PLANNED' }
    ];
    expect(activeTask(tasks).id).toBe('T2');
  });

  it('activeTask returns undefined when nothing is non-terminal', () => {
    const tasks = [{ id: 'T1', state: 'KANE_VERIFIED' }, { id: 'T2', state: 'BLOCKED_NEEDS_HUMAN' }];
    expect(activeTask(tasks)).toBeUndefined();
  });

  it('nextPlannedTask respects depends_on', () => {
    const tasks = [
      { id: 'T1', state: 'KANE_VERIFIED', depends_on: [] },
      { id: 'T2', state: 'PLANNED', depends_on: ['T1'] },
      { id: 'T3', state: 'PLANNED', depends_on: ['T2'] }
    ];
    expect(nextPlannedTask(tasks).id).toBe('T2');
  });

  it('nextPlannedTask skips tasks whose deps are not yet verified', () => {
    const tasks = [
      { id: 'T1', state: 'PLANNED', depends_on: [] },
      { id: 'T2', state: 'PLANNED', depends_on: ['T1'] }
    ];
    expect(nextPlannedTask(tasks).id).toBe('T1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/tracker.test.js`
Expected: FAIL with "Cannot find module './tracker.js'" or similar.

- [ ] **Step 3: Write the implementation**

```javascript
// lib/tracker.js
import fs from 'node:fs';
import yaml from 'js-yaml';

const FENCE_START = '```yaml\n';
const FENCE_END = '\n```';
const HEADER = '# GuardianKane Task Tracker\n\n';

export function readTracker(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const start = raw.indexOf(FENCE_START) + FENCE_START.length;
  const end = raw.indexOf(FENCE_END, start);
  const yamlBody = raw.slice(start, end);
  const tasks = yaml.load(yamlBody) || [];
  return { tasks };
}

export function writeTracker(filePath, { tasks }) {
  const yamlBody = yaml.dump(tasks, { lineWidth: 100 });
  const content = HEADER + FENCE_START + yamlBody + FENCE_END + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
}

export function findTask(tasks, id) {
  return tasks.find(t => t.id === id);
}

const TERMINAL_STATES = new Set(['KANE_VERIFIED', 'BLOCKED_NEEDS_HUMAN']);

export function activeTask(tasks) {
  return tasks.find(t => !TERMINAL_STATES.has(t.state));
}

export function nextPlannedTask(tasks) {
  const verifiedIds = new Set(tasks.filter(t => t.state === 'KANE_VERIFIED').map(t => t.id));
  return tasks.find(t =>
    t.state === 'PLANNED' &&
    (t.depends_on || []).every(dep => verifiedIds.has(dep))
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/tracker.test.js`
Expected: PASS, 6/6.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json lib/tracker.js lib/tracker.test.js
git commit -m "Add task-tracker read/write library"
```

### Task 5: Write the `.testmuai/task-tracker.md` seed template and schema doc

**Files:**
- Create: `.testmuai/task-tracker.example.md` (reference example, not consumed at runtime — the real file is generated per-project by the skill in Phase 4)

**Interfaces:**
- Consumes: the `Task` shape from Task 4.

- [ ] **Step 1: Write the example file verbatim from the spec's schema, plus the synthetic T0**

```bash
mkdir -p /Users/18abhinav07/Documents/GuardianKane/.testmuai
cat > /Users/18abhinav07/Documents/GuardianKane/.testmuai/task-tracker.example.md <<'EOF'
# GuardianKane Task Tracker

```yaml
- id: T0
  title: "Scaffold — clone + boot"
  prd_ref: null
  verification_mode: kane
  test_file: null
  depends_on: []
  state: PLANNED
  attempts: 0
  files: []
  last_run: null
  last_verdict: null
- id: T3
  title: "Priority badge, existing card preserved"
  prd_ref: "PRD.md#L20-27"
  verification_mode: kane
  test_file: ".testmuai/tests/T3_test.md"
  depends_on: [T1]
  state: PLANNED
  attempts: 0
  files: []
  last_run: null
  last_verdict: null
```
EOF
```

- [ ] **Step 2: Commit**

```bash
git add .testmuai/task-tracker.example.md
git commit -m "Add task-tracker schema example"
```

### Task 6: Write the `guardian-kane` skill — `start` entry point

**Files:**
- Create: `.claude/skills/guardian-kane/SKILL.md`

**Interfaces:**
- Consumes: `lib/tracker.js` functions (skill instructs Claude to call them via `node -e` or a small CLI wrapper written in Task 8).
- Produces: the protocol Claude follows when a human types `/guardian-kane start ./PRD.md` in a project directory.

- [ ] **Step 1: Write the skill file**

```markdown
---
name: guardian-kane
description: Use when the human types /guardian-kane start, sync, or open-pr. Turns a PRD into a sequence of Kane-CLI-verified tasks with a deterministic Stop-hook gate. Never invoked implicitly — only on the explicit slash command.
---

# GuardianKane

## `start ./PRD.md`

1. Run `kane-cli whoami`. If not authenticated, stop and tell the human to run `kane-cli login --oauth`.
2. Read the PRD file the human pointed at (default `./PRD.md` if no path given).
3. Spawn the project's dev server as a background process (use the project's own `npm run dev` or equivalent — check `package.json` `scripts`). Write its PID to `.testmuai/devserver.pid`. Probe `http://localhost:<port>` with `curl` until it responds (max 10 tries, 2s apart) before continuing.
4. Consult the `kane-cli` skill for the exact current syntax, then run the PRD pipeline: `context ingest` on the PRD file, then `context extract` to get a structured list of use-cases/features.
5. **Grilling conversation** (this is the core value — do not skip or rush it):
   - For each extracted use-case, restate it back to the human in one sentence and ask them to confirm, edit, or split it.
   - For any use-case that **modifies or ports existing code** (not a from-scratch feature), explicitly ask: "Should I add a structural-preservation assertion — i.e., should Kane also check that `<specific existing element>` is still present/unchanged after this change?" If yes, record that as an extra assertion line to feed into `design tests` for that use-case in Step 7.
   - Ask whether each use-case has a browser-observable surface. If no, mark it `verification_mode: manual` in the tracker instead of `kane`.
   - Do not proceed to Step 6 until every use-case has an explicit human confirmation.
6. Write `prd-sections.md`: one confirmed section per use-case, each with its exact wording as agreed in grilling, and its `verification_mode`.
7. Seed `.testmuai/task-tracker.md` using the schema in `.testmuai/task-tracker.example.md`: T0 is always `{title: "Scaffold — clone + boot", verification_mode: kane, test_file: null, depends_on: [], state: PLANNED}` first. Then one task per confirmed section, in dependency order as discussed with the human, `state: PLANNED`, `attempts: 0`, `files: []`.
8. For every task with `verification_mode: kane` (except T0, which uses an ad-hoc `kane-cli run` check, not a generated test file), run `design tests --use-case <section text>` (consult the `kane-cli` skill for exact flag names) to generate its `test_file`, saved under `.testmuai/tests/<task-id>_test.md`. Record that path in the task's `test_file` field. **Never hand-write a `_test.md` file** — always generate it via kane-cli's own pipeline.
9. Install the Stop hook and PostToolUse hook into `.claude/settings.local.json` (paths: `.claude/hooks/guardian-kane-stop.sh`, `.claude/hooks/guardian-kane-post-tool-use.sh` — built in Phase 3 of this project's own implementation plan; when GuardianKane is used on a *target* project, these two files plus `lib/` are copied into that project's `.claude/hooks/` and `.claude/lib/` by this step).
10. Report to the human: task count, list of task titles, and "Starting T0." Then begin implementing T0 immediately (the skill's job past this point is: implement the active task's code, then just stop the turn — the Stop hook takes over from there).

## `sync`

1. Diff the current `PRD.md` against the version last ingested (keep a copy at `.testmuai/PRD.snapshot.md` from the last `start`/`sync`, compare with `diff`).
2. Run `context ingest`/`context extract` only on the diff region.
3. Re-run the grilling conversation (Step 5 above) only for use-cases that changed or are new.
4. Append new rows to `task-tracker.md` for new use-cases — never modify existing rows for unrelated tasks, never touch `PRD.md` itself.
5. Update `.testmuai/PRD.snapshot.md` to the current PRD content.

## `open-pr <task-id>`

1. Read the task from `task-tracker.md`. If its state is not `KANE_VERIFIED`, refuse: "T-<id> is not yet KANE_VERIFIED, cannot open a PR for it."
2. Run `git status --porcelain -- <task.files>`. If any of those files show uncommitted changes, refuse and tell the human to commit first.
3. Compose a PR body from: the task's `last_verdict` (Kane's `run_end.summary`/`reason`), its `prd_ref`, and the delta `kane-cli cover` reports for this task's use-case.
4. Run `gh pr create --title "<task.title>" --body "<composed body>"`.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/guardian-kane/SKILL.md
git commit -m "Add guardian-kane skill: start/sync/open-pr protocol"
```

**Checkpoint (must pass before Phase 3):** `.claude/skills/guardian-kane/SKILL.md` exists, references the tracker schema from Task 5 exactly, and every `kane-cli` invocation in it says "consult the kane-cli skill for exact syntax" rather than hardcoding flags.

---

## Phase 3 — Stop Hook Decision Table + PostToolUse Tracker

**Timebox: 4 hours.** This is the mechanical core of the product — get this exactly right against the spec's 9-step logic.

### Task 7: Write the Kane-invocation wrapper

**Files:**
- Create: `lib/kane.js`
- Test: `lib/kane.test.js`

**Interfaces:**
- Produces: `runKaneTest(testFilePath) -> { exitCode: number, runEnd: object|null, stdout: string }` — spawns `kane-cli testmd run <testFilePath> --agent --headless` (confirm this exact subcommand/flags against the `kane-cli` skill before finalizing — the spec's prose names may drift from the CLI's actual current flags), parses NDJSON from stdout, returns the last `run_end` event object plus the process exit code.
- Consumes: `child_process.spawnSync` from Node's stdlib.

- [ ] **Step 1: Write the failing test using a fake kane-cli binary**

```javascript
// lib/kane.test.js
import { describe, it, expect } from 'vitest';
import { parseRunEnd } from './kane.js';

describe('parseRunEnd', () => {
  it('extracts the terminal run_end event from NDJSON stdout', () => {
    const stdout = [
      '{"step":1,"status":"running","remark":"clicking add"}',
      '{"step":2,"status":"running","remark":"checking badge"}',
      '{"type":"run_end","status":"pass","summary":"Priority badge shown","reason":null,"duration":4.2,"credits":1,"final_state":"passed","test_url":"https://kane.example/t/1"}'
    ].join('\n');
    const result = parseRunEnd(stdout);
    expect(result.status).toBe('pass');
    expect(result.summary).toBe('Priority badge shown');
  });

  it('returns null when no run_end line is present', () => {
    expect(parseRunEnd('{"step":1,"status":"running"}')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/kane.test.js`
Expected: FAIL with "Cannot find module './kane.js'".

- [ ] **Step 3: Write the implementation**

```javascript
// lib/kane.js
import { spawnSync } from 'node:child_process';

export function parseRunEnd(stdout) {
  const lines = stdout.split('\n').filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(lines[i]);
      if (parsed.type === 'run_end') return parsed;
    } catch {
      continue;
    }
  }
  return null;
}

export function runKaneTest(testFilePath) {
  const result = spawnSync('kane-cli', ['testmd', 'run', testFilePath, '--agent', '--headless'], {
    encoding: 'utf8',
    timeout: 5 * 60 * 1000
  });
  const runEnd = parseRunEnd(result.stdout || '');
  return { exitCode: result.status, runEnd, stdout: result.stdout || '' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/kane.test.js`
Expected: PASS, 2/2.

- [ ] **Step 5: Before committing, verify the exact subcommand against the kane-cli skill**

Open the `kane-cli` Skill tool content (or `~/.claude/skills/kane-cli/`) and confirm `testmd run <file> --agent --headless` is the correct current invocation for running a single generated test file non-interactively with NDJSON output. If the flag names differ, update the `spawnSync` args in Step 3 before committing.

- [ ] **Step 6: Commit**

```bash
git add lib/kane.js lib/kane.test.js
git commit -m "Add kane-cli invocation wrapper with NDJSON run_end parsing"
```

### Task 8: Write the Stop hook script implementing the full decision table

**Files:**
- Create: `.claude/hooks/guardian-kane-stop.js`
- Create: `.claude/hooks/guardian-kane-stop.sh` (thin bash entrypoint Claude Code actually calls, per the hooks contract — pipes stdin through to the Node script and forwards exit code)
- Test: `.claude/hooks/guardian-kane-stop.test.js`

**Interfaces:**
- Consumes: `readTracker`, `writeTracker`, `activeTask`, `nextPlannedTask`, `findTask` from `lib/tracker.js`; `runKaneTest` from `lib/kane.js`.
- Produces: exit code 0 (allow, JSON `{}` on stdout — no permission fields needed for allow) or exit code 2 with a `permissionDecisionReason`-carrying JSON on stdout (per the hooks contract's JSON-output blocking form, preferred over stderr-only since it lets us pass structured `additionalContext`).

- [ ] **Step 1: Write the failing tests covering every branch of the spec's 9-step logic**

```javascript
// .claude/hooks/guardian-kane-stop.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { decide } from './guardian-kane-stop.js';

function task(overrides) {
  return {
    id: 'T1', title: 'Add task', prd_ref: 'PRD.md#L1', verification_mode: 'kane',
    test_file: '.testmuai/tests/T1_test.md', depends_on: [], state: 'PLANNED',
    attempts: 0, files: [], last_run: null, last_verdict: null, ...overrides
  };
}

describe('decide', () => {
  it('step 1: allows stop when no task is CLAIMED_DONE', () => {
    const result = decide({ tasks: [task({ state: 'PLANNED' })] }, { probeReady: () => true, runKane: () => { throw new Error('should not be called'); } });
    expect(result.decision).toBe('allow');
  });

  it('step 2: allows stop and surfaces manual confirmation for verification_mode manual', () => {
    const tasks = [task({ state: 'CLAIMED_DONE', verification_mode: 'manual' })];
    const result = decide({ tasks }, { probeReady: () => true, runKane: () => { throw new Error('should not be called'); } });
    expect(result.decision).toBe('allow');
    expect(result.additionalContext).toMatch(/confirm T1 manually/);
  });

  it('step 3: resets a stale KANE_VERIFYING task (>5min) back to IN_PROGRESS', () => {
    const staleTime = new Date(Date.now() - 6 * 60 * 1000).toISOString();
    const tasks = [task({ state: 'KANE_VERIFYING', last_run: staleTime })];
    const result = decide({ tasks }, { probeReady: () => true, runKane: () => { throw new Error('should not run in same pass'); } });
    expect(tasks[0].state).toBe('IN_PROGRESS');
    expect(result.decision).toBe('deny');
  });

  it('step 4: allows stop with systemMessage when dev server is not ready', () => {
    const tasks = [task({ state: 'CLAIMED_DONE' })];
    const result = decide({ tasks }, { probeReady: () => false, runKane: () => { throw new Error('should not be called'); } });
    expect(result.decision).toBe('allow');
    expect(result.systemMessage).toMatch(/dev server/i);
  });

  it('step 6: exit 0 with no remaining tasks -> KANE_VERIFIED, allow (true done)', () => {
    const tasks = [task({ state: 'CLAIMED_DONE' })];
    const result = decide({ tasks }, {
      probeReady: () => true,
      runKane: () => ({ exitCode: 0, runEnd: { status: 'pass', summary: 'ok', reason: null } })
    });
    expect(tasks[0].state).toBe('KANE_VERIFIED');
    expect(result.decision).toBe('allow');
    expect(result.done).toBe(true);
  });

  it('step 6: exit 0 with a next PLANNED task -> deny, names it', () => {
    const tasks = [
      task({ id: 'T1', state: 'CLAIMED_DONE', depends_on: [] }),
      task({ id: 'T2', state: 'PLANNED', depends_on: ['T1'], title: 'Complete task' })
    ];
    const result = decide({ tasks }, {
      probeReady: () => true,
      runKane: () => ({ exitCode: 0, runEnd: { status: 'pass', summary: 'ok', reason: null } })
    });
    expect(tasks[0].state).toBe('KANE_VERIFIED');
    expect(result.decision).toBe('deny');
    expect(result.permissionDecisionReason).toMatch(/T2/);
    expect(result.permissionDecisionReason).toMatch(/Complete task/);
  });

  it('step 7: exit 1 with attempts < 3 -> KANE_FAILED, deny, reason includes remark+run_end.reason verbatim', () => {
    const tasks = [task({ state: 'CLAIMED_DONE', attempts: 1 })];
    const result = decide({ tasks }, {
      probeReady: () => true,
      runKane: () => ({ exitCode: 1, runEnd: { status: 'fail', summary: 'badge missing', reason: 'assertion failed: .priority-badge not found' } })
    });
    expect(tasks[0].state).toBe('KANE_FAILED');
    expect(tasks[0].attempts).toBe(2);
    expect(result.decision).toBe('deny');
    expect(result.permissionDecisionReason).toMatch(/assertion failed: \.priority-badge not found/);
  });

  it('step 7: exit 1 with attempts >= 3 -> BLOCKED_NEEDS_HUMAN, allow, no further retry', () => {
    const tasks = [task({ state: 'CLAIMED_DONE', attempts: 2 })];
    const result = decide({ tasks }, {
      probeReady: () => true,
      runKane: () => ({ exitCode: 1, runEnd: { status: 'fail', summary: 'still broken', reason: 'x' } })
    });
    expect(tasks[0].state).toBe('BLOCKED_NEEDS_HUMAN');
    expect(tasks[0].attempts).toBe(3);
    expect(result.decision).toBe('allow');
  });

  it('step 8: exit 2 (infra) -> does not touch task state, allow, systemMessage', () => {
    const tasks = [task({ state: 'CLAIMED_DONE', attempts: 0 })];
    const result = decide({ tasks }, {
      probeReady: () => true,
      runKane: () => ({ exitCode: 2, runEnd: null })
    });
    expect(tasks[0].state).toBe('KANE_VERIFYING');
    expect(tasks[0].attempts).toBe(0);
    expect(result.decision).toBe('allow');
    expect(result.systemMessage).toMatch(/infra|auth/i);
  });

  it('step 8: exit 3 (timeout) -> does not touch task state, allow, systemMessage', () => {
    const tasks = [task({ state: 'CLAIMED_DONE', attempts: 0 })];
    const result = decide({ tasks }, {
      probeReady: () => true,
      runKane: () => ({ exitCode: 3, runEnd: null })
    });
    expect(tasks[0].state).toBe('KANE_VERIFYING');
    expect(result.decision).toBe('allow');
    expect(result.systemMessage).toMatch(/timeout/i);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run .claude/hooks/guardian-kane-stop.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```javascript
// .claude/hooks/guardian-kane-stop.js
import { activeTask, findTask, nextPlannedTask } from '../../lib/tracker.js';

const STALE_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 3;

export function decide({ tasks }, { probeReady, runKane }) {
  const claimed = tasks.find(t => t.state === 'CLAIMED_DONE');

  // Step 3: staleness check on any task stuck in KANE_VERIFYING
  const stale = tasks.find(t => t.state === 'KANE_VERIFYING' &&
    t.last_run && (Date.now() - new Date(t.last_run).getTime()) > STALE_MS);
  if (stale) {
    stale.state = 'IN_PROGRESS';
    return { decision: 'deny', permissionDecisionReason: `T-${stale.id} verification run appears to have crashed (stuck >5min). Reset to IN_PROGRESS — resume work on it.` };
  }

  // Step 1: nothing to verify
  if (!claimed) {
    return { decision: 'allow' };
  }

  // Step 2: manual verification mode
  if (claimed.verification_mode === 'manual') {
    return { decision: 'allow', additionalContext: `Please confirm T${claimed.id.replace('T', '')} manually — no browser-observable surface for Kane to check.` };
  }

  // Step 4: dev server readiness probe
  if (!probeReady()) {
    return { decision: 'allow', systemMessage: 'GuardianKane: dev server not responding — cannot verify. Check it manually and resume the session.' };
  }

  // Step 5: run kane
  claimed.state = 'KANE_VERIFYING';
  claimed.last_run = new Date().toISOString();
  const { exitCode, runEnd } = runKane(claimed.test_file);

  if (exitCode === 0) {
    // Step 6
    claimed.state = 'KANE_VERIFIED';
    claimed.last_verdict = runEnd;
    const next = nextPlannedTask(tasks);
    if (next) {
      return { decision: 'deny', permissionDecisionReason: `T-${claimed.id} verified. Start T-${next.id}: ${next.title}. Mark it IN_PROGRESS in task-tracker.md before editing files.` };
    }
    return { decision: 'allow', done: true, systemMessage: 'GuardianKane: all tasks KANE_VERIFIED. Build complete.' };
  }

  if (exitCode === 1) {
    // Step 7
    claimed.attempts += 1;
    claimed.last_verdict = runEnd;
    if (claimed.attempts < MAX_ATTEMPTS) {
      claimed.state = 'KANE_FAILED';
      const remark = runEnd?.summary || '(no summary)';
      const reason = runEnd?.reason || '(no reason)';
      return { decision: 'deny', permissionDecisionReason: `T-${claimed.id} failed verification (attempt ${claimed.attempts}/${MAX_ATTEMPTS}). Summary: ${remark}. Reason: ${reason}. Flip T-${claimed.id} to IN_PROGRESS first, then fix and re-claim done.` };
    }
    claimed.state = 'BLOCKED_NEEDS_HUMAN';
    return { decision: 'allow', systemMessage: `GuardianKane: T-${claimed.id} failed ${MAX_ATTEMPTS} times, needs human review.` };
  }

  // Step 8: exit 2/3, infra/timeout — never touch state further, allow
  const kind = exitCode === 2 ? 'infra/auth error' : 'timeout';
  return { decision: 'allow', systemMessage: `GuardianKane: Kane verification hit a ${kind} (exit ${exitCode}), not a code failure. Check kane-cli auth/connectivity and resume manually.` };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run .claude/hooks/guardian-kane-stop.test.js`
Expected: PASS, 10/10.

- [ ] **Step 5: Write the bash + Node entrypoint that Claude Code actually invokes**

```javascript
// .claude/hooks/guardian-kane-stop-entry.js — reads stdin JSON, calls decide(), writes hook-contract JSON to stdout, sets exit code
import { readTracker, writeTracker } from '../../lib/tracker.js';
import { runKaneTest } from '../../lib/kane.js';
import { decide } from './guardian-kane-stop.js';
import { execSync } from 'node:child_process';

const TRACKER_PATH = '.testmuai/task-tracker.md';

function probeReady() {
  try {
    execSync('curl -sf http://localhost:5173 -o /dev/null', { timeout: 3000 });
    return true;
  } catch {
    try {
      execSync('sleep 3 && curl -sf http://localhost:5173 -o /dev/null', { timeout: 6000 });
      return true;
    } catch {
      return false;
    }
  }
}

let stdin = '';
process.stdin.on('data', d => stdin += d);
process.stdin.on('end', () => {
  const { tasks } = readTracker(TRACKER_PATH);
  const result = decide({ tasks }, { probeReady, runKane: runKaneTest });
  writeTracker(TRACKER_PATH, { tasks });

  if (result.decision === 'deny') {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'Stop',
        permissionDecision: 'deny',
        permissionDecisionReason: result.permissionDecisionReason
      }
    }));
    process.exit(0);
  } else {
    const out = { hookSpecificOutput: { hookEventName: 'Stop', permissionDecision: 'allow' } };
    if (result.additionalContext) out.hookSpecificOutput.additionalContext = result.additionalContext;
    if (result.systemMessage) out.systemMessage = result.systemMessage;
    process.stdout.write(JSON.stringify(out));
    process.exit(0);
  }
});
```

```bash
cat > /Users/18abhinav07/Documents/GuardianKane/.claude/hooks/guardian-kane-stop.sh <<'EOF'
#!/usr/bin/env bash
exec node "$(dirname "$0")/guardian-kane-stop-entry.js"
EOF
chmod +x /Users/18abhinav07/Documents/GuardianKane/.claude/hooks/guardian-kane-stop.sh
```

- [ ] **Step 6: Before committing, verify the JSON output shape against the current hooks doc**

Re-check `https://code.claude.com/docs/en/hooks` (or ask the `claude-code-guide` agent) that `hookSpecificOutput.permissionDecision: "deny"|"allow"` plus `permissionDecisionReason`/`additionalContext` is still the correct current JSON contract for a Stop hook, and that top-level `systemMessage` is still supported. Adjust field names in Step 5 if the contract has changed.

- [ ] **Step 7: Commit**

```bash
git add .claude/hooks/guardian-kane-stop.js .claude/hooks/guardian-kane-stop.test.js .claude/hooks/guardian-kane-stop-entry.js .claude/hooks/guardian-kane-stop.sh
git commit -m "Implement Stop hook decision table (steps 1-8 of spec)"
```

### Task 9: Write the PostToolUse files[] tracker hook

**Files:**
- Create: `.claude/hooks/guardian-kane-post-tool-use.js`
- Create: `.claude/hooks/guardian-kane-post-tool-use.sh`
- Test: `.claude/hooks/guardian-kane-post-tool-use.test.js`

**Interfaces:**
- Consumes: `readTracker`, `writeTracker`, `activeTask` from `lib/tracker.js`.
- Produces: `appendFile(tasks, activeTaskRef, filePath)` — pure function, mutates the active task's `files[]` (dedup, only when there is an active task in `IN_PROGRESS`).

- [ ] **Step 1: Write the failing test**

```javascript
// .claude/hooks/guardian-kane-post-tool-use.test.js
import { describe, it, expect } from 'vitest';
import { recordFileTouch } from './guardian-kane-post-tool-use.js';

describe('recordFileTouch', () => {
  it('appends a new file to the IN_PROGRESS task', () => {
    const tasks = [{ id: 'T1', state: 'IN_PROGRESS', files: [] }];
    recordFileTouch(tasks, 'src/App.jsx');
    expect(tasks[0].files).toEqual(['src/App.jsx']);
  });

  it('dedupes repeated touches of the same file', () => {
    const tasks = [{ id: 'T1', state: 'IN_PROGRESS', files: ['src/App.jsx'] }];
    recordFileTouch(tasks, 'src/App.jsx');
    expect(tasks[0].files).toEqual(['src/App.jsx']);
  });

  it('is a no-op when no task is IN_PROGRESS (e.g. during CLAIMED_DONE or KANE_VERIFYING)', () => {
    const tasks = [{ id: 'T1', state: 'CLAIMED_DONE', files: [] }];
    recordFileTouch(tasks, 'src/App.jsx');
    expect(tasks[0].files).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run .claude/hooks/guardian-kane-post-tool-use.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```javascript
// .claude/hooks/guardian-kane-post-tool-use.js
export function recordFileTouch(tasks, filePath) {
  const active = tasks.find(t => t.state === 'IN_PROGRESS');
  if (!active) return;
  if (!active.files.includes(filePath)) active.files.push(filePath);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run .claude/hooks/guardian-kane-post-tool-use.test.js`
Expected: PASS, 3/3.

- [ ] **Step 5: Write the entrypoint (reads PostToolUse JSON stdin, extracts `tool_input.file_path` for Edit/Write tools)**

```javascript
// .claude/hooks/guardian-kane-post-tool-use-entry.js
import { readTracker, writeTracker } from '../../lib/tracker.js';
import { recordFileTouch } from './guardian-kane-post-tool-use.js';

const TRACKER_PATH = '.testmuai/task-tracker.md';

let stdin = '';
process.stdin.on('data', d => stdin += d);
process.stdin.on('end', () => {
  const input = JSON.parse(stdin || '{}');
  const filePath = input.tool_input?.file_path;
  if (!filePath || !['Edit', 'Write'].includes(input.tool_name)) {
    process.exit(0);
  }
  const { tasks } = readTracker(TRACKER_PATH);
  recordFileTouch(tasks, filePath);
  writeTracker(TRACKER_PATH, { tasks });
  process.exit(0);
});
```

```bash
cat > /Users/18abhinav07/Documents/GuardianKane/.claude/hooks/guardian-kane-post-tool-use.sh <<'EOF'
#!/usr/bin/env bash
exec node "$(dirname "$0")/guardian-kane-post-tool-use-entry.js"
EOF
chmod +x /Users/18abhinav07/Documents/GuardianKane/.claude/hooks/guardian-kane-post-tool-use.sh
```

- [ ] **Step 6: Before committing, verify PostToolUse's actual input JSON field names (`tool_name` vs `tool_use.name`, `tool_input` vs `tool_use.input`) against the current hooks doc**

Same verification approach as Task 8 Step 6.

- [ ] **Step 7: Commit**

```bash
git add .claude/hooks/guardian-kane-post-tool-use.js .claude/hooks/guardian-kane-post-tool-use.test.js .claude/hooks/guardian-kane-post-tool-use-entry.js .claude/hooks/guardian-kane-post-tool-use.sh
git commit -m "Implement PostToolUse files[] tracker hook"
```

### Task 10: Register both hooks in this repo's own settings and re-run the Phase 1 smoke test against the real hooks

**Files:**
- Create: `.claude/settings.local.json`

- [ ] **Step 1: Register the hooks**

```bash
cat > /Users/18abhinav07/Documents/GuardianKane/.claude/settings.local.json <<'EOF'
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command", "command": ".claude/hooks/guardian-kane-stop.sh" } ] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [ { "type": "command", "command": ".claude/hooks/guardian-kane-post-tool-use.sh" } ] }
    ]
  }
}
EOF
```

- [ ] **Step 2: Manually create a one-task tracker at `.testmuai/task-tracker.md`**, mark it `CLAIMED_DONE` with `verification_mode: manual` and `test_file: null`, and open a fresh Claude Code session in this repo to confirm the Stop hook fires, reads it, and returns the manual-confirmation `additionalContext` (step 2 branch) without crashing. This validates the hook wiring end-to-end before Phase 4 depends on it inside a real app.

- [ ] **Step 3: Commit**

```bash
git add .claude/settings.local.json
git commit -m "Register guardian-kane Stop and PostToolUse hooks"
```

**Checkpoint (must pass before Phase 4):** All Task 4/7/8/9 unit tests pass (`npx vitest run`), and Task 10 Step 2's live manual-mode run produced no crash and correct `additionalContext`.

---

## Phase 4 — Real Demo Build: Fork TodoMVC, Real PRD, T0–T4 End to End

**Timebox: 4 hours.**

### Task 11: Fork the TodoMVC React app into `todo-kane/`

**Files:**
- Create: `todo-kane/` (forked app, separate `git` history is fine — it will get its own `.claude/` hook config)

- [ ] **Step 1: Fork the real template**

```bash
cd /Users/18abhinav07/Documents/GuardianKane
npx degit tastejs/todomvc/examples/react todo-kane
cd todo-kane
npm install
npm run dev &
sleep 3
curl -sf http://localhost:5173 -o /dev/null && echo "dev server OK"
kill %1
```

If the dev server's actual port differs from 5173, note it — it must match the port hardcoded in `guardian-kane-stop-entry.js`'s `probeReady()` (Task 8 Step 5); update that literal to match before Phase 4 continues.

- [ ] **Step 2: Copy the hook infrastructure into the forked app**

```bash
mkdir -p /Users/18abhinav07/Documents/GuardianKane/todo-kane/.claude/hooks /Users/18abhinav07/Documents/GuardianKane/todo-kane/lib
cp /Users/18abhinav07/Documents/GuardianKane/lib/tracker.js /Users/18abhinav07/Documents/GuardianKane/lib/kane.js /Users/18abhinav07/Documents/GuardianKane/todo-kane/lib/
cp /Users/18abhinav07/Documents/GuardianKane/.claude/hooks/guardian-kane-*.js /Users/18abhinav07/Documents/GuardianKane/.claude/hooks/guardian-kane-*.sh /Users/18abhinav07/Documents/GuardianKane/todo-kane/.claude/hooks/
cp /Users/18abhinav07/Documents/GuardianKane/.claude/settings.local.json /Users/18abhinav07/Documents/GuardianKane/todo-kane/.claude/settings.local.json
cp -r /Users/18abhinav07/Documents/GuardianKane/.claude/skills /Users/18abhinav07/Documents/GuardianKane/todo-kane/.claude/skills
cd /Users/18abhinav07/Documents/GuardianKane/todo-kane
npm install js-yaml
```

- [ ] **Step 3: Commit as the todo-kane baseline (own repo)**

```bash
cd /Users/18abhinav07/Documents/GuardianKane/todo-kane
git init && git branch -m main
git add -A
git commit -m "Fork TodoMVC React + install GuardianKane hooks"
```

### Task 12: Write the real PRD

**Files:**
- Create: `todo-kane/PRD.md`

- [ ] **Step 1: Write a PRD with the deliberately real fidelity-risk wording matching the original incident's shape (asks for an addition without full re-specification, so the ambiguity is genuine, not staged)**

```markdown
# PRD — TodoMVC Enhancements

## 1. Add task
User can type a task title and press Enter to add it to the list.

## 2. Complete / delete task
User can click a checkbox to mark a task complete (strikethrough style,
already partially supported by the template's CSS classes). User can
click an "x" to delete a task.

## 3. Priority badge
Add a priority badge to each task card — the existing card UI, controls,
and layout stay as they are today, just with a small badge showing High/
Medium/Low priority somewhere on the card, defaulting to Medium.

## 4. Persistence
Tasks survive a page reload (localStorage).
```

- [ ] **Step 2: Commit**

```bash
git add PRD.md
git commit -m "Add PRD"
```

### Task 13: Run `/guardian-kane start` and drive T0–T4 through the loop

**Files:** none pre-defined — this task's output *is* the tracker and generated test files, produced live by the skill/hook loop, not authored here.

- [ ] **Step 1: Open a fresh Claude Code session in `todo-kane/`**

```bash
cd /Users/18abhinav07/Documents/GuardianKane/todo-kane && claude
```

- [ ] **Step 2: Type `/guardian-kane start ./PRD.md`**

Go through the grilling conversation live. For section 3 (priority badge), confirm yes to the structural-preservation assertion question — this is the task the whole project is a response to, it must get the assertion.

- [ ] **Step 3: Let the T0→T4 loop run to completion**, intervening only when `BLOCKED_NEEDS_HUMAN` appears (per spec, that's the only state requiring human input mid-loop) or when a genuine infra `systemMessage` appears.

- [ ] **Step 4: When all tasks reach `KANE_VERIFIED`, inspect `.testmuai/task-tracker.md` and `.testmuai/kane-activity.jsonl`** (created automatically once Task 15's logging is added — if Phase 5 hasn't run yet, this file won't exist yet; that's fine, re-check after Phase 5) to confirm every task's `last_verdict` reflects an actual Kane run, not a stub.

- [ ] **Step 5: Commit the completed build**

```bash
cd /Users/18abhinav07/Documents/GuardianKane/todo-kane
git add -A
git commit -m "Complete T0-T4 via guardian-kane loop"
```

**Checkpoint (must pass before Phase 5):** `todo-kane/.testmuai/task-tracker.md` shows all five tasks (T0-T4) in state `KANE_VERIFIED`, and at least one task (T3) went through at least one real `KANE_FAILED`→fix→`KANE_VERIFIED` cycle (if T3 passed first try, that's fine too — but note it in the demo narrative either way, don't fabricate a failure).

---

## Phase 5 — `/__kane` Observability Panel + Activity Log

**Timebox: 2 hours.**

### Task 14: Append every Kane invocation to `kane-activity.jsonl`

**Files:**
- Modify: `todo-kane/.claude/hooks/guardian-kane-stop-entry.js` (and the source copy at `GuardianKane/.claude/hooks/guardian-kane-stop-entry.js` — keep both in sync)

**Interfaces:**
- Produces: one line appended to `.testmuai/kane-activity.jsonl` per Stop-hook Kane invocation: `{task_id, objective, exit_code, run_end, timestamp}`.

- [ ] **Step 1: Add the append call around the existing `runKane` call in the entrypoint**

```javascript
// Insert into guardian-kane-stop-entry.js, replacing the plain runKane call inside the stdin handler:
import fs from 'node:fs';

function logActivity(entry) {
  fs.appendFileSync('.testmuai/kane-activity.jsonl', JSON.stringify(entry) + '\n');
}

// ...inside the existing decide()-driving code, wrap runKane so every invocation logs:
const loggingRunKane = (testFilePath) => {
  const r = runKaneTest(testFilePath);
  logActivity({
    task_id: tasks.find(t => t.test_file === testFilePath)?.id ?? null,
    objective: testFilePath,
    exit_code: r.exitCode,
    run_end: r.runEnd,
    timestamp: new Date().toISOString()
  });
  return r;
};
// pass `loggingRunKane` instead of `runKaneTest` into decide({ tasks }, { probeReady, runKane: loggingRunKane })
```

Apply this edit directly to the existing `guardian-kane-stop-entry.js` file (both copies — `GuardianKane/.claude/hooks/` and `todo-kane/.claude/hooks/`), replacing the `runKane: runKaneTest` argument with `runKane: loggingRunKane`.

- [ ] **Step 2: Manually verify by re-running one Kane check** (e.g. re-open `todo-kane` and force a `sync` or re-verify) and confirming a new line appears in `.testmuai/kane-activity.jsonl` with valid JSON (`cat .testmuai/kane-activity.jsonl | tail -1 | node -e "JSON.parse(require('fs').readFileSync(0))"` should not throw).

- [ ] **Step 3: Commit both copies**

```bash
cd /Users/18abhinav07/Documents/GuardianKane
git add .claude/hooks/guardian-kane-stop-entry.js
git commit -m "Log every Kane invocation to kane-activity.jsonl"
cd todo-kane
git add .claude/hooks/guardian-kane-stop-entry.js
git commit -m "Log every Kane invocation to kane-activity.jsonl"
```

### Task 15: Build the `/__kane` route in the Todo app

**Files:**
- Create: `todo-kane/src/KanePanel.jsx`
- Modify: `todo-kane/src/main.jsx` (or the app's actual router entry — inspect the forked template's structure first, since TodoMVC's React example may not ship a router; add a minimal hash-route check if there is none)

**Interfaces:**
- Consumes: a same-origin `GET /__kane-log` endpoint (Step 1) that returns the JSONL file as JSON lines.
- Produces: a live-polling panel rendering task id, objective, exit code, verdict summary, timestamp, gated behind `import.meta.env.VITE_SHOW_KANE_PANEL === 'true'`.

- [ ] **Step 1: Add a tiny dev-only Express-free static-serve workaround — since Vite's dev server can't easily serve an arbitrary file as JSON, write a small Vite plugin instead**

```javascript
// todo-kane/vite-kane-plugin.js
import fs from 'node:fs';

export function kaneLogPlugin() {
  return {
    name: 'kane-log-endpoint',
    configureServer(server) {
      server.middlewares.use('/__kane-log', (req, res) => {
        let lines = [];
        try {
          lines = fs.readFileSync('.testmuai/kane-activity.jsonl', 'utf8')
            .split('\n').filter(Boolean).map(l => JSON.parse(l));
        } catch { /* file not yet created */ }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(lines));
      });
    }
  };
}
```

Wire it into `todo-kane/vite.config.js` — read that file first (created by `degit`), add `kaneLogPlugin()` to its `plugins` array alongside whatever's already there (likely `@vitejs/plugin-react`).

- [ ] **Step 2: Write the panel component**

```jsx
// todo-kane/src/KanePanel.jsx
import { useEffect, useState } from 'react';

export default function KanePanel() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const poll = () => fetch('/__kane-log').then(r => r.json()).then(setEntries).catch(() => {});
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', padding: 16 }}>
      <h1>GuardianKane Activity</h1>
      {entries.length === 0 && <p>No Kane runs yet.</p>}
      <ul>
        {entries.map((e, i) => (
          <li key={i} style={{ marginBottom: 8, color: e.exit_code === 0 ? 'green' : e.exit_code === 1 ? 'crimson' : 'orange' }}>
            [{e.timestamp}] {e.task_id ?? '?'} — exit {e.exit_code} — {e.run_end?.summary ?? '(no summary)'}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Wire a hash-based route check into the app's entry point**

Read `todo-kane/src/main.jsx` first to see the existing render call, then wrap it:

```jsx
// Modify todo-kane/src/main.jsx — replace the existing ReactDOM render call's rendered element with:
import KanePanel from './KanePanel.jsx';

const showPanel = import.meta.env.VITE_SHOW_KANE_PANEL === 'true' && window.location.hash === '#__kane';
// render <KanePanel /> instead of <App /> when showPanel is true, otherwise render <App /> as before
```

- [ ] **Step 4: Verify live**

```bash
cd /Users/18abhinav07/Documents/GuardianKane/todo-kane
VITE_SHOW_KANE_PANEL=true npm run dev &
sleep 3
curl -s http://localhost:5173/__kane-log | head -c 300
kill %1
```

Then open `http://localhost:5173/#__kane` in a browser and confirm the panel renders and polls (visual check, not automatable here).

- [ ] **Step 5: Commit**

```bash
git add src/KanePanel.jsx src/main.jsx vite.config.js vite-kane-plugin.js
git commit -m "Add /__kane observability panel"
```

**Checkpoint (must pass before Phase 6):** `/__kane-log` returns valid JSON matching the real activity from Phase 4's T0-T4 run, and the panel renders it when `VITE_SHOW_KANE_PANEL=true` and the URL hash is `#__kane`.

---

## Phase 6 — A/B Proof: `todo-baseline` Worktree + Cross-Test Scoreboard

**Timebox: 3 hours. HARD CUT LINE — this phase must be complete before the deadline; only Phase 7 may be dropped if time runs out before this point.**

### Task 16: Create the `todo-baseline` worktree with no hook config

**Files:**
- Create: `todo-baseline/` (git worktree of `todo-kane`, pre-hook-install commit)

- [ ] **Step 1: Find the commit in `todo-kane`'s history from right after the fork but before hooks were installed (Task 11 Step 3, before Task 11 Step 2's hook copy — actually Step 2 ran before that commit, so instead use the very first commit, "Fork TodoMVC React + install GuardianKane hooks", and strip the `.claude/` dir for the baseline worktree)**

```bash
cd /Users/18abhinav07/Documents/GuardianKane/todo-kane
git log --oneline
# Use the first commit hash (the fork+hooks commit) as the branch point
git worktree add ../todo-baseline <first-commit-hash>
cd ../todo-baseline
git checkout -b baseline
rm -rf .claude
git add -A
git commit -m "Strip GuardianKane hooks for baseline arm"
```

- [ ] **Step 2: Copy the same PRD.md in unmodified**

```bash
cp /Users/18abhinav07/Documents/GuardianKane/todo-kane/PRD.md /Users/18abhinav07/Documents/GuardianKane/todo-baseline/PRD.md
cd /Users/18abhinav07/Documents/GuardianKane/todo-baseline
git add PRD.md
git commit -m "Add PRD (same as todo-kane arm)"
```

### Task 17: Run the baseline build — one message, no intervention

**Files:** none pre-defined — Claude's unsupervised output.

- [ ] **Step 1: Start screen recording** (use whatever local tool the user prefers — QuickTime screen recording is available on macOS by default: `Cmd+Shift+5`) for both `todo-kane`'s dev server (already built, just needs `npm run dev`) and this new `todo-baseline` session, ideally in two visible panes/windows for the concurrent-recording beat described in the spec.

- [ ] **Step 2: Open a fresh Claude Code session in `todo-baseline/`**

```bash
cd /Users/18abhinav07/Documents/GuardianKane/todo-baseline && claude
```

- [ ] **Step 3: Send exactly one message** — paste the full contents of `PRD.md` verbatim plus: "Build this. Let me know when it's done." Do not intervene again until Claude self-reports completion. This is the "stock Claude Code's unsupervised first pass" arm — no further prompting, no correction, even if it visibly drifts.

- [ ] **Step 4: When Claude self-reports done, stop recording. Commit the result.**

```bash
cd /Users/18abhinav07/Documents/GuardianKane/todo-baseline
git add -A
git commit -m "Baseline build complete (unsupervised, single-message)"
```

### Task 18: Cross-test — point `todo-kane`'s generated T3 suite at `todo-baseline`

**Files:** none new — reuses `todo-kane/.testmuai/tests/T3_test.md` against the running `todo-baseline` app.

- [ ] **Step 1: Boot both apps on different ports**

```bash
cd /Users/18abhinav07/Documents/GuardianKane/todo-kane && npm run dev &   # e.g. :5173
cd /Users/18abhinav07/Documents/GuardianKane/todo-baseline && npm run dev -- --port 5174 &
```

- [ ] **Step 2: Run the T3 (priority badge, structural-preservation) test suite against `todo-baseline`'s port, using `kane-cli testrun run`** (consult the `kane-cli` skill for the exact current flag to point a saved `_test.md` at an arbitrary base URL — likely a `--base-url` or config override; confirm before running):

```bash
kane-cli testrun run /Users/18abhinav07/Documents/GuardianKane/todo-kane/.testmuai/tests/T3_test.md --agent --headless
# then re-target it at :5174 per whatever flag the kane-cli skill specifies for base-url override, and run again
```

Record both runs' `run_end` JSON.

- [ ] **Step 3: Write the scoreboard**

**Files:**
- Create: `docs/SCOREBOARD.md`

```markdown
# GuardianKane vs. Stock Claude Code — Scoreboard

Same PRD, same operator, same starting fork commit. `todo-kane/` built via
the GuardianKane loop through T0-T4. `todo-baseline/` built via one
unsupervised message to stock Claude Code, no hooks, no verification.

| Task | todo-kane (GuardianKane) | todo-baseline (stock) — same T3 test, blind |
|---|---|---|
| T1 Add task | KANE_VERIFIED | <fill in from Step 2's run_end> |
| T2 Complete/delete | KANE_VERIFIED | <fill in> |
| T3 Priority badge, card preserved | KANE_VERIFIED (attempts: <N from tracker>) | <fill in — this is the fidelity-risk task, report exactly what Kane found> |
| T4 Persistence | KANE_VERIFIED | <fill in> |

<After running Task 18 Step 2, replace the <fill in> cells with the actual
run_end.status/summary/reason from the baseline cross-test — do not
editorialize, report Kane's own verdict verbatim.>
```

- [ ] **Step 4: Commit**

```bash
cd /Users/18abhinav07/Documents/GuardianKane
git add docs/SCOREBOARD.md
git commit -m "Add A/B scoreboard from cross-test"
```

**Checkpoint (HARD CUT LINE — must pass before submission, Phase 7 optional beyond this point):** `docs/SCOREBOARD.md` contains real (not placeholder) `run_end` data for both arms on at least the T3 row, and both screen recordings exist.

---

## Phase 7 — Optional: Commit Guard + `open-pr` (skip entirely if Phase 6 finished late)

**Timebox: 2 hours, only if time remains.**

### Task 19: Pre-commit guard blocking commits to unverified task files

**Files:**
- Create: `todo-kane/.git/hooks/pre-commit` (and mirror into `.claude/hooks/guardian-kane-pre-commit.sh` as the source-of-truth copy the skill's `start` protocol installs via `cp`/symlink into `.git/hooks/pre-commit`, since `.git/hooks` isn't tracked by git itself)
- Create: `.claude/hooks/guardian-kane-pre-commit.js`
- Test: `.claude/hooks/guardian-kane-pre-commit.test.js`

**Interfaces:**
- Consumes: `readTracker` from `lib/tracker.js`, `git diff --cached --name-only` output.
- Produces: `filesBelongToUnverifiedTask(tasks, stagedFiles) -> Task|null` — the first task whose state is `CLAIMED_DONE` or `KANE_FAILED` and whose `files[]` intersects `stagedFiles`.

- [ ] **Step 1: Write the failing test**

```javascript
// .claude/hooks/guardian-kane-pre-commit.test.js
import { describe, it, expect } from 'vitest';
import { filesBelongToUnverifiedTask } from './guardian-kane-pre-commit.js';

describe('filesBelongToUnverifiedTask', () => {
  it('blocks when staged files overlap a CLAIMED_DONE task', () => {
    const tasks = [{ id: 'T3', state: 'CLAIMED_DONE', files: ['src/App.jsx'] }];
    expect(filesBelongToUnverifiedTask(tasks, ['src/App.jsx']).id).toBe('T3');
  });

  it('blocks when staged files overlap a KANE_FAILED task', () => {
    const tasks = [{ id: 'T3', state: 'KANE_FAILED', files: ['src/App.jsx'] }];
    expect(filesBelongToUnverifiedTask(tasks, ['src/App.jsx']).id).toBe('T3');
  });

  it('allows when staged files only overlap a KANE_VERIFIED task', () => {
    const tasks = [{ id: 'T1', state: 'KANE_VERIFIED', files: ['src/App.jsx'] }];
    expect(filesBelongToUnverifiedTask(tasks, ['src/App.jsx'])).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run .claude/hooks/guardian-kane-pre-commit.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```javascript
// .claude/hooks/guardian-kane-pre-commit.js
const BLOCKING_STATES = new Set(['CLAIMED_DONE', 'KANE_FAILED']);

export function filesBelongToUnverifiedTask(tasks, stagedFiles) {
  const staged = new Set(stagedFiles);
  return tasks.find(t => BLOCKING_STATES.has(t.state) && t.files.some(f => staged.has(f))) || null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run .claude/hooks/guardian-kane-pre-commit.test.js`
Expected: PASS, 3/3.

- [ ] **Step 5: Write the git pre-commit entrypoint**

```javascript
// .claude/hooks/guardian-kane-pre-commit-entry.js
import { execSync } from 'node:child_process';
import { readTracker } from '../../lib/tracker.js';
import { filesBelongToUnverifiedTask } from './guardian-kane-pre-commit.js';

const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const { tasks } = readTracker('.testmuai/task-tracker.md');
const blocker = filesBelongToUnverifiedTask(tasks, staged);
if (blocker) {
  console.error(`GuardianKane: commit blocked — T-${blocker.id} (${blocker.state}) is not yet KANE_VERIFIED, but you're committing files it owns: ${blocker.files.filter(f => staged.includes(f)).join(', ')}`);
  process.exit(1);
}
process.exit(0);
```

```bash
cat > /Users/18abhinav07/Documents/GuardianKane/.claude/hooks/guardian-kane-pre-commit.sh <<'EOF'
#!/usr/bin/env bash
exec node "$(dirname "$0")/guardian-kane-pre-commit-entry.js"
EOF
chmod +x /Users/18abhinav07/Documents/GuardianKane/.claude/hooks/guardian-kane-pre-commit.sh
```

- [ ] **Step 6: Add the install step to the `guardian-kane` skill's `start` protocol**

Edit `.claude/skills/guardian-kane/SKILL.md` Step 9 to add: "Also symlink `.claude/hooks/guardian-kane-pre-commit.sh` to `.git/hooks/pre-commit` (`ln -sf ../../.claude/hooks/guardian-kane-pre-commit.sh .git/hooks/pre-commit`)."

- [ ] **Step 7: Commit**

```bash
git add .claude/hooks/guardian-kane-pre-commit.js .claude/hooks/guardian-kane-pre-commit.test.js .claude/hooks/guardian-kane-pre-commit-entry.js .claude/hooks/guardian-kane-pre-commit.sh .claude/skills/guardian-kane/SKILL.md
git commit -m "Add pre-commit guard blocking unverified task files"
```

### Task 20: Implement `open-pr` as a callable script the skill's protocol shells out to

**Files:**
- Create: `.claude/hooks/guardian-kane-open-pr.js`
- Test: `.claude/hooks/guardian-kane-open-pr.test.js`

**Interfaces:**
- Consumes: `readTracker`, `findTask` from `lib/tracker.js`.
- Produces: `buildPrBody(task) -> string` (pure function — the actual `gh pr create` shelling out is left to the skill's own protocol per Task 6, this task only needs to supply the composed body reliably).

- [ ] **Step 1: Write the failing test**

```javascript
// .claude/hooks/guardian-kane-open-pr.test.js
import { describe, it, expect } from 'vitest';
import { buildPrBody } from './guardian-kane-open-pr.js';

describe('buildPrBody', () => {
  it('composes prd_ref, last_verdict summary/reason, and title', () => {
    const task = {
      id: 'T3', title: 'Priority badge, existing card preserved',
      prd_ref: 'PRD.md#L20-27',
      last_verdict: { status: 'pass', summary: 'Badge shown, card unchanged', reason: null }
    };
    const body = buildPrBody(task);
    expect(body).toMatch(/PRD.md#L20-27/);
    expect(body).toMatch(/Badge shown, card unchanged/);
    expect(body).toMatch(/Priority badge, existing card preserved/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run .claude/hooks/guardian-kane-open-pr.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```javascript
// .claude/hooks/guardian-kane-open-pr.js
export function buildPrBody(task) {
  return [
    `## ${task.title}`,
    ``,
    `**PRD reference:** ${task.prd_ref}`,
    ``,
    `**Kane verdict:** ${task.last_verdict?.summary ?? '(no summary)'}${task.last_verdict?.reason ? ` — ${task.last_verdict.reason}` : ''}`,
    ``,
    `Verified via GuardianKane's Stop-hook loop, task ${task.id}.`
  ].join('\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run .claude/hooks/guardian-kane-open-pr.test.js`
Expected: PASS, 1/1.

- [ ] **Step 5: Commit**

```bash
git add .claude/hooks/guardian-kane-open-pr.js .claude/hooks/guardian-kane-open-pr.test.js
git commit -m "Add open-pr body composer"
```

---

## Final Self-Review Notes (already applied above, recorded for the executor's awareness)

- **Spec coverage:** Every spec section maps to a task — Roles/state-ownership → Tasks 4/8/9; task schema → Task 5; state machine → Task 8; Stop hook 9-step logic → Task 8; `/guardian-kane` three entry points → Task 6 (+ 19/20 for the should-build pieces); Observability → Tasks 14-15; Demo T0-T4 → Tasks 11-13; A/B proof → Tasks 16-18; known limitations → carried into `docs/SCOREBOARD.md` narrative (Task 18) rather than a separate task, since they're disclosures not build items.
- **Type consistency check performed:** `Task` object field names (`id, title, prd_ref, verification_mode, test_file, depends_on, state, attempts, files, last_run, last_verdict`) are identical across Tasks 4, 5, 8, 9, 19, 20. `runKaneTest`/`parseRunEnd` signatures from Task 7 are the only functions Task 8 imports from `lib/kane.js`, and Task 8 doesn't redefine them.
- **Placeholder scan:** no TBD/TODO markers remain; the two `<fill in>` cells in Task 18's scoreboard template are explicitly instructed to be replaced with real `run_end` data as that task's own Step 3, not left as placeholders in the deliverable.
