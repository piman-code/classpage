#!/bin/zsh

set -euo pipefail

# Copy this template outside the repo before editing local paths.
# Do not commit a machine-specific copy with real vault paths back into Git.
# Update these two paths for your environment.
DRIVE_JSON_DIR="$HOME/Library/CloudStorage/GoogleDrive-your-account/My Drive/classpage-sync"
OBSIDIAN_JSON_DIR="$HOME/Documents/Obsidian/MySchoolVault/classpage-data"

FILES=(
  "class-summary.json"
  "lesson-summary.json"
  "star-ledger.json"
)

mkdir -p "$OBSIDIAN_JSON_DIR"

timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

log() {
  echo "[$(timestamp)] $1"
}

copy_one() {
  local name="$1"
  local src="$DRIVE_JSON_DIR/$name"
  local dst="$OBSIDIAN_JSON_DIR/$name"
  local tmp="$OBSIDIAN_JSON_DIR/.${name}.tmp"

  if [[ ! -f "$src" ]]; then
    log "skip: source file not found -> $src"
    return 0
  fi

  if ! plutil -lint -s "$src"; then
    log "error: invalid JSON -> $src"
    return 1
  fi

  if [[ -f "$dst" ]] && cmp -s "$src" "$dst"; then
    log "unchanged: $name"
    return 0
  fi

  cp "$src" "$tmp"
  mv "$tmp" "$dst"
  log "synced: $name"
}

for file_name in "${FILES[@]}"; do
  copy_one "$file_name"
done
