# Developing CoPicker

CoPicker is a SwiftPM macOS command-line package with a bundled JavaScript renderer payload and a local Codex settings plugin. Development does not require an Xcode project, but live compatibility work requires a deliberately authorized Codex desktop session.

Start with these documents:

- [Accepted product and compatibility baseline](accepted-baseline.md) is the authority for accepted behavior, exact model support, geometry, live measurements, compatibility anchors, and superseded assumptions.
- [Architecture](architecture.md) explains the installer, watcher, Inspector, renderer, settings plugin, persistence, and failure boundaries.
- [Validation](validation.md) separates offline proof from live process, UI, restart, and cold-login proof.
- [Contributing](../CONTRIBUTING.md) defines the collaboration, Git, documentation, test, safety, and publication agreement.
- [Installation](installation.md) is the operator-facing new-machine, update, rollback, and recovery guide.

## Current development baseline

CoPicker has several independent version layers. Never collapse them into a single “latest version” claim.

| Layer | Current accepted value | Where it is defined |
| --- | --- | --- |
| Accepted runtime-code anchor | `c0343d4d76e4094cd99ba9ff7fe0fb71fc3edbbb` | [accepted-baseline.md](accepted-baseline.md) |
| Published GitHub pre-release | `v0.99.0` | Immutable annotated tag/release; `v0.99.0^{commit}` resolves its package commit |
| CLI and plugin | `0.99.0` | `ProjectInfo.version` and plugin manifest |
| Live-accepted CLI label | `0.12.0-dev` | Earlier installed label for the unchanged accepted runtime behavior |
| Renderer development candidate | `0.12.10` | `model-rail.js` `VERSION`; no-task selector correction is offline only until a separately authorized live pass |
| Renderer in `v0.99.0` | `0.12.8` | Immutable annotated release source |
| Settings schema | `1` | `CopickerSettings.currentSchemaVersion` |
| Settings resource | `ui://copicker/settings/v2.html` | `CopickerMCPProtocol.settingsResourceURI` |
| Live-accepted Codex | `26.820.60940` build `7119` | [accepted-baseline.md](accepted-baseline.md) |

The accepted runtime commit is older than the release metadata and documentation closure. That is intentional: documentation-only and version-only commits do not become runtime acceptance anchors. A later behavioral source change must earn its own build, live compatibility, interaction, settings, restart, and Inspector-closure evidence before replacing `c0343d4`.

The public `v0.99.0` pre-release packages the full six-model implementation at renderer `0.12.8`. Renderer `0.12.9` was installed for a focused live pass: rapid pointer release passed, but the new-unsent-task official-control proxy did not. Current `main` advances to `0.12.10` by changing only the official menu-item compatibility anchor from a button-specific selector to the current Codex tag-agnostic `data-list-navigation-item="true"` selector. That correction must not be described as live-accepted until the focused new-task gate is rerun. `v0.11.0` remains an immutable historical three-model release.

## Supported development boundary

- macOS 14 or later is the Swift package deployment target.
- Apple silicon `arm64` is the currently live-verified architecture.
- Swift 6 or later is required.
- The official Codex desktop app is expected at `/Applications/ChatGPT.app` for compatibility inspection and live actions, but is not required for offline tests.
- The `codex` CLI is required by `script/install.sh` to register the local settings plugin.
- Node.js is optional and is used for JavaScript syntax validation when available.
- The accepted UI measurements were taken from one exact Codex desktop build. A successful build on another Mac does not prove compatibility with another Codex renderer.
- The repository currently has no cross-version macOS/Codex live acceptance matrix.

This project does not own or patch the official application bundle. Do not modify, unpack into, replace, or re-sign `/Applications/ChatGPT.app` within the current project scope.

## Clone for development

Clone the moving development branch and create a short-lived branch for source changes:

```bash
git clone https://github.com/Wineondili/copicker.git
cd copicker
git switch main
git pull --ff-only
git switch -c codex/my-change
```

Before each change batch, verify the checkout and remote state:

```bash
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
git remote -v
```

Do not use a shallow `--branch v0.99.0` installation checkout for ongoing development. A tag checkout is deliberately detached and suitable for reproducible installation or historical investigation, not for retaining development commits.

## Package products and repository layout

`Package.swift` defines:

- `CopickerCore`, containing process discovery, Electron fuse parsing, Inspector transport, injection planning, user-scoped paths, settings persistence, and the pure MCP settings protocol;
- `copicker`, containing CLI routing, watcher/autostart management, settings application, bundled renderer resources, and the private stdio MCP server.

Important paths:

- `Sources/CopickerCore/ProjectInfo.swift`: CLI/plugin distribution version.
- `Sources/CopickerCore/CopickerSettings.swift`: schema, defaults, model keys, validation, revision checks, and atomic persistence.
- `Sources/CopickerCore/CopickerMCPProtocol.swift`: versioned app-only settings resource and tool metadata.
- `Sources/CopickerCore/CopickerAutostart.swift`: user-scoped paths, installed artifacts, LaunchAgent definition, watcher state, and retry policy.
- `Sources/CopickerCLI/CopickerCLI.swift`: command routing, preflight, live actions, probes, watcher loop, and status reporting.
- `Sources/CopickerCLI/CopickerSettingsApplier.swift`: guarded Apply-now adapter.
- `Sources/CopickerCLI/CopickerMCPServer.swift`: newline-delimited stdio MCP server.
- `Sources/CopickerCLI/AutostartManager.swift`: explicit `launchctl` mutations.
- `Sources/CopickerCLI/Resources/model-rail.js`: detached Shadow DOM rail, placement/avoidance, official-control proxy, task settings bridge, and settings fallback.
- `Sources/CopickerCLI/Resources/copicker-settings-v2.html`: network-free settings document and controller.
- `Plugin/copicker/`: local plugin manifest, launcher, and light/dark icon assets.
- `.agents/plugins/marketplace.json`: stable local marketplace descriptor.
- `Tests/CopickerCoreTests/`: offline unit and source-contract tests; these must never attach to or signal Codex.
- `tools/model-rail-tuner.html`: isolated historical rail tuning surface.
- `script/build_and_run.sh`: project-local build/run/debug entrypoint.
- `script/install.sh`: release build, managed user installation, LaunchAgent enablement, and plugin registration.
- `docs/accepted-baseline.md`: normalized accepted requirements and measured values.
- `design-qa.md`: chronological visual evidence, including explicitly superseded passes.
- `local-docs/`: optional ignored directory for machine-local or non-public evidence; never put required public instructions only there.

SwiftPM processes both renderer resources into `Copicker_CopickerCLI.bundle`. Installed or packaged copies must keep that bundle adjacent to the executable.

## Offline development workflow

These commands do not inject into Codex and do not change the real user LaunchAgent:

```bash
swift package dump-package >/dev/null
swift build
swift test
swift build -c release
node --check Sources/CopickerCLI/Resources/model-rail.js
bash -n script/build_and_run.sh script/install.sh
git diff --check
```

Node.js is optional for normal installation. If it is unavailable, record that `node --check` was not run instead of describing it as passed.

The private stdio MCP server can be exercised without registering the plugin or changing Codex state:

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  '{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"ui://copicker/settings/v2.html"}}' \
  | .build/debug/copicker mcp-server
```

The default project script builds and runs the read-only status command:

```bash
./script/build_and_run.sh
./script/build_and_run.sh --autostart-status
```

Read-only status can inspect the application path, bundle ID, Electron fuses, process identity, installed artifacts, and structured watcher state. It must not send `SIGUSR1` or open Inspector.

## Commands that change live state

These are separate authorization and validation gates, not offline tests:

| Command or action | Process effect | Persistent effect |
| --- | --- | --- |
| `./script/build_and_run.sh --inject` | Signals the running Codex process, briefly opens loopback Inspector, and injects/replaces the hook | None beyond current process |
| `./script/build_and_run.sh --remove` | Opens the guarded Inspector path and removes the current-process hook | None |
| `./script/build_and_run.sh --probe` | Opens Inspector and reads scoped compatibility metadata | None |
| `./script/build_and_run.sh --probe-picker` | Opens the full-width official list and runs its scoped probe | Temporary UI action |
| `./script/build_and_run.sh --probe-primary` | Opens the first-level picker and runs its scoped probe | Temporary UI action |
| `./script/build_and_run.sh --probe-selector` | Selects supported settings, confirms them, and restores the original selection | Temporary task mutation; may compact normally |
| `./script/build_and_run.sh --autostart-enable` | The watcher may inject the current or next PID | Replaces managed artifacts and loads the user LaunchAgent |
| `./script/build_and_run.sh --autostart-disable` | No current-process removal by default | Unloads/disables the user LaunchAgent |
| `./script/build_and_run.sh --autostart-disable --remove` | Also removes the current hook | Unloads/disables the user LaunchAgent |
| `./script/install.sh` | The loaded watcher may inject an already-running PID | Installs artifacts, LaunchAgent, marketplace, and plugin |
| Settings autosave | Does not open Inspector | Writes the versioned `settings.json` snapshot |
| Settings **Apply now** | Briefly opens guarded Inspector and injects the saved snapshot | Uses the already saved snapshot; does not restart Codex |

Never run live commands from tests. Never terminate or restart Codex from an active Codex task without explicit approval. A model/effort probe can cause the same compaction as the equivalent official action; record that as Codex behavior, not a CoPicker-specific failure.

## Version-change rules

The version layers serve different purposes:

- Bump `ProjectInfo.version` when the installed CLI/plugin distribution line changes. Keep the plugin manifest and its tests synchronized.
- Bump the renderer `VERSION` whenever an already injected payload must be replaced for compatibility or behavior. It need not equal the CLI version.
- Bump the settings schema only for a persisted JSON shape/meaning change, and provide a migration or explicit rejection strategy.
- Bump the settings resource URI when hosts must treat the MCP App document as a new resource contract.
- Create an immutable Git tag only as part of an explicitly authorized publication batch.
- Never call a moving `main` commit a release merely because it builds or has been pushed.
- Never replace the accepted runtime-code anchor with a documentation-only commit or an offline-only implementation result.

When any value changes, update the machine-readable block in [accepted-baseline.md](accepted-baseline.md), user-facing install commands, relevant tests, and `CHANGELOG.md` in the same coherent batch.

## Renderer and model-selection contracts

The complete normative behavior is in [accepted-baseline.md](accepted-baseline.md). The following implementation rules are especially easy to regress:

- Activate only for the compact first-level model/reasoning picker, never for the full-width composer list.
- Keep the rail as a body-level Shadow DOM sibling rather than inserting it into official menu DOM.
- Resolve account model IDs, effort availability, and the Fast tier from `model/list`; do not persist or hard-code account-specific IDs.
- Resolve an active task ID only from the unique open trigger's own composer; never fall back to a document-wide or cached task marker.
- With that exact active task ID, use `thread/settings/update` and require the matching `thread/settings/updated` confirmation.
- Before the current composer has a task ID, proxy only the exact official Model, Effort, and Speed controls and confirm the resulting official trigger state.
- Preserve the six-row order and effort matrix. Daybreak and Codex Spark cannot use Fast and must clear it.
- Recognize hidden adapted models without selecting an invisible row; show empty centered `Other` for unsupported models.
- Preserve top/left/right placement, nested-menu avoidance, no-flicker latching, pointer-gated side restoration, viewport clamping, and the 12-pixel separation/inset contract.
- Preserve preview-only pointer dragging with one release snapshot, the 120-millisecond keyboard commit delay, 180-millisecond open/close motion, and 420-millisecond placement return delay unless a later accepted requirement supersedes them.
- Fail closed when private DOM, bridge, task, catalog, or confirmation anchors are absent.

Legacy runtime names including `__CODEX_MODEL_RAIL__`, `codex-model-rail-popover-host`, related state keys, host IDs, and the logging subsystem are migration anchors. Do not rename them without code that can dispose of an older already injected payload.

## Settings and persistence contracts

- Persist only schema version, revision, enablement, ordered visible model keys, preferred placement, and appearance.
- Require at least one visible model.
- Normalize model order from `CopickerModel.allCases`, not request order.
- Write atomically with user-only mode `0600` and reject stale revisions with the authoritative snapshot.
- Keep autosave and Apply-now status separate. Autosave never opens Inspector; Apply now operates only after save completion.
- Prefer the native plugin settings entry when Codex exposes it. Add the Browser-derived fallback only when native is absent, and deduplicate continuously.
- Keep the settings document network-free, script-safe under its CSP, and bridged only through the bounded renderer controller.
- Keep the Apply row directly below Enable CoPicker in the `General` group.
- Light rail background is exactly `rgb(255, 255, 255)`; dark is `rgb(44, 44, 44)`.

## Visual measurement and acceptance

Do not infer current native settings dimensions from screenshots or minified class names when the running DOM can be measured safely. The accepted method is:

1. record the exact CoPicker ref and Codex version/build;
2. inspect only known settings elements and return rectangles plus relevant computed styles;
3. avoid arbitrary text, task identifiers, conversation content, cookies, tokens, or authentication data;
4. identify the official wide `overflow-y: auto|scroll` viewport rather than treating the whole right pane as content;
5. compare the implementation to that viewport, its inset, centered maximum-width column, typography, and group rhythm;
6. verify Inspector closure after the bounded read;
7. retain screenshot evidence as historical context, but let later live DOM evidence explicitly supersede it.

The accepted build measured a 46-pixel toolbar, 20-pixel scroll-viewport inset, 768-pixel maximum content width, 24-pixel heading with 28.8-pixel line height, and 41.5 pixels from heading bottom to the first group-title top. The previous fixed 42-pixel iframe top inset is historical and superseded.

Rail visual work may begin in `tools/model-rail-tuner.html`, but isolated preview acceptance is not live Codex acceptance. Preserve exact accepted geometry and colors from the baseline unless the user explicitly supplies a later design requirement.

## Tests as executable documentation

Tests are expected to assert both behavior and durable source/document contracts:

- pure settings validation, ordering, revisions, atomic writes, permissions, and concurrency;
- MCP metadata, schemas, visibility, resources, icons, persistence, and Apply-now response boundaries;
- Inspector ownership, fuse parsing, injection expression, autostart state, and retry behavior;
- payload anchors for activation, placement, models, selection paths, privacy, settings integration, geometry, theme, and version replacement;
- plugin packaging, marketplace registration, settings CSP, controls, copy, and resource-bundle installation;
- documentation baseline values matching source versions, schema/resource constants, accepted settings geometry, and release/install language.

When an accepted requirement changes, update its source, tests, accepted-baseline entry, focused guide, and historical QA disposition together. Do not weaken a test merely to make a changed implementation pass; first decide whether the implementation regressed or the requirement was explicitly superseded.

## Resource packaging

For a release build:

```bash
swift build -c release
swift build -c release --show-bin-path
```

Verify that the reported directory contains both:

- `copicker`;
- `Copicker_CopickerCLI.bundle` containing `model-rail.js` and `copicker-settings-v2.html`.

`script/install.sh` copies the executable, resource bundle, marketplace, and plugin package into stable user-scoped locations. The settings launcher invokes the installed executable, so a mixed-version executable/bundle/plugin installation is unsupported.

## Cross-device validation

On every new Mac, record rather than assume these gates:

1. intended Git commit or tag resolves exactly;
2. macOS version and architecture meet the supported boundary;
3. SwiftPM manifest loads;
4. debug and release builds complete;
5. offline tests and syntax checks pass;
6. the release directory contains the executable and resource bundle;
7. read-only status recognizes that Mac's Codex path, bundle ID, fuse state, version/build, and process;
8. plugin marketplace and plugin registration succeed;
9. only after explicit authorization, the LaunchAgent installs/loads;
10. current-process injection succeeds and Inspector closes;
11. picker UI, controls, all model states, placement, submenu avoidance, settings UI, save/apply, and appearance pass;
12. Codex restart reinjection passes;
13. cold login/reboot passes independently.

Use the evidence template in [validation.md](validation.md#new-machine-acceptance-record). Write `not tested` for any unperformed gate.

## Change and commit workflow

1. Read `AGENTS.md`, the accepted baseline, and the relevant focused docs.
2. Verify branch, HEAD, worktree, and remote state before writing.
3. Make one small coherent source/documentation batch.
4. Run proportional offline checks and review `git diff --check`.
5. If live proof is authorized, run it as a separate gate and record exact environment/evidence.
6. Commit the coherent batch with an English commit message.
7. Append a timestamped `CHANGELOG.md` entry with seconds and timezone in that same committed batch.
8. Push, tag, release, install, restart, and cold-login validation only when each action is authorized.
9. Report commit SHA, remote state, checks run, checks not run, and any remaining compatibility caveat separately.

Do not overwrite unrelated user changes. Do not use destructive Git cleanup to manufacture a clean tree.

## Release checklist

Before publishing a tag or GitHub Release:

1. confirm intended branch, clean worktree, exact HEAD, and remote state;
2. decide whether this is a runtime release, documentation-only release, or historical correction;
3. update all applicable version layers without inventing synchronization between them;
4. update README, installation commands, accepted baseline, validation evidence, contract tests, and `CHANGELOG.md`;
5. run the complete offline suite and release build;
6. verify the built binary reports the intended version and its resource bundle is present;
7. run read-only Codex compatibility status;
8. obtain and record any required live picker/settings/restart/cold-login evidence separately;
9. commit and push the exact source first;
10. create and push an annotated immutable tag only with explicit authorization;
11. create the GitHub Release and verify its Draft/Pre-release/Latest flags and target commit;
12. do not describe publication as complete until both the remote tag and GitHub Release are observed.

## License status

The plugin manifest currently declares `Proprietary`, and the repository does not contain a general open-source license grant. Public visibility alone does not grant redistribution or derivative-work rights. The repository owner should add an explicit license before inviting broader third-party redistribution or collaboration beyond the current permissions.
