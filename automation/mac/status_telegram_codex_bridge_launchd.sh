#!/bin/zsh

set -euo pipefail

LABEL="com.classpage.telegram-codex-bridge"
SERVICE="gui/$(id -u)/$LABEL"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOG_DIR="$REPO_ROOT/.tmp/telegram-codex-bridge/launchd"

echo "Label: $LABEL"
echo ""
launchctl print "$SERVICE" || true
echo ""
echo "stdout log: $LOG_DIR/stdout.log"
echo "stderr log: $LOG_DIR/stderr.log"
