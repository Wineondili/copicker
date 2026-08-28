# Validation and acceptance

CoPicker uses private, version-sensitive Codex interfaces. Validation therefore has multiple gates. A result at one gate must never be reported as proof of a later gate.

The current product contract is [accepted-baseline.md](accepted-baseline.md). Development commands and release rules are in [development.md](development.md).

## Validation layers

| Layer | What it proves | What it does not prove |
| --- | --- | --- |
| Git/ref check | Exact source identity and clean ownership | Buildability or runtime behavior |
| Static syntax | Swift package, JavaScript, shell, JSON, and Markdown are parseable | Semantic correctness |
| Offline unit/contract tests | Pure logic, resource packaging, privacy exclusions, selectors, settings, version, and documentation anchors | Compatibility with a running Codex build |
| Debug/release build | Native compilation and bundled resources | Installation, watcher, injection, or UI |
| Read-only status | App path, bundle ID/version/build, fuse wire, process path, payload/settings sizes, preferences | Successful injection or UI |
| Installer/LaunchAgent check | User artifacts, watcher, and plugin registration exist | Current PID injection or cold-login behavior |
| Injection confirmation | Main/renderer hook reported installed for an exact PID | Visual correctness or user interaction |
| Live scoped probe | Current private anchors and bounded control metadata are present | Full product acceptance unless the intended scenarios are exercised |
| UI interaction acceptance | Actual picker/settings appearance and input behavior on one Codex build | Future Codex builds or another machine |
| Restart acceptance | New Codex PID receives automatic injection | Cold macOS login/reboot behavior |
| Cold-login acceptance | LaunchAgent/watcher works after login or reboot on that Mac | Other machines or later OS/Codex versions |
| Inspector closure | Port `9229` is idle after the action | Any other gate |
| Commit/push/tag/release | Publication state | Installation or live acceptance |

## Offline validation command set

These commands must not signal Codex, open Inspector, mutate the real LaunchAgent, or change persisted user settings:

```bash
git status --short --branch
git diff --check
swift package dump-package >/dev/null
node --check Sources/CopickerCLI/Resources/model-rail.js
bash -n script/build_and_run.sh script/install.sh
swift test
swift build -c release
```

Node.js is optional for end-user installation, but a development/release machine should run the JavaScript check.

The private stdio MCP protocol can also be checked offline:

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  '{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"ui://copicker/settings/v2.html"}}' \
  | .build/debug/copicker mcp-server
```

This reads no settings and does not call `copicker_settings_apply`.

## Current contract assertions

The Swift Testing suite is intentionally offline. Its assertions cover:

- Electron fuse decoding and missing-sentinel rejection;
- Inspector target decoding and exclusive port-owner parsing;
- bounded watcher retry/backoff behavior;
- user-scoped installed paths, LaunchAgent plist, structured state, and managed artifact replacement;
- safe JavaScript literal embedding, removal, Inspector shutdown, and frame targeting;
- renderer privacy exclusions, exact trigger/menu selectors, first-level/full-list separation, Shadow DOM ownership, obstacle latching, animation, keyboard behavior, model matrix, Fast restrictions, catalog lookup, task/no-task switch paths, and settings integration;
- settings schema validation, normalized model order, at-least-one-model enforcement, atomic `0600` persistence, idempotency, and revision conflicts;
- app-only MCP metadata, versioned settings resource, empty network/frame allowlists, read/save/apply behavior, and fail-closed Apply handler;
- plugin marketplace, manifest, launcher, icons, installer registration, and resource bundle contracts;
- project, plugin, renderer, settings schema/resource, README, installation guide, accepted-baseline marker, native geometry, and documentation-version synchronization.

`Tests/CopickerCoreTests/DocumentationContractTests.swift` is the documentation drift guard. When a version, accepted runtime anchor, settings geometry, marketplace/plugin ID, or settings resource changes, the source and public documentation must be updated in the same batch.

Contract tests are not substitutes for live acceptance. Their purpose is to make intentional changes explicit and prevent quiet regression.

## Read-only compatibility check

Run the source or installed binary without a live subcommand:

```bash
./script/build_and_run.sh

"$HOME/Library/Application Support/Copicker/bin/copicker" status
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
```

The output should identify the exact official app, bundle identifier, Codex short/build versions, fuse state, current process path, CoPicker payload/settings resource, persisted preference summary, installed artifacts, watcher version, last PID, and result code. It must explicitly say that no signal was sent and no Inspector connection was opened.

Record the output as operational evidence, but do not include task/content data in an issue or report.

## Live command classification

| Command/action | Reads live renderer | Changes current renderer/task | Changes persistent user state |
| --- | --- | --- | --- |
| `copicker status` | No | No | No |
| `autostart status` | No | No | No |
| `inject` | Yes | Installs/replaces hook | No settings write |
| `remove` | Yes | Removes current hook | No |
| `probe` | Yes | No intended selection write | No |
| `probe-picker` | Yes | Opens official full list | No |
| `probe-primary` | Yes | Opens official first-level picker | No |
| `probe-selector` | Yes | Temporarily changes and restores selection | No preference write |
| `autostart enable` | May inject current PID | May install hook | Installs artifacts/LaunchAgent |
| `autostart disable` | No by default | No by default | Removes LaunchAgent |
| `autostart disable --remove` | Yes | Removes current hook | Removes LaunchAgent |
| `script/install.sh` | May inject current PID | May install hook | Replaces managed artifacts and plugin |
| Settings autosave | No Inspector | No current hook change | Writes `settings.json` |
| Settings **Apply now** | Yes | Injects saved snapshot | Uses already saved snapshot |

Every live command requires the applicable authorization and must not be run from an active Codex task if it would terminate or restart that task. CoPicker never restarts Codex automatically.

## Live picker acceptance checklist

Record the exact CoPicker commit/tag and Codex version/build, then test:

1. official first-level picker opens CoPicker;
2. full-width composer list does not activate or move CoPicker;
3. rail is a body-level sibling, not a child of the official picker;
4. top, left, and right placement fit and preserve the 12-pixel gap;
5. nested Model and Effort menus remain open and are avoided without flashing;
6. pointer-gated side restoration and top latching behave as specified;
7. open/close animation has no stale-coordinate fly-in;
8. pointer click commits once, rapid drag commits its final release cell without pausing, cancellation restores without writing, and four arrow keys plus Space work;
9. all enabled model rows have the correct effort count;
10. Daybreak and Codex Spark cannot enter Fast;
11. a hidden adapted model is recognized without an active selectable row;
12. GPT-5.4/GPT-5.4 Mini and another unsupported model show empty `Other` state;
13. existing-task changes confirm and failures restore state;
14. a new-unsent-task composer with retained background task markers still uses and confirms through official controls;
15. normal Codex compaction is not misreported as a CoPicker-specific failure;
16. Escape, outside click, window blur, document hide, and official close dismiss both surfaces correctly;
17. Inspector port closes after the live action.

## Live settings acceptance checklist

1. CoPicker appears after Plugins/Browser and no duplicate native/fallback item exists.
2. Light/dark icon variants remain legible.
3. Page title, `常规`, cards, switches, segmented controls, actions, model order, copy, and warnings match the accepted baseline.
4. At least one model remains enabled.
5. All six model toggles persist.
6. Top/left/right and all four appearance options persist.
7. Stale revision conflicts display authoritative values.
8. Autosave does not open Inspector or mutate the current renderer.
9. A normal restart consumes the saved snapshot.
10. **Apply now** waits for save completion, applies without restarting, reports success/failure separately, and closes Inspector.
11. Disabled settings prevent the watcher from opening Inspector for a later PID.
12. Native/fallback page width and top geometry are measured against the current official scroll viewport rather than a screenshot.

## How to re-measure official settings safely

For a new Codex build, use a bounded, read-only renderer inspection that returns only:

- known settings element classes/IDs;
- `getBoundingClientRect()` values;
- relevant computed padding, gap, font, line-height, overflow, and max-width properties;
- booleans for known CoPicker/settings anchors.

Do not return arbitrary DOM text, conversation content, composer content, task identifiers, cookies, tokens, or authentication state. If opening Settings is necessary, use Codex's own navigation and return to the prior page afterward. Bind Inspector to loopback and verify it closes.

For the accepted build, the official values are recorded in [accepted-baseline.md](accepted-baseline.md#accepted-native-settings-measurements).

## Current accepted evidence

| Gate | Evidence |
| --- | --- |
| Live-accepted runtime source | `c0343d4d76e4094cd99ba9ff7fe0fb71fc3edbbb` |
| Current package | `v0.99.0`; CLI/plugin `0.99.0` |
| Live-accepted CLI label | `0.12.0-dev` |
| Live-accepted/published renderer | `0.12.8` |
| Renderer `0.12.9` focused live result | Rapid pointer release passed; new-unsent-task official trigger update failed |
| Current `main` renderer candidate | `0.12.10`; current-Codex tag-agnostic official-item selector, offline proof only |
| Codex | `26.820.60940` build `7119` |
| Architecture | Apple silicon `arm64` |
| Installed watcher | loaded; `injection-succeeded`; current/last PID matched |
| Settings geometry | live official DOM measured; final user response: completely identical |
| Inspector | closed after bounded work; no idle listener |
| Public runtime release | `v0.99.0` full-feature source pre-release; no prebuilt executable attached |

The accepted UI evidence applies to that exact Codex build and runtime source. The `0.99.0` distribution bump changes version metadata, tests, and documentation but not renderer behavior; its offline/release-build proof is separate from the earlier live install/restart proof. Neither result must be generalized to an untested desktop update.

## New-machine acceptance record

Use this template after installation:

```text
CoPicker ref:
CLI/plugin version:
Renderer version:
Settings schema/resource:
macOS version:
Architecture:
Swift version:
Codex CLI version:
Codex desktop version/build:
Official app path/bundle ID:
Release build:
Offline tests:
Read-only status:
Plugin marketplace/plugin:
LaunchAgent loaded:
Injection result and PID:
Picker UI/interaction:
Settings UI/persistence:
Codex restart reinjection:
Cold login/reboot:
Inspector closed:
Known caveats:
```

Use `not tested` instead of implying that an unperformed gate passed.
