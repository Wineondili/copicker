#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"
APP_NAME="CodexModelRailInjector"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pkill -x "$APP_NAME" >/dev/null 2>&1 || true

if command -v node >/dev/null 2>&1; then
  node --check Sources/CodexModelRailInjector/Resources/model-rail.js
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
  --probe|probe)
    "$APP_BINARY" probe
    ;;
  --probe-picker|probe-picker)
    "$APP_BINARY" probe-picker
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
    echo "usage: $0 [run|--inject|--probe|--probe-picker|--debug|--logs|--telemetry|--verify]" >&2
    exit 2
    ;;
esac
