import fs from 'node:fs';
import path from 'node:path';

const LOG_PATH = '.testmuai/kane-activity.log';

// Plain-text, append-only audit trail of everything the Stop hook itself
// decided and did. Written only by the hook (never by Claude self-reporting)
// so the log stays a trustworthy record of what actually ran, not a claim.
export function logActivity(taskId, message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${taskId}] ${message}\n`;
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.appendFileSync(LOG_PATH, line, 'utf8');
}
