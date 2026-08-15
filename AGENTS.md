# Agent Instructions

## Purpose

This repository builds Copicker, a local macOS CLI that adds a model-selection rail to the official Codex desktop renderer without modifying or re-signing the OpenAI application bundle.

## Safety boundaries

- Never modify, replace, unpack into, or re-sign `/Applications/ChatGPT.app` unless the user explicitly changes the project scope.
- Never terminate or restart the Codex host application from an active Codex task without explicit approval.
- Bind Inspector endpoints to `127.0.0.1` only, use the shortest practical lifetime, and close them after injection.
- Do not log or persist DOM text, conversation content, authentication data, cookies, tokens, task contents, or workspace file contents.
- Treat private Codex DOM selectors as versioned compatibility points. Abort safely when required anchors are absent.
- Use the documented app-server `thread/settings/update` method through the existing Codex renderer bridge for current-task model, effort, and service-tier changes. Resolve model IDs and the Fast service tier from `model/list`; never hard-code account-specific model IDs or tier IDs.
- Require an active task identifier and an official settings confirmation for direct changes. Keep accessible-control proxying only as a separately verified fallback if the documented settings method becomes unavailable.
- Keep live injection explicit. The default CLI action must remain read-only.
- Keep automatic injection opt-in. Never load, unload, or modify the real user LaunchAgent during tests or without explicit user authorization.

## Project layout

- `Sources/CopickerCore/`: Inspector protocol, process discovery, compatibility, and injection planning.
- `Sources/CopickerCLI/`: CLI entrypoint and bundled DOM payload.
- `Sources/CopickerCore/CopickerAutostart.swift`: user-scoped paths, plist generation, artifact installation, structured watcher state, and retry policy.
- `Sources/CopickerCLI/AutostartManager.swift`: explicit `launchctl` management for the opt-in user LaunchAgent.
- `Tests/`: offline unit tests; tests must not signal or attach to the running Codex process.
- `script/build_and_run.sh`: single build/run/debug entrypoint.
- `.codex/environments/environment.toml`: Codex Run action.

The existing `codex-model-rail` state keys, host IDs, and log subsystem are legacy runtime compatibility identifiers. Do not rename them without an explicit migration that can remove an already injected older payload.

## Commands

```bash
swift build
swift test
./script/build_and_run.sh
./script/build_and_run.sh --inject
./script/build_and_run.sh --autostart-status
```

## Change discipline

- Work in small, coherent commits.
- Update `CHANGELOG.md` with a timestamp including seconds and timezone for every committed change batch.
- Keep implementation details and comments in English.
