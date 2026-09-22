# CoPicker

Source-sharing privacy guidance and the one-time history-cleanup notice are in [docs/source-sharing.md](docs/source-sharing.md). Use a fresh clone after the 2026-09-13 cleanup; do not merge older history back into this repository.

CoPicker is a local macOS companion for the official Codex desktop app. It adds a compact model, reasoning-effort, and Fast-tier rail beside Codex's first-level model picker, plus a persistent CoPicker page under **Settings → Integrations**.

CoPicker does **not** modify, unpack into, replace, or re-sign `/Applications/ChatGPT.app`. A guarded local injector briefly enables Electron's loopback Node Inspector, installs a versioned renderer hook through `webContents.executeJavaScript`, and closes the Inspector immediately. The official OpenAI bundle, signature, permissions, Keychain access groups, App Groups, and update path remain unchanged.

## Current baseline

CoPicker has independent release, CLI/plugin, renderer, settings-schema, and settings-resource versions. Do not treat them as interchangeable.

| Layer | Current value | Meaning |
| --- | --- | --- |
| Latest GitHub release | `v1.0.0` stable | Current full-feature, source-distributed package |
| Historical full-runtime code | `c127509ae0a05f50c14757d2a212b79951126f46` | Older six-model acceptance and rollback anchor, not the current picker adapter |
| CLI and plugin version | `1.0.0` | Version reported by the stable release package |
| Current renderer | `0.12.21` on `main` | Adds 6-Sol/6-Luna, removes Spark, and marks GPT-5.5 Retiring; not yet live-accepted |
| Renderer in `v0.99.0` | `0.12.8` | Immutable published source pre-release payload |
| Settings schema | `1` | Version of `settings.json` |
| MCP settings resource | `ui://copicker/settings/v5.html` | Eight-model native settings surface; v4, v3, and v2 remain read aliases |
| Current adapted Codex Desktop | `26.908.40834` (build `8881`) | Picker selection/routing and later native settings presentation user-confirmed |
| Electron dependency declared by Codex | `42.3.0` | Read from the official app's package metadata; not a fresh runtime version probe |
| Bundled Chromium framework | `152.0.7977.83` | Read from Codex Framework metadata and corroborated by its binary version string |
| Historical full-runtime Codex build | `26.820.60940` (`7119`) | Earlier complete runtime/restart acceptance, not the current supported-version label |
| Historical live CLI label | `0.12.0-dev` | Version string present during that older installation |

The current package targets the verified Codex `26.908.40834` build `8881` picker. Model selection and actual routing were user-confirmed; after the manual-restart handoff, the user confirmed the corrected native settings interface on 2026-09-13. The original full-runtime baseline on Apple silicon with build `7119` remains historical. Private Codex DOM, Electron, plugin, and app-server behavior remain version-sensitive, so a later Codex build must be checked independently.

These are tested compatibility baselines, not a version allowlist. A different Codex Desktop, Electron, or Chromium version alone does not prevent CoPicker from running. Actual capability and ownership checks still apply: unavailable Inspector support, unrecognized or ambiguous controls, and unconfirmed official mutations can stop the affected operation safely. A matching version does not guarantee account entitlements or every UI variant. See [the detailed environment and evidence boundary](docs/accepted-baseline.md#current-environment-and-evidence-boundary).

`v1.0.0` packages renderer `0.12.20`: seven-model selection, no-task refresh-loop fixes, the original click/drag easing, version-prefixed labels, Spark Retiring, native settings initialization, and the corrected background/scroll insets. Its renderer and settings HTML are unchanged from user-accepted source `6979811`. `v0.99.0` remains the immutable older six-model pre-release. Installation, user acceptance, cold-login checks, and publication are separate gates.

See [the accepted baseline](docs/accepted-baseline.md) for the complete requirement IDs, model matrix, geometry, live DOM measurements, compatibility anchors, acceptance evidence, and superseded assumptions. See [the v1.0.0 release notes](docs/releases/v1.0.0.md) for the packaged feature and validation boundary.

## Install on a new Mac

Install the immutable full-feature stable release tag:

```bash
xcode-select --install
git clone --branch v1.0.0 --depth 1 https://github.com/Wineondili/copicker.git
cd copicker
./script/install.sh
```

For forensic comparison or rollback to the **historical build-7119** acceptance only, use the older runtime anchor below. It is not the current-build installation recommendation:

```bash
git clone https://github.com/Wineondili/copicker.git copicker-c127509
cd copicker-c127509
git checkout --detach c127509ae0a05f50c14757d2a212b79951126f46
./script/install.sh
```

Run the installer as the logged-in user, never with `sudo`. The official Codex desktop app must be installed at `/Applications/ChatGPT.app`, and the `codex` CLI must be available because the current full-feature installer registers the local settings plugin.

The release is source-distributed. GitHub supplies its standard source archives; no unsigned or non-notarized prebuilt executable is attached. Building on the target Mac avoids shipping a machine-specific native binary.

All CoPicker build inputs, renderer/settings resources, installer scripts, plugin metadata, and icons are tracked in this repository. There are no external Swift package dependencies, Git submodules, or required files in `local-docs/`. The official Codex app and a plugin-capable Codex CLI are separate installation prerequisites, not redistributed source. For a build-only check that does not install or inject anything, follow [source-only reproduction](docs/installation.md#source-only-reproduction-without-installation).

The installer may inject an already-running Codex process when it loads the watcher. It never quits or restarts Codex. For the cleanest first acceptance, run the installer, then quit and reopen Codex yourself.

Full prerequisites, release and runtime-anchor paths, verification, settings migration, reinstall, update, rollback, recovery, permissions, and uninstall instructions are in [docs/installation.md](docs/installation.md).

## Use CoPicker

1. Open an existing Codex task or a new unsent task.
2. Click the compact composer control that displays the current model and reasoning effort.
3. Wait for Codex's first-level model/reasoning picker. CoPicker appears in its own non-overlapping popover at the configured top, left, or right position.

`Ctrl+Shift+M` opens a different full-width model list above the composer. That list is intentionally **not** CoPicker's activation surface and does not make the rail move away from its normal position.

| Input | Action |
| --- | --- |
| Click a dot or rail cell | Smoothly preview, then select a supported model and effort on release |
| Drag horizontally | Smoothly preview that model's supported efforts and select the final release cell |
| Up / Down | Move through models enabled in CoPicker settings |
| Left / Right | Decrease or increase effort |
| Space | Toggle Fast when the selected model supports it |
| Escape or outside click | Close the official picker and CoPicker |

Current `main` supports 6-Astra, 6-Sol, 6-Luna, 5.6-Sol, 5.6-Terra, 5.6-Luna, Daybreak, and GPT-5.5 in that order. New 6-Sol/6-Luna rows are available in visibility settings and share their 5.6 counterparts' colors. Default displays as `Default`; unsupported models display centered gray `Other`. Only Daybreak is non-Fast. GPT-5.5 is marked `Retiring` without an automatic cutoff. Spark is removed, with a read-only migration for older saved visibility. Existing visibility and the default 5.6 Sol/Terra/Luna set are preserved. The published `v1.0.0` remains the older seven-model package; this model refresh has not been released or live-accepted.

The legacy adapter distinguishes two build-`7377` Daybreak topologies. When Codex exposes the separate Daybreak program checkbox that may remap base-model defaults, CoPicker rejects the Daybreak row and allows ordinary model commits only while that exact control is explicitly off. Enabled, busy, disabled, or otherwise ambiguous program state remains fail-closed. When Codex instead exposes one exact legacy Daybreak Model leaf—as observed live on the current account—renderer `0.12.14` treats it as the normal model-backed topology and permits official model mutations. If neither topology is observable, mutation still fails closed because no bounded signal distinguishes no entitlement from unresolved verified access.

The legacy build-`7377` no-task transaction requires a restorable current Model/Effort/Speed state before changing the target. An idle no-task composer never opens those nested menus merely to synchronize the rail; until the user explicitly selects a rail cell, an unconfirmed initial state may display `Other`. The bounded transaction still uses the official controls because they are the only inspected path that updates the renderer-local draft and prewarmed-task state. A hidden current model, a missing Speed submenu, or a visually Standard current model without a catalog-resolved Fast transition fails closed. Speed is captured by the exact checked leaf's index, option count, and semantic label; Standard is re-established through Fast → Standard even when the rail selection appears unchanged.

Changing a model or effort may trigger the same compaction behavior as the equivalent official Codex action. That is normal Codex behavior, not a separate CoPicker compaction mechanism.

See [docs/usage.md](docs/usage.md) for the exact model/effort matrix, Fast behavior, no-task workflow, placement latching, closing rules, settings, and troubleshooting.

## Configure CoPicker

Open **Settings → Integrations → CoPicker**. The entry appears below the built-in Plugins/Browser area and uses the supplied model-grid icon.

Settings include:

- enable or disable CoPicker;
- show or hide each of the eight adapted models on `main`, while retaining at least one;
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
6. Existing tasks use `thread/settings/update` and wait for a strictly newer `thread/settings/updated`; both explicit `null` and the live-observed `"default"` tier mean Standard. A new unsent task touches the exact official Model, Effort, and Speed controls only after an explicit CoPicker selection so Codex performs its own default-task workflow without an idle flyout-probing loop. Build-`7377`'s separate Daybreak program remains policy-gated, while an exact legacy Daybreak Model leaf follows the normal model-backed route in renderer `0.12.14`.
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

- [v1.0.0 release notes](docs/releases/v1.0.0.md)
- [Historical v0.99.0 release notes](docs/releases/v0.99.0.md)
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
- On Codex build `7377`, Daybreak needs a product decision about which normal base model and effort the separate program should retain or select; current `main` fails closed instead of guessing.
- The new GPT-6 Sol/Luna rows have catalog and offline evidence, not renewed live sending acceptance.
- The repository does not currently include a cross-version macOS/Codex CI matrix.
- The repository has no general open-source license. Public visibility alone does not grant redistribution or derivative-work rights.
