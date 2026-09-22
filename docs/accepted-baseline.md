# Accepted product and compatibility baseline

This document is the current authority for behavior that has been explicitly accepted in the running Codex app. It normalizes the product requirements developed through the CoPicker design and implementation sessions into stable requirement IDs, exact source values, live DOM measurements, and validation gates.

When sources disagree, use this precedence:

1. a later explicit user acceptance or correction;
2. current live Codex DOM/computed-style evidence for that exact Codex build;
3. current CoPicker source and contract tests;
4. this baseline and the focused public guides;
5. historical screenshots, tuning pages, comments, and changelog entries.

Historical evidence remains useful, but it must not silently override a later accepted correction.

<!-- COPICKER_ACCEPTED_BASELINE_V1
accepted_runtime_commit=c127509ae0a05f50c14757d2a212b79951126f46
accepted_live_cli_version=0.12.0-dev
published_release_tag=v1.0.0
published_release_commit=v1.0.0^{commit}
cli_version=1.0.0
accepted_settings_source_commit=6979811f4797ae9630f1b23fd0d5eee0551de68d
accepted_settings_user_confirmation_date=2026-09-13
renderer_version=0.12.21
settings_schema_version=1
settings_resource_uri=ui://copicker/settings/v5.html
marketplace_name=copicker-local
plugin_id=copicker@copicker-local
accepted_codex_version=26.820.60940
accepted_codex_build=7119
inspected_codex_version=26.908.40834
inspected_codex_build=8881
accepted_picker_renderer_version=0.12.16
accepted_picker_codex_build=8881
inspected_electron_dependency_version=42.3.0
inspected_chromium_framework_version=152.0.7977.83
host_version_policy=capability-based-not-version-allowlist
accepted_architecture=arm64
accepted_window_width_css_px=1440
accepted_window_height_css_px=810
accepted_device_pixel_ratio=2
official_settings_toolbar_height_css_px=46
official_settings_panel_inset_css_px=20
official_settings_content_max_width_css_px=768
official_settings_heading_font_size_css_px=24
official_settings_heading_line_height_css_px=28.8
official_settings_heading_to_group_title_css_px=70.3
official_settings_heading_bottom_to_group_title_css_px=41.5
-->

## Version and acceptance status

| Item | Accepted value | Status |
| --- | --- | --- |
| Historical full-runtime code anchor | `c127509ae0a05f50c14757d2a212b79951126f46` | Older installed, live-reviewed, and user-accepted six-model code |
| CLI/plugin release | `1.0.0` | Current source-distributed stable release package |
| Current renderer | `0.12.21` | Eight-model catalog refresh; GPT-6 Sol/Luna added, Spark removed, GPT-5.5 Retiring; live installation/acceptance pending |
| Renderer `0.12.16` native settings result | Native entry opened a blank/loading surface after restart despite a current seven-model backend | User-reported failure; missing UI initialization was confirmed in the native sandbox |
| Renderer `0.12.13` live result | Model/Effort/Speed menus flashed repeatedly; Daybreak and Codex Spark could leave the renderer unresponsive | User-observed strict failure; installed payload matched source and watcher injection succeeded |
| Renderer `0.12.12` live result | Injected and visible, but model selection had no effect | User-observed strict failure; probes confirmed `serviceTier: "default"`, exact `legacy-model` Daybreak topology, `Other`, and `switchState: error` |
| Renderer `0.12.9` live interaction | Rapid pointer release passed; new-unsent-task selection failed | User-observed result; the two outcomes must not be reversed |
| Renderer in `v0.99.0` | `0.12.8` | Immutable published source pre-release payload |
| Settings schema | `1` | Current persisted preference schema |
| Settings resource | `ui://copicker/settings/v5.html` | Eight-row MCP App document; v4, v3, and v2 remain read aliases with the requested URI echoed |
| Public GitHub release | `v1.0.0` | Full-feature immutable stable source release; the annotated tag resolves its exact package commit |
| Live-accepted CLI label | `0.12.0-dev` | Version string present when the unchanged runtime behavior was installed and accepted |
| Historical full-runtime Codex desktop | `26.820.60940` build `7119` | Exact build for the older complete runtime/settings geometry acceptance |
| Current adapted Codex desktop | `26.908.40834` build `8881` | Model-picker interaction and user-reported first-message routing accepted; later native v4 settings presentation user-confirmed |
| Official bundle | `/Applications/ChatGPT.app`, `com.openai.codex` | Read-only status verified |
| Architecture | `arm64` | Live verified |
| Pre-restart installed watcher | CLI `0.99.0`, renderer/settings `0.12.20`, loaded, `injection-succeeded` | Verified before the user's restart on build `8881`; the release-only CLI/plugin version bump does not imply reinstalling this machine |
| Last live-verified settings backend | v4 resource with v3/v2 read aliases and owned page surface | Historical fresh-process/native delivery checks passed; current source v5 still requires separate installation and live verification |
| Native v4 presentation | User-confirmed passed on 2026-09-13, source `6979811` | After the manual-restart handoff, the user explicitly confirmed the actual interface was fully correct. This supersedes the earlier old-window cache/presentation blocker; no new agent-measured post-restart geometry or cold-login pass is claimed |
| Inspector idle state | no listener on `127.0.0.1:9229` | Verified after inspection/injection |

`v0.99.0` packages renderer `0.12.8`, including the complete six-model, persistent-settings, placement-latching, no-task-selection, and native-settings-geometry source. Its renderer behavior is unchanged from the live-accepted runtime at `c127509`; the release preparation changes distribution metadata, tests, and documentation only. The exact release commit is intentionally resolved through the immutable annotated tag expression `v0.99.0^{commit}` instead of attempting to embed a commit's own hash inside itself.

Renderer `0.12.9` was deliberately installed and the user confirmed that a continuous rapid drag commits the release cell without pausing. The same live pass confirmed that selection on a new unsent task still did not update the official composer trigger. Read-only inspection of the then-observed legacy/alternate picker branch showed one compatibility break: its menu item component rendered a `div[role="menuitem"][data-list-navigation-item="true"]`, while the proxy still required `button[data-list-navigation-item]` and therefore failed before invoking the official new-thread draft-setting callbacks.

Renderer `0.12.10` preserved the live-passed `0.12.9` pointer state machine and broadened only the versioned official menu-item anchor to `[data-list-navigation-item="true"]`, allowing that then-observed legacy/alternate `div` item while retaining exact-surface, visibility, disabled-state, option-count, and final-trigger confirmation checks.

Renderer `0.12.11` retained the `0.12.10` selector correction and the release-coordinate commit state machine, while restoring the original 240-millisecond fill/thumb positional transitions for both click previews and active drags. The visual easing never changes the final cell recomputed from release coordinates or the immutable selection snapshot.

Renderer `0.12.12` adapted the proxy to the statically inspected build-`7377` active-panel, semantic flyout, portal-ownership, pointer-down, and responsive-label contracts. After installation, the user reported that it had no effect. The installed resource SHA matched source and the watcher reported `injection-succeeded`; bounded probes then opened the exact first-level picker and observed renderer `0.12.12` present but displaying `Other` with `switchState: error`. The live notification used `serviceTier: "default"` for Standard, and the account exposed one exact legacy Daybreak Model leaf. This evidence supersedes the earlier offline-green compatibility claim.

Renderer `0.12.13` recognized both `null` and the observed official `"default"` value as Standard and restored mutation through an exact legacy Daybreak Model topology. After installation, the user reported that Daybreak and Codex Spark could make the app appear frozen at every effort and that an idle no-task picker continuously flashed the three official flyouts. Source tracing established the matching self-trigger mechanism: passive no-task synchronization opened Model/Effort/Speed, its own Daybreak-leaf DOM churn invalidated classification, and same-composer retry scheduled another pass. The same unbounded retry could occupy the shared commit queue around non-Fast special-model transitions.

Renderer `0.12.14` addressed the build-`7377` refresh loop. It never opens nested official controls for idle no-task synchronization, coalesces a duplicate in-flight thread classification without scheduling a same-key retry, ignores proxy-owned Daybreak structural churn when tracking external state, and suppresses selector reinitialization while bounded classification is reading official controls. A successful no-task selection remains confirmed across a same-composer trigger remount. Explicit no-task selection still performs one bounded official-control transaction because the inspected renderer exposes no equivalent public method for its draft/default/prewarm workflow. The separate Daybreak program policy, strict transaction baselines, pointer animation, and release-coordinate commit state machine remain unchanged. On 2026-09-10, the installed watcher confirmed this payload injected into build `8378`; that proves injection, not compatibility with its redesigned picker.

The historical full-runtime and native-settings-geometry acceptance remains tied to CLI label `0.12.0-dev` and Codex build `7119`. On 2026-09-12, hot-loaded renderer `0.12.16` additionally passed live picker selection on build `8881`; the user explicitly confirmed that selected models can send and that actual model routing is correct. That acceptance does not imply a new settings-geometry, restart, cold-login, or published-release pass.

`v1.0.0` packages the current seven-model renderer `0.12.20` and settings resource v4. It incorporates the build-`8881` picker and user-confirmed routing acceptance from `43379d0`, plus the later settings surface at `6979811` whose native presentation the user confirmed on 2026-09-13. The release preparation changes CLI/plugin version metadata and documentation only; it does not modify the accepted renderer or HTML. The older full-runtime anchor remains historical rather than being silently relabeled as a new exhaustive acceptance pass.

## Current environment and evidence boundary

The following describes the latest adapted host, not an exclusive supported-version list. Read-only bundle inspection on 2026-09-13 confirmed that the installed official app still matches the build used for the recent acceptance.

| Layer | Observed value | Evidence and scope |
| --- | --- | --- |
| Codex Desktop application | `26.908.40834`, build `8881` | Official app `Contents/Info.plist`; current picker and native settings acceptance target |
| Electron dependency | `42.3.0` | Declared in `app.asar` root `package.json`; metadata only, not a runtime `process.versions.electron` measurement |
| Chromium / Codex Framework | `152.0.7977.83` | Framework `CFBundleShortVersionString`, corroborated by its binary version string; do not substitute the declared Electron dependency for this value |
| Host architecture | Apple silicon `arm64` | Current source-build and prior live acceptance environment; Intel has no equivalent acceptance evidence |
| Reproduction-check OS | macOS `27.0`, build `26A428` | Current source-build host only; the package deployment minimum remains macOS 14, not a claim of testing every OS from 14 onward |
| Reproduction-check compiler | Apple Swift `6.4` | Current source-build toolchain; manifest requires Swift tools 6.0 or later |
| Installer CLI | `codex-cli 0.154.0` | Version and `codex plugin --help` inspected; installer requires plugin marketplace/list/add/remove commands, not this exact version |

These are tested compatibility baselines, not a version allowlist. CoPicker does not compare Codex Desktop, Electron, or Chromium version numbers against these values to permit execution. It checks actual Inspector capability, expected executable/port ownership, and recognizable official UI/bridge contracts. A version mismatch alone is not a rejection; a missing capability, ambiguous target, or absent official confirmation can still stop an operation safely. Conversely, matching versions do not guarantee the same account catalog, entitlement, feature rollout, or responsive UI state.

Current acceptance covers bounded seven-model selections, inspected reasoning/Fast transitions, the original pointer easing, and the user's independent successful sending and correct model routing on build `8881`. The later v4 native settings presentation was user-confirmed after the manual-restart handoff on 2026-09-13. This is not an exhaustive live model-by-effort matrix, an independently remeasured post-restart geometry pass, a new cold-login/reboot pass, or acceptance on a friend's Mac. Build `7119` and its source anchor remain explicitly historical evidence.

The source-only reproduction procedure and external installation prerequisites are in [installation.md](installation.md#source-only-reproduction-without-installation). Neither the official application bundle nor local reference extracts are needed to compile and run offline tests.

## Product requirements

### Builds 8378 and 8881 compatibility update

Renderer `0.12.15` adapts the owned `[data-model-picker-view]` surface with `simple` and `advanced` panels. Advanced now contains a Default radio and model radios; selecting a model returns to its model-specific strength slider. The three-flyout transaction below remains a legacy-build fallback and is not used for this layout.

The adapter reads checked radio state from the already-mounted inactive panel without opening menus while idle. It validates a unique selected model against `model/list`, confirms explicit/default state through `[data-explicit-model]`, rejects locked or ambiguous rows, and drives the official model radio, strength keyboard control, and Fast checkbox. Each no-task transaction stays bound to its original unsent composer, verifies model/effort/speed, and attempts restoration only while that composer and external-input generation remain unchanged. Missing effort steps and inaccessible controls terminate boundedly. Default is displayed as `Default`, with no concrete model cell selected; it is not a new selectable rail row. Unrepresentable speed tiers fail closed.

Build `8881` also exposes unrelated native model radios, including GPT-5.2, that need not resolve in the current catalog. Renderer `0.12.16` tolerates an unknown **unselected** radio without invalidating a known selected model; an unknown selected radio, duplicate known model, locked selection, or ambiguous checked state still fails closed. Bounded native transactions confirmed Astra, Sol, Terra, Luna, GPT-5.5, Daybreak, and Codex Spark, including Fast and non-Fast transitions. A trusted pointer click retained visible positional easing and left the official picker open. The user separately verified selection followed by sending and correct model routing; no model request was submitted by the inspection helpers.

Astra is an additional supported row with six efforts and catalog-resolved Fast. Existing visibility preferences and the three-row default are preserved; Astra is available in the model visibility settings. The previous six models retain their effort counts, colors, and pointer animation.

Luna deliberately retains five displayed efforts: the build-`8881` native strength control reports Max as step five of five, even though `model/list` advertises an additional Ultra effort. Settings and the standalone preview must reflect the verified native control, not expose that inaccessible sixth step. Model settings also explain that Default is a display state, not another visibility row.

### Activation and ownership

- **CP-ACT-001 — First-level picker only.** CoPicker appears when the compact composer model/reasoning control opens Codex's first-level picker.
- **CP-ACT-002 — Input-origin list excluded.** The full-width list opened through `Ctrl+Shift+M` or from the composer input does not activate CoPicker and is not a placement obstacle.
- **CP-ACT-003 — Independent DOM.** CoPicker is appended to `document.body` in its own host and Shadow DOM. It is never inserted into or made a child of Codex's official menu.
- **CP-ACT-004 — Synchronized lifecycle.** When the official first-level picker opens, CoPicker opens. When that picker closes, the document hides, the window blurs, Escape is pressed, or the combined picker loses focus, CoPicker closes.
- **CP-ACT-005 — Combined interaction region.** Pointer interaction inside CoPicker must not dismiss the official picker.

### Selection and keyboard behavior

- **CP-SEL-001 — Two-dimensional selection.** The vertical axis selects an enabled model row; the horizontal axis selects a supported reasoning effort.
- **CP-SEL-002 — Pointer behavior.** Pressing a dot/cell previews its model and effort. Click previews and active drags retain the original 240-millisecond fill/thumb positional easing. A click commits that cell once on release. Dragging updates only the rail preview; release recomputes the exact final cell from the release coordinates and commits that immutable selection once. Visual easing never changes commit intent.
- **CP-SEL-003 — Keyboard behavior.** Up/Down move between enabled rows, Left/Right move between efforts, and Space toggles Fast only when the selected model supports it.
- **CP-SEL-004 — Confirmed commits.** Rapid keyboard input is coalesced for 120 milliseconds. Pointer release and Space commit immediately. A cancelled pointer gesture restores its pre-gesture state without a settings write. A failure before any settings request or official-control mutation restores the last confirmed state. Once an existing-task request has been dispatched, an absent fresh official confirmation is an uncertain outcome: CoPicker invalidates confirmation and displays `Other` rather than claiming that the prior value was restored.
- **CP-SEL-005 — Catalog authority.** Account-specific model IDs, effort availability, and the service-tier ID/order named `Fast` are resolved from every page of Codex `model/list`; they are not hard-coded or persisted. Hidden entries may resolve the exact current model but are excluded from selectable CoPicker rows.
- **CP-SEL-006 — Existing task path.** A task identifier is accepted only from the currently open trigger's own `[data-codex-composer-root]`; document-wide or previously cached identifiers are never a fallback. With that exact active identifier, changes use `thread/settings/update` and require a strictly newer `thread/settings/updated` generation for that task than the generation observed before dispatch. A notification represents Standard when its service tier is explicit null or the live-observed official string `"default"`, and Fast only when it equals the catalog-resolved Fast ID; `Ultrafast`, every other unrelated non-null tier, and missing or unknown values fail closed. Notifications received before catalog readiness are replayed without allowing an old generation to confirm a later request, and a hidden adapted model remains recognizable without selecting a hidden row. Trusted official picker actions invalidate cached confirmation whether their DOM mutation is observed before or after the corresponding notification.
- **CP-SEL-007 — New unsent task path.** When the currently open trigger's composer has no task identifier, an idle CoPicker never opens nested official controls merely to synchronize its display; an unconfirmed initial state may remain `Other`. Only an explicit CoPicker selection starts one bounded proxy transaction against the exact official Model, Effort, and Speed controls owned by that trigger. The transaction resolves the current power layout's active panel or the exact non-Power three-flyout Work layout and binds each portalled flyout through semantic menu roles plus `aria-controls`, excludes exactly one leading Daybreak-program row only when explicitly labeled, requires exact visible model-label equality against the complete paginated hidden-inclusive `model/list` catalog, excludes hidden targets, validates effort/tier ordering, and treats an absent, false, or ambiguous compact Fast control as unknown instead of Standard. When responsive layout hides the compact trigger's selected-model text, flat-effort validation derives the current catalog entry only from one exact Model row owned by the same primary surface. It waits up to three seconds for the roughly two-second compact Ultra warning to release Codex's intentionally inert Advanced control. Before a target mutation, it preflights the target Model leaf and captures two identical, restorable current snapshots from the exact checked Model leaf, trigger effort, and checked Speed leaf, including the Speed leaf's index, option count, and semantic signature; a hidden current model or missing/restoration-ineligible control aborts. Every subsequent click remains bound to the same composer while it has no task ID. The selected model is confirmed from exact trigger text or, when responsive layout removes that text, from the exact checked target Model leaf. A checked Fast control confirms Fast. An initially checked Standard leaf does not: build `7377` may visually fall back to Standard while retaining an unsupported raw tier, so an unconfirmed initial Standard displays `Other`; a Standard commit first observes a catalog-resolved Fast transition and then the checked Standard leaf. This deliberately establishes normalized Standard as the rollback baseline; the unknowable hidden raw tier cannot be recreated. If that transition is unavailable, the request fails before target mutation. The requested tier is established on the current model before Model/Effort mutation and reapplied on the target. A partial failure restores Model, Effort, and the captured tier index and then recaptures all three; an initially ambiguous Standard reports `restored-normalized`, while a failed or unrepresentable rollback invalidates confirmation rather than reusing stale state. Before selecting a model-backed non-Fast target, CoPicker clears the current tier through the current official model. If the chosen combination cannot return to compact power view, CoPicker leaves the official picker in Advanced rather than activating Reset. A successful result remains confirmed through same-composer trigger remounts, while a trusted official change invalidates it. Proxy-owned classification mutations never schedule another classification pass. It does not adopt a retained background task ID, invent a task ID, or write raw config keys.
- **CP-SEL-008 — Normal compaction.** A model or effort change may cause the same compaction as the equivalent official Codex action. CoPicker must not label that as its own defect.

### September 22 model refresh (renderer 0.12.21)

The owner requested removal of GPT-5.3 Codex Spark, a `Retiring` notice for GPT-5.5, and separate GPT-6 Sol/Luna rows sharing the corresponding 5.6 colors. The local official catalog cache refreshed on 2026-09-22 exposes `GPT-6-Sol` with six efforts and `GPT-6-Luna` with five, both with Fast; Spark is absent. This is catalog evidence, not a fresh live picker or sending acceptance. GPT-5.5's notice follows the owner's requested lifecycle designation; no exact shutdown date or independently verified announcement is claimed.

New rows use distinct preference keys `sol-6` and `luna-6`; existing `sol` and `luna` still mean GPT-5.6. Catalog display aliases are generation-specific and actual model/tier IDs remain resolved at runtime. New rows are opt-in under existing preferences; the default 5.6 Sol/Terra/Luna set is unchanged. Settings resource v5 distinguishes the eight-row document from cached v4 pages. No host-version allowlist or new host compatibility acceptance is introduced.

Reading schema-1 settings removes only the retired Spark key in memory, preserving revision, enablement, placement, appearance, and remaining model choices. A Spark-only list falls back to the existing default three rows. Reads never rewrite disk; unknown keys and an originally empty list still fail validation. The retired key is not offered by the UI or accepted by new MCP save requests.

### Supported model matrix

The selectable and rendered order is fixed.

| Order | Persisted key | Official names matched | Rail label | Efforts | Fast | Fill gradient | Dark label gradient |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 0 | `astra` | `GPT-6-Astra`, `GPT-6 Astra` | `6-Astra` | low, medium, high, xhigh, max, ultra | Yes | `#E3F8F8 → #C6ECEC` | `#bfe7e7 → #a9d9d9` |
| 1 | `sol-6` | `GPT-6-Sol`, `GPT-6 Sol` | `6-Sol` | low, medium, high, xhigh, max, ultra | Yes | `#FBE1E5 → #F7C6CC` | `#f1c0c9 → #edb7c1` |
| 2 | `luna-6` | `GPT-6-Luna`, `GPT-6 Luna` | `6-Luna` | low, medium, high, xhigh, max | Yes | `#EEF9F1 → #DDF3E4` | `#c1e2cb → #b7dcc3` |
| 3 | `sol` | `GPT-5.6-Sol`, `GPT-5.6 Sol` | `5.6-Sol` | low, medium, high, xhigh, max, ultra | Yes | `#FBE1E5 → #F7C6CC` | `#f1c0c9 → #edb7c1` |
| 4 | `terra` | `GPT-5.6-Terra`, `GPT-5.6 Terra` | `5.6-Terra` | low, medium, high, xhigh, max, ultra | Yes | `#FFF1CF → #FFE6B8` | `#f0d69b → #ebcd90` |
| 5 | `luna` | `GPT-5.6-Luna`, `GPT-5.6 Luna` | `5.6-Luna` | low, medium, high, xhigh, max | Yes | `#EEF9F1 → #DDF3E4` | `#c1e2cb → #b7dcc3` |
| 6 | `daybreak-blue` | `Daybreak Blue`, `GPT Daybreak Blue` | `Daybreak` | low, medium, high, xhigh, max, ultra | No | `#DDEEFF → #C2E0FF` | `#afd2f2 → #9bc5eb` |
| 7 | `gpt-5.5` | `GPT-5.5` | `GPT-5.5` (Retiring) | low, medium, high, xhigh | Yes | `#E3EDFF → #CADCFF` | `#bad0f4 → #a9c3ee` |

- **CP-MOD-001 — At least one visible row.** Settings may hide any adapted row but must retain at least one.
- **CP-MOD-002 — Recognition is wider than visibility.** An adapted model hidden from settings is still recognized from the official trigger; no rail cell is active until a visible cell is selected.
- **CP-MOD-003 — Unsupported state.** GPT-5.4, GPT-5.4 Mini, and every other unadapted model show centered gray `Other`; no rail fill, thumb, effort label, or Fast indicator is active.
- **CP-MOD-004 — Non-Fast rows.** Daybreak clears Fast when selected, cannot toggle it, and does not preserve a prior Fast state when leaving and returning. Spark is no longer a supported row.
- **CP-MOD-005 — Daybreak presentation.** The rail omits `Blue`; `Daybreak` uses theme-adaptive blue (`#70b9ff` dark, `#176fbd` light).
- **CP-MOD-006 — Access notices.** Daybreak may require Codex Trusted Access for Cyber and necessary network access. Settings do not grant model entitlements.
- **CP-MOD-007 — Current-build Daybreak boundary.** In Codex build `7377`, the separate Daybreak program path removes `gpt-daybreak-blue-latest` from the official Model submenu and exposes a `menuitemcheckbox` that may remap both the current and configured default base model. Renderer `0.12.14` does not activate that broader program control without an accepted base-model/effort policy. When the control is present, the Daybreak row is rejected; ordinary model commits are allowed only while the exact control is explicitly off and are rejected while it is enabled, busy, disabled, or otherwise ambiguous. When Codex instead exposes one exact legacy Daybreak Model leaf, it is treated as the normal model-backed topology and mutation is allowed while the absence of a program control is rechecked across the transaction. When neither exact topology is observable, mutation fails closed because no bounded signal separates no entitlement from unresolved verified access. `thread/settings/update` alone cannot express build `7377`'s separate program state.
- **CP-MOD-008 — Model lifecycle.** Remove Spark from selectable rows, settings, and the active standalone preview. Keep its old preference key only for migration. Display `Retiring` for GPT-5.5 in those three surfaces, preserving its four efforts, Fast support, visibility setting, and official-catalog checks without a scheduled cutoff. The badge occupies unused space beyond the last thumb without changing geometry or intercepting input. This supersedes the historical Spark retirement annotation shipped in `v1.0.0`.

- **CP-MOD-009 — Version-prefixed rail labels.** Display `6-Astra`, `6-Sol`, `6-Luna`, `5.6-Sol`, `5.6-Terra`, and `5.6-Luna` in that order before Daybreak and GPT-5.5. Keep aliases, preference keys, and machine-readable names unambiguous across generations. New and old Sol share both fill and text gradients; new and old Luna do likewise. Settings retain full official model names. Preserve the existing long-label column rule and all cell dimensions/easing; host height grows by the existing 32 CSS px per additional visible row.

### Placement, avoidance, and animation

- **CP-PLC-001 — Preferences.** Top, left, and right are selectable base placements.
- **CP-PLC-002 — Separation.** CoPicker keeps a 12-pixel gap from the official first-level picker and a 12-pixel viewport inset.
- **CP-PLC-003 — Nested-menu avoidance.** Visible nested model/reasoning menus remain open. CoPicker moves to a valid non-overlapping rectangle instead of hiding.
- **CP-PLC-004 — No flicker.** Repeated mutations on the same side do not make the rail bounce between base and avoided positions while its current rectangle remains valid.
- **CP-PLC-005 — Top latch.** A top-position avoidance move remains latched for the current official-picker session.
- **CP-PLC-006 — Side restoration.** In left/right mode, a raised/shifted rail restores only after the pointer has visited and then left CoPicker, the base rectangle is clear, and the 420-millisecond return delay has elapsed. It never restores while the pointer is inside.
- **CP-PLC-007 — Right-edge behavior.** If right placement cannot fit, clamp toward the left edge of the viewport; raise for primary overlap and shift left for nested-menu overlap as needed.
- **CP-PLC-008 — Motion.** Open and close use the same 180-millisecond opacity/scale/vertical transition. A newly opened rail must not fly in from a stale remote coordinate.

### Settings integration and persistence

- **CP-SET-001 — Location.** CoPicker appears at the bottom of the Settings integrations area, after the built-in Plugins/Browser entries, with the supplied model-grid icon.
- **CP-SET-002 — Native/fallback deduplication.** Native MCP settings metadata is preferred. When the current Codex allowlist suppresses the local native entry, the injected fallback clones the built-in Browser navigation control. Only one CoPicker entry may exist.
- **CP-SET-003 — Persistent fields only.** `settings.json` stores schema version, revision, enablement, ordered visible model keys, preferred placement, and appearance. It stores no account model IDs, service-tier IDs, task IDs, or content.
- **CP-SET-004 — Atomic concurrency.** Writes are validated, atomic, mode `0600`, revisioned, idempotent for the same preferences, and fail with the authoritative current snapshot on a stale revision.
- **CP-SET-005 — Save/apply distinction.** Edits autosave. The default effect boundary is the next process injection. **Apply now** is enabled only after saving and may apply the persisted snapshot to the current process through the guarded Inspector path without restarting Codex.
- **CP-SET-006 — General group.** The page-level title is `CoPicker`; the first group is `常规`/General. The Apply row is directly below Enable CoPicker, not in a separate bottom group.
- **CP-SET-007 — Appearance.** Appearance choices are follow Codex, follow system, light, and dark. Light rail background is exactly `rgb(255, 255, 255)`; dark rail background is `rgb(44, 44, 44)`. Model fills remain colored.
- **CP-SET-008 — Native initialization.** The native resource sends `ui/initialize`, validates the negotiated supported protocol, applies host theme variables, and sends `ui/notifications/initialized` before reading or changing settings. One in-flight initialization is shared; its five-second timeout can be retried, and late replies are ignored. Messages are accepted only from the parent window. An explicit unsupported-method response may select a feature-detected legacy bridge, but a timed-out settings write is never replayed through another transport. Controls remain disabled until an authoritative snapshot is available. The script-free injected fallback retains its separate parent controller.
- **CP-SET-009 — Owned settings surface.** In the build-`8881` native plugin entry, the portal starts at `y=0`; unlike built-in settings it supplies neither the 46 CSS px toolbar region nor content padding. Its later sandbox stylesheet resets `html, body, #root` padding to zero. Put the surface background and insets on CoPicker-owned descendants, never on `body`: a full-height shell with a fixed 46 CSS px top spacer, then one scroll viewport with 20 CSS px content padding and the existing 768 CSS px centered column. Dark background is the measured native `--color-surface` value `#181818`, with white as the light fallback. The script-free parent-controlled fallback is already positioned below the native toolbar and must set its own spacer to zero. Keep the 20 CSS px bottom inset inside the scrollable region, so the last section does not touch the window edge. Preserve initialization, autosave, user preferences, and rail geometry.

### Safety and privacy

- **CP-SAFE-001 — No bundle mutation.** Never modify or re-sign `/Applications/ChatGPT.app` within this project scope.
- **CP-SAFE-002 — No permission reset.** Because the official bundle is unchanged, a CoPicker reinstall does not reset permissions granted to the official app.
- **CP-SAFE-003 — Guarded loopback Inspector.** Inspector is bound to `127.0.0.1`, unknown ownership fails closed, and shutdown is scheduled immediately after the bounded live action.
- **CP-SAFE-004 — Read-only default.** The default CLI action and status commands send no signal and open no Inspector connection.
- **CP-SAFE-005 — No sensitive capture.** Do not read, log, or persist conversation text, composer text, task contents, task IDs, authentication data, cookies, or tokens.
- **CP-SAFE-006 — Explicit live boundary.** Install, LaunchAgent changes, injection, removal, probes, selection probes, Apply now, restart, and publication are separate deliberate gates.

## Accepted selector geometry

The rail is authored at an internal scale and rendered at `0.5`.

| Parameter | Internal/source value | Rendered value or rule |
| --- | ---: | --- |
| Short-label three-row host | `579.5 × 269.5` equivalent inner geometry | `289.75 × 134.75` CSS px when no displayed label exceeds seven characters |
| Long-label inner width | `679.5` | `339.75` CSS px |
| Host height | `134.75 + max(0, rowCount - 3) × 32` | Already expressed in rendered CSS px |
| Stage width | `388` | `194` CSS px |
| Row height | `48` | `24` CSS px |
| Row gap | `16` | `8` CSS px; row-center step is `32` CSS px |
| Horizontal stage padding | `34` left and right | `17` CSS px |
| Column-center step | `64` | `32` CSS px |
| Start inset | `6` | `3` CSS px |
| Thumb size | `56` | `28` CSS px |
| Model column | `90`, or `190` with a label longer than seven characters | `45` or `95` CSS px |
| Popover padding | `40px 26px 17.5px` | `20px 13px 8.75px` CSS px |
| Popover radius | `24` | `12` CSS px |
| Text scale | `1.2` | Applied before the outer `0.5` scale |

As of `0.12.19`, the default Sol/Terra/Luna set uses the existing long-label width because `5.6-Terra` and `5.6-Luna` exceed seven characters. Its height and the rail's stage, cells, typography, and animation dimensions remain unchanged.

The top row contains `Faster` at the left, the moving model/effort/Fast status, and `Smarter` at the right. The former bottom model-plus-effort status row remains hidden. Endpoint labels hide temporarily if the moving effort label would overlap them. Text aligns to the bottom of the top-label row.

The selection fill begins with a rounded left cap. The right edge and thumb geometry must not expose a second fill strip below the rail or clip the first cell's rounded cap. Equal horizontal and vertical center spacing is an accepted visual invariant.

## Accepted native settings measurements

These values were originally read directly from `getBoundingClientRect()` and `getComputedStyle()` in the running official General settings page. The Browser settings page on build `8881` was remeasured on 2026-09-12 and retained the same 46 px toolbar, 20 px scroll padding, 768 px column, and heading at `y=66`. Its right-pane background was `rgb(24, 24, 24)` (`--color-surface: #181818`). These values were not inferred from screenshots.

Measurement environment:

- Codex `26.820.60940` build `7119`;
- window `1440 × 810` CSS pixels;
- device pixel ratio `2`;
- right settings pane begins at `x = 268.828125`.

| Official element | Rectangle or computed value |
| --- | --- |
| Right-pane toolbar | `top=0`, `height=46` |
| Scroll viewport | `left=268.828125`, `top=46`, `width=1171.171875`, `height=764`, `overflow-y=auto` |
| Scroll viewport padding | `20px` on every side |
| Centered content column | `left=470.41`, `top=66`, `width=768`, `max-width=768px` |
| Page heading | `top=66`, `height=28.8`, `font=24px`, `line-height=28.8px`, `weight=400` |
| Title block | `top=66`, `height=60.8`, `padding-bottom=32px` |
| Groups container | `top=126.8`, `gap=40px` |
| First section header | `top=126.8`, `height=46`, `padding-bottom=6px`, `gap=16px` |
| First group title | `top=136.3`, `height=21`, `font=14px`, `line-height=21px`, `weight=500` |
| Heading top to first group-title top | `70.3px` |
| Heading bottom to first group-title top | `41.5px` |

The parent-controlled fallback mirrors the built-in structure, not a fixed window coordinate:

1. detect the official full-width `overflow-y: auto|scroll` viewport inside the right settings panel;
2. position the CoPicker host to that viewport rectangle;
3. give the iframe's owned scroll viewport a 20-pixel content inset on all sides, with no extra toolbar spacer;
4. center a `max-width: 768px` content column;
5. use a 24-pixel page heading with unitless `1.2` line height;
6. keep 32 pixels below the page heading and 40 pixels between groups.

This yields the same `y=66` heading and `70.3px` heading-to-General alignment at the measured window size while continuing to adapt to a different sidebar width, window size, or zoom.

The native MCP entry instead fills the right pane from `y=0`. The v4 document supplies the 46 px toolbar spacer inside its own shell and the same 20 px scroll padding below it. This distinction supersedes using `body` padding for both entry paths: the native sandbox's later reset stylesheet erased that padding in v3, and transparent content exposed the wrong underlying background. Functional opening/saving acceptance of v3 did not establish native surface-style parity.

### Settings control geometry

| Primitive | Accepted values |
| --- | --- |
| Settings card | `1px` default border, `16px` radius, native panel fill |
| Setting row | `12px 16px` padding, `24px` content/control gap |
| Inset separator | `0.5px`, left/right inset `16px` |
| Switch | `32 × 20`, `16 × 16` thumb, unchecked translate `2px`, checked translate `14px` |
| Segmented group | Transparent group, `2px` option gap, no selected shadow |
| Segment | Minimum height `24px`, padding `2px 8px`, full pill radius, selected 5-percent text fill |
| Apply/retry action | Height `28px`, horizontal padding `8px`, radius `10px`, transparent border |
| Responsive threshold | Adaptive rows stack below `640px`; page header stacks below `420px` |

## Compatibility anchors

The following private selectors and identifiers are compatibility points, not public APIs:

- trigger: `[data-codex-intelligence-trigger][data-composer-navigation-target="reasoning"]`;
- first-level surfaces: the innermost trigger-owned `[data-radix-menu-content], [role="menu"]` containing either an owned `[data-reasoning-slider]`, the exact marked three-flyout Work layout, or the bounded marker-backed flat layout; inactive panels may remain mounted under `aria-hidden`/`inert`;
- nested obstacles: `[data-composer-overlay-floating-ui]`, with the older `[data-list-navigation-item="true"]` and `[data-model-picker-model-row]` retained only as alternate-layout compatibility anchors;
- official proxy items for statically inspected build `7377`: active-panel `[role="menuitem"][aria-haspopup="menu"][aria-controls]` flyout triggers and owned `[role="menuitem"]` leaf options; the current power branch omits the earlier Model-row, navigation-item, and selected-effort attributes;
- task marker: `[data-above-composer-conversation-id]`;
- Fast control: `[role="menuitemcheckbox"][data-fast-mode-enabled]`;
- settings anchor: Browser or Plugins settings buttons identified by `data-settings-panel-slug`;
- app-server methods: `model/list`, `thread/settings/update`, `thread/settings/updated`, `thread/loaded/list`, and `mcpServer/tool/call` under their documented scopes.

Legacy compatibility names such as `com.jonas.codex-model-rail.main-state`, `__CODEX_MODEL_RAIL__`, `codex-model-rail-popover-host`, and the logging subsystem must not be renamed without an explicit migration that can dispose of an already injected older payload.

## Implementation decisions and rationale

### Why the app bundle is not patched

Editing `app.asar` or re-signing the official app would change the bundle's designated requirement and can reset trust/permission relationships. CoPicker instead uses an ephemeral, user-authorized runtime injection and leaves the signed bundle byte-for-byte outside project ownership.

### Why the rail is a separate popover

The official model picker is private, versioned DOM. Mounting inside it couples layout, event propagation, clipping, and lifetime to minified host internals. A body-level Shadow DOM popover preserves the official menu, isolates styles, and allows explicit collision geometry.

### Why settings controls are locally implemented

The native Codex React controls are private modules and are not safely reusable inside the plugin/fallback sandbox. CoPicker implements the measured primitives locally, consumes host theme variables, and targets the official scroll viewport. Visual parity is validated through live computed geometry rather than copying minified component code or estimating from screenshots.

### Why two settings entry paths exist

The plugin declares an app-only native settings entrypoint. Codex build `7119` parses the metadata but may filter local plugin settings pages behind a remote allowlist. The renderer fallback therefore supplies the same entry only when the native item is absent and removes itself if the native item appears.

### Why model switching has two paths

An existing task has a stable identifier and supported settings update/notification path. A new unsent task does not. In the statically inspected Codex `26.825.51511` build `7377` sources, the official no-task controls update renderer draft state, profile-aware defaults, managed-default handling, and prewarmed-task invalidation. Proxying those controls follows that path—including its deliberate prewarmed-task discard/rebuild—without inventing internal state; it does not promise preservation of an earlier prewarm or cache hit. The public `config/batchWrite` method alone is not an equivalent fallback for the already-open composer because the inspected method does not expose the renderer-local draft update or private prewarm-manager call.

## Default settings versus the accepted test state

Code defaults are:

| Field | Default |
| --- | --- |
| Enabled | `true` |
| Visible models | Sol, Terra, Luna |
| Preferred placement | `top` |
| Appearance | `dark` |
| Revision | `0` |

The live acceptance machine may use a different persisted snapshot. Personal preference values are not published; code defaults remain unchanged.

## Superseded assumptions

The screenshot-derived 42-pixel iframe top inset is explicitly superseded. It placed the CoPicker heading at `y=42` because the host incorrectly covered the entire right pane from `y=0`, and it inherited a 32-pixel `text-2xl` line height. The official page actually uses a 46-pixel toolbar plus a 20-pixel scroll inset and a 28.8-pixel heading line height. Renderer `0.12.8` fixes the host boundary and line-height source.

Historical QA records may retain the 42-pixel pass to explain the iteration, but must label it superseded and must not present it as current acceptance.

## Change and acceptance protocol

The owner-authorized privacy maintenance on 2026-09-13 rewrote historical commits and reissued affected tags. Current source references below and in companion guides use the rewritten IDs; runtime contents and acceptance meaning are unchanged. See [source-sharing.md](source-sharing.md) before publishing or reusing an older clone.

Any change to a requirement, model matrix, geometry, settings behavior, selector, version, installation path, or safety boundary must:

1. name the affected `CP-*` requirement IDs;
2. distinguish source work, offline validation, installation, live injection, restart, UI acceptance, push, tag, and release;
3. update the source, this baseline, focused guides, and documentation contract tests together;
4. preserve unrelated accepted behavior;
5. record the exact CoPicker ref and Codex version/build;
6. re-measure current official DOM when host geometry is involved;
7. obtain explicit authorization before live mutation or publication;
8. keep the previous accepted runtime commit available for rollback.
