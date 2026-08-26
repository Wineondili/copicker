#!/usr/bin/env bash
set -euo pipefail

APP_NAME="copicker"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "$(id -u)" -eq 0 ]]; then
  echo "Copicker must be installed by the logged-in user, not with sudo." >&2
  exit 1
fi

if ! command -v swift >/dev/null 2>&1; then
  echo "Swift is unavailable. Install the Xcode Command Line Tools first: xcode-select --install" >&2
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

echo "Copicker installation completed."
