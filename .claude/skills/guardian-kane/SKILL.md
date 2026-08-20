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
9. Install the Stop hook and PostToolUse hook into `.claude/settings.local.json` (paths: `.claude/hooks/guardian-kane-stop.sh`, `.claude/hooks/guardian-kane-post-tool-use.sh` — copy `lib/`, `.claude/hooks/guardian-kane-*.js`, `.claude/hooks/guardian-kane-*.sh`, and this skill directory from the GuardianKane repo into the target project). If the pre-commit guard is available (Phase 7), also symlink `.claude/hooks/guardian-kane-pre-commit.sh` to `.git/hooks/pre-commit` (`ln -sf ../../.claude/hooks/guardian-kane-pre-commit.sh .git/hooks/pre-commit`).
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
3. Compose a PR body via `buildPrBody(task)` in `.claude/hooks/guardian-kane-open-pr.js` (uses the task's `last_verdict`, `prd_ref`, and title — do not hand-compose the body text yourself).
4. Run `gh pr create --title "<task.title>" --body "<composed body>"`.
