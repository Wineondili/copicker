# Codex Model Rail

Codex Model Rail is a local macOS injector prototype for showing a user-designed model control in its own popover beside the official Codex first-level model/reasoning popover.

The project is designed around one non-negotiable safety property: it does not modify or re-sign `/Applications/ChatGPT.app`. The injector briefly connects to the Electron main-process Inspector on loopback, injects a self-contained DOM component through `webContents.executeJavaScript`, and closes the Inspector connection immediately afterward.

## Goals

- Preserve the official OpenAI signature, Team ID, permissions, Keychain access, App Groups, and update path.
- Keep the Inspector bound to `127.0.0.1` and open only for the injection window.
- Avoid reading, storing, or logging conversation content.
- Discover model options from the official picker instead of hard-coding account-specific model IDs.
- Stop safely when a Codex update changes the expected DOM anchors.

## Current status

The injection transport and first-level mount-target lifecycle are live-verified against Codex `26.810.41047` (build `6570`). Version `0.6.3` ports the supplied `preview.html` two-dimensional selector into the detached popover for visual and interaction review:

- The read-only status command verifies the installed Codex bundle, version, executable, and Electron fuse wire.
- Live injection is an explicit command and refuses to attach when Inspector port `9229` already belongs to an unknown process.
- The Inspector is bound to loopback, and shutdown is scheduled immediately after the renderer hook is installed.
- The only accepted anchor lifecycle is the first-level popover opened from `[data-codex-intelligence-trigger][data-composer-navigation-target="reasoning"]`.
- A valid anchor surface must be an open menu containing `[data-reasoning-slider]` and the current model-picker controls.
- The custom popover scaffold is appended directly to `document.body`; it is never inserted into, or made a child of, the official first-level popover.
- The scaffold uses the official popover rectangle only for positioning. It prefers left, then right, bottom, and top, with a 12-pixel gap and viewport padding.
- Every placement candidate must fit the viewport and must not overlap the official popover. If none fits, the custom popover remains hidden.
- The full model-list overlay identified by `[data-composer-overlay-floating-ui]` and multiple `button[data-list-navigation-item]` controls globally suppresses and removes the custom popover, even if the first-level menu remains mounted in the DOM.
- The custom popover preserves the supplied 560-pixel two-dimensional geometry internally, then renders the entire design at 50% scale for an actual footprint of approximately 280 by 151 pixels. All text, rows, effort columns, gradients, the draggable thumb, the Fast toggle, radii, and shadows scale together. Its base background is `rgb(44, 44, 44)`.
- Only Sol and Terra's six effort levels (`low` through `ultra`) and Luna's five levels (`low` through `max`) exist in the selector. No other model is offered as a switch target.
- When the official trigger reports Sol, Terra, or Luna with a supported effort, the detached selector initializes to that cell. Any other official model produces an empty selector state: the footer reads `Other`, and no fill, thumb, active effort label, or Fast state is shown until the user selects a valid cell.
- This visual-review build keeps selector changes local to renderer memory. It does not click official model controls, call model APIs, or change the current Codex task model.
- Pointer interaction inside the custom popover is treated as part of the combined picker region, so local clicks do not dismiss the official popover. Clicking outside, pressing `Escape`, hiding the document, blurring the window, or closing the official picker dismisses the custom popover.
- All selector markup and styles are isolated in the detached Shadow DOM host.

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

The hook lasts for the current Codex process, so run the command again after every Codex restart. After an app update, run the normal status/test gates first because private DOM anchors may have changed.

The command performs these gates before it sends a signal:

1. Confirm `/Applications/ChatGPT.app` exists and decode its version.
2. Read the Electron fuse wire and require `EnableNodeCliInspectArguments=1`.
3. Confirm the running process has bundle identifier `com.openai.codex` and the expected executable path.
4. Refuse to proceed if `127.0.0.1:9229` is already serving an Inspector target.
5. Send `SIGUSR1`, connect to the Electron main process, and inject through `webContents.executeJavaScript`.
6. Schedule `inspector.close()` and disconnect the local client.

## Mount contract

The intended lifecycle is:

1. Click the bottom composer control that currently displays the selected model and reasoning effort, such as `5.6 Sol / 极高`.
2. Wait for that exact trigger to report `aria-expanded="true"` and `data-state="open"`.
3. Resolve the nearest visible first-level menu containing the reasoning slider and model-picker controls as a positioning anchor only.
4. Reject the full model-list overlay even if it is simultaneously present elsewhere in the DOM.
5. Append an independent popover host to `document.body`, outside the official popover DOM subtree.
6. Position it beside the official popover without intersection; automatically change sides when necessary and hide it when no side fits.
7. Remove the independent popover as soon as the first-level surface closes or the full model list opens.

For a scoped live check of this target:

```bash
./script/build_and_run.sh --probe-primary
```

For a trusted-input check that clicks only the local Terra/medium cell and verifies local selected-state feedback:

```bash
./script/build_and_run.sh --probe-selector
```

`Ctrl+Shift+M` opens the full model list in the current build. It is retained only as a diagnostic exclusion test through `--probe-picker`; it is not the custom component's mount trigger.

## Privacy and rollback

The payload contains no network request, storage write, cookie access, or conversation logging. It observes only the private model/reasoning control anchors. Selector state exists only in renderer memory and disappears with the Codex process. The diagnostic probe is scoped to control metadata and short control labels; it does not read the conversation body or composer text.

The injected hook lasts only for the running Codex process. Quit Codex or run `./script/build_and_run.sh --remove` to remove it. The official application bundle is never changed.
