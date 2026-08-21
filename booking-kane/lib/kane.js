import { spawnSync } from 'node:child_process';

export function parseRunEnd(stdout) {
  const lines = stdout.split('\n').filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(lines[i]);
      if (parsed.type === 'run_end') return parsed;
    } catch {
      continue;
    }
  }
  return null;
}

const APP_URL = process.env.GUARDIAN_KANE_APP_URL || 'http://localhost:8082';

function runSingleKaneTest(testFilePath) {
  const variables = JSON.stringify({ start_url: { value: APP_URL } });
  const result = spawnSync(
    'kane-cli',
    ['testmd', 'run', testFilePath, '--agent', '--headless', '--variables', variables],
    { encoding: 'utf8', timeout: 5 * 60 * 1000 }
  );
  const runEnd = parseRunEnd(result.stdout || '');
  return { exitCode: result.status, runEnd, stdout: result.stdout || '' };
}

// A task may have more than one generated test file (e.g. separate
// default-value and explicit-value cases). Run them in order, short-circuit
// on the first failure so the tracker records that failure's runEnd.
export function runKaneTest(testFilePath) {
  const files = Array.isArray(testFilePath) ? testFilePath : [testFilePath];
  let combinedStdout = '';
  let last;
  for (const file of files) {
    last = runSingleKaneTest(file);
    combinedStdout += last.stdout;
    if (last.exitCode !== 0) {
      return { exitCode: last.exitCode, runEnd: last.runEnd, stdout: combinedStdout };
    }
  }
  return { exitCode: last.exitCode, runEnd: last.runEnd, stdout: combinedStdout };
}
