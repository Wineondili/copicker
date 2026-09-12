# Using CoPicker

This guide covers the published `v0.99.0` pre-release (renderer `0.12.8`) and current `main` renderer `0.12.16`. The published runtime remains accepted at `c0343d4`, under CLI label `0.12.0-dev`, on Codex build `7119`. The current renderer adapts the model-list and strength-slider layout on Codex `26.908.40834` build `8881`; bounded live switches passed and the user confirmed sending with correct model routing. Installation, restart, and publication remain separate gates. See [accepted-baseline.md](accepted-baseline.md) for exact requirements and historical results.

On builds `8378` and `8881`, an explicit selection uses the official model radio row, model-specific reasoning slider, and Fast checkbox. Idle synchronization reads the already-mounted checked state without opening flyouts. Default appears as `Default` and has no active rail cell. Astra is available in CoPicker's model visibility settings, with six reasoning levels and catalog-resolved Fast; existing visibility preferences are preserved. Luna retains the five levels exposed by build `8881`'s native picker. An unrelated unselected native model does not disable supported rows; an unknown selected model still fails closed. The three-flyout constraints below describe the legacy build-`7377` fallback.

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
| Click a dot or cell | Smoothly preview on press and commit that model/effort once on release |
| Drag on the rail | Smoothly preview model/effort changes without writing; commit the final release cell once |
| Up / Down | Move through the model rows enabled in settings |
| Left / Right | Decrease or increase effort |
| Space | Toggle Fast when supported by the selected row |
| Escape | Close the official picker and CoPicker |

Click and drag previews use the original 240-millisecond fill/thumb positional transition. That animation is visual only: pointer release and Space still commit immediately, and release recomputes the exact final cell independently of the animated position. Keyboard movement is coalesced for 120 milliseconds so rapid arrows do not send redundant settings writes. Drag classification uses both delivered move events and the final release displacement, so a rapid drag does not need to pause before release. A cancelled drag restores the selection present before the gesture and sends no settings write.

In an existing task, CoPicker waits for a strictly newer official settings notification than the one observed before dispatch. Explicit null and the live-observed official `"default"` service tier both mean Standard; unrelated tiers remain unsupported. In a new unsent task, CoPicker waits for the official picker controls to confirm the complete result through the trigger and, when responsive layout hides its model label, the exact checked Model leaf. A failure before dispatch or official-control mutation restores the last confirmed rail state. If an existing-task request was dispatched but no fresh confirmation arrives, the result is uncertain, so CoPicker invalidates the confirmation and displays `Other` instead of claiming a rollback.

## Supported selections

The row order is fixed. Settings may hide rows but must retain at least one.

| Row | Efforts | Fast | Notes |
| --- | --- | --- | --- |
| GPT-6 Astra | Light, Medium, High, Extra High, Max, Ultra | Yes | Added in candidate `0.12.15`; rail label `Astra` |
| GPT-5.6 Sol | Light, Medium, High, Extra High, Max, Ultra | Yes | Rail label `Sol` |
| GPT-5.6 Terra | Light, Medium, High, Extra High, Max, Ultra | Yes | Rail label `Terra` |
| GPT-5.6 Luna | Light, Medium, High, Extra High, Max | Yes | No Ultra cell |
| Daybreak Blue | Light, Medium, High, Extra High, Max, Ultra | No | Rail label `Daybreak`; theme-adaptive blue |
| GPT-5.5 | Light, Medium, High, Extra High | Yes | No Max or Ultra |
| GPT-5.3 Codex Spark | Light, Medium, High, Extra High | No | Rail label `Codex Spark`; no Max or Ultra |

Daybreak and Codex Spark clear Fast when selected. Space and pointer Fast toggles are disabled on those rows. Returning to a Fast-capable row remains on the normal tier until Fast is explicitly enabled again.

For renderer `0.12.14` on Codex build `7377`, a separate Daybreak program checkbox and a normal legacy Daybreak Model leaf are different topologies. When the separate program control is present, CoPicker rejects the Daybreak row and permits ordinary model commits only while the exact program is explicitly off. When one exact legacy Daybreak Model leaf is present—as observed on the current account—it follows the normal model-backed selection route. If neither exact topology is observable, mutation fails closed because the renderer cannot distinguish no entitlement from unresolved verified access. Supporting the separate program still requires a base-model/effort policy.

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

Before the first message creates a task identifier for the currently open composer, CoPicker uses Codex's exact official Model, Effort, and Speed controls. It resolves task state only from that composer's marker, never from retained background task DOM or a cached previous task. It follows the trigger-owned primary menu into the visible active panel, binds each portalled flyout through `aria-controls`, and selects only owned semantic menu leaves. This follows Codex's renderer draft, profile-aware default, managed-default, and prewarmed-task workflow. The official workflow deliberately invalidates and rebuilds prewarmed tasks after a selection change, so CoPicker does not promise to preserve a prior prewarm or cache hit; the goal is that the first created task uses the selected settings.

The fallback is deliberately strict. While the no-task composer is idle, CoPicker does not open Model, Effort, or Speed for passive synchronization; the rail may initially display `Other`. An explicit rail selection starts one bounded transaction. It supports the exact current three-flyout power and non-Power Work layouts plus the exact catalog-sized alternate flat-effort layout, excludes one leading row only when it is explicitly labeled as the Daybreak program, requires exact visible model-label equality plus catalog-backed ordered Model/Effort/Speed options, and preflights one exact usable target Model leaf. When responsive layout hides the compact trigger's model text, the flat-effort path resolves the current catalog entry only from one exact Model row owned by the same primary surface. Before target mutation it captures two matching current snapshots from the exact checked Model leaf, trigger effort, and checked Speed leaf—including the Speed index, count, and semantic signature—and proves that the current Model/Effort controls remain selectable for rollback. A hidden current model is rejected because its temporary selected leaf may disappear after switching. Every click remains scoped to the same composer while it has no task ID. A responsive icon-only trigger is confirmed through the exact checked target Model leaf. A missing, false, or conflicting compact Fast marker is unknown. Fast can be confirmed from the checked compact control; an initially prechecked Standard remains provisional and displays `Other` because build `7377` can display Standard while carrying an unsupported raw tier. A Standard commit therefore requires an observed catalog-resolved Fast-to-Standard transition. That transition intentionally replaces the unknowable raw tier with real Standard before target mutation. The requested tier is first established on the current model and then reapplied on the target; if the current model has no usable Speed/Fast transition, the switch fails first. A later failure restores and recaptures the captured Model/Effort/tier index, including exact `Ultrafast`; an initially ambiguous Standard restores the normalized Standard baseline, while failed rollback invalidates state instead of reusing a stale selection. CoPicker clears the current official tier before switching to a model-backed non-Fast target such as Codex Spark and never matches `Fast` by suffix. If Codex cannot represent the selected combination in compact power view, CoPicker leaves Advanced open instead of activating Reset. Proxy-owned flyout changes do not trigger another passive read, and a confirmed result survives same-composer trigger remounts. Missing or ambiguous controls fail closed. After Codex creates a task ID, CoPicker returns to the direct task path.

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

### Selection restores itself or becomes `Other`

If the requested model/effort/Fast option is unavailable or an official anchor is ambiguous before mutation, CoPicker restores the last confirmed state instead of leaving an unconfirmed preview. If an existing-task settings request was already dispatched but no strictly newer confirmation arrives, the server result is uncertain; CoPicker clears confirmation and displays `Other` rather than falsely reporting that the prior value was restored.

## Privacy boundary

CoPicker does not modify or re-sign the official app. The renderer makes no external network request and does not read, log, or persist conversation content, composer content, task contents/IDs, authentication data, cookies, or tokens.

The settings file contains only CoPicker preferences, schema, and revision. The compatibility points remain private and version-sensitive; missing required anchors fail closed.
