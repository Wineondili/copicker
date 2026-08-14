# Changelog

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
