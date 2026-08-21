import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { parseRunEnd, runKaneTest, runKaneSweep } from './kane.js';

vi.mock('node:child_process', () => ({ spawnSync: vi.fn() }));
vi.mock('node:fs', () => ({ default: { mkdirSync: vi.fn(), writeFileSync: vi.fn() } }));

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

describe('runKaneTest', () => {
  beforeEach(() => {
    spawnSync.mockReset();
    process.env.GUARDIAN_KANE_APP_URL = 'http://localhost:9999';
  });

  function fakeRun(status, exitCode) {
    return { status: exitCode, stdout: `{"type":"run_end","status":"${status}","summary":"s","reason":null}` };
  }

  it('passes --variables with a start_url for a single test file', () => {
    spawnSync.mockReturnValue(fakeRun('pass', 0));
    runKaneTest('.testmuai/tests/T1_test.md');
    const args = spawnSync.mock.calls[0][1];
    expect(args).toContain('--variables');
    expect(args[args.indexOf('--variables') + 1]).toMatch(/"start_url":\{"value":"http/);
  });

  function fakeTestrun(status, events) {
    return { status, stdout: events.map((e) => JSON.stringify(e)).join('\n') };
  }

  it('batches 2+ test files into one testrun call and writes the variables file', () => {
    spawnSync.mockReturnValue(
      fakeTestrun(0, [
        { type: 'testrun_plan', valid: true, members: [{ path: 'a_test.md' }, { path: 'b_test.md' }] },
        { type: 'testrun_member_end', path: 'a_test.md', status: 'passed' },
        { type: 'testrun_member_end', path: 'b_test.md', status: 'passed' },
        { type: 'testrun_summary', totals: { tests: 2, passed: 2, failed: 0, broken: 0, skipped: 0 } },
        { type: 'testrun_done', overall_status: 'passed' },
      ])
    );
    const result = runKaneTest(['a_test.md', 'b_test.md']);
    expect(spawnSync).toHaveBeenCalledTimes(1);
    const [cmd, args] = spawnSync.mock.calls[0];
    expect(cmd).toBe('kane-cli');
    expect(args[0]).toBe('testrun');
    expect(args).toContain('--parallel');
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '.testmuai/variables/app.json',
      expect.stringMatching(/"start_url"/),
      'utf8'
    );
    expect(result.exitCode).toBe(0);
    expect(result.runEnd.summary).toMatch(/2\/2 passed/);
  });

  it('reports a failed member from a testrun batch without falling back', () => {
    spawnSync.mockReturnValue(
      fakeTestrun(1, [
        { type: 'testrun_plan', valid: true, members: [{ path: 'a_test.md' }, { path: 'b_test.md' }] },
        { type: 'testrun_member_end', path: 'a_test.md', status: 'passed' },
        { type: 'testrun_member_end', path: 'b_test.md', status: 'failed' },
        { type: 'testrun_summary', totals: { tests: 2, passed: 1, failed: 1, broken: 0, skipped: 0 } },
        { type: 'testrun_done', overall_status: 'failed' },
      ])
    );
    const result = runKaneTest(['a_test.md', 'b_test.md']);
    expect(spawnSync).toHaveBeenCalledTimes(1);
    expect(result.exitCode).toBe(1);
    expect(result.runEnd.reason).toMatch(/b_test\.md \(failed\)/);
  });

  it('falls back to the sequential path when the testrun plan is rejected', () => {
    spawnSync
      .mockReturnValueOnce(fakeTestrun(2, [{ type: 'testrun_plan', valid: false, members: [] }]))
      .mockReturnValueOnce(fakeRun('pass', 0))
      .mockReturnValueOnce(fakeRun('fail', 1));
    const result = runKaneTest(['a_test.md', 'b_test.md']);
    expect(spawnSync).toHaveBeenCalledTimes(3);
    expect(spawnSync.mock.calls[1][1]).toContain('testmd');
    expect(spawnSync.mock.calls[2][1]).toContain('testmd');
    expect(result.exitCode).toBe(1);
    expect(result.runEnd.status).toBe('fail');
  });
});

describe('runKaneSweep', () => {
  beforeEach(() => {
    spawnSync.mockReset();
    process.env.GUARDIAN_KANE_APP_URL = 'http://localhost:9999';
  });

  function fakeSweepRun(confirmed, exitCode = 0) {
    return {
      status: exitCode,
      stdout: `{"type":"run_end","status":"pass","summary":"s","verdict":{"confirmed":${confirmed}}}`
    };
  }

  it('passes --bug-detection stop and the task title into the objective', () => {
    spawnSync.mockReturnValue(fakeSweepRun(false));
    runKaneSweep({ id: 'T1', title: 'Add priority badge', prd_ref: 'PRD.md#L1' });
    const [cmd, args] = spawnSync.mock.calls[0];
    expect(cmd).toBe('kane-cli');
    expect(args).toContain('--bug-detection');
    expect(args[args.indexOf('--bug-detection') + 1]).toBe('stop');
    expect(args.some(a => typeof a === 'string' && a.includes('Add priority badge'))).toBe(true);
  });

  it('issueFound is false when verdict.confirmed is false', () => {
    spawnSync.mockReturnValue(fakeSweepRun(false));
    const result = runKaneSweep({ id: 'T1', title: 'x' });
    expect(result.issueFound).toBe(false);
  });

  it('issueFound is true when verdict.confirmed is true', () => {
    spawnSync.mockReturnValue(fakeSweepRun(true));
    const result = runKaneSweep({ id: 'T1', title: 'x' });
    expect(result.issueFound).toBe(true);
  });
});
