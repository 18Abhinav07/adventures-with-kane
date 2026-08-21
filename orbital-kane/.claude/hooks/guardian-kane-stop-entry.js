import { readTracker, writeTracker } from '../../lib/tracker.js';
import { runKaneTest, runKaneSweep } from '../../lib/kane.js';
import { getAppUrl } from '../../lib/config.js';
import { logActivity } from '../../lib/logger.js';
import { decide } from './guardian-kane-stop.js';
import { execSync } from 'node:child_process';

const TRACKER_PATH = '.testmuai/task-tracker.md';

function probeReady() {
  // No hardcoded fallback port: a wrong silent guess here is worse than a
  // loud, visible "not ready" — see lib/config.js.
  let appUrl;
  try {
    appUrl = getAppUrl();
  } catch {
    return false;
  }
  try {
    execSync(`curl -sf ${appUrl} -o /dev/null`, { timeout: 3000 });
    return true;
  } catch {
    try {
      execSync(`sleep 3 && curl -sf ${appUrl} -o /dev/null`, { timeout: 6000 });
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
  const result = decide({ tasks }, { probeReady, runKane: runKaneTest, runSweep: runKaneSweep, log: logActivity });
  writeTracker(TRACKER_PATH, { tasks });

  if (result.decision === 'deny') {
    // Stop hooks use the top-level decision/reason shape (not
    // hookSpecificOutput.permissionDecision, which is PreToolUse-only).
    const out = { decision: 'block', reason: result.permissionDecisionReason };
    if (result.systemMessage) out.systemMessage = result.systemMessage;
    process.stdout.write(JSON.stringify(out));
    process.exit(0);
  } else {
    const out = {};
    if (result.additionalContext) {
      out.hookSpecificOutput = { hookEventName: 'Stop', additionalContext: result.additionalContext };
    }
    if (result.systemMessage) out.systemMessage = result.systemMessage;
    process.stdout.write(JSON.stringify(out));
    process.exit(0);
  }
});
