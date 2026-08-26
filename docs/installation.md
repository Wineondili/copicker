# Installing Copicker on another Mac

Copicker `0.11.0` is a source-distributed pre-release. Building it on the target Mac avoids distributing an unsigned or non-notarized executable and produces a native binary for that machine.

## Compatibility boundary

- macOS 14 or later.
- Apple silicon is the live-verified architecture for this pre-release.
- The official Codex desktop app must be installed at `/Applications/ChatGPT.app`.
- Xcode Command Line Tools with Swift 6 support are required for the source build.
- Copicker uses private Codex DOM and Electron compatibility points. A future Codex update may require a newer Copicker release even when installation succeeds.

Copicker does not edit, replace, unpack into, or re-sign the official Codex application bundle. Its user LaunchAgent starts only after the user logs into the Aqua session.

## Install the pinned pre-release

Install Apple's command-line developer tools if the target Mac does not already have them:

```bash
xcode-select --install
```

Clone the exact release tag and run the installer as the logged-in user:

```bash
git clone --branch v0.11.0 --depth 1 https://github.com/Wineondili/copicker.git
cd copicker
./script/install.sh
```

Do not use `sudo`. The installer performs these steps:

1. Validates the bundled JavaScript when Node.js is available.
2. Builds the SwiftPM executable in release mode.
3. Runs the read-only Codex installation and Electron-fuse compatibility check.
4. Copies the executable and Swift resource bundle into the user Library.
5. Creates and loads the opt-in user LaunchAgent.
6. Prints the resulting watcher status.

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

When Codex is not running, `waiting-for-codex` is expected. Open Codex, wait a few seconds, then open its first-level model/reasoning picker and confirm that Copicker appears above it.

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
- `~/Library/LaunchAgents/io.github.wineondili.copicker.plist`
- `~/Library/Logs/Copicker/autostart.log`
- `~/Library/Logs/Copicker/autostart-error.log`

The source checkout may be removed after installation. The stable executable and resource bundle under `Application Support` are what the LaunchAgent runs.

## Update to a later release

From an existing checkout, fetch the desired tag, check it out, and rerun the installer:

```bash
git fetch origin --tags
git checkout v0.11.0
./script/install.sh
```

Rerunning the installer replaces only Copicker-managed artifacts and reloads the user LaunchAgent. It does not modify the official Codex bundle. Check the release notes before moving to a newer tag because Codex compatibility is version-sensitive.

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
