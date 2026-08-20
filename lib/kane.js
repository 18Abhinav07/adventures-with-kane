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

export function runKaneTest(testFilePath) {
  const result = spawnSync('kane-cli', ['testmd', 'run', testFilePath, '--agent', '--headless'], {
    encoding: 'utf8',
    timeout: 5 * 60 * 1000
  });
  const runEnd = parseRunEnd(result.stdout || '');
  return { exitCode: result.status, runEnd, stdout: result.stdout || '' };
}
