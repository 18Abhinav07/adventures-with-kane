#!/usr/bin/env bash
# One-click GuardianKane installer.
#
# Usage:
#   ./install.sh <target-project-dir>
#   curl -sL <raw-url-to-this-file> | bash -s <target-project-dir>
#
# Copies GuardianKane's lib/, hooks, and skill into a target Claude Code
# project, wires .claude/settings.json, and installs the one dependency
# (js-yaml) it needs. Does not touch your app code or PRD.
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-}"

if [ -z "$TARGET_DIR" ]; then
  echo "usage: ./install.sh <target-project-dir>" >&2
  exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "error: $TARGET_DIR does not exist" >&2
  exit 1
fi

if [ ! -d "$TARGET_DIR/.git" ]; then
  echo "error: $TARGET_DIR is not a git repo — GuardianKane's task-tracker/PR flow assumes one" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "error: node is required and not on PATH" >&2
  exit 1
fi

if ! command -v kane-cli >/dev/null 2>&1; then
  echo "warning: kane-cli not found on PATH — install it before running '/guardian-kane start' (see https://testmuai.com)" >&2
fi

echo "Installing GuardianKane into $TARGET_DIR ..."

mkdir -p "$TARGET_DIR/lib" "$TARGET_DIR/.claude/hooks" "$TARGET_DIR/.claude/skills/guardian-kane"

# lib/ — skip .test.js files, target project doesn't need GuardianKane's own test suite
for f in "$SOURCE_DIR"/lib/*.js; do
  base="$(basename "$f")"
  case "$base" in *.test.js) continue ;; esac
  cp "$f" "$TARGET_DIR/lib/$base"
done

cp "$SOURCE_DIR"/.claude/hooks/guardian-kane-stop.js "$TARGET_DIR/.claude/hooks/"
cp "$SOURCE_DIR"/.claude/hooks/guardian-kane-stop-entry.js "$TARGET_DIR/.claude/hooks/"
cp "$SOURCE_DIR"/.claude/hooks/guardian-kane-stop.sh "$TARGET_DIR/.claude/hooks/"
cp "$SOURCE_DIR"/.claude/hooks/guardian-kane-post-tool-use.js "$TARGET_DIR/.claude/hooks/"
cp "$SOURCE_DIR"/.claude/hooks/guardian-kane-post-tool-use-entry.js "$TARGET_DIR/.claude/hooks/"
cp "$SOURCE_DIR"/.claude/hooks/guardian-kane-post-tool-use.sh "$TARGET_DIR/.claude/hooks/"
chmod +x "$TARGET_DIR"/.claude/hooks/guardian-kane-*.sh

cp "$SOURCE_DIR"/.claude/skills/guardian-kane/SKILL.md "$TARGET_DIR/.claude/skills/guardian-kane/SKILL.md"

node "$SOURCE_DIR/scripts/merge-install.mjs" "$TARGET_DIR"

echo "Installing dependencies ..."
( cd "$TARGET_DIR" && npm install --no-fund --no-audit --loglevel=error )

cat <<EOF

GuardianKane installed.

Next steps:
  1. cd $TARGET_DIR
  2. kane-cli login --oauth        (skip if already authenticated — check with 'kane-cli whoami')
  3. In Claude Code: /guardian-kane start ./PRD.md

EOF
