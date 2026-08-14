# Codex Model Rail

Codex Model Rail is a local macOS injector prototype for adding a user-designed model control to the official Codex first-level model/reasoning popover.

The project is designed around one non-negotiable safety property: it does not modify or re-sign `/Applications/ChatGPT.app`. The injector briefly connects to the Electron main-process Inspector on loopback, injects a self-contained DOM component through `webContents.executeJavaScript`, and closes the Inspector connection immediately afterward.

## Goals

- Preserve the official OpenAI signature, Team ID, permissions, Keychain access, App Groups, and update path.
- Keep the Inspector bound to `127.0.0.1` and open only for the injection window.
- Avoid reading, storing, or logging conversation content.
- Discover model options from the official picker instead of hard-coding account-specific model IDs.
- Stop safely when a Codex update changes the expected DOM anchors.

## Current status

The injection transport and first-level mount-target lifecycle are live-verified against Codex `26.810.41047` (build `6570`). The visual component is intentionally pending the user's design specification:

- The read-only status command verifies the installed Codex bundle, version, executable, and Electron fuse wire.
- Live injection is an explicit command and refuses to attach when Inspector port `9229` already belongs to an unknown process.
- The Inspector is bound to loopback, and shutdown is scheduled immediately after the renderer hook is installed.
- The only accepted mount lifecycle is the first-level popover opened from `[data-codex-intelligence-trigger][data-composer-navigation-target="reasoning"]`.
- A valid mount surface must be an open menu containing `[data-reasoning-slider]` and the current model-picker controls.
- The full model-list overlay identified by `[data-composer-overlay-floating-ui]` and `button[data-list-navigation-item]` is explicitly excluded.
- The previous `0.2.0` Shadow DOM rail and its visual styling were removed. Version `0.3.0` observes the correct target but intentionally renders nothing until the visual contract is supplied.

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
3. Resolve the nearest visible first-level menu containing the reasoning slider and model-picker controls.
4. Reject the full model-list overlay even if it is simultaneously present elsewhere in the DOM.
5. Mount the future user-designed component only in the accepted first-level surface and remove it as soon as that surface closes.

For a scoped live check of this target:

```bash
./script/build_and_run.sh --probe-primary
```

`Ctrl+Shift+M` opens the full model list in the current build. It is retained only as a diagnostic exclusion test through `--probe-picker`; it is not the custom component's mount trigger.

## Privacy and rollback

The payload contains no network request, storage write, cookie access, or conversation logging. It observes only the private model/reasoning control anchors. The diagnostic probe is scoped to control metadata and short control labels; it does not read the conversation body or composer text.

The injected hook lasts only for the running Codex process. Quit Codex or run `./script/build_and_run.sh --remove` to remove it. The official application bundle is never changed.
