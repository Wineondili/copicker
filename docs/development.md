# Developing Copicker

Copicker is a SwiftPM macOS command-line package with a bundled JavaScript renderer payload. Development does not require an Xcode project.

## Supported development boundary

- macOS 14 or later.
- Apple silicon is the currently live-verified architecture.
- Swift 6 or later.
- The official Codex desktop app at `/Applications/ChatGPT.app` is required for compatibility inspection and any live injection, but not for offline unit tests.
- Node.js is optional and is used only for JavaScript syntax validation when available.

The repository does not currently have a cross-version macOS CI matrix. A successful build on one Mac is not proof that a different Codex renderer build remains compatible.

## Clone for development

Clone the default branch and create a working branch:

```bash
git clone https://github.com/Wineondili/copicker.git
cd copicker
git switch main
git pull --ff-only
git switch -c codex/my-change
```

Do not use the shallow `--branch v0.11.0` installation checkout for ongoing development. A tag checkout is deliberately detached and is appropriate for a reproducible installation, not for retaining development commits.

## Package products and layout

`Package.swift` defines:

- `CopickerCore`: process discovery, Electron fuse parsing, Inspector transport, injection planning, user-scoped installation paths, state, retry policy, and the pure MCP settings protocol;
- `copicker`: the executable CLI, user LaunchAgent management, watcher, bundled renderer payload, and private stdio MCP server.

Important paths:

- `Sources/CopickerCore/`: reusable compatibility and injection infrastructure;
- `Sources/CopickerCore/CopickerMCPProtocol.swift`: pure JSON-RPC contract for the app-only settings tool and resource;
- `Sources/CopickerCore/CopickerSettings.swift`: versioned CoPicker preferences, validation, revision checks, and atomic local storage;
- `Sources/CopickerCLI/CopickerCLI.swift`: command routing, live injection, probes, and watcher loop;
- `Sources/CopickerCLI/CopickerMCPServer.swift`: newline-delimited stdio transport for the settings plugin;
- `Sources/CopickerCLI/CopickerSettingsApplier.swift`: explicit settings-button adapter to the guarded `inject` command;
- `Sources/CopickerCLI/AutostartManager.swift`: explicit `launchctl` mutations;
- `Sources/CopickerCLI/Resources/model-rail.js`: detached Shadow DOM UI and Codex renderer bridge;
- `Sources/CopickerCLI/Resources/copicker-settings-v2.html`: network-free interactive MCP App settings page;
- `Plugin/copicker/`: repository-local plugin package, launcher, manifest, and themed icons;
- `.agents/plugins/marketplace.json`: local marketplace descriptor for installing the settings plugin;
- `Tests/`: offline tests that must not attach to or signal Codex;
- `tools/model-rail-tuner.html`: standalone visual tuning page;
- `script/build_and_run.sh`: project-local development entrypoint;
- `script/install.sh`: release build plus explicit installation of the real user LaunchAgent.

The settings plugin is an independent distribution surface documented in [plugin-settings.md](plugin-settings.md). `script/install.sh` copies its marketplace and package to the stable Application Support directory, then registers and installs it through `codex plugin`.

## Offline development commands

These commands do not inject into Codex or change the user LaunchAgent:

```bash
swift package dump-package >/dev/null
swift build
swift test
node --check Sources/CopickerCLI/Resources/model-rail.js
bash -n script/build_and_run.sh script/install.sh
git diff --check
```

Node.js is optional for normal installation. Skip `node --check` when Node.js is unavailable; the Swift build still bundles the payload.

The private stdio server can be exercised without registering the plugin or changing Codex state:

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  | .build/debug/copicker mcp-server
```

The default project script builds and runs the read-only status command:

```bash
./script/build_and_run.sh
```

Read automatic-injection state without opening Inspector:

```bash
./script/build_and_run.sh --autostart-status
```

## Commands that change live state

The following commands are not offline tests and require deliberate authorization:

| Command | Live effect |
| --- | --- |
| `./script/build_and_run.sh --inject` | Signals the running Codex process, opens the loopback Inspector briefly, and injects Copicker |
| `./script/build_and_run.sh --remove` | Opens the guarded Inspector path and removes the current-process hook |
| `./script/build_and_run.sh --probe` | Opens Inspector and reads scoped selector metadata |
| `./script/build_and_run.sh --probe-picker` | Opens the full model-list shortcut and runs the scoped probe |
| `./script/build_and_run.sh --probe-primary` | Opens the first-level picker and runs the scoped probe |
| `./script/build_and_run.sh --probe-selector` | Writes a supported test selection, confirms it, and restores the original task settings |
| `./script/build_and_run.sh --autostart-enable` | Replaces Copicker-managed artifacts and loads the real user LaunchAgent |
| `./script/build_and_run.sh --autostart-disable` | Unloads and disables the real user LaunchAgent |
| `./script/install.sh` | Builds release artifacts, performs read-only preflight, installs them, loads the real user LaunchAgent, and registers the local settings plugin |
| Settings → CoPicker → **Apply now** | Calls the app-only apply tool, briefly opens the guarded loopback Inspector, and injects the saved snapshot into the current Codex process without restarting it |

Never run live commands from offline tests. Never restart or terminate Codex from an active Codex task without explicit approval. A settings probe may produce the same compaction behavior as the official picker because it uses the same task settings path.

## Renderer compatibility contracts

Private DOM selectors, host IDs, state keys, and bridge behavior are versioned compatibility points. Required anchors must fail closed when absent.

The CLI version is defined in `Sources/CopickerCore/ProjectInfo.swift`. The renderer payload has an independent compatibility version in `model-rail.js`. Do not bump or rename the legacy `codex-model-rail` keys, host IDs, payload filename, or logging subsystem merely to match the CLI release; changing them requires an explicit migration that can dispose of an already injected older payload.

Model IDs and the Fast service-tier ID must continue to come from `model/list`. Current-task changes must use the existing renderer bridge and `thread/settings/update`, require an active task identifier, and wait for `thread/settings/updated` confirmation. Do not add account-specific model or tier IDs.

## Resource packaging

SwiftPM processes `Sources/CopickerCLI/Resources/model-rail.js` and `copicker-settings-v2.html` into `Copicker_CopickerCLI.bundle`. `Bundle.module` resolves that bundle at runtime. Any installation or packaging change must preserve both the executable and this adjacent resource bundle. The settings plugin launcher invokes that stable executable, so the plugin package and bundle version must be installed together.

For a release build:

```bash
swift build -c release
swift build -c release --show-bin-path
```

Verify that the reported directory contains both `copicker` and `Copicker_CopickerCLI.bundle`.

## Visual changes

Use `tools/model-rail-tuner.html` for isolated layout work before live injection. Preserve accepted component geometry unless a new design explicitly supersedes it.

Any live visual acceptance should record separately:

- the exact Copicker commit or tag;
- the Codex version and build;
- whether the first-level picker and nested submenu avoidance were exercised;
- keyboard, pointer, Fast, and `Other` behavior;
- confirmation that port `9229` closed after injection.

Do not cite machine-local `/var/folders` screenshots as portable repository evidence. Add reusable public references under a tracked documentation asset directory when distribution rights allow it.

## Cross-device validation

On a second Mac, validate these gates independently:

1. Git checkout resolves the intended commit or tag.
2. SwiftPM manifest loads.
3. Debug and release builds complete.
4. Offline tests pass.
5. JavaScript and shell syntax checks pass.
6. The release directory contains the executable and resource bundle.
7. Read-only `copicker status` recognizes that Mac's installed Codex build.
8. Only after explicit approval, install or load the LaunchAgent.
9. Treat successful injection, UI behavior, restart reinjection, cold-login behavior, and Inspector closure as separate live verification gates.

## Release checklist

Before publishing a tag:

1. Confirm a clean worktree, intended branch, exact HEAD, and remote state.
2. Update `ProjectInfo.version`, its tests, current installation commands, and `CHANGELOG.md`.
3. Run the offline checks and a release build.
4. Verify the release binary version and resource bundle.
5. Run the read-only Codex compatibility check.
6. Commit the coherent release batch.
7. Create an annotated, immutable tag and push the commit and tag.
8. Publish the GitHub Release and verify that it is Draft or Pre-release as intended.
9. Record live runtime verification separately; do not infer it from a green build or published tag.

## License status

The repository does not currently declare an open-source license. Public visibility alone does not grant general redistribution or derivative-work rights. The repository owner should select and add a license before inviting third-party redistribution or broader collaborative development.
