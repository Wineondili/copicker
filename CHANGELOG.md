# Changelog

## 2026-08-27 01:27:58 +0800

- Added a clearly labeled **立即应用** action to both the injected settings fallback and native MCP App controller while retaining automatic persistence and explicit next-start/next-injection default behavior.
- Disabled immediate application during loading, autosave, conflicts, and active application; added bounded current-process wait time, one-click retry, and separate success and fallback messaging without restarting Codex.
- Advanced the renderer compatibility identifier to `0.12.2`, expanded settings and payload contracts, documented the only Inspector-opening settings action, and browser-verified CSP loading, save gating, one apply call, success feedback, layout, and a clean console with a local mock rather than a live injection.

## 2026-08-27 01:19:20 +0800

- Added an app-only `copicker_settings_apply` MCP tool that runs only through an explicit settings action and reuses the existing guarded `copicker inject` command for the current Codex process.
- Kept the live path fail-closed when no apply handler is installed, returned structured current-process success and error results, and covered tool visibility, explicit invocation, and unavailable-host behavior without signaling or attaching to Codex in tests.

## 2026-08-27 01:07:06 +0800

- Fixed the injected settings fallback remaining permanently at `正在读取设置…` because Codex's top-level CSP blocks inline scripts inherited by `about:srcdoc` frames.
- Moved fallback form loading, validation, saving, stale-write handling, and retry behavior into the parent injection layer while keeping the frame script-disabled, same-origin, network-free, and isolated from the native MCP App controller.
- Advanced the renderer compatibility identifier to `0.12.1` so reinstalling replaces the already injected stalled `0.12.0` settings integration in the current or next Codex process.

## 2026-08-27 00:33:03 +0800

- Added an injected CoPicker settings-sidebar fallback for Codex builds that parse local MCP settings entrypoints but hide them behind a remote plugin allowlist, while automatically yielding when a native CoPicker entry is available.
- Reused the sandboxed, network-free settings document and the existing native preference store through `thread/loaded/list` and `mcpServer/tool/call`, without adding a port, helper process, alternate settings file, or application-bundle modification.
- Bundled the fallback settings document with every renderer injection, kept the entry available when the model rail itself is disabled, preserved concurrent-write conflicts as standard MCP error tool results, expanded removal cleanup and compatibility contracts, and documented the native/fallback boundary.

## 2026-08-26 22:47:24 +0800

- Connected persisted settings to manual and automatic injection, added read-only status reporting, and made a disabled watcher record `settings-disabled` without opening Inspector for a new Codex process.
- Added configurable Sol, Terra, Luna, Daybreak, GPT-5.5, and Codex Spark rows with exact effort counts, fixed display order, right-aligned labels, hidden-model recognition, and account-access guidance while leaving GPT-5.4 and GPT-5.4 Mini as `Other`.
- Made Daybreak and Codex Spark explicitly non-Fast, clearing Fast when either is selected and disabling their Fast interactions; added theme-adaptive Daybreak blue text and exact-white light appearance without changing the accepted colored fills.
- Added latched top, left, and right placement with viewport clamping, obstacle-aware vertical and horizontal avoidance, and pointer-gated restoration so repeated submenu mutations do not make the rail oscillate.
- Added a stable local plugin marketplace installation path, advanced the development package to `0.12.0-dev`, and expanded offline contracts, release-build validation, settings documentation, and cross-device installation guidance.

## 2026-08-26 22:17:02 +0800

- Replaced the placeholder settings shell with an accessible, network-free MCP App for CoPicker enablement, supported-model visibility, top/left/right placement, and Codex/system/light/dark appearance preferences.
- Added authoritative read/save synchronization, queued autosaves, stale-window conflict recovery, a last-visible-model guard, Spark subscription guidance, and next-injection status messaging.
- Advanced the versioned settings resource to `ui://copicker/settings/v2.html` and added offline HTML, JavaScript syntax, privacy, and control-contract coverage.

## 2026-08-26 22:11:59 +0800

- Added versioned persistent CoPicker settings under the user Application Support directory with atomic `0600` writes, normalized model visibility, and optimistic revision checks.
- Split the app-only settings surface into a read/render tool and an idempotent save tool, returning authoritative snapshots and current state on stale-write conflicts.

## 2026-08-26 21:56:53 +0800

- Added a private stdio MCP server mode with an app-only `CoPicker` settings entrypoint, versioned MCP App resource, exact empty network allowlists, and themed data-URI server icons.
- Added a transparent, network-free settings shell, pure JSON-RPC protocol coverage, plugin-package contract tests, release-bundle verification, and a documented boundary for the later settings and installation phases.

## 2026-08-26 21:52:34 +0800

- Added a distributable CoPicker plugin package with an MCP server launcher, repository metadata, and a validated Codex plugin manifest.
- Preserved the supplied model-picker grid SVG as the source asset and added explicit dark-on-light and light-on-dark variants for reliable host rendering.

## 2026-08-26 14:15:42 +0800

- Added a focused user guide for opening Copicker, pointer and keyboard controls, supported model and effort states, Fast behavior, task requirements, dismissal, and interaction troubleshooting.
- Expanded cross-device installation documentation with environment checks, signature and permission behavior, same-version reinstall, clean-tag upgrades, interrupted-install recovery, asynchronous watcher-version verification, and complete uninstall steps.
- Added a SwiftPM development handoff covering branch setup, package structure, offline and live command boundaries, renderer compatibility contracts, resource packaging, cross-device gates, release discipline, and current license status.
- Replaced machine-local temporary screenshot paths in design QA with explicit historical provenance and linked the new documentation from the repository index and agent context.

## 2026-08-26 13:29:37 +0800

- Corrected the public pre-release baseline from the mistakenly published `0.9.0` version to `0.11.0`, preserving monotonic version ordering after the historical `v0.10.1-dev` development snapshot.
- Updated release metadata, tests, installation commands, and cross-device documentation to pin `v0.11.0`; the renderer compatibility identifier remains `0.9.3`.
- Retired the mistaken `v0.9.0` GitHub pre-release and tag as part of the corrected publication while retaining its commit in repository history.

## 2026-08-26 11:32:40 +0800

- Established `0.9.0` as the public pre-release baseline while retaining `v0.10.1-dev` as an immutable historical development snapshot and keeping renderer compatibility identifier `0.9.3` unchanged.
- Added a tagged-source installation entrypoint that builds a native SwiftPM release executable, runs the read-only Codex compatibility preflight, and explicitly installs the user LaunchAgent without restarting or modifying Codex.
- Added public cross-device documentation for prerequisites, exact-tag installation, structured verification, upgrades, managed paths, rollback, Inspector closure, and privacy-safe troubleshooting.
- Revalidated the release build and existing automatic-injection state against Codex `26.818.41705` build `6971` on Apple silicon.

## 2026-08-19 08:53:46 +0800

- Fixed the login-time Codex/Copicker startup race by adding a five-second startup grace period and retrying bounded Inspector target timeouts.
- Added fail-closed listener ownership verification so the watcher can recover an Inspector opened late by its own timed-out signal only when `lsof` confirms that the expected Codex PID is the sole listener; unknown or pre-existing Inspector endpoints remain blocked.
- Added Inspector ownership parsing tests, documented the recovery behavior, and advanced the CLI version to `0.10.1-dev` without changing renderer payload `0.9.3`.

## 2026-08-16 02:32:22 +0800

- Added opt-in `copicker autostart enable`, `disable`, `disable --remove`, and read-only `status` commands backed by a user LaunchAgent and a stable installed CLI/resource copy.
- Added the long-running `copicker watch` process with one injection per Codex PID, bounded retry for transient startup races, fail-closed Inspector and compatibility outcomes, and privacy-safe structured state.
- Refactored manual and automatic injection through one confirmed installer path, kept the default command read-only, removed the build script's broad `pkill`, documented rollback, and advanced the CLI version to `0.10.0-dev` while retaining renderer payload `0.9.3`.

## 2026-08-16 02:27:18 +0800

- Added testable, user-scoped Copicker autostart paths for the stable CLI copy, Swift resource bundle, LaunchAgent plist, privacy-safe state file, and logs.
- Added deterministic LaunchAgent plist generation, exact managed-artifact replacement, structured autostart state persistence, and a finite retry schedule without loading or modifying the real user LaunchAgent.

## 2026-08-16 00:03:47 +0800

- Renamed the public project from Codex Model Rail to Copicker, including the Swift package, core module, CLI target, executable, metadata, documentation, and user-facing runtime messages.
- Relocated the repository to `/Users/jonas/Code/02-Public/04-Tools/CLI/copicker` while preserving its Git history.
- Retained the existing `codex-model-rail` renderer state keys, DOM host IDs, payload filename, and logging subsystem as compatibility identifiers for already injected payloads.

## 2026-08-15 22:10:20 +0800

- Restored obstacle avoidance for every visible Radix/`role="menu"` submenu attached to the first-level picker, including the reasoning-effort menu as well as nested model menus.
- Kept the input-origin full-width model list as the sole explicit non-obstacle exception through its `[data-composer-overlay-floating-ui]` ancestry.

## 2026-08-15 22:07:48 +0800

- Moved the detached Model Rail to a top-first placement strategy while preserving the approved 289.75-by-134.75-pixel internal design.
- Kept the rail visible while the nested Model Picker is open and added obstacle-aware top alignment, side fallbacks, and animated repositioning around visible `[data-model-picker-model-row]` surfaces.
- Excluded the full-width model list opened above the composer input from avoidance so it no longer displaces the rail from its normal centered top position.
- Added 180-millisecond open and close transitions while snapping initial `left` and `top` coordinates before animation, eliminating the long fly-in from the viewport origin.
- Added a centered gray `Other` label to the top row for unsupported official models while retaining the empty fill, thumb, and active-effort state.
- Live-verified top-centered placement, zero overlap with the first-level picker, and zero avoidance obstacles for the input-origin full model list against Codex `26.810.41047` build `6570`.

## 2026-08-15 21:50:03 +0800

- Connected the approved Model Rail controls to the current task through Codex's existing renderer bridge and documented `thread/settings/update` app-server method, without proxy-clicking official picker items.
- Added dynamically discovered Sol, Terra, and Luna model IDs, supported-effort validation, and Fast service-tier lookup from `model/list`, with no persisted or hard-coded account-specific identifiers.
- Added serialized pointer and keyboard commits, official `thread/settings/updated` confirmation, no-thread refusal, same-value support, and rollback to the last confirmed selection on failure.
- Extended privacy-safe diagnostics and the selector probe with bridge readiness, task-marker counts, switch state, a direct alternate-selection check, and automatic restoration of the original model, effort, and Fast state.
- Live-verified a `Sol/xhigh/Fast off` to `Terra/medium/Fast on` switch and restoration against Codex `26.810.41047` build `6570`; the accepted 289.75-by-134.75-pixel appearance remained unchanged.

## 2026-08-15 17:01:40 +0800

- Ported the accepted compact Model Rail appearance into the runtime injector at a 289.75-by-134.75-pixel footprint, including the moving model/effort/Fast labels, endpoint labels, gradients, and hidden footer.
- Added document-level arrow-key navigation and Space-based Fast toggling while the detached first-level rail is visible, with Luna limited to five effort levels.
- Live-verified the injected design against Codex `26.810.41047` and recorded user acceptance of both visual parity and keyboard behavior.

## 2026-08-15 16:43:21 +0800

- Clamped the preview fill to one full row height at the first effort stage so its 24-pixel end radius no longer collapses beneath the 56-pixel thumb.
- Preserved all later-stage fill widths and live-verified the first Sol, Terra, and Luna stages without the previously exposed colored crescent.

## 2026-08-15 03:29:30 +0800

- Matched the moving top model label's font size, weight, letter spacing, and line height exactly to the active effort label.
- Added Sol, Terra, and Luna text palettes derived from slightly darker versions of their selector fills, each with a restrained left-light-to-right-dark gradient.
- Live-verified identical 26.4-pixel font size, 650 weight, and 31.68-pixel line height between the current model and effort labels.

## 2026-08-15 03:28:02 +0800

- Removed the preview footer's model-and-effort summary and moved the current model to the left side of the active top effort label without changing the effort's dot-centered position.
- Extended endpoint collision detection across the complete model-effort-Fast group so `Faster` and `Smarter` continue to yield when the moving label group reaches them.
- Raised only the bottom edge and reduced the preview height from 159 to 134.75 pixels; live measurements confirm equal 13.5-pixel left and Luna-text bottom insets.

## 2026-08-15 03:23:50 +0800

- Extended only the preview selector's right edge by another 1.75 rendered pixels, increasing the total width from 288 to 289.75 pixels while leaving the left edge and all selector content fixed.
- Moved `Smarter` with the extended edge and live-measured matching 13.5-pixel outer insets for `Faster` and `Smarter`; the `ultra Fast` group now retains a 13.52-pixel right inset.

## 2026-08-15 03:19:22 +0800

- Moved the Fast-state label from the current-selection footer to the right side of the active effort label in the preview.
- Kept the active effort centered on its dot while giving the attached `Fast` label the same typography and the existing blue state color.
- Extended endpoint collision detection across the combined effort-and-Fast bounds so `Faster` or `Smarter` is temporarily hidden when either part overlaps it.

## 2026-08-15 03:15:55 +0800

- Expanded the preview selector shell by 8 rendered pixels exclusively on the right, increasing its width from 280 to 288 pixels while keeping the left edge and all existing selector content visually anchored.
- Moved `Smarter` with the extended right edge so its right inset continues to match the unchanged left inset of `Faster`.

## 2026-08-15 03:13:04 +0800

- Changed the smaller `Faster` and `Smarter` endpoint labels from vertical centering to bottom alignment with the active effort label while preserving their size, color, and horizontal positions.

## 2026-08-15 03:12:05 +0800

- Added `Faster` and `Smarter` endpoint labels to the preview effort row, aligned to equal left and right shell insets and vertically centered against the active effort label.
- Styled both endpoint labels one type step smaller in the same neutral gray and added per-label collision detection so only an endpoint overlapped by the active effort text is temporarily hidden.

## 2026-08-15 03:04:05 +0800

- Expanded the preview selector shell by another 4 rendered pixels above its fixed content, increasing the total preview height from 155 to 159 pixels without changing any internal element positions or spacing.

## 2026-08-15 03:02:35 +0800

- Reverted the preview-only 4-pixel active-effort-label nudge so the approved typography and label-to-stage relationship remain unchanged.
- Added 4 rendered pixels above the complete selector by expanding the rail shell from 151 to 155 pixels and anchoring its existing content and bottom edge in place.

## 2026-08-15 03:00:51 +0800

- Increased the preview-only active effort label's rendered top inset by 4 pixels, from approximately 1 pixel to 5 pixels, without moving the model rows, dot grid, or current-selection footer.

## 2026-08-15 02:59:15 +0800

- Reduced the hot-reloading tuning page to a centered Model Rail canvas by removing the surrounding header, measurements, control panel, and export surface from view.
- Retained the selector's click and drag interaction, current URL-fragment state, and automatic source refresh for direct code-driven layout iteration.

## 2026-08-15 02:57:22 +0800

- Switched the Model Rail tuning workflow back to a preview-only iteration loop so intermediate layout edits no longer require live Codex injection or picker probing.
- Added 500-millisecond source polling and automatic page reload while preserving the current URL-fragment tuning state.
- Renamed the control area to make its preview-only scope explicit and live-verified that a saved HTML change refreshes the existing Codex in-app browser tab without losing `text`, `gap`, or `top` values.

## 2026-08-15 02:34:05 +0800

- Applied the approved `MODEL_RAIL_TUNING_V1` values to the injected selector: 280-by-151-pixel preview, 0.5 component scale, 388-pixel internal stage, 64-pixel internal column step, 1.2 text scale, zero model-to-stage gap, and a -22-pixel internal effort-label offset.
- Preserved equal 32-pixel rendered horizontal and vertical dot spacing across the six Sol/Terra effort columns and five visible Luna columns.
- Added safe-area compensation around the supplied geometry without changing the outer footprint, yielding live rendered text insets of 9 pixels at the top, 17 pixels at the left, and 12 pixels at the bottom.
- Extended runtime diagnostics and payload contract coverage for typography, popover padding, and rendered text insets.
- Live-verified the 280-by-151-pixel detached popover, 194-by-88-pixel rendered stage, non-overlap placement, exact `rgb(44, 44, 44)` background, and local-only Terra/medium click behavior against Codex `26.810.41047` build `6570`.

## 2026-08-15 02:17:00 +0800

- Added a standalone local Model Rail tuning page with a preview fixed to the current 280-by-151-pixel runtime footprint.
- Changed the tuning preview to equal 32-pixel horizontal and vertical dot spacing while retaining the Sol/Terra six-level and Luna five-level geometry.
- Added synchronized range and numeric controls for global text scale, model-label-to-stage spacing, and top effort-label vertical placement.
- Added URL-fragment state, reset behavior, and copyable `MODEL_RAIL_TUNING_V1` output so approved values can be transferred exactly into the injected component.
- Verified the page in the Codex in-app browser at its native preview size, including live control updates, exact dot spacing, copied output feedback, and reset values.

## 2026-08-15 02:07:59 +0800

- Scaled the complete detached selector design to 50% while preserving the source geometry and proportional text, controls, gradients, radii, and shadows.
- Reduced the live popover footprint from 560 by 302 pixels to 280 by 151 pixels and the rendered selector stage from 360 by 176 pixels to 180 by 88 pixels.
- Updated placement diagnostics for the scaled footprint and retained non-overlap, exact RGB background, model initialization, and trusted pointer targeting at the reduced size.

## 2026-08-14 22:44:07 +0800

- Replaced the temporary model-button grid with the supplied 560-pixel two-dimensional Sol, Terra, and Luna selector inside the detached Shadow DOM popover.
- Preserved the source geometry, gradients, six effort columns, draggable thumb, keyboard movement, and Fast toggle while changing the base background to `rgb(44, 44, 44)`.
- Limited selectable cells to six efforts for Sol and Terra and five efforts for Luna, with no rows or controls for other Codex models.
- Added trigger-based initialization and an empty `Other` state with no fill, thumb, active effort label, or Fast indicator until a valid selector cell is chosen.
- Added selector-specific diagnostics and a trusted Terra/medium input probe while keeping all selection feedback local to renderer memory for this visual review.
- Live-verified a 560-by-302 body-level popover, 360-by-176 stage, 17 dots, exact RGB background, non-overlap, local Terra/medium interaction, official picker retention, and full-list suppression against Codex `26.810.41047` build `6570`.

## 2026-08-14 22:01:20 +0800

- Added a deliberately temporary 304-pixel neutral prototype card with seven local-only model buttons for interaction review.
- Added hover, pressed, keyboard-focus, and local selected-state feedback without connecting any button to Codex model selection.
- Treated the detached popover as part of the combined picker interaction region while preserving outside-click, `Escape`, document-hide, window-blur, official-close, and Figure 2 dismissal behavior.
- Added a trusted-input prototype probe and live-verified that clicking `5.6 Terra` keeps Figure 1 open and changes only the prototype selection state.
- Confirmed separate body-level parentage, seven prototype buttons, non-overlap, and unchanged official application boundaries.

## 2026-08-14 21:54:28 +0800

- Replaced the in-surface mount contract with an independent `document.body` popover scaffold that uses the first-level menu only as a positioning anchor.
- Added left, right, bottom, and top collision-free placement with a fixed gap, viewport padding, automatic side changes, and hide-on-no-fit behavior.
- Added resize and scroll repositioning while keeping all visual content intentionally disabled pending the user's specification.
- Added global full-model-list suppression so the detached popover is removed even when the first-level menu remains mounted behind Figure 2.
- Live-verified body-level parentage, separation from the official menu subtree, left-side placement, non-overlap, and removal when the seven-item full model list opens.

## 2026-08-14 21:49:31 +0800

- Removed the previous custom visual from the running Codex process and added an explicit `remove` command for future rollback.
- Proved that the first-level model/reasoning popover is anchored by the open intelligence trigger and a menu containing the reasoning slider.
- Explicitly excluded the full model-list overlay and removed the unsolicited `0.2.0` Shadow DOM visual implementation.
- Replaced the renderer payload with a non-visual `0.3.0` first-level mount-target observer pending the user's style specification.
- Added scoped first-level and full-list probe commands and verified that the corrected hook recognizes Figure 1 while creating zero visual hosts in Figure 2.

## 2026-08-14 21:39:36 +0800

- Adapted renderer injection to all frames in each Codex window and webview.
- Added scoped runtime diagnostics for current picker anchors and control labels without reading conversation or composer content.
- Added direct support for the current floating model picker and mirrored its live official controls into the Shadow DOM rail.
- Prevented observer-driven redraw loops by rendering only when the official candidate list changes.
- Live-verified a visible `0.2.0` rail with seven mirrored model controls against Codex `26.810.41047` build `6570`.
- Confirmed Inspector shutdown and verified that the untouched official application still satisfies its code-signing requirement.

## 2026-08-14 21:28:35 +0800

- Added the Shadow DOM Model Rail payload and its picker-open lifecycle.
- Added dynamic official-menu discovery, official click proxying, and `1`–`9` shortcuts.
- Added payload privacy/selector contract tests and JavaScript syntax validation in the build entrypoint.
- Documented the interaction, compatibility gates, privacy boundary, and rollback behavior.

## 2026-08-14 21:28:12 +0800

- Added installed-Codex metadata and Electron fuse inspection.
- Added safe running-process discovery and explicit SIGUSR1 Inspector activation.
- Added the loopback Inspector target client, WebSocket protocol evaluation, and shutdown scheduling.
- Added version-safe renderer injection planning and offline unit coverage.

## 2026-08-14 21:19:58 +0800

- Initialized the SwiftPM repository and CLI product structure.
- Added repository safety boundaries, build documentation, and a single build/run entrypoint.
- Added the Codex Run action and a minimal offline test target.
