# CoPicker

CoPicker is a local macOS companion for the official Codex desktop app. It adds a compact model, reasoning-effort, and Fast-tier rail beside Codex's first-level model picker, plus a persistent CoPicker page under **Settings → Integrations**.

CoPicker does **not** modify, unpack into, replace, or re-sign `/Applications/ChatGPT.app`. A guarded local injector briefly enables Electron's loopback Node Inspector, installs a versioned renderer hook through `webContents.executeJavaScript`, and closes the Inspector immediately. The official OpenAI bundle, signature, permissions, Keychain access groups, App Groups, and update path remain unchanged.

## Current baseline

CoPicker has independent release, CLI/plugin, renderer, settings-schema, and settings-resource versions. Do not treat them as interchangeable.

| Layer | Current value | Meaning |
| --- | --- | --- |
| Latest GitHub release | `v0.99.0` pre-release | Current full-feature, source-distributed package |
| Accepted full-feature runtime code | `c0343d4d76e4094cd99ba9ff7fe0fb71fc3edbbb` | Accepted six-model, persistent-settings, placement, and native-geometry baseline |
| CLI and plugin version | `0.99.0` | Version reported by the current pre-release package |
| Renderer development candidate | `0.12.10` on `main` | Current-Codex no-task menu-item compatibility fix; forces replacement of older in-memory integrations when deliberately installed |
| Renderer in `v0.99.0` | `0.12.8` | Immutable published source pre-release payload |
| Settings schema | `1` | Version of `settings.json` |
| MCP settings resource | `ui://copicker/settings/v2.html` | Versioned CoPicker settings document |
| Live-accepted Codex build | `26.820.60940` (`7119`) | Build on which the current UI and interaction baseline was accepted |
| Live-accepted CLI label | `0.12.0-dev` | Version string present during the accepted installation before the release-only bump |

The current runtime baseline was installed and accepted on Apple silicon with Codex `26.820.60940` build `7119`. The user confirmed that the final CoPicker settings geometry matches the official settings page. Private Codex DOM, Electron, plugin, and app-server behavior remain version-sensitive, so a later Codex build must be checked independently.

`v0.99.0` packages that accepted full-feature implementation with release metadata and the completed public documentation. Its renderer `0.12.8` is unchanged from `c0343d4`; the release-only version bump does not create a second live-installation claim. Renderer `0.12.9` later passed the user's rapid-drag live check but failed the new-unsent-task check. `main` is now a moving `0.12.10` candidate containing only the current-Codex menu-item compatibility correction on top of that pointer behavior, while `v0.99.0` remains the immutable install ref.

See [the accepted baseline](docs/accepted-baseline.md) for the complete requirement IDs, model matrix, geometry, live DOM measurements, compatibility anchors, acceptance evidence, and superseded assumptions. See [the v0.99.0 release notes](docs/releases/v0.99.0.md) for the packaged feature and validation boundary.

## Install on a new Mac

Install the immutable full-feature pre-release tag:

```bash
xcode-select --install
git clone --branch v0.99.0 --depth 1 https://github.com/Wineondili/copicker.git
cd copicker
./script/install.sh
```

For forensic comparison or rollback to the exact code that was installed during live acceptance, use the runtime anchor instead:

```bash
git clone https://github.com/Wineondili/copicker.git copicker-c0343d4
cd copicker-c0343d4
git checkout --detach c0343d4d76e4094cd99ba9ff7fe0fb71fc3edbbb
./script/install.sh
```

Run the installer as the logged-in user, never with `sudo`. The official Codex desktop app must be installed at `/Applications/ChatGPT.app`, and the `codex` CLI must be available because the current full-feature installer registers the local settings plugin.

The pre-release is source-distributed. GitHub supplies its standard source archives; no unsigned or non-notarized prebuilt executable is attached. Building on the target Mac avoids shipping a machine-specific native binary.

The installer may inject an already-running Codex process when it loads the watcher. It never quits or restarts Codex. For the cleanest first acceptance, run the installer, then quit and reopen Codex yourself.

Full prerequisites, release and runtime-anchor paths, verification, settings migration, reinstall, update, rollback, recovery, permissions, and uninstall instructions are in [docs/installation.md](docs/installation.md).

## Use CoPicker

1. Open an existing Codex task or a new unsent task.
2. Click the compact composer control that displays the current model and reasoning effort.
3. Wait for Codex's first-level model/reasoning picker. CoPicker appears in its own non-overlapping popover at the configured top, left, or right position.

`Ctrl+Shift+M` opens a different full-width model list above the composer. That list is intentionally **not** CoPicker's activation surface and does not make the rail move away from its normal position.

| Input | Action |
| --- | --- |
| Click a dot or rail cell | Select a supported model and effort |
| Drag horizontally | Move through that model's supported efforts |
| Up / Down | Move through models enabled in CoPicker settings |
| Left / Right | Decrease or increase effort |
| Space | Toggle Fast when the selected model supports it |
| Escape or outside click | Close the official picker and CoPicker |

CoPicker supports Sol, Terra, Luna, Daybreak Blue, GPT-5.5, and GPT-5.3 Codex Spark in a fixed order. GPT-5.4, GPT-5.4 Mini, and other unsupported models display centered gray `Other`. Daybreak and Codex Spark do not support Fast in CoPicker.

Changing a model or effort may trigger the same compaction behavior as the equivalent official Codex action. That is normal Codex behavior, not a separate CoPicker compaction mechanism.

See [docs/usage.md](docs/usage.md) for the exact model/effort matrix, Fast behavior, no-task workflow, placement latching, closing rules, settings, and troubleshooting.

## Configure CoPicker

Open **Settings → Integrations → CoPicker**. The entry appears below the built-in Plugins/Browser area and uses the supplied model-grid icon.

Settings include:

- enable or disable CoPicker;
- show or hide each of the six adapted models, while retaining at least one;
- prefer top, left, or right placement;
- follow Codex, follow macOS, or force light or dark appearance.

Changes save automatically to `~/Library/Application Support/Copicker/settings.json`. By default, the saved snapshot applies during the next process injection, normally the next time Codex opens. After saving completes, **Apply now** can inject the saved snapshot into the current Codex process without restarting it.

The settings page is implemented locally rather than importing private minified React components. It follows current Codex host tokens and measured native geometry. The final alignment uses the actual official scroll viewport below the 46-pixel toolbar, a 20-pixel panel inset, a 768-pixel maximum content column, and the official 24-pixel/28.8-pixel page heading.

See [docs/plugin-settings.md](docs/plugin-settings.md) for persistence, MCP metadata, native/fallback routing, CSP isolation, and the exact settings-page visual contract.

## Verify an installation

The installed copy is independent of the source checkout:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" version
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
codex plugin marketplace list --json
codex plugin list --json
lsof -nP -iTCP:9229 -sTCP:LISTEN
```

A healthy running installation reports a loaded LaunchAgent, installed executable and resource bundle, `Last result: injection-succeeded`, the intended CoPicker version, and the current Codex PID. No `lsof` output is the expected idle Inspector state.

Treat the following as separate gates:

1. exact Git commit or tag;
2. debug/release build;
3. offline tests;
4. read-only Codex compatibility status;
5. installed LaunchAgent and plugin;
6. successful current-process injection;
7. UI and interaction acceptance;
8. reinjection after a Codex restart;
9. cold login or reboot behavior;
10. Inspector closure.

A passing build or test suite does not prove every live gate. See [docs/validation.md](docs/validation.md).

## How it works

The installation and runtime path is:

1. SwiftPM builds a native `copicker` executable and an adjacent resource bundle.
2. `script/install.sh` copies managed artifacts into the user Library, installs the local CoPicker plugin, and loads an opt-in user LaunchAgent.
3. The watcher detects each new `com.openai.codex` PID and performs guarded app-path, bundle-ID, Electron-fuse, and Inspector-port ownership checks.
4. It sends `SIGUSR1`, connects only to `127.0.0.1:9229`, installs the versioned Electron/renderer hook, schedules `inspector.close()`, and disconnects.
5. The renderer observes only the private model/reasoning controls needed for CoPicker. It appends an independent Shadow DOM popover to `document.body` and uses official surfaces only as anchors and collision obstacles.
6. Existing tasks use `thread/settings/update` and wait for `thread/settings/updated`. A new unsent task uses the exact official Model, Effort, and Speed controls so Codex performs its own default-task workflow.
7. The settings plugin runs over private stdio MCP and persists only the versioned CoPicker preference snapshot.

The full component and data flow is documented in [docs/architecture.md](docs/architecture.md).

## Safety and privacy

- The default `copicker`/`status` action is read-only.
- Automatic injection is opt-in and user-scoped.
- Unknown or pre-existing Inspector ownership fails closed.
- The payload makes no external network request.
- CoPicker does not log or persist conversation text, composer text, task contents, authentication data, cookies, or tokens.
- Diagnostic probes return scoped control metadata and never return task identifiers or conversation bodies.
- Settings persistence is limited to enablement, visible model keys, placement, appearance, schema version, and revision; the file is written atomically with mode `0600`.
- CoPicker does not require Accessibility or Screen Recording permissions.
- Reinstalling CoPicker does not change permissions already granted to the official Codex app because its bundle and signature are untouched.

## Build and develop

```bash
swift package dump-package >/dev/null
swift build
swift test
node --check Sources/CopickerCLI/Resources/model-rail.js
bash -n script/build_and_run.sh script/install.sh
swift build -c release
git diff --check
```

The default project script is read-only:

```bash
./script/build_and_run.sh
```

Live actions are explicit:

```bash
./script/build_and_run.sh --inject
./script/build_and_run.sh --remove
```

Before changing UI, model behavior, selectors, versions, installation, or live commands, read [CONTRIBUTING.md](CONTRIBUTING.md), [docs/accepted-baseline.md](docs/accepted-baseline.md), [docs/architecture.md](docs/architecture.md), [docs/development.md](docs/development.md), and [docs/validation.md](docs/validation.md).

## Documentation map

- [v0.99.0 release notes](docs/releases/v0.99.0.md)
- [Accepted product and compatibility baseline](docs/accepted-baseline.md)
- [Install on a new Mac, update, recover, or uninstall](docs/installation.md)
- [Use the selector and settings](docs/usage.md)
- [Architecture and data flow](docs/architecture.md)
- [Settings plugin and persistence contract](docs/plugin-settings.md)
- [Development workflow and release checklist](docs/development.md)
- [Validation layers and acceptance evidence](docs/validation.md)
- [Historical visual QA record](design-qa.md)
- [Contribution and collaboration agreement](CONTRIBUTING.md)
- [Timestamped change history](CHANGELOG.md)

## Known boundaries

- Only Apple silicon is currently live-verified. The Swift package declares macOS 14 or later.
- Codex private DOM, Electron fuses, settings routes, and bridge methods may change without notice.
- Model availability still depends on the signed-in account's official `model/list` catalog. Enabling a row does not grant model access.
- Daybreak Blue may require Codex Trusted Access for Cyber and required network access.
- Codex Spark may require an eligible ChatGPT Pro subscription.
- The repository does not currently include a cross-version macOS/Codex CI matrix.
- The repository has no general open-source license. Public visibility alone does not grant redistribution or derivative-work rights.
