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

const APP_URL = process.env.GUARDIAN_KANE_APP_URL || 'http://localhost:8080';

function runSingleKaneTest(testFilePath) {
  const variables = JSON.stringify({ start_url: { value: APP_URL } });
  const result = spawnSync(
    'kane-cli',
    ['testmd', 'run', testFilePath, '--agent', '--headless', '--variables', variables],
    {
      encoding: 'utf8',
      timeout: 5 * 60 * 1000
    }
  );
  const runEnd = parseRunEnd(result.stdout || '');
  return { exitCode: result.status, runEnd, stdout: result.stdout || '' };
}

export function runKaneTest(testFilePath) {
  const files = Array.isArray(testFilePath) ? testFilePath : [testFilePath];
  let combinedStdout = '';
  for (const file of files) {
    const outcome = runSingleKaneTest(file);
    combinedStdout += outcome.stdout;
    if (outcome.exitCode !== 0) {
      return { exitCode: outcome.exitCode, runEnd: outcome.runEnd, stdout: combinedStdout };
    }
    if (file === files[files.length - 1]) {
      return { exitCode: outcome.exitCode, runEnd: outcome.runEnd, stdout: combinedStdout };
    }
  }
  return { exitCode: 0, runEnd: null, stdout: combinedStdout };
}
