import { describe, it, expect } from 'vitest';
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

  it('step 2: allows stop and asks for manual_confirmed when unset, does not touch state', () => {
    const tasks = [task({ state: 'CLAIMED_DONE', verification_mode: 'manual' })];
    const result = decide({ tasks }, { probeReady: () => true, runKane: () => { throw new Error('should not be called'); } });
    expect(result.decision).toBe('allow');
    expect(result.additionalContext).toMatch(/manual_confirmed: true/);
    expect(tasks[0].state).toBe('CLAIMED_DONE');
  });

  it('step 2: manual_confirmed true -> hook itself transitions to KANE_VERIFIED, done', () => {
    const tasks = [task({ state: 'CLAIMED_DONE', verification_mode: 'manual', manual_confirmed: true })];
    const result = decide({ tasks }, { probeReady: () => true, runKane: () => { throw new Error('should not be called'); } });
    expect(tasks[0].state).toBe('KANE_VERIFIED');
    expect(result.decision).toBe('allow');
    expect(result.done).toBe(true);
  });

  it('step 2: manual_confirmed true with a next PLANNED task -> deny, names it', () => {
    const tasks = [
      task({ id: 'T1', state: 'CLAIMED_DONE', verification_mode: 'manual', manual_confirmed: true, depends_on: [] }),
      task({ id: 'T2', state: 'PLANNED', depends_on: ['T1'], title: 'Complete task' })
    ];
    const result = decide({ tasks }, { probeReady: () => true, runKane: () => { throw new Error('should not be called'); } });
    expect(tasks[0].state).toBe('KANE_VERIFIED');
    expect(result.decision).toBe('deny');
    expect(result.permissionDecisionReason).toMatch(/T2/);
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

  it('sweep: scripted test passes, sweep finds no issue -> KANE_VERIFIED', () => {
    const tasks = [task({ state: 'CLAIMED_DONE' })];
    const result = decide({ tasks }, {
      probeReady: () => true,
      runKane: () => ({ exitCode: 0, runEnd: { status: 'pass', summary: 'ok', reason: null } }),
      runSweep: () => ({ exitCode: 0, runEnd: { status: 'pass', verdict: { confirmed: false } }, issueFound: false })
    });
    expect(tasks[0].state).toBe('KANE_VERIFIED');
    expect(result.decision).toBe('allow');
    expect(result.done).toBe(true);
  });

  it('sweep: scripted test passes, sweep finds a confirmed issue -> KANE_FAILED, deny, reason includes sweep summary', () => {
    const tasks = [task({ state: 'CLAIMED_DONE', attempts: 0 })];
    const result = decide({ tasks }, {
      probeReady: () => true,
      runKane: () => ({ exitCode: 0, runEnd: { status: 'pass', summary: 'ok', reason: null } }),
      runSweep: () => ({
        exitCode: 0,
        runEnd: { status: 'pass', verdict: { confirmed: true }, summary: 'button overlaps footer at narrow widths' },
        issueFound: true
      })
    });
    expect(tasks[0].state).toBe('KANE_FAILED');
    expect(tasks[0].attempts).toBe(1);
    expect(result.decision).toBe('deny');
    expect(result.permissionDecisionReason).toMatch(/button overlaps footer/);
  });

  it('sweep: confirmed issue on 3rd attempt -> BLOCKED_NEEDS_HUMAN', () => {
    const tasks = [task({ state: 'CLAIMED_DONE', attempts: 2 })];
    const result = decide({ tasks }, {
      probeReady: () => true,
      runKane: () => ({ exitCode: 0, runEnd: { status: 'pass', summary: 'ok', reason: null } }),
      runSweep: () => ({ exitCode: 0, runEnd: { verdict: { confirmed: true }, summary: 'still broken' }, issueFound: true })
    });
    expect(tasks[0].state).toBe('BLOCKED_NEEDS_HUMAN');
    expect(tasks[0].attempts).toBe(3);
    expect(result.decision).toBe('allow');
  });

  it('step 5: test_file null (e.g. T0) skips runKane entirely and goes straight to the sweep', () => {
    const tasks = [task({ id: 'T0', state: 'CLAIMED_DONE', test_file: null, prd_ref: null })];
    const result = decide({ tasks }, {
      probeReady: () => true,
      runKane: () => { throw new Error('should not be called when test_file is null'); },
      runSweep: () => ({ exitCode: 0, runEnd: { status: 'pass', verdict: { confirmed: false } }, issueFound: false })
    });
    expect(tasks[0].state).toBe('KANE_VERIFIED');
    expect(result.decision).toBe('allow');
    expect(result.done).toBe(true);
  });

  it('step 5: test_file empty array also skips runKane and goes straight to the sweep', () => {
    const tasks = [task({ state: 'CLAIMED_DONE', test_file: [] })];
    const result = decide({ tasks }, {
      probeReady: () => true,
      runKane: () => { throw new Error('should not be called when test_file is empty') },
      runSweep: () => ({ exitCode: 0, runEnd: { status: 'pass', verdict: { confirmed: false } }, issueFound: false })
    });
    expect(tasks[0].state).toBe('KANE_VERIFIED');
    expect(result.decision).toBe('allow');
  });

  it('logging: log callback receives a line for every branch it is given (no crash if omitted)', () => {
    const lines = [];
    const tasks = [task({ state: 'CLAIMED_DONE' })];
    decide({ tasks }, {
      probeReady: () => true,
      runKane: () => ({ exitCode: 0, runEnd: { status: 'pass', summary: 'ok', reason: null } }),
      runSweep: () => ({ exitCode: 0, runEnd: { verdict: { confirmed: false } }, issueFound: false }),
      log: (taskId, message) => lines.push(`${taskId}: ${message}`)
    });
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.some(l => l.includes('KANE_VERIFIED'))).toBe(true);
  });
});
