import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let cwdBackup;
let tmpDir;

beforeEach(() => {
  cwdBackup = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'guardian-kane-config-test-'));
  process.chdir(tmpDir);
  delete process.env.GUARDIAN_KANE_APP_URL;
});

afterEach(() => {
  process.chdir(cwdBackup);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('config', () => {
  it('getAppUrl prefers env var over config file', async () => {
    const { writeAppUrl, getAppUrl } = await import('./config.js?' + Math.random());
    writeAppUrl('http://localhost:9999');
    process.env.GUARDIAN_KANE_APP_URL = 'http://localhost:1111';
    expect(getAppUrl()).toBe('http://localhost:1111');
  });

  it('getAppUrl falls back to config file when no env var', async () => {
    const { writeAppUrl, getAppUrl } = await import('./config.js?' + Math.random());
    writeAppUrl('http://localhost:8084');
    expect(getAppUrl()).toBe('http://localhost:8084');
  });

  it('getAppUrl throws when neither env var nor config file is present', async () => {
    const { getAppUrl } = await import('./config.js?' + Math.random());
    expect(() => getAppUrl()).toThrow(/no app URL configured/);
  });
});
