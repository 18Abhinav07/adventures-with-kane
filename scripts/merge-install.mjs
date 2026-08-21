#!/usr/bin/env node
// Called by install.sh. Merges GuardianKane's hooks into a target project's
// .claude/settings.json (without clobbering any hooks already there) and
// makes sure the target's package.json can run ESM hook files + has js-yaml.
import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2];
if (!target) {
  console.error('usage: node merge-install.mjs <target-dir>');
  process.exit(1);
}

const settingsPath = path.join(target, '.claude', 'settings.json');
fs.mkdirSync(path.dirname(settingsPath), { recursive: true });

let settings = {};
if (fs.existsSync(settingsPath)) {
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch {
    console.error(`Warning: ${settingsPath} exists but isn't valid JSON — leaving it untouched. Wire the hooks in manually (see README).`);
    process.exit(0);
  }
}

settings.hooks ||= {};

function hasHook(list, command) {
  return (list || []).some(entry => (entry.hooks || []).some(h => h.command === command));
}

const stopCommand = '.claude/hooks/guardian-kane-stop.sh';
const postToolUseCommand = '.claude/hooks/guardian-kane-post-tool-use.sh';

settings.hooks.Stop ||= [];
if (!hasHook(settings.hooks.Stop, stopCommand)) {
  settings.hooks.Stop.push({ hooks: [{ type: 'command', command: stopCommand }] });
}

settings.hooks.PostToolUse ||= [];
if (!hasHook(settings.hooks.PostToolUse, postToolUseCommand)) {
  settings.hooks.PostToolUse.push({ matcher: 'Edit|Write', hooks: [{ type: 'command', command: postToolUseCommand }] });
}

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
console.log(`Wired hooks into ${settingsPath}`);

// package.json: needs "type": "module" (hook files use ESM import syntax)
// and js-yaml as a dependency (lib/tracker.js parses task-tracker.md).
const pkgPath = path.join(target, 'package.json');
let pkg = { name: path.basename(target), version: '0.0.0' };
if (fs.existsSync(pkgPath)) {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}
if (pkg.type === 'commonjs') {
  console.error(
    `\n${pkgPath} is explicitly "type": "commonjs" — GuardianKane's hook files use ESM ` +
    `import syntax and won't run as-is. Not touching your package.json automatically since ` +
    `flipping module type could break your existing CommonJS code. See README.md for a ` +
    `manual workaround (renaming hook files to .mjs).\n`
  );
  process.exit(1);
}
let changed = !fs.existsSync(pkgPath);
if (pkg.type !== 'module') {
  pkg.type = 'module';
  changed = true;
}
pkg.dependencies ||= {};
if (!pkg.dependencies['js-yaml']) {
  pkg.dependencies['js-yaml'] = '^5.3.0';
  changed = true;
}
if (changed) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`Updated ${pkgPath} (type: module, js-yaml dependency)`);
}
