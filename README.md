# Copicker

Copicker is a local macOS CLI that adds a user-designed model-and-effort control in its own popover above the official Codex first-level model/reasoning popover.

The project is designed around one non-negotiable safety property: it does not modify or re-sign `/Applications/ChatGPT.app`. The injector briefly connects to the Electron main-process Inspector on loopback, injects a self-contained DOM component through `webContents.executeJavaScript`, and closes the Inspector connection immediately afterward.

## Documentation

- [Install, update, reinstall, recover, or uninstall](docs/installation.md)
- [Use the model and effort selector](docs/usage.md)
- [Build, test, and continue development](docs/development.md)

## Goals

- Preserve the official OpenAI signature, Team ID, permissions, Keychain access, App Groups, and update path.
- Keep the Inspector bound to `127.0.0.1` and open only for the injection window.
- Avoid reading, storing, or logging conversation content.
- Discover model IDs, supported efforts, and the Fast service tier from the current Codex app-server model catalog instead of hard-coding account-specific values.
- Stop safely when a Codex update changes the expected DOM anchors.

## Current status

The selector and watcher behavior frozen in Copicker `0.11.0` is live-verified on Apple silicon against Codex `26.818.41705` (build `6971`), including guarded automatic injection after Codex restarts and Inspector shutdown after injection. The renderer payload keeps its independent `0.9.3` compatibility identifier so an already injected hook remains idempotent across this CLI release. Autostart remains opt-in and is never enabled by the default read-only command.

`v0.11.0` is the public pre-release baseline. The earlier `v0.10.1-dev` tag remains available only as an immutable historical development snapshot; it is not the recommended installation version.

- The read-only status command verifies the installed Codex bundle, version, executable, and Electron fuse wire.
- Live injection is an explicit command and refuses to attach when Inspector port `9229` already belongs to an unknown process.
- The Inspector is bound to loopback, and shutdown is scheduled immediately after the renderer hook is installed.
- The only accepted anchor lifecycle is the first-level popover opened from `[data-codex-intelligence-trigger][data-composer-navigation-target="reasoning"]`.
- A valid anchor surface must be an open menu containing `[data-reasoning-slider]` and the current model-picker controls.
- The custom popover scaffold is appended directly to `document.body`; it is never inserted into, or made a child of, the official first-level popover.
- The scaffold uses the official popover rectangle only for positioning. It prefers a horizontally centered position above that popover with a 12-pixel gap, then tries other above-aligned positions before side or bottom fallbacks.
- Every placement candidate must fit the viewport and must not overlap either the official first-level popover or another visible Radix/`role="menu"` submenu, including nested model and reasoning-effort pickers. Those submenus remain open while the rail moves around their rectangles instead of disappearing.
- The full-width model list opened directly above the composer input is intentionally not a placement obstacle. It may sit behind the higher-z-index rail and does not move the rail away from its normal above-primary position.
- Opening and closing use a short opacity, scale, and vertical-motion transition; obstacle-driven position changes animate through the same 180-millisecond motion curve.
- The custom popover renders at 50% scale for a 289.75-by-134.75-pixel footprint. Its internal stage is 388 pixels wide, with equal 64-pixel internal horizontal and vertical dot spacing, producing 32-pixel spacing in the rendered component.
- The top row contains `Faster`, the moving model/effort/Fast labels, and `Smarter`; the old bottom status row is hidden. The shell background is `rgb(44, 44, 44)`.
- Only Sol and Terra's six effort levels (`low` through `ultra`) and Luna's five levels (`low` through `max`) exist in the selector. No other model is offered as a switch target.
- When the official trigger reports Sol, Terra, or Luna with a supported effort, the detached selector initializes to that cell. Any other official model produces an empty state with no fill, thumb, or active moving labels, plus a centered gray `Other` label on the top row until the user selects a valid cell.
- While the rail is visible, the arrow keys move through model and effort cells, Luna is clamped to five effort levels, and Space toggles Fast. Arrow input is briefly coalesced, while pointer release and Space commit immediately.
- The renderer reuses Codex's existing `electronBridge` and local app-server connection. It calls only `model/list` and `thread/settings/update`; it does not spawn another app-server process or proxy a click through the official model list.
- Sol, Terra, and Luna model IDs are matched from their official catalog display names. Supported effort levels and the service tier named `Fast` are validated from that catalog before any write, and no model ID or tier ID is persisted.
- A settings update is scoped to the active task identified by Codex's composer context. The rail waits for `thread/settings/updated` before marking a changed selection as confirmed, serializes rapid changes, and restores the last confirmed selection if the update fails.
- On a new unsent task with no thread identifier, the rail remains visible but refuses to write until Codex creates the task. Model or effort changes may trigger the same compaction behavior as the official picker because both use the same current-task settings path.
- Pointer interaction inside the custom popover is treated as part of the combined picker region, so local clicks do not dismiss the official popover. Clicking outside, pressing `Escape`, hiding the document, blurring the window, or closing the official picker dismisses the custom popover.
- All selector markup and styles are isolated in the detached Shadow DOM host.

## Quick use

After automatic or manual injection, open an existing Codex task and click the composer control that displays the current model and reasoning effort. Copicker appears above the official first-level picker.

| Input | Action |
| --- | --- |
| Click or drag | Select a supported model and effort |
| Up / Down | Move between Sol, Terra, and Luna |
| Left / Right | Change reasoning effort |
| Space | Toggle Fast |
| Escape or outside click | Close the combined picker |

Sol and Terra expose six supported effort levels; Luna exposes five. An unsupported official model shows `Other` until a valid Copicker cell is selected. `Ctrl+Shift+M` opens a different, full-width composer model list and does not activate Copicker.

See [docs/usage.md](docs/usage.md) for task requirements, confirmation behavior, supported selections, closing behavior, and troubleshooting.

## Install on another Mac

Copicker `0.11.0` is distributed as source in this pre-release. The recommended installation pins the exact release tag, builds a native release executable with SwiftPM, performs the read-only compatibility check, and then explicitly enables the user LaunchAgent:

```bash
xcode-select --install
git clone --branch v0.11.0 --depth 1 https://github.com/Wineondili/copicker.git
cd copicker
./script/install.sh
```

Run the installer as the logged-in user, never with `sudo`. The official Codex desktop app must be installed at `/Applications/ChatGPT.app`. Enabling autostart may inject the currently running Codex process; the installer never terminates Codex and never modifies or re-signs its application bundle.

See [docs/installation.md](docs/installation.md) for prerequisites, environment checks, verification, permissions, repeat installation, updates, recovery, complete uninstall, and troubleshooting on another device.

## Build and test

```bash
swift build
swift test
```

The project-local run entrypoint is:

```bash
./script/build_and_run.sh
```

Live injection is always an explicit action:

```bash
./script/build_and_run.sh --inject
```

Remove the current-process hook and any injected visual with:

```bash
./script/build_and_run.sh --remove
```

Without autostart, the hook lasts for the current Codex process, so run the command again after every Codex restart. After an app update, run the normal status/test gates first because private DOM anchors may have changed.

## Automatic injection (opt-in)

Inspect autostart without changing launchd, signaling Codex, or opening Inspector:

```bash
swift run copicker autostart status
```

Explicitly install a stable copy of the current executable and Swift resource bundle, create the user LaunchAgent, and load its watcher:

```bash
swift run copicker autostart enable
```

The managed files are limited to:

- `~/Library/Application Support/Copicker/bin/copicker`
- `~/Library/Application Support/Copicker/bin/Copicker_CopickerCLI.bundle`
- `~/Library/Application Support/Copicker/autostart-state.json`
- `~/Library/LaunchAgents/io.github.wineondili.copicker.plist`
- `~/Library/Logs/Copicker/autostart.log`
- `~/Library/Logs/Copicker/autostart-error.log`

The LaunchAgent starts a long-running `copicker watch` process in the logged-in GUI session. The watcher polls only for the `com.openai.codex` process, injects once per new PID, and waits for the next PID after Codex quits. A restarted watcher may safely call the installer again because the renderer and Electron main-process hooks are versioned and idempotent.

After first seeing a new Codex PID, the watcher allows a five-second startup grace period, then uses the finite `0`, `1`, `2`, `4`, and `8` second retry schedule. An Inspector timeout is retried because Electron may finish opening the endpoint after the first attempt times out. A later attempt may reuse that endpoint only after `lsof` confirms that its sole listener is the exact Codex PID signaled by the same in-memory attempt; pre-existing or unknown Inspector ownership still fails closed. An incompatible Codex installation or an unconfirmed installer result stops retries for that PID and records a structured result code. The state file contains only Copicker/Codex versions, process identifiers, timestamps, phases, and result codes.

Disable future automatic injection without changing the current Codex process:

```bash
swift run copicker autostart disable
```

Disable autostart and also remove the current-process hook when Codex is running:

```bash
swift run copicker autostart disable --remove
```

`autostart enable` and `autostart disable` must run as the logged-in user, never through `sudo`. Enabling autostart may inject the currently running Codex process as soon as the LaunchAgent starts. Disabling autostart removes the LaunchAgent plist but intentionally leaves the stable CLI copy and privacy-safe logs in place for inspection and later re-enabling.

## Injection safety gates

Both manual and automatic injection perform these gates before sending a signal:

1. Confirm `/Applications/ChatGPT.app` exists and decode its version.
2. Read the Electron fuse wire and require `EnableNodeCliInspectArguments=1`.
3. Confirm the running process has bundle identifier `com.openai.codex` and the expected executable path.
4. Refuse to proceed if `127.0.0.1:9229` is already serving an unknown or pre-existing Inspector target. The watcher may recover only an endpoint opened late by its own immediately preceding timed-out signal and owned exclusively by the expected Codex PID.
5. Send `SIGUSR1`, connect to the Electron main process, and inject through `webContents.executeJavaScript`.
6. Schedule `inspector.close()` and disconnect the local client.

## Visual tuning page

[`tools/model-rail-tuner.html`](tools/model-rail-tuner.html) is a standalone local tuning page for the selector geometry. It does not inject into Codex or change the runtime payload.

The page keeps the preview at the current 289.75-by-134.75-pixel footprint and sets both horizontal and vertical dot spacing to 32 pixels.

- the global text scale covering model and effort labels;
- the visible gap between the Sol/Terra/Luna column and the selector stage;
- the visible distance from the top effort labels to the popover's top edge.

The current values are encoded in the page URL fragment and exported by the `复制参数` button as a `MODEL_RAIL_TUNING_V1` text block. Paste that block into the task before applying the geometry to the injected component.

## Mount contract

The intended lifecycle is:

1. Click the bottom composer control that currently displays the selected model and reasoning effort, such as `5.6 Sol / 极高`.
2. Wait for that exact trigger to report `aria-expanded="true"` and `data-state="open"`.
3. Resolve the nearest visible first-level menu containing the reasoning slider and model-picker controls as a positioning anchor only.
4. Discover simultaneously visible Radix/`role="menu"` secondary surfaces as placement obstacles, while explicitly ignoring the full-width composer model list under `[data-composer-overlay-floating-ui]` unless it is a nested model-row surface.
5. Append an independent popover host to `document.body`, outside the official popover DOM subtree.
6. Position it above the official popover without intersection; shift it along the top edge or use a fallback side when needed to clear a secondary menu.
7. Keep it present while a secondary menu is open, and animate it closed only when the first-level surface itself closes or the combined picker loses focus.

For a scoped live check of this target:

```bash
./script/build_and_run.sh --probe-primary
```

For a direct settings round trip that first verifies a same-value write, switches to a supported alternate model/effort/Fast combination, confirms it, and restores the original settings:

```bash
./script/build_and_run.sh --probe-selector
```

`Ctrl+Shift+M` opens the full-width model list above the composer in the current build. `--probe-picker` verifies that this input-origin list does not become an avoidance obstacle; it is not the custom component's mount trigger.

## Privacy and rollback

The payload makes no external network request and performs no storage write, cookie access, or conversation logging. It observes only the private model/reasoning control anchors and sends the two allowlisted app-server methods through Codex's existing renderer bridge. Selector and catalog state exist only in renderer memory and disappear with the Codex process. The diagnostic probe reports control metadata, supported selection state, and task-marker counts without returning task identifiers, conversation body text, or composer text.

The injected hook lasts only for the running Codex process. Quit Codex or run `./script/build_and_run.sh --remove` to remove it. Use the installed executable's `autostart disable` command to stop future automatic injection. The official application bundle is never changed.
