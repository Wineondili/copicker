# Codex Model Rail

Codex Model Rail is a local macOS injector for adding a compact, keyboard-friendly model rail to the official Codex model picker.

The project is designed around one non-negotiable safety property: it does not modify or re-sign `/Applications/ChatGPT.app`. The injector briefly connects to the Electron main-process Inspector on loopback, injects a self-contained DOM component through `webContents.executeJavaScript`, and closes the Inspector connection immediately afterward.

## Goals

- Preserve the official OpenAI signature, Team ID, permissions, Keychain access, App Groups, and update path.
- Keep the Inspector bound to `127.0.0.1` and open only for the injection window.
- Avoid reading, storing, or logging conversation content.
- Discover model options from the official picker instead of hard-coding account-specific model IDs.
- Stop safely when a Codex update changes the expected DOM anchors.

## Current status

The SwiftPM repository and build entrypoint are bootstrapped. The Inspector client and overlay are implemented in subsequent change batches.

## Build and test

```bash
swift build
swift test
```

The project-local run entrypoint is:

```bash
./script/build_and_run.sh
```

Live injection is always an explicit action:

```bash
./script/build_and_run.sh --inject
```

Do not run live injection from an active Codex development task until the injector's dry-run and compatibility checks pass.

