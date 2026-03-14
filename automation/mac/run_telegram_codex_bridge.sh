#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

export PATH="$HOME/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

log() {
  echo "[$(timestamp)] $1"
}

if [[ ! -f "$REPO_ROOT/.env.local" ]]; then
  log "error: .env.local not found at $REPO_ROOT/.env.local"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  log "error: node command not found in PATH"
  exit 1
fi

if ! command -v codex >/dev/null 2>&1; then
  log "error: codex command not found in PATH"
  exit 1
fi

mkdir -p "$REPO_ROOT/.tmp/telegram-codex-bridge"

cd "$REPO_ROOT"
log "starting telegram codex bridge"
exec node "$REPO_ROOT/scripts/telegram-codex-bridge.mjs"
