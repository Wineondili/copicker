# Changelog

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
