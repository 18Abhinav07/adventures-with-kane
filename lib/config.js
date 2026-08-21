import fs from 'node:fs';

const CONFIG_PATH = '.testmuai/guardian-kane.config.json';

export function getAppUrl() {
  if (process.env.GUARDIAN_KANE_APP_URL) return process.env.GUARDIAN_KANE_APP_URL;
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const cfg = JSON.parse(raw);
    if (cfg.appUrl) return cfg.appUrl;
  } catch {
    // fall through to error below
  }
  throw new Error(
    `GuardianKane: no app URL configured. Set GUARDIAN_KANE_APP_URL or write ${CONFIG_PATH} with {"appUrl": "http://localhost:<port>"}.`
  );
}

export function writeAppUrl(appUrl) {
  fs.mkdirSync('.testmuai', { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ appUrl }, null, 2) + '\n', 'utf8');
}
