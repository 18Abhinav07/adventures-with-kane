import fs from 'node:fs';
import { load, dump } from 'js-yaml';

const FENCE_START = '```yaml\n';
const FENCE_END = '\n```';
const HEADER = '# GuardianKane Task Tracker\n\n';

export function readTracker(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const start = raw.indexOf(FENCE_START) + FENCE_START.length;
  const end = raw.indexOf(FENCE_END, start);
  const yamlBody = raw.slice(start, end);
  const tasks = load(yamlBody) || [];
  return { tasks };
}

export function writeTracker(filePath, { tasks }) {
  const yamlBody = dump(tasks, { lineWidth: 100 });
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
