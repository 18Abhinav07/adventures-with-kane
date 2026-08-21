import { nextPlannedTask } from '../../lib/tracker.js';

const STALE_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 3;

export function decide({ tasks }, { probeReady, runKane, runSweep, log }) {
  const logLine = log || (() => {});
  const claimed = tasks.find(t => t.state === 'CLAIMED_DONE');

  // Step 3: staleness check on any task stuck in KANE_VERIFYING
  const stale = tasks.find(t => t.state === 'KANE_VERIFYING' &&
    t.last_run && (Date.now() - new Date(t.last_run).getTime()) > STALE_MS);
  if (stale) {
    stale.state = 'IN_PROGRESS';
    logLine(stale.id, `STALE — stuck in KANE_VERIFYING >5min. Reset to IN_PROGRESS.`);
    return { decision: 'deny', permissionDecisionReason: `T-${stale.id} verification run appears to have crashed (stuck >5min). Reset to IN_PROGRESS — resume work on it.` };
  }

  // Step 1: nothing to verify
  if (!claimed) {
    return { decision: 'allow' };
  }

  // Step 2: manual verification mode
  if (claimed.verification_mode === 'manual') {
    // Claude signals confirmation via `manual_confirmed`, never by writing a
    // KANE_* state itself — the hook alone owns that transition.
    if (!claimed.manual_confirmed) {
      logLine(claimed.id, `manual verification mode — awaiting manual_confirmed: true.`);
      return { decision: 'allow', additionalContext: `T${claimed.id.replace('T', '')} is CLAIMED_DONE with no browser-observable surface for Kane to check. To confirm it, set manual_confirmed: true on its task-tracker.md row (do not change state directly), then stop again.` };
    }
    claimed.state = 'KANE_VERIFIED';
    claimed.last_verdict = { status: 'pass', summary: 'Manually confirmed — no browser-observable surface.', reason: null };
    logLine(claimed.id, `manual_confirmed: true received -> KANE_VERIFIED.`);
    const nextManual = nextPlannedTask(tasks);
    if (nextManual) {
      logLine(claimed.id, `next task: T-${nextManual.id} (${nextManual.title}).`);
      return { decision: 'deny', permissionDecisionReason: `T-${claimed.id} verified. Start T-${nextManual.id}: ${nextManual.title}. Mark it IN_PROGRESS in task-tracker.md before editing files.` };
    }
    logLine(claimed.id, `all tasks KANE_VERIFIED. Build complete.`);
    return { decision: 'allow', done: true, systemMessage: 'GuardianKane: all tasks KANE_VERIFIED. Build complete.' };
  }

  // Step 4: dev server readiness probe
  if (!probeReady()) {
    logLine(claimed.id, `dev server not responding — cannot verify.`);
    return { decision: 'allow', systemMessage: 'GuardianKane: dev server not responding — cannot verify. Check it manually and resume the session.' };
  }

  // Step 5: run kane's scripted test(s) — tasks with no generated test file
  // (e.g. T0's ad-hoc scaffold check) skip straight to the defect sweep,
  // which is their sole verification.
  claimed.state = 'KANE_VERIFYING';
  claimed.last_run = new Date().toISOString();
  const hasTestFile = Array.isArray(claimed.test_file)
    ? claimed.test_file.length > 0
    : Boolean(claimed.test_file);

  let exitCode;
  let runEnd;
  if (hasTestFile) {
    logLine(claimed.id, `running scripted test: ${JSON.stringify(claimed.test_file)}.`);
    ({ exitCode, runEnd } = runKane(claimed.test_file));
  } else {
    logLine(claimed.id, `no scripted test file — skipping to defect sweep.`);
    exitCode = 0;
    runEnd = null;
  }

  if (exitCode === 0) {
    // Step 6: scripted test passed. Before declaring KANE_VERIFIED, run a
    // second, ad-hoc general-defect sweep of the live app against this
    // task's PRD section — a scripted test only checks what it was told to
    // check; the sweep looks for anything else that's wrong.
    if (hasTestFile) {
      logLine(claimed.id, `scripted test PASSED. summary: ${runEnd?.summary || '(none)'}`);
    }

    if (!runSweep) {
      // No sweep configured for this run (e.g. older/unit-test caller) —
      // fall back to the pre-sweep behavior unchanged.
      claimed.state = 'KANE_VERIFIED';
      claimed.last_verdict = runEnd;
      logLine(claimed.id, `-> KANE_VERIFIED (no sweep configured).`);
      const next = nextPlannedTask(tasks);
      if (next) {
        logLine(claimed.id, `next task: T-${next.id} (${next.title}).`);
        return { decision: 'deny', permissionDecisionReason: `T-${claimed.id} verified. Start T-${next.id}: ${next.title}. Mark it IN_PROGRESS in task-tracker.md before editing files.` };
      }
      logLine(claimed.id, `all tasks KANE_VERIFIED. Build complete.`);
      return { decision: 'allow', done: true, systemMessage: 'GuardianKane: all tasks KANE_VERIFIED. Build complete.' };
    }

    logLine(claimed.id, `running general defect sweep against PRD section "${claimed.prd_ref || claimed.title}".`);
    const sweep = runSweep(claimed);

    if (!sweep.issueFound) {
      claimed.state = 'KANE_VERIFIED';
      claimed.last_verdict = runEnd;
      logLine(claimed.id, `sweep found no issues. -> KANE_VERIFIED.`);
      const next = nextPlannedTask(tasks);
      if (next) {
        logLine(claimed.id, `next task: T-${next.id} (${next.title}).`);
        return { decision: 'deny', permissionDecisionReason: `T-${claimed.id} verified. Start T-${next.id}: ${next.title}. Mark it IN_PROGRESS in task-tracker.md before editing files.` };
      }
      logLine(claimed.id, `all tasks KANE_VERIFIED. Build complete.`);
      return { decision: 'allow', done: true, systemMessage: 'GuardianKane: all tasks KANE_VERIFIED. Build complete.' };
    }

    // Sweep flagged a confirmed issue — gate exactly like a scripted-test
    // failure (Step 7), sharing the same attempt cap.
    claimed.attempts += 1;
    claimed.last_verdict = sweep.runEnd || runEnd;
    const sweepSummary = sweep.runEnd?.summary || '(no summary)';
    logLine(claimed.id, `sweep FOUND ISSUE (attempt ${claimed.attempts}/${MAX_ATTEMPTS}): ${sweepSummary}`);
    if (claimed.attempts < MAX_ATTEMPTS) {
      claimed.state = 'KANE_FAILED';
      return { decision: 'deny', permissionDecisionReason: `T-${claimed.id} passed its scripted test but the general defect sweep found an issue (attempt ${claimed.attempts}/${MAX_ATTEMPTS}): ${sweepSummary}. Flip T-${claimed.id} to IN_PROGRESS first, then fix and re-claim done.` };
    }
    claimed.state = 'BLOCKED_NEEDS_HUMAN';
    logLine(claimed.id, `-> BLOCKED_NEEDS_HUMAN after ${MAX_ATTEMPTS} sweep failures.`);
    return { decision: 'allow', systemMessage: `GuardianKane: T-${claimed.id} failed the defect sweep ${MAX_ATTEMPTS} times, needs human review.` };
  }

  if (exitCode === 1) {
    // Step 7
    claimed.attempts += 1;
    claimed.last_verdict = runEnd;
    const remark = runEnd?.summary || '(no summary)';
    const reason = runEnd?.reason || '(no reason)';
    logLine(claimed.id, `scripted test FAILED (attempt ${claimed.attempts}/${MAX_ATTEMPTS}). summary: ${remark}. reason: ${reason}`);
    if (claimed.attempts < MAX_ATTEMPTS) {
      claimed.state = 'KANE_FAILED';
      return { decision: 'deny', permissionDecisionReason: `T-${claimed.id} failed verification (attempt ${claimed.attempts}/${MAX_ATTEMPTS}). Summary: ${remark}. Reason: ${reason}. Flip T-${claimed.id} to IN_PROGRESS first, then fix and re-claim done.` };
    }
    claimed.state = 'BLOCKED_NEEDS_HUMAN';
    logLine(claimed.id, `-> BLOCKED_NEEDS_HUMAN after ${MAX_ATTEMPTS} failures.`);
    return { decision: 'allow', systemMessage: `GuardianKane: T-${claimed.id} failed ${MAX_ATTEMPTS} times, needs human review.` };
  }

  // Step 8: exit 2/3, infra/timeout — never touch state further, allow
  const kind = exitCode === 2 ? 'infra/auth error' : 'timeout';
  logLine(claimed.id, `Kane run hit a ${kind} (exit ${exitCode}) — state unchanged.`);
  return { decision: 'allow', systemMessage: `GuardianKane: Kane verification hit a ${kind} (exit ${exitCode}), not a code failure. Check kane-cli auth/connectivity and resume manually.` };
}
