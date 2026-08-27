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
- `Sources/CopickerCore/CopickerMCPProtocol.swift`: pure app-only MCP settings protocol and metadata contract.
- `Sources/CopickerCore/CopickerSettings.swift`: versioned, privacy-limited user preferences and atomic local persistence.
- `Sources/CopickerCLI/CopickerMCPServer.swift`: private newline-delimited stdio server for the settings plugin.
- `Sources/CopickerCore/CopickerAutostart.swift`: user-scoped paths, plist generation, artifact installation, structured watcher state, and retry policy.
- `Sources/CopickerCLI/AutostartManager.swift`: explicit `launchctl` management for the opt-in user LaunchAgent.
- `Tests/`: offline unit tests; tests must not signal or attach to the running Codex process.
- `script/install.sh`: release-build and explicit user LaunchAgent installation entrypoint for a tagged source checkout.
- `script/build_and_run.sh`: single build/run/debug entrypoint.
- `Plugin/copicker/`: repository-local Codex plugin package, launcher, and themed icon assets.
- `.agents/plugins/marketplace.json`: local marketplace descriptor used to install the settings plugin from a stable user-scoped copy.
- `docs/usage.md`: user interaction, supported selection, task, closing, and troubleshooting behavior.
- `docs/installation.md`: cross-device prerequisites, install, update, reinstall, recovery, permissions, and uninstall guidance.
- `docs/accepted-baseline.md`: authoritative accepted requirements, version layers, model matrix, geometry, live DOM measurements, compatibility anchors, and superseded assumptions.
- `docs/architecture.md`: installer, watcher, Inspector, renderer, selection, settings, persistence, and failure-boundary design.
- `docs/validation.md`: offline, live-process, UI, restart, cold-login, and publication proof gates.
- `docs/development.md`: SwiftPM onboarding, command mutation boundaries, compatibility contracts, cross-device validation, and release checklist.
- `docs/plugin-settings.md`: settings plugin architecture, persistence, native/fallback routing, visual contract, validation, and installation boundary.
- `CONTRIBUTING.md`: public collaboration, Git, documentation, test, safety, and publication agreement.
- `.codex/environments/environment.toml`: Codex Run action.

The existing `codex-model-rail` state keys, host IDs, and log subsystem are legacy runtime compatibility identifiers. Do not rename them without an explicit migration that can remove an already injected older payload.

## Documentation authority

- Read `docs/accepted-baseline.md` before changing runtime behavior, supported models, placement, settings, or visual geometry.
- When historical screenshots, tuning artifacts, comments, or QA passes conflict with a later accepted correction, preserve the history but label it superseded. Do not restore the older value silently.
- For native settings fidelity, prefer bounded live `getBoundingClientRect()` and computed-style measurements from the exact Codex build over screenshot estimates or guessed minified utility classes.
- Treat the public release tag, CLI/plugin version, renderer version, settings schema, settings resource, accepted runtime commit, and accepted Codex build as independent version layers.
- When an accepted requirement changes, update source, offline contract tests, `docs/accepted-baseline.md`, the relevant focused guide, `design-qa.md` when visual evidence is involved, and `CHANGELOG.md` in the same coherent batch.
- A documentation-only commit, green offline test suite, pushed branch, installed binary, successful injection, visual acceptance, restart reinjection, cold-login result, tag, and GitHub Release are separate proof/publication gates. Report only the gates actually observed.

## Commands

```bash
swift build
swift test
# Requires explicit user authorization because it installs and loads the real user LaunchAgent.
./script/install.sh
./script/build_and_run.sh
./script/build_and_run.sh --inject
./script/build_and_run.sh --autostart-status
```

## Change discipline

- Work in small, coherent commits.
- Update `CHANGELOG.md` with a timestamp including seconds and timezone for every committed change batch.
- Keep implementation details and comments in English.
