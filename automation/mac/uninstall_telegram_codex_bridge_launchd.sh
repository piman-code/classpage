#!/bin/zsh

set -euo pipefail

LABEL="com.classpage.telegram-codex-bridge"
TARGET_PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"

timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

log() {
  echo "[$(timestamp)] $1"
}

launchctl bootout "gui/$(id -u)" "$TARGET_PLIST" >/dev/null 2>&1 || true

if [[ -f "$TARGET_PLIST" ]]; then
  rm -f "$TARGET_PLIST"
fi

log "stopped and removed: $LABEL"
log "launchd 로그 파일은 저장소의 .tmp/telegram-codex-bridge/launchd/ 아래에 남아 있을 수 있습니다."
