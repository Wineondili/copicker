# Codex Model Rail

Codex Model Rail is a local macOS injector for adding a compact, keyboard-friendly model rail to the official Codex model picker.

The project is designed around one non-negotiable safety property: it does not modify or re-sign `/Applications/ChatGPT.app`. The injector briefly connects to the Electron main-process Inspector on loopback, injects a self-contained DOM component through `webContents.executeJavaScript`, and closes the Inspector connection immediately afterward.

## Goals

- Preserve the official OpenAI signature, Team ID, permissions, Keychain access, App Groups, and update path.
- Keep the Inspector bound to `127.0.0.1` and open only for the injection window.
- Avoid reading, storing, or logging conversation content.
- Discover model options from the official picker instead of hard-coding account-specific model IDs.
- Stop safely when a Codex update changes the expected DOM anchors.

## Current status

The first functional implementation is complete and was live-verified against Codex `26.810.41047` (build `6570`):

- The read-only status command verifies the installed Codex bundle, version, executable, and Electron fuse wire.
- Live injection is an explicit command and refuses to attach when Inspector port `9229` already belongs to an unknown process.
- The Inspector is bound to loopback, and shutdown is scheduled immediately after the renderer hook is installed.
- The renderer payload supports the current floating picker as well as the earlier nested-menu shape, prepends a Shadow DOM rail inside the official overlay, and mirrors its live model options.
- Model selection is proxied through the official menu items; the injector does not call model RPCs or persist account-specific identifiers.
- A live probe confirmed one visible `0.2.0` rail with seven buttons matching the seven model controls currently exposed by the official picker.

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

The hook lasts for the current Codex process, so run the command again after every Codex restart. After an app update, run the normal status/test gates first because private DOM anchors may have changed.

The command performs these gates before it sends a signal:

1. Confirm `/Applications/ChatGPT.app` exists and decode its version.
2. Read the Electron fuse wire and require `EnableNodeCliInspectArguments=1`.
3. Confirm the running process has bundle identifier `com.openai.codex` and the expected executable path.
4. Refuse to proceed if `127.0.0.1:9229` is already serving an Inspector target.
5. Send `SIGUSR1`, connect to the Electron main process, and inject through `webContents.executeJavaScript`.
6. Schedule `inspector.close()` and disconnect the local client.

## Interaction

After injection:

1. Open the official Codex model picker or press `Ctrl+Shift+M`.
2. The injected **快捷模型** rail appears at the top of the same overlay and mirrors the official model buttons.
3. Click a mirrored item or press `1`–`9` while the picker is open.

On an older picker shape, use **加载模型列表** once so the rail can mirror the official nested Model submenu.

The final selection remains an official menu click, so Codex retains responsibility for model availability, active-thread state, and persistence.

## Privacy and rollback

The payload contains no network request, storage write, cookie access, or conversation logging. It observes only the private model-picker anchors and the short labels of buttons inside that picker. The diagnostic probe is likewise scoped to control metadata and picker-button labels; it does not read the conversation body or composer text.

The injected component lasts only for the running Codex process. Quit Codex to remove it, or run the payload's `dispose()` hook from a debugger. The official application bundle is never changed.
