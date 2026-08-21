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
