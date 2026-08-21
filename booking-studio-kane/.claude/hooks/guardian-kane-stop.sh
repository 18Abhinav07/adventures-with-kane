#!/usr/bin/env bash
export GUARDIAN_KANE_APP_URL="http://localhost:8084"
exec node "$(dirname "$0")/guardian-kane-stop-entry.js"
