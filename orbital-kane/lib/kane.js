import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { getAppUrl } from './config.js';

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

function runSingleKaneTest(testFilePath) {
  const appUrl = getAppUrl();
  const variables = JSON.stringify({
    start_url: { value: appUrl },
    portfolio_overview_url: { value: appUrl },
    dashboard_url: { value: appUrl },
  });
  const result = spawnSync(
    'kane-cli',
    ['testmd', 'run', testFilePath, '--agent', '--headless', '--variables', variables],
    { encoding: 'utf8', timeout: 5 * 60 * 1000 }
  );
  const runEnd = parseRunEnd(result.stdout || '');
  return { exitCode: result.status, runEnd, stdout: result.stdout || '' };
}

// `testrun run` has no --variables flag, but kane-cli auto-loads
// {cwd}/.testmuai/variables/*.json for every subcommand — write the same
// url bindings there once so a batched run resolves {{start_url}} etc.
// the same way the sequential --variables path does.
function writeVariablesFile() {
  const appUrl = getAppUrl();
  fs.mkdirSync('.testmuai/variables', { recursive: true });
  fs.writeFileSync(
    '.testmuai/variables/app.json',
    JSON.stringify(
      {
        start_url: { value: appUrl },
        portfolio_overview_url: { value: appUrl },
        dashboard_url: { value: appUrl },
      },
      null,
      2
    ) + '\n',
    'utf8'
  );
}

function parseTestrunEvents(stdout) {
  return (stdout || '')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// Batches a task's test files into one `testrun run --parallel` invocation
// instead of N sequential `testmd run` processes. Returns
// { batchable: false } if the plan was rejected (unauthored member, org
// mismatch, etc.) so the caller can fall back to the sequential path.
function runTestrunBatch(testFilePaths) {
  writeVariablesFile();
  const parallel = String(Math.min(3, testFilePaths.length));
  const result = spawnSync(
    'kane-cli',
    ['testrun', 'run', ...testFilePaths, '--headless', '--parallel', parallel],
    { encoding: 'utf8', timeout: 10 * 60 * 1000 }
  );
  const events = parseTestrunEvents(result.stdout);
  const plan = events.find((e) => e.type === 'testrun_plan');
  if (!plan || plan.valid === false) {
    return { batchable: false };
  }
  const summary = events.find((e) => e.type === 'testrun_summary');
  const memberEnds = events.filter((e) => e.type === 'testrun_member_end');
  const failedMembers = memberEnds.filter((e) => e.status && e.status !== 'passed');
  const runEnd = {
    summary: summary ? `testrun batch: ${summary.totals.passed}/${summary.totals.tests} passed` : '',
    reason: failedMembers.length
      ? `failed members: ${failedMembers.map((m) => `${m.path} (${m.status})`).join(', ')}`
      : 'all members passed',
  };
  return { batchable: true, exitCode: result.status, runEnd, stdout: result.stdout || '' };
}

// A task may have more than one generated test file (e.g. separate
// default-value and explicit-value cases). For 2+ files, try running them
// as one testrun batch first (parallel workers, one kane-cli startup cost
// instead of N); fall back to the sequential short-circuiting loop if the
// batch plan is rejected. A single file always uses the sequential path —
// there's nothing to parallelize.
export function runKaneTest(testFilePath) {
  const files = Array.isArray(testFilePath) ? testFilePath : [testFilePath];

  if (files.length > 1) {
    const batch = runTestrunBatch(files);
    if (batch.batchable) {
      return { exitCode: batch.exitCode, runEnd: batch.runEnd, stdout: batch.stdout };
    }
  }

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

// Ad-hoc general defect sweep run after a task's scripted test(s) pass.
// Not a re-run of the scripted assertions — a free-form inspection of the
// live app for anything (visual, console, broken element) that doesn't
// match the PRD section, using kane-cli's own bug-detection mode rather
// than a hand-written pass/fail condition.
export function runKaneSweep(task) {
  const appUrl = getAppUrl();
  const prdRef = task.prd_ref ? ` (${task.prd_ref})` : '';
  const objective =
    `Go to ${appUrl} and thoroughly inspect the current implementation of ` +
    `"${task.title}"${prdRef}. Look for visual defects, layout problems, ` +
    `missing or broken elements, console errors, or anything that does not ` +
    `match the stated requirement. Report any issue found.`;
  const result = spawnSync(
    'kane-cli',
    ['run', objective, '--agent', '--headless', '--bug-detection', 'stop', '--url', appUrl],
    { encoding: 'utf8', timeout: 5 * 60 * 1000 }
  );
  const runEnd = parseRunEnd(result.stdout || '');
  // Trust verdict.confirmed over the raw pass/fail status: a sweep can end
  // with exit 0 (the objective "completed") while still reporting a
  // confirmed bug, and can fail on automation flakiness with no real defect.
  const issueFound = runEnd?.verdict?.confirmed === true || (result.status !== 0 && !runEnd);
  return { exitCode: result.status, runEnd, issueFound, stdout: result.stdout || '' };
}
