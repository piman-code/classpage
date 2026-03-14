#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LABEL="com.classpage.telegram-codex-bridge"
PLIST_TEMPLATE="$SCRIPT_DIR/${LABEL}.plist.example"
TARGET_PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"
RUN_SCRIPT="$SCRIPT_DIR/run_telegram_codex_bridge.sh"
LOG_DIR="$REPO_ROOT/.tmp/telegram-codex-bridge/launchd"
STDOUT_PATH="$LOG_DIR/stdout.log"
STDERR_PATH="$LOG_DIR/stderr.log"
DEFAULT_PATH="$HOME/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

log() {
  echo "[$(timestamp)] $1"
}

if [[ ! -f "$REPO_ROOT/.env.local" ]]; then
  log "error: $REPO_ROOT/.env.local not found"
  log "먼저 .env.local 에 텔레그램 토큰, chat id, workdir 값을 넣어 주세요."
  exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$LOG_DIR"
chmod +x "$RUN_SCRIPT"

SCRIPT_PATH_ESCAPED="${RUN_SCRIPT//\//\\/}"
WORKDIR_ESCAPED="${REPO_ROOT//\//\\/}"
STDOUT_ESCAPED="${STDOUT_PATH//\//\\/}"
STDERR_ESCAPED="${STDERR_PATH//\//\\/}"
PATH_ESCAPED="${DEFAULT_PATH//\//\\/}"

sed \
  -e "s/__SCRIPT_PATH__/${SCRIPT_PATH_ESCAPED}/g" \
  -e "s/__WORKDIR__/${WORKDIR_ESCAPED}/g" \
  -e "s/__STDOUT_PATH__/${STDOUT_ESCAPED}/g" \
  -e "s/__STDERR_PATH__/${STDERR_ESCAPED}/g" \
  -e "s/__PATH__/${PATH_ESCAPED}/g" \
  "$PLIST_TEMPLATE" > "$TARGET_PLIST"

launchctl bootout "gui/$(id -u)" "$TARGET_PLIST" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "$TARGET_PLIST"
launchctl kickstart -k "gui/$(id -u)/$LABEL"

log "installed and started: $LABEL"
log "plist: $TARGET_PLIST"
log "stdout: $STDOUT_PATH"
log "stderr: $STDERR_PATH"
log "상태 확인: launchctl print gui/$(id -u)/$LABEL"
