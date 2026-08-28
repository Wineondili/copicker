# Using CoPicker

This guide describes the full-feature `v0.99.0` pre-release with CLI/plugin `0.99.0` and renderer `0.12.8`, plus the current `main` renderer candidate `0.12.10`. The published renderer behavior was live-accepted at runtime commit `c0343d4` under the earlier CLI label `0.12.0-dev`, against Codex `26.820.60940` build `7119`. Intermediate renderer `0.12.9` repaired no-task routing in a user test but did not repair rapid continuous release. Renderer `0.12.10` addresses the remaining capture-phase event boundary and still requires a separate installed/live pass. See [accepted-baseline.md](accepted-baseline.md) for exact requirement IDs and measurements.

CoPicker appears only with the official compact first-level model/reasoning picker. It does not replace the full-width model list opened from the composer input.

## Before opening the selector

CoPicker must already be present in the current Codex process through one of these paths:

- the opt-in user LaunchAgent installed by `./script/install.sh`;
- a manual current-process injection with `./script/build_and_run.sh --inject`.

The automatic path injects once for each new Codex PID. The manual path lasts only until that Codex process exits.

Check automatic state without opening Inspector or changing Codex:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
```

`LaunchAgent service: loaded` means the watcher is active. `Last result: injection-succeeded` means the latest handled PID confirmed the hook. `waiting-for-codex` is normal when Codex is closed.

## Open CoPicker

1. Open an existing Codex task or a new unsent task.
2. Click the compact composer control that shows the current model and effort, such as `5.6 Sol / High`.
3. Wait for the official first-level picker to open. CoPicker animates into its own non-overlapping popover at the configured top, left, or right position.

`Ctrl+Shift+M` opens a separate full-width composer model list. It does not activate CoPicker. When that input-origin list is visible behind the rail, it is intentionally not treated as an obstacle.

## Pointer and keyboard controls

| Input | Action |
| --- | --- |
| Click a dot or cell | Preview on press and commit that model/effort once on release |
| Drag on the rail | Preview model/effort changes without writing; commit the final release cell once |
| Up / Down | Move through the model rows enabled in settings |
| Left / Right | Decrease or increase effort |
| Space | Toggle Fast when supported by the selected row |
| Escape | Close the official picker and CoPicker |

Keyboard movement is coalesced for 120 milliseconds so rapid arrows do not send redundant settings writes. Pointer release and Space commit immediately. On current `main`, CoPicker intercepts only pointer events whose composed path belongs to its stage at window capture phase; this keeps Codex's host menus from swallowing a fast terminal event. Drag classification uses both delivered move events and the final release displacement, so a rapid drag should not need to pause before release. A cancelled drag restores the selection present before the gesture and sends no settings write.

In an existing task, CoPicker waits for the official settings notification. In a new unsent task, it waits for the official picker controls and trigger to confirm the complete result. A failed or unavailable selection restores the last confirmed rail state.

## Supported selections

The row order is fixed. Settings may hide rows but must retain at least one.

| Row | Efforts | Fast | Notes |
| --- | --- | --- | --- |
| GPT-5.6 Sol | Light, Medium, High, Extra High, Max, Ultra | Yes | Rail label `Sol` |
| GPT-5.6 Terra | Light, Medium, High, Extra High, Max, Ultra | Yes | Rail label `Terra` |
| GPT-5.6 Luna | Light, Medium, High, Extra High, Max | Yes | No Ultra cell |
| Daybreak Blue | Light, Medium, High, Extra High, Max, Ultra | No | Rail label `Daybreak`; theme-adaptive blue |
| GPT-5.5 | Light, Medium, High, Extra High | Yes | No Max or Ultra |
| GPT-5.3 Codex Spark | Light, Medium, High, Extra High | No | Rail label `Codex Spark`; no Max or Ultra |

Daybreak and Codex Spark clear Fast when selected. Space and pointer Fast toggles are disabled on those rows. Returning to a Fast-capable row remains on the normal tier until Fast is explicitly enabled again.

Daybreak Blue may require approved Codex Trusted Access for Cyber and the network access required by that model. Codex Spark may require an eligible ChatGPT Pro subscription. Enabling a row in CoPicker does not grant account access.

Model IDs, effort availability/order, and the service-tier ID/order named `Fast` are resolved from the current account's official Codex `model/list` catalog. CoPicker stores no account-specific model or tier ID.

If the official picker is on an adapted model that is hidden in settings, CoPicker recognizes and names it but has no active selectable cell. Select a visible cell to leave that state.

GPT-5.4, GPT-5.4 Mini, and every other unadapted model display centered gray `Other`. In `Other`, the rail has no active fill, thumb, effort label, or Fast indicator. Select a visible available cell to switch to an adapted model.

If the current catalog lacks a requested model, effort, or Fast tier, CoPicker refuses the update and restores the confirmed state.

## Existing tasks, new tasks, and compaction

### Existing task

When a valid task identifier exists, CoPicker:

1. resolves the requested catalog IDs;
2. calls `thread/settings/update` for that task;
3. waits for `thread/settings/updated`;
4. commits the UI only after confirmation.

### New unsent task

Before the first message creates a task identifier for the currently open composer, CoPicker uses Codex's exact official Model, Effort, and Speed controls. It resolves task state only from that composer's marker, never from retained background task DOM or a cached previous task. This preserves Codex's own default-settings, cache, and prewarmed-task workflow.

The fallback is deliberately strict. It requires the accepted trigger, Model row, catalog-backed ordered Effort options, ordered Speed options, and final official trigger confirmation. If any anchor or option is missing or ambiguous, it fails closed. After Codex creates a task ID, CoPicker returns to the direct task path.

### Compaction

Changing model or effort may trigger the same compaction as the equivalent official picker action. This is expected Codex behavior. CoPicker does not add a separate compaction step.

## Placement and nested menus

The preferred base may be top, left, or right. Every candidate keeps a 12-pixel gap from the official picker and a 12-pixel viewport inset.

Opening an official nested Model or Effort menu does not close CoPicker. The rail moves to a non-overlapping rectangle and the submenu remains usable.

Avoidance is latched to prevent flashing:

- repeated mutations do not move the rail while its current rectangle remains valid;
- in top mode, an avoided position stays fixed for that official-picker session;
- in left/right mode, a raised or shifted rail returns only after the pointer has visited and then left CoPicker, the base rectangle is clear, and the 420-millisecond return delay expires;
- the rail never restores while the pointer is inside it;
- right placement clamps leftward at the screen edge and may raise or shift left depending on primary/nested overlap.

Open and close use a 180-millisecond opacity, scale, and small vertical-motion transition. The renderer suppresses stale-coordinate transition on first placement so the rail does not fly in from a remote previous position.

## Closing behavior

CoPicker closes when:

- the official first-level picker closes;
- the user clicks outside both surfaces;
- Escape is pressed;
- the combined picker loses focus;
- the document becomes hidden;
- the Codex window blurs.

Clicks and drags inside CoPicker count as part of the combined interaction region and must not dismiss the official picker.

## Settings

On the full-feature baseline, open **Settings → Integrations → CoPicker**. The entry appears after the built-in Plugins/Browser area and uses the model-grid icon. Only one native or compatibility-fallback entry is shown.

Available settings:

- enable or disable CoPicker;
- show/hide each adapted model while retaining one;
- prefer top, left, or right placement;
- follow Codex, follow macOS, or force light/dark appearance.

The page title is `CoPicker`; the first group is `常规`. **Apply now** sits directly below Enable CoPicker. The page follows the official scroll viewport, content width, heading, group, card, switch, segmented-control, and action geometry recorded in [accepted-baseline.md](accepted-baseline.md#accepted-native-settings-measurements).

Settings save automatically. The normal effect boundary is the next process injection, usually the next time Codex opens. After the save finishes, **Apply now** injects the persisted snapshot into the current process without restarting Codex. If Apply now fails, the saved snapshot remains available for the next normal injection.

Autosave/read operations do not open Inspector. Apply now is the only settings-page action that deliberately invokes the guarded current-process injection path.

Disabling CoPicker means a future watcher PID does not open Inspector. Applying the disabled snapshot to the current process removes active rail behavior from that renderer.

## Appearance

- `Follow Codex`: use the current Codex document theme.
- `Follow system`: use macOS color scheme.
- `Light`: use exact `rgb(255, 255, 255)` rail background and dark text.
- `Dark`: use `rgb(44, 44, 44)` rail background and the accepted dark tokens.

Model fills remain colored in both modes. Daybreak blue changes for light/dark contrast.

## Troubleshooting

### CoPicker does not appear

1. Confirm that the compact first-level picker is open, not the full-width list.
2. Check watcher/injection status:

   ```bash
   "$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
   ```

3. Confirm the installed CLI/watcher version matches the intended ref.
4. Confirm the reported Codex version/build is compatible with the baseline you installed.
5. Check Inspector idle state:

   ```bash
   lsof -nP -iTCP:9229 -sTCP:LISTEN
   ```

6. Review [installation troubleshooting](installation.md#troubleshooting). Do not repeatedly enable autostart to bypass an incompatible or busy result.

### CoPicker setting is missing or duplicated

- Reopen Codex after the current installer has registered the plugin.
- Verify `copicker-local` and `copicker@copicker-local` through the Codex CLI.
- Confirm only one native/fallback navigation item exists.
- Reinstall the same exact ref if the stable plugin package and installed executable versions differ.

### A setting saved but did not change the current rail

That is the default design. Saved values apply during the next injection. Reopen Codex, or wait for saving to finish and use **Apply now**.

### Selection restores itself

The requested model/effort/Fast option was unavailable, an official anchor/confirmation was ambiguous, or the app-server update failed. CoPicker restores the last confirmed state instead of leaving an unconfirmed visual selection.

## Privacy boundary

CoPicker does not modify or re-sign the official app. The renderer makes no external network request and does not read, log, or persist conversation content, composer content, task contents/IDs, authentication data, cookies, or tokens.

The settings file contains only CoPicker preferences, schema, and revision. The compatibility points remain private and version-sensitive; missing required anchors fail closed.
