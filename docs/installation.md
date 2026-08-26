# Installing Copicker on another Mac

Copicker `0.11.0` is a source-distributed pre-release. Building it on the target Mac avoids distributing an unsigned or non-notarized executable and produces a native binary for that machine.

## Compatibility boundary

- macOS 14 or later.
- Apple silicon is the live-verified architecture for this pre-release.
- The official Codex desktop app must be installed at `/Applications/ChatGPT.app`.
- Xcode Command Line Tools with Swift 6 support are required for the source build.
- Copicker uses private Codex DOM and Electron compatibility points. A future Codex update may require a newer Copicker release even when installation succeeds.

Copicker does not edit, replace, unpack into, or re-sign the official Codex application bundle. Its user LaunchAgent starts only after the user logs into the Aqua session.

## Check the target Mac

Inspect the target before cloning or enabling anything:

```bash
sw_vers -productVersion
uname -m
xcode-select -p
swift --version
test -d /Applications/ChatGPT.app && echo "Codex app found"
```

The currently verified architecture reports `arm64`. `swift --version` must report Swift 6 or later. If `xcode-select -p` or `swift --version` fails, install the Xcode Command Line Tools before continuing:

```bash
xcode-select --install
```

The installation script also checks for Swift and the official application path. It runs the CLI's read-only compatibility status before it changes the user LaunchAgent.

## Install the pinned pre-release

Clone the exact release tag and run the installer as the logged-in user:

```bash
git clone --branch v0.11.0 --depth 1 https://github.com/Wineondili/copicker.git
cd copicker
./script/install.sh
```

Checking out an exact tag produces a detached HEAD. That is expected and desirable for a reproducible installation. Do not use this shallow installation checkout for ongoing development; follow [docs/development.md](development.md) instead.

Do not use `sudo`. The installer performs these steps:

1. Validates the bundled JavaScript when Node.js is available.
2. Builds the SwiftPM executable in release mode.
3. Runs the read-only Codex installation and Electron-fuse compatibility check.
4. Copies the executable and Swift resource bundle into the user Library.
5. Creates and loads the opt-in user LaunchAgent.
6. Prints the resulting watcher status.

The published `v0.11.0` tag stops there. The current `0.12.0-dev` branch additionally copies and registers the CoPicker settings plugin through the Codex CLI. Do not treat `0.12.0-dev` as the cross-device release baseline until it receives its own tag.

If Codex is already running, loading the watcher may inject it immediately. The installer does not quit or restart Codex.

## Verify the installation

Use the stable installed executable, which does not depend on the cloned repository remaining in place:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" version
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
```

A successful active installation reports all of the following:

```text
LaunchAgent plist: installed
LaunchAgent service: loaded
Installed executable: present
Installed resource bundle: present
Last watcher phase: injected
Last result: injection-succeeded
```

When Codex is not running, `waiting-for-codex` is expected. Open Codex, wait a few seconds, then follow [the usage guide](usage.md) and confirm that Copicker appears above the official first-level model/reasoning picker.

The Inspector should close after injection:

```bash
lsof -nP -iTCP:9229 -sTCP:LISTEN
```

No output is the expected idle result. If another process intentionally owns that port, Copicker fails closed instead of attaching to it.

## Managed user files

Installation is limited to these user-scoped paths:

- `~/Library/Application Support/Copicker/bin/copicker`
- `~/Library/Application Support/Copicker/bin/Copicker_CopickerCLI.bundle`
- `~/Library/Application Support/Copicker/autostart-state.json`
- `~/Library/Application Support/Copicker/settings.json`
- `~/Library/Application Support/Copicker/plugin-marketplace`
- `~/Library/LaunchAgents/io.github.wineondili.copicker.plist`
- `~/Library/Logs/Copicker/autostart.log`
- `~/Library/Logs/Copicker/autostart-error.log`

The source checkout may be removed after installation. The stable executable, resource bundle, and local plugin marketplace under `Application Support` are what the LaunchAgent and settings plugin use. `settings.json` contains only CoPicker UI preferences, is written with user-only `0600` permissions, and persists across ordinary reinstalls and watcher disable/enable cycles.

Starting with the current `0.12.0-dev` installer, the script registers `copicker-local` with the Codex CLI and installs `copicker@copicker-local`. The settings entry appears after the updated payload is injected, normally when Codex is next opened. Current Codex builds may keep local plugin settings entrypoints behind a remote allowlist, so the injected payload provides a matching sidebar fallback and automatically yields if the native entry is available. Settings autosave and default to the next process injection; the explicit **Apply now** action can instead reuse the guarded injection path for the current process without restarting Codex. Updating with a newer CoPicker installer refreshes the stable plugin package and reinstalls that same plugin ID; it does not create duplicate settings entries. The published `v0.11.0` installer does not create the marketplace directory or settings entry.

## Permissions and signatures

Reinstalling or updating Copicker on the same Mac does not change the official Codex bundle, signature, Team ID, bundle identifier, Keychain groups, App Groups, or designated requirement. Existing permissions granted to the official Codex app are therefore not reset by a Copicker reinstall.

On a different Mac, Codex may request its normal first-use permissions for that device. Those prompts belong to the official app and are independent of Copicker. Copicker itself does not use Accessibility or Screen Recording to proxy UI clicks.

## Reinstall the same version

For the smallest repeat-installation window, stop the existing watcher before replacing its managed artifacts. This does not remove an already injected hook from the current Codex process:

```bash
COPICKER_BIN="$HOME/Library/Application Support/Copicker/bin/copicker"

if [[ -x "$COPICKER_BIN" ]]; then
  "$COPICKER_BIN" autostart disable
fi

./script/install.sh
```

The installer rebuilds the tagged source, replaces the managed executable and resource bundle, recreates the plist, and loads a new watcher. Confirm both the installed version and watcher version afterward:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" version
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
```

The status file is written asynchronously by the watcher. Immediately after installation it may briefly show a previous state; wait several seconds and check again. The final `Watcher Copicker version` must match the installed executable version.

## Update to a later release

Use a clean, exact-tag checkout rather than switching an active development worktree into detached HEAD. Replace the example version with the release you intend to install:

```bash
COPICKER_VERSION=v0.11.0
COPICKER_BIN="$HOME/Library/Application Support/Copicker/bin/copicker"

git clone --branch "$COPICKER_VERSION" --depth 1 \
  https://github.com/Wineondili/copicker.git \
  "copicker-$COPICKER_VERSION"

cd "copicker-$COPICKER_VERSION"

if [[ -x "$COPICKER_BIN" ]]; then
  "$COPICKER_BIN" autostart disable
fi

./script/install.sh
```

Rerunning the installer replaces only Copicker-managed artifacts and reloads the user LaunchAgent. It does not modify the official Codex bundle. Check the release notes before moving to a newer tag because Codex compatibility is version-sensitive. Keep the previous tagged checkout until the new watcher and UI have been verified so the previous release remains easy to rebuild.

## Recover from an interrupted or failed install

The installation script stops at the first failed command. It does not automatically restore an earlier Copicker binary or LaunchAgent when artifact replacement or `launchctl bootstrap` fails. It still never changes the official Codex bundle.

Use this recovery sequence:

1. Do not repeatedly run `autostart enable` while Inspector port `9229` has an unknown listener.
2. Check the exact managed state and operational result:

   ```bash
   "$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
   ```

3. Confirm the intended tagged checkout is clean and its release build succeeds:

   ```bash
   git status --short
   swift build -c release
   swift test
   ```

4. Fix the reported compatibility, build, filesystem, or `launchctl` problem.
5. Rerun `./script/install.sh` from that exact tagged checkout.
6. Verify the installed executable version, watcher version, Codex version, result code, UI behavior, and Inspector closure independently.

If no installed executable is available, skip its status command and rebuild from a fresh tagged checkout. A failed install may leave Copicker-managed binary, resource, state, or log files for diagnosis even when the LaunchAgent plist has been removed.

## Disable automatic injection

Disable future automatic injection without changing the current Codex process:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart disable
```

Disable the LaunchAgent and also remove the active hook from the currently running Codex process:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart disable --remove
```

The second command briefly uses the guarded loopback Inspector path when Codex is running. Neither command modifies the Codex application bundle. The stable Copicker binary, structured state, and privacy-safe logs remain available for inspection or later re-enabling.

## Completely uninstall Copicker

`autostart disable` is intentionally reversible and does not delete the stable executable, resource bundle, state, or logs. For a complete uninstall, first disable future injection and remove the current-process hook when possible:

```bash
COPICKER_BIN="$HOME/Library/Application Support/Copicker/bin/copicker"
"$COPICKER_BIN" autostart disable --remove
```

If Codex is not running, there is no current-process hook to remove. If guarded removal cannot complete, quitting Codex clears the in-memory hook.

After reviewing the exact targets, remove only Copicker-managed files:

```bash
codex plugin remove copicker@copicker-local
codex plugin marketplace remove copicker-local
rm -f -- "$HOME/Library/LaunchAgents/io.github.wineondili.copicker.plist"
rm -rf -- "$HOME/Library/Application Support/Copicker"
rm -rf -- "$HOME/Library/Logs/Copicker"
```

These commands permanently remove Copicker's settings plugin registration, installed binary, resource bundle, preferences, structured state, and operational logs. They do not touch `/Applications/ChatGPT.app`. Reinstall later by repeating the clean tagged-source installation.

## Troubleshooting

Inspect the structured state first:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
```

Then inspect only Copicker's operational logs:

```bash
tail -n 80 "$HOME/Library/Logs/Copicker/autostart.log"
tail -n 80 "$HOME/Library/Logs/Copicker/autostart-error.log"
```

Useful result codes include:

- `injection-succeeded`: the main-process hook and renderer payload were confirmed.
- `waiting-for-codex`: the watcher is loaded and waiting for Codex to start.
- `incompatible-installation`: the installed Codex build or Electron fuse configuration failed a safety gate.
- `inspector-busy`: port `9229` already belongs to a pre-existing or unverified Inspector.
- `inspector-timeout`: the bounded Inspector startup/recovery attempts did not complete.

Do not repeatedly enable autostart to bypass a blocked result. Record the Codex version, Copicker version, structured status, and operational result code before reporting a compatibility issue. Do not include conversation content, authentication information, cookies, tokens, or task contents in a report.

For interaction-specific checks, including the difference between the first-level picker and the full-width composer model list, see [docs/usage.md](usage.md).
