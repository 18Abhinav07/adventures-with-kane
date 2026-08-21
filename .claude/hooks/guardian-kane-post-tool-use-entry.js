import { existsSync } from 'node:fs';
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
  // No tracker yet means GuardianKane hasn't been started on this project
  // (via /guardian-kane start) — nothing to record, not an error.
  if (!existsSync(TRACKER_PATH)) {
    process.exit(0);
  }
  const { tasks } = readTracker(TRACKER_PATH);
  recordFileTouch(tasks, filePath);
  writeTracker(TRACKER_PATH, { tasks });
  process.exit(0);
});
