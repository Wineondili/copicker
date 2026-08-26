#!/usr/bin/env bash
set -euo pipefail

APP_NAME="copicker"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COPICKER_SUPPORT_DIR="$HOME/Library/Application Support/Copicker"
PLUGIN_MARKETPLACE_DIR="$COPICKER_SUPPORT_DIR/plugin-marketplace"

if [[ "$(id -u)" -eq 0 ]]; then
  echo "Copicker must be installed by the logged-in user, not with sudo." >&2
  exit 1
fi

if ! command -v swift >/dev/null 2>&1; then
  echo "Swift is unavailable. Install the Xcode Command Line Tools first: xcode-select --install" >&2
  exit 1
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "The Codex CLI is unavailable. Install or update Codex before installing CoPicker." >&2
  exit 1
fi

if [[ ! -d /Applications/ChatGPT.app ]]; then
  echo "The official Codex desktop app was not found at /Applications/ChatGPT.app." >&2
  exit 1
fi

cd "$ROOT_DIR"

if command -v node >/dev/null 2>&1; then
  node --check Sources/CopickerCLI/Resources/model-rail.js
fi

swift build -c release
BIN_DIRECTORY="$(swift build -c release --show-bin-path)"
APP_BINARY="$BIN_DIRECTORY/$APP_NAME"

"$APP_BINARY" status
"$APP_BINARY" autostart enable
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart status

mkdir -p "$PLUGIN_MARKETPLACE_DIR/.agents/plugins" "$PLUGIN_MARKETPLACE_DIR/Plugin"
/usr/bin/ditto \
  "$ROOT_DIR/.agents/plugins/marketplace.json" \
  "$PLUGIN_MARKETPLACE_DIR/.agents/plugins/marketplace.json"
/usr/bin/ditto "$ROOT_DIR/Plugin/copicker" "$PLUGIN_MARKETPLACE_DIR/Plugin/copicker"

if ! codex plugin marketplace list --json | grep -F '"name": "copicker-local"' >/dev/null; then
  codex plugin marketplace add "$PLUGIN_MARKETPLACE_DIR"
fi
if codex plugin list --json | grep -F '"pluginId": "copicker@copicker-local"' >/dev/null; then
  codex plugin remove copicker@copicker-local
fi
codex plugin add copicker@copicker-local

echo "Copicker installation completed."
echo "The CoPicker settings entry will be available after Codex is next opened."
