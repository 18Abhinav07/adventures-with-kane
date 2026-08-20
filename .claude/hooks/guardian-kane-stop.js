import { nextPlannedTask } from '../../lib/tracker.js';

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
