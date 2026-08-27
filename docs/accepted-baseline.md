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
accepted_runtime_commit=c0343d4d76e4094cd99ba9ff7fe0fb71fc3edbbb
accepted_live_cli_version=0.12.0-dev
published_release_tag=v0.99.0
published_release_commit=v0.99.0^{commit}
cli_version=0.99.0
renderer_version=0.12.8
settings_schema_version=1
settings_resource_uri=ui://copicker/settings/v2.html
marketplace_name=copicker-local
plugin_id=copicker@copicker-local
accepted_codex_version=26.820.60940
accepted_codex_build=7119
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
| Runtime-code anchor | `c0343d4d76e4094cd99ba9ff7fe0fb71fc3edbbb` | Installed, live-reviewed, and user-accepted |
| CLI/plugin release | `0.99.0` | Current source-distributed pre-release package |
| Renderer compatibility | `0.12.8` | Current accepted in-memory renderer/settings payload |
| Settings schema | `1` | Current persisted preference schema |
| Settings resource | `ui://copicker/settings/v2.html` | Current MCP App document |
| Public GitHub release | `v0.99.0` | Full-feature immutable source pre-release; the annotated tag resolves its exact package commit |
| Live-accepted CLI label | `0.12.0-dev` | Version string present when the unchanged runtime behavior was installed and accepted |
| Codex desktop | `26.820.60940` build `7119` | Exact build for current live acceptance |
| Official bundle | `/Applications/ChatGPT.app`, `com.openai.codex` | Read-only status verified |
| Architecture | `arm64` | Live verified |
| Installed watcher evidence | `0.12.0-dev`, loaded, `injection-succeeded` | Verified for the accepted Codex PID before the release-only version bump |
| Inspector idle state | no listener on `127.0.0.1:9229` | Verified after inspection/injection |

`v0.99.0` packages the complete six-model, persistent-settings, placement-latching, no-task-selection, and native-settings-geometry source. Its renderer behavior is unchanged from the live-accepted runtime at `c0343d4`; the release preparation changes distribution metadata, tests, and documentation only. The exact release commit is intentionally resolved through the immutable annotated tag expression `v0.99.0^{commit}` instead of attempting to embed a commit's own hash inside itself.

The live acceptance evidence remains tied to CLI label `0.12.0-dev` and Codex build `7119`. The `0.99.0` package passed the complete offline/release-build gate but is not described as a second live installation or restart acceptance.

## Product requirements

### Activation and ownership

- **CP-ACT-001 — First-level picker only.** CoPicker appears when the compact composer model/reasoning control opens Codex's first-level picker.
- **CP-ACT-002 — Input-origin list excluded.** The full-width list opened through `Ctrl+Shift+M` or from the composer input does not activate CoPicker and is not a placement obstacle.
- **CP-ACT-003 — Independent DOM.** CoPicker is appended to `document.body` in its own host and Shadow DOM. It is never inserted into or made a child of Codex's official menu.
- **CP-ACT-004 — Synchronized lifecycle.** When the official first-level picker opens, CoPicker opens. When that picker closes, the document hides, the window blurs, Escape is pressed, or the combined picker loses focus, CoPicker closes.
- **CP-ACT-005 — Combined interaction region.** Pointer interaction inside CoPicker must not dismiss the official picker.

### Selection and keyboard behavior

- **CP-SEL-001 — Two-dimensional selection.** The vertical axis selects an enabled model row; the horizontal axis selects a supported reasoning effort.
- **CP-SEL-002 — Pointer behavior.** Clicking a dot/cell and horizontal dragging select the corresponding model and effort.
- **CP-SEL-003 — Keyboard behavior.** Up/Down move between enabled rows, Left/Right move between efforts, and Space toggles Fast only when the selected model supports it.
- **CP-SEL-004 — Confirmed commits.** Rapid keyboard input is coalesced for 120 milliseconds. Pointer release and Space commit immediately. Failed changes restore the last confirmed state.
- **CP-SEL-005 — Catalog authority.** Account-specific model IDs, effort availability, and the service-tier ID/order named `Fast` are resolved from Codex `model/list`; they are not hard-coded or persisted.
- **CP-SEL-006 — Existing task path.** With an active task identifier, changes use `thread/settings/update` and require `thread/settings/updated` confirmation for that task.
- **CP-SEL-007 — New unsent task path.** Before a task identifier exists, CoPicker proxies only the exact official Model, Effort, and Speed controls and requires the official trigger state to confirm the full selection. It does not invent a task ID or write raw config keys.
- **CP-SEL-008 — Normal compaction.** A model or effort change may cause the same compaction as the equivalent official Codex action. CoPicker must not label that as its own defect.

### Supported model matrix

The selectable and rendered order is fixed.

| Order | Persisted key | Official names matched | Rail label | Efforts | Fast | Fill gradient | Dark label gradient |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | `sol` | `GPT-5.6-Sol`, `GPT-5.6 Sol` | `Sol` | low, medium, high, xhigh, max, ultra | Yes | `#FBE1E5 → #F7C6CC` | `#f1c0c9 → #edb7c1` |
| 2 | `terra` | `GPT-5.6-Terra`, `GPT-5.6 Terra` | `Terra` | low, medium, high, xhigh, max, ultra | Yes | `#FFF1CF → #FFE6B8` | `#f0d69b → #ebcd90` |
| 3 | `luna` | `GPT-5.6-Luna`, `GPT-5.6 Luna` | `Luna` | low, medium, high, xhigh, max | Yes | `#EEF9F1 → #DDF3E4` | `#c1e2cb → #b7dcc3` |
| 4 | `daybreak-blue` | `Daybreak Blue`, `GPT Daybreak Blue` | `Daybreak` | low, medium, high, xhigh, max, ultra | No | `#DDEEFF → #C2E0FF` | `#afd2f2 → #9bc5eb` |
| 5 | `gpt-5.5` | `GPT-5.5` | `GPT-5.5` | low, medium, high, xhigh | Yes | `#E3EDFF → #CADCFF` | `#bad0f4 → #a9c3ee` |
| 6 | `gpt-5.3-codex-spark` | `GPT-5.3 Codex Spark`, `GPT-5.3-Codex-Spark` | `Codex Spark` | low, medium, high, xhigh | No | `#F0E7FF → #E0D1FA` | `#d4c0f2 → #c8afea` |

- **CP-MOD-001 — At least one visible row.** Settings may hide any adapted row but must retain at least one.
- **CP-MOD-002 — Recognition is wider than visibility.** An adapted model hidden from settings is still recognized from the official trigger; no rail cell is active until a visible cell is selected.
- **CP-MOD-003 — Unsupported state.** GPT-5.4, GPT-5.4 Mini, and every other unadapted model show centered gray `Other`; no rail fill, thumb, effort label, or Fast indicator is active.
- **CP-MOD-004 — Non-Fast rows.** Daybreak and Codex Spark clear Fast when selected, cannot toggle it, and do not preserve a prior Fast state when leaving and returning.
- **CP-MOD-005 — Daybreak presentation.** The rail omits `Blue`; `Daybreak` uses theme-adaptive blue (`#70b9ff` dark, `#176fbd` light).
- **CP-MOD-006 — Access notices.** Daybreak may require Codex Trusted Access for Cyber and necessary network access. Codex Spark may require an eligible ChatGPT Pro subscription. Settings do not grant either entitlement.

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
| Base three-row host | `579.5 × 269.5` equivalent inner geometry | `289.75 × 134.75` CSS px |
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

The top row contains `Faster` at the left, the moving model/effort/Fast status, and `Smarter` at the right. The former bottom model-plus-effort status row remains hidden. Endpoint labels hide temporarily if the moving effort label would overlap them. Text aligns to the bottom of the top-label row.

The selection fill begins with a rounded left cap. The right edge and thumb geometry must not expose a second fill strip below the rail or clip the first cell's rounded cap. Equal horizontal and vertical center spacing is an accepted visual invariant.

## Accepted native settings measurements

These values were read directly from `getBoundingClientRect()` and `getComputedStyle()` in the running official General settings page. They were not inferred from screenshots.

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

The accepted implementation mirrors the structure, not a fixed window coordinate:

1. detect the official full-width `overflow-y: auto|scroll` viewport inside the right settings panel;
2. position the CoPicker host to that viewport rectangle;
3. give the iframe a 20-pixel body inset on all sides;
4. center a `max-width: 768px` content column;
5. use a 24-pixel page heading with unitless `1.2` line height;
6. keep 32 pixels below the page heading and 40 pixels between groups.

This yields the same `y=66` heading and `70.3px` heading-to-General alignment at the measured window size while continuing to adapt to a different sidebar width, window size, or zoom.

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
- first-level surfaces: `[data-radix-menu-content], [role="menu"]` containing `[data-reasoning-slider]` and current model-picker controls;
- nested obstacles: `[data-composer-overlay-floating-ui]`, `button[data-list-navigation-item]`, and `[data-model-picker-model-row]` under the bounded rules above;
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

An existing task has a stable identifier and supported settings update/notification path. A new unsent task does not. Proxying Codex's official controls in the no-task state preserves Codex's own defaults, cache, and prewarmed-task behavior without inventing internal state.

## Default settings versus the accepted test state

Code defaults are:

| Field | Default |
| --- | --- |
| Enabled | `true` |
| Visible models | Sol, Terra, Luna |
| Preferred placement | `top` |
| Appearance | `dark` |
| Revision | `0` |

The live acceptance machine may use a different persisted snapshot. At final status inspection it had all six models visible, preferred placement `left`, and appearance `codex`. That machine-specific state is evidence, not a change to code defaults.

## Superseded assumptions

The screenshot-derived 42-pixel iframe top inset is explicitly superseded. It placed the CoPicker heading at `y=42` because the host incorrectly covered the entire right pane from `y=0`, and it inherited a 32-pixel `text-2xl` line height. The official page actually uses a 46-pixel toolbar plus a 20-pixel scroll inset and a 28.8-pixel heading line height. Renderer `0.12.8` fixes the host boundary and line-height source.

Historical QA records may retain the 42-pixel pass to explain the iteration, but must label it superseded and must not present it as current acceptance.

## Change and acceptance protocol

Any change to a requirement, model matrix, geometry, settings behavior, selector, version, installation path, or safety boundary must:

1. name the affected `CP-*` requirement IDs;
2. distinguish source work, offline validation, installation, live injection, restart, UI acceptance, push, tag, and release;
3. update the source, this baseline, focused guides, and documentation contract tests together;
4. preserve unrelated accepted behavior;
5. record the exact CoPicker ref and Codex version/build;
6. re-measure current official DOM when host geometry is involved;
7. obtain explicit authorization before live mutation or publication;
8. keep the previous accepted runtime commit available for rollback.
