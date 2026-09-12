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
- renderer privacy exclusions, exact trigger/menu selectors, first-level/full-list separation, Shadow DOM ownership, obstacle latching, animation, keyboard behavior, model matrix, Fast restrictions, hidden/paginated catalog handling, exact task routing, executable no-task layout classification, service-tier rejection, no-task source integration, and settings integration;
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
8. pointer click and active drag preserve the 240-millisecond fill/thumb positional easing, click commits once, rapid drag commits its final release cell without pausing, cancellation restores without writing, and four arrow keys plus Space work;
9. all enabled model rows have the correct effort count;
10. Codex Spark cannot enter Fast; an exact legacy model-backed Daybreak leaf follows the normal non-Fast model route, while the separate Daybreak program remains policy-gated;
11. a hidden adapted model is recognized without an active selectable row;
12. GPT-5.4/GPT-5.4 Mini and another unsupported model show empty `Other` state;
13. an existing-task change accepts only a strictly newer matching settings notification; a pre-dispatch failure restores state, while a post-dispatch unconfirmed outcome invalidates confirmation and displays `Other`;
14. a new-unsent-task composer with retained background task markers still uses and confirms model-backed rows through official controls, including an icon-only responsive trigger;
15. on build `7377`, the Daybreak row fails on both task paths when the separate program checkbox is present; ordinary rows work only while that exact control is explicitly off, fail while it is enabled/busy/disabled/ambiguous, and every mutation fails when neither that checkbox nor one exact legacy leaf is observable;
16. an initially prechecked no-task Standard remains provisional and displays `Other`; a Standard selection visibly transitions through catalog-resolved Fast before returning to Standard, and a current model without that path fails before target mutation;
17. a forced target failure restores the captured Model/Effort/tier, including exact `Ultrafast`; an initially ambiguous Standard restores and reports normalized Standard rather than the unknowable raw tier, while forced rollback failure invalidates the rail state;
18. task notifications received before catalog readiness replay without confirming a later request, hidden adapted notifications remain recognizable, and a trusted official picker change invalidates cache in both DOM-before-notification and notification-before-DOM order;
19. an idle no-task composer never opens Model/Effort/Speed for synchronization; one explicit selection performs one bounded transaction, proxy-owned Daybreak churn never retriggers classification, and duplicate in-flight task classification coalesces without a queued retry;
20. normal Codex compaction is not misreported as a CoPicker-specific failure;
21. Escape, outside click, window blur, document hide, and official close dismiss both surfaces correctly;
22. Inspector port closes after the live action.

## Live settings acceptance checklist

1. CoPicker appears after Plugins/Browser and no duplicate native/fallback item exists.
2. Light/dark icon variants remain legible.
3. Page title, `常规`, cards, switches, segmented controls, actions, model order, copy, and warnings match the accepted baseline.
4. At least one model remains enabled.
5. All configured model toggles persist, including the new Astra option in candidate `0.12.15`.
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
| Renderer `0.12.12` live result | Injected and visible on build `7377`, but selection had no effect; probes observed `serviceTier: "default"`, exact `legacy-model`, `Other`, and `error` |
| Renderer `0.12.13` live result | Idle no-task Model/Effort/Speed flyouts looped visibly; Daybreak and Codex Spark could leave the renderer unresponsive |
| Current `main` renderer | `0.12.19`; uses separate version-prefixed rail display labels while retaining Spark Retiring, native settings initialization, and the user-accepted model switching from `0.12.16` |
| Spark lifecycle annotation | Original 2026-09-11 X post verified directly; 56 offline tests and release build passed. Actual settings HTML passed local mock initialization, an enabled Spark toggle, and a 390 px no-overflow check; the standalone rail retains four Spark cells and its original dimensions |
| Current settings source | Seven model rows match the persisted/MCP/renderer contract; Astra save round-trip covered offline; isolated HTML preview passed model toggles, last-visible-row protection, and mock Apply |
| Current installed delivery | Release executable and HTML/renderer resources match source SHA-256; the user-authorized `0.12.19` watcher update reports successful injection without restarting Codex. The LaunchAgent plist is unchanged; a concurrent preference save was confirmed as the user's manual change and retained |
| Version-prefixed rail labels | 57 offline tests and release build passed; local Browser preview at 1280 × 720 and 390 × 844 displays all four exact labels without clipping. Clicking each of the four rows updates the visible xhigh status while keeping the internal model name unchanged; no console warnings/errors |
| Native settings interaction | The candidate document reached `ready` in the real native sandbox, displayed seven rows, and loaded preferences; the user manually confirmed successful opening and saving |
| Fresh installed MCP process | Advertises the seven-model schema and v3 URI; v3 and legacy v2 reads return the source-exact initialized document with the Retiring notice. No new restart/cold-login or all-cache-invalidation claim is made |
| Live-accepted Codex | `26.820.60940` build `7119` |
| Diagnosed Codex | `26.825.51511` build `7377`; bundle inspection plus bounded live read-only picker probes |
| Architecture | Apple silicon `arm64` |
| Installed watcher | loaded; `injection-succeeded`; current/last PID matched |
| Settings geometry | live official DOM measured; final user response: completely identical |
| Inspector | closed after bounded work; no idle listener |
| Public runtime release | `v0.99.0` full-feature source pre-release; no prebuilt executable attached |

The accepted watcher, UI, and Inspector evidence applies specifically to Codex `26.820.60940` build `7119` and runtime source `c0343d4`; none of those rows is live evidence for the statically inspected build `7377`. The `0.99.0` distribution bump changes version metadata, tests, and documentation but not renderer behavior; its offline/release-build proof is separate from the earlier live install/restart proof. Neither result must be generalized to an untested desktop update.

The 2026-09-12 build-`8881` picker acceptance is newer and specific: official checked model, reasoning effort, Fast state, and confirmed transaction state were inspected after bounded no-task selections; a trusted pointer click kept the native picker open and showed intermediate easing. The user then independently confirmed that selections send successfully using the expected model. This does not claim an exhaustive live effort matrix, a new native-settings-geometry pass, or restart/cold-login acceptance. The settings browser check used the actual shipped HTML and an in-memory mock bridge at `127.0.0.1`, with a `1280 × 720` viewport, seven rows, no horizontal overflow, no blank/error overlay, and no console warnings/errors. Its Apply success is deliberately mock-only; offline MCP tests separately verify Astra persistence and revision handling.

The later Spark-notice check is independent of that live picker acceptance. In the standalone preview the host remains `339.75 × 262.75` CSS px, the badge has an 8 CSS px gap after the final Spark thumb and cannot capture pointer input, and Spark/xhigh remains selectable with Fast off. The actual settings document initialized under a local in-memory host, accepted a mock Spark visibility save, and kept the badge and enabled switch inside its row at 390 px without horizontal overflow. An initial browser/sandbox MutationObserver exception did not recur during a scoped reload check; the settings document contains no MutationObserver use. No real preference save, model switch, or prompt submission was part of this annotation check.

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
