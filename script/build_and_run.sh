#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"
APP_NAME="copicker"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pkill -x "$APP_NAME" >/dev/null 2>&1 || true

if command -v node >/dev/null 2>&1; then
  node --check Sources/CopickerCLI/Resources/model-rail.js
fi

swift build
APP_BINARY="$(swift build --show-bin-path)/$APP_NAME"

case "$MODE" in
  run)
    "$APP_BINARY"
    ;;
  --inject|inject)
    "$APP_BINARY" inject
    ;;
  --remove|remove)
    "$APP_BINARY" remove
    ;;
  --probe|probe)
    "$APP_BINARY" probe
    ;;
  --probe-picker|probe-picker)
    "$APP_BINARY" probe-picker
    ;;
  --probe-primary|probe-primary)
    "$APP_BINARY" probe-primary
    ;;
  --probe-selector|probe-selector)
    "$APP_BINARY" probe-selector
    ;;
  --probe-prototype|probe-prototype)
    "$APP_BINARY" probe-prototype
    ;;
  --debug|debug)
    lldb -- "$APP_BINARY"
    ;;
  --logs|logs)
    "$APP_BINARY" &
    /usr/bin/log stream --info --style compact --predicate "process == \"$APP_NAME\""
    ;;
  --telemetry|telemetry)
    "$APP_BINARY" &
    /usr/bin/log stream --info --style compact --predicate 'subsystem == "com.jonas.codex-model-rail"'
    ;;
  --verify|verify)
    "$APP_BINARY"
    ;;
  *)
    echo "usage: $0 [run|--inject|--remove|--probe|--probe-picker|--probe-primary|--probe-selector|--debug|--logs|--telemetry|--verify]" >&2
    exit 2
    ;;
esac
