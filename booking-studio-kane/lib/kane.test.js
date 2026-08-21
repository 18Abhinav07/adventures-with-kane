import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parseRunEnd, runKaneTest } from './kane.js';

vi.mock('node:child_process', () => ({ spawnSync: vi.fn() }));

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
  beforeEach(() => { spawnSync.mockReset(); });

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

  it('runs multiple test files in order and stops at the first failure', () => {
    spawnSync
      .mockReturnValueOnce(fakeRun('pass', 0))
      .mockReturnValueOnce(fakeRun('fail', 1));
    const result = runKaneTest(['a_test.md', 'b_test.md']);
    expect(spawnSync).toHaveBeenCalledTimes(2);
    expect(result.exitCode).toBe(1);
    expect(result.runEnd.status).toBe('fail');
  });

  it('returns the last file\'s runEnd when all test files pass', () => {
    spawnSync
      .mockReturnValueOnce(fakeRun('pass', 0))
      .mockReturnValueOnce(fakeRun('pass', 0));
    const result = runKaneTest(['a_test.md', 'b_test.md']);
    expect(spawnSync).toHaveBeenCalledTimes(2);
    expect(result.exitCode).toBe(0);
  });
});
