# Using Copicker

Copicker appears only with the official first-level model and reasoning picker. It does not replace the full-width model list opened from the composer input.

## Before opening the selector

Copicker must already be present in the current Codex process through one of these paths:

- the opt-in user LaunchAgent installed by `./script/install.sh`;
- a manual, current-process injection with `./script/build_and_run.sh --inject`.

The automatic path injects once for each new Codex process. The manual path lasts only until that Codex process exits.

Check the automatic installation without opening Inspector or changing Codex:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
```

`LaunchAgent service: loaded` confirms that the watcher is active. `Last result: injection-succeeded` confirms the most recently handled Codex process. When Codex is not running, `waiting-for-codex` is expected.

## Open Copicker

1. Open an existing Codex task, or send the first message in a new task so Codex has created its task identifier.
2. Click the composer control that displays the current model and reasoning effort, such as `5.6 Sol / High`.
3. Wait for the official first-level model and reasoning picker to open. Copicker appears in its own popover at the configured top, left, or right position.

`Ctrl+Shift+M` opens the full-width composer model list. That list is intentionally not Copicker's activation surface.

## Controls

| Input | Action |
| --- | --- |
| Click a dot or rail cell | Select that model and effort |
| Drag horizontally on a model row | Move through supported effort levels |
| Up / Down | Move between the models enabled in CoPicker settings |
| Left / Right | Decrease or increase reasoning effort |
| Space | Toggle the catalog service tier named `Fast` when the selected model supports it |
| Escape | Close the official picker and Copicker |

Arrow-key input is briefly coalesced before it is committed. Pointer release and Space commit immediately. Copicker waits for Codex's official settings confirmation before treating a changed selection as final; a failed update restores the last confirmed selection.

## Supported selections

CoPicker settings can expose only these adapted models:

- GPT-5.6 Sol: `low`, `medium`, `high`, `xhigh`, `max`, and `ultra`;
- GPT-5.6 Terra: `low`, `medium`, `high`, `xhigh`, `max`, and `ultra`;
- GPT-5.6 Luna: `low`, `medium`, `high`, `xhigh`, and `max`;
- Daybreak Blue: `low`, `medium`, `high`, `xhigh`, `max`, and `ultra`;
- GPT-5.5: `low`, `medium`, `high`, and `xhigh`;
- GPT-5.3 Codex Spark: `low`, `medium`, `high`, and `xhigh`.

The rendered row order is Sol, Terra, Luna, Daybreak, GPT-5.5, then Codex Spark. The Daybreak row omits the word `Blue` and uses a theme-adaptive blue label.

Daybreak and Codex Spark do not support Fast in CoPicker. Entering either row clears the current Fast state, Space and thumb-click Fast toggles are disabled there, and returning to another model stays on the normal tier until Fast is explicitly enabled again.

GPT-5.4 and GPT-5.4 Mini are not adapted and cannot be enabled. Daybreak Blue may require approved Codex Trusted Access for Cyber and the network access required by that model. GPT-5.3 Codex Spark may require an eligible ChatGPT Pro subscription (Pro 5x / 20x). Enabling a model in settings does not make it available to an account whose official Codex catalog does not contain it.

The model IDs, supported efforts, and Fast service-tier ID are resolved from the current Codex model catalog. Copicker does not persist or hard-code account-specific IDs.

When the official picker is on an adapted model hidden in settings, Copicker still displays its recognized model and effort but shows no active rail cell. Unsupported models, including GPT-5.4 and GPT-5.4 Mini, display centered gray `Other`. Select any visible, available cell to leave either inactive state.

If an account does not currently expose a requested model, effort, or Fast tier in its Codex catalog, Copicker refuses that update and restores the last confirmed selection.

## Task and compaction behavior

Model, effort, and Fast changes apply to the active Codex task through the same current-task settings path used by the official picker. The active task must already have a Codex task identifier.

Changing model or effort may trigger the same compaction behavior as an equivalent change made with the official picker. This is expected Codex behavior rather than a separate Copicker compaction mechanism.

## Closing behavior

Copicker closes when any of the following happens:

- the official first-level picker closes;
- the combined picker loses focus;
- the user clicks outside both picker surfaces;
- the user presses Escape;
- the document becomes hidden;
- the Codex window loses focus.

Opening an official nested model or reasoning-effort menu does not close Copicker. The custom popover repositions to avoid that submenu.

Placement avoidance is latched. Repeated submenu mutations do not move CoPicker while its current rectangle remains valid. In the top position, an avoided position remains fixed until the official picker closes. In left or right mode, CoPicker restores its preferred base position only after the pointer has entered and then left CoPicker, the submenu no longer covers the base position, and a short return delay has elapsed. It never restores while the pointer is inside.

## Settings

After the `0.12.0-dev` settings plugin is installed, open **Settings → Integrations → CoPicker**. Changes save automatically. By default they apply on the next injection, usually the next time Codex is opened. After saving completes, **立即应用** applies the saved snapshot to the currently running Codex without restarting it; if that action fails, the saved settings still apply on the next normal injection.

The CoPicker page follows the same grouped cards, setting rows, compact switches, and segmented controls as the built-in Codex settings pages. Its controls remain keyboard accessible in both the native plugin view and the injected compatibility fallback.

Available settings are:

- enable or disable CoPicker;
- choose which adapted models appear, while keeping at least one enabled;
- prefer the top, left, or right placement;
- follow Codex, follow macOS, or force light or dark appearance.

Light appearance uses an exact `rgb(255, 255, 255)` rail background and dark text while preserving the model fill colors. Disabling CoPicker prevents the watcher from opening Inspector for the next Codex process.

## If Copicker does not appear

1. Confirm that the official first-level picker, rather than the full-width composer model list, is open.
2. Check automatic-injection state:

   ```bash
   "$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
   ```

3. Check that Inspector port `9229` has closed after injection:

   ```bash
   lsof -nP -iTCP:9229 -sTCP:LISTEN
   ```

   No output is the expected idle result.

4. Compare the reported Codex version with the compatibility notes for the installed Copicker release.
5. Review [installation troubleshooting](installation.md#troubleshooting) before enabling the watcher again. Do not repeatedly enable autostart to bypass a blocked or incompatible result.

## Privacy boundary

Copicker does not modify or re-sign the official Codex application bundle. Its payload makes no external network request and does not log conversation content, task contents, authentication data, cookies, or tokens. The private DOM and renderer compatibility points remain version-sensitive and fail closed when required anchors are absent.
