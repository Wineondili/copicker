# Installing CoPicker on another Mac

CoPicker `v0.99.0` is source-distributed. Building on the target Mac avoids distributing an unsigned/non-notarized executable and produces a native binary for that machine.

This guide covers the current immutable pre-release, its live-accepted runtime anchor, and historical rollback. Read [accepted-baseline.md](accepted-baseline.md) before choosing a version.

## Choose the intended version

| Choice | Ref | Feature set | Publication status |
| --- | --- | --- | --- |
| Recommended current pre-release | `v0.99.0` | Six models, settings page, persistence, Apply now, top/left/right placement, no-task selection, final native settings geometry | Published full-feature pre-release |
| Live-accepted runtime anchor | `c0343d4d76e4094cd99ba9ff7fe0fb71fc3edbbb` | Same renderer behavior, with the earlier `0.12.0-dev` CLI label | Exact installed/UI/restart evidence and rollback anchor |
| Historical pre-release | `v0.11.0` | Older Sol/Terra/Luna rail and guarded autostart | Immutable historical pre-release |

Do not install moving `main` when reproducibility matters. Use `v0.99.0` for a normal new installation. The annotated tag resolves the exact release commit through `v0.99.0^{commit}`. Use `c0343d4` only when reproducing the original live-acceptance environment or rolling back for diagnosis.

## Compatibility boundary

- Swift package minimum: macOS 14 or later.
- Live-verified architecture: Apple silicon `arm64`.
- Full-feature accepted environment: Codex `26.820.60940` build `7119`.
- Official app path: `/Applications/ChatGPT.app`.
- Official bundle identifier: `com.openai.codex`.
- Build toolchain: Xcode Command Line Tools or Xcode with Swift 6 or later.
- Current full-feature installer: requires the `codex` CLI to register the local settings plugin.
- Private Codex DOM, Electron fuses, app-server methods, and settings routes may change in a later desktop build.

CoPicker never edits, replaces, unpacks into, or re-signs the official application. The LaunchAgent starts only in the logged-in user's GUI session.

## Inspect a new Mac before installation

```bash
sw_vers -productVersion
uname -m
xcode-select -p
swift --version
codex --version
test -d /Applications/ChatGPT.app && echo "Codex app found"
```

Expected prerequisites:

- `uname -m` reports `arm64` for the currently verified path;
- `swift --version` reports Swift 6 or later;
- `codex --version` succeeds for the current full-feature installer;
- the app-path test prints `Codex app found`.

If the developer tools are missing:

```bash
xcode-select --install
```

If the Codex CLI is unavailable, install or update Codex through its normal supported distribution before installing the full-feature CoPicker baseline. Do not work around the check by copying another machine's native executable.

## Install the current full-feature pre-release

Clone the exact `v0.99.0` tag and run the installer:

```bash
git clone --branch v0.99.0 --depth 1 \
  https://github.com/Wineondili/copicker.git \
  copicker-v0.99.0
cd copicker-v0.99.0
git status --short --branch
./script/install.sh
```

The tag checkout is detached by design. Do not make development commits in this checkout.

Run the script as the logged-in user, never with `sudo`.

The full-feature installer:

1. rejects root execution;
2. requires Swift, the Codex CLI, and the official app path;
3. validates the renderer JavaScript when Node.js is available;
4. builds the SwiftPM release executable and resource bundle;
5. runs the read-only CoPicker/Codex compatibility status;
6. installs stable managed artifacts in the user Library;
7. creates and loads the opt-in user LaunchAgent;
8. prints watcher status;
9. copies the local marketplace and CoPicker plugin into Application Support;
10. registers `copicker-local` and installs `copicker@copicker-local` through the Codex CLI.

If Codex is already running, loading the watcher may inject that PID immediately. The installer never quits or restarts Codex. For a clean acceptance boundary, let the installer finish, then quit and reopen Codex yourself.

This pre-release has no attached unsigned/non-notarized executable. GitHub's standard source archives and the pinned clone above are the package; the native executable is built on the target Mac.

## Reproduce the live-accepted runtime anchor

Use this only for exact evidence reproduction or rollback. It reports CLI/plugin `0.12.0-dev` but contains the same accepted renderer `0.12.8` behavior packaged by `v0.99.0`:

```bash
git clone https://github.com/Wineondili/copicker.git copicker-c0343d4
cd copicker-c0343d4
git checkout --detach c0343d4d76e4094cd99ba9ff7fe0fb71fc3edbbb
./script/install.sh
```

The older `v0.11.0` tag remains available as historical three-model source. It is not the recommended installation and does not contain the current six-model settings plugin/fallback.

## First start and first acceptance

After installation:

1. quit and reopen Codex yourself;
2. wait several seconds for the watcher to handle the new PID;
3. verify installed/watch state;
4. open the official first-level model/reasoning picker and confirm CoPicker;
5. open **Settings → Integrations → CoPicker** and confirm one CoPicker entry;
6. verify the model/settings behavior in [usage.md](usage.md);
7. confirm Inspector port `9229` is closed.

The settings entry may not appear until the updated payload is injected, normally the next time Codex opens. Some Codex builds suppress local native settings entries behind a remote allowlist; the accepted runtime supplies a matching injected fallback and removes it automatically if the native entry becomes available.

## Verify the installed copy

Use the stable installed executable. It does not depend on the source checkout:

```bash
COPICKER_BIN="$HOME/Library/Application Support/Copicker/bin/copicker"

"$COPICKER_BIN" version
"$COPICKER_BIN" status
"$COPICKER_BIN" autostart status
codex plugin marketplace list --json
codex plugin list --json
lsof -nP -iTCP:9229 -sTCP:LISTEN
```

For the `v0.99.0` pre-release, confirm:

```text
Copicker 0.99.0
LaunchAgent plist: installed
LaunchAgent service: loaded
Installed executable: present
Installed resource bundle: present
Last watcher phase: injected
Last result: injection-succeeded
Watcher Copicker version: 0.99.0
```

When Codex is not running, `waiting-for-codex` is expected. Immediately after install, the asynchronous watcher state may briefly contain an earlier phase; wait several seconds and recheck.

Plugin JSON should contain marketplace `copicker-local` and plugin ID `copicker@copicker-local`.

No `lsof` output is the expected idle Inspector state. If another process intentionally owns port `9229`, CoPicker fails closed rather than attaching to it.

## Managed user files

The current installation is limited to:

- `~/Library/Application Support/Copicker/bin/copicker`;
- `~/Library/Application Support/Copicker/bin/Copicker_CopickerCLI.bundle`;
- `~/Library/Application Support/Copicker/autostart-state.json`;
- `~/Library/Application Support/Copicker/settings.json`;
- `~/Library/Application Support/Copicker/plugin-marketplace`;
- `~/Library/LaunchAgents/io.github.wineondili.copicker.plist`;
- `~/Library/Logs/Copicker/autostart.log`;
- `~/Library/Logs/Copicker/autostart-error.log`;
- the Codex plugin cache/registration managed by `codex plugin` for `copicker@copicker-local`.

The source checkout may be removed after acceptance. Keep it or retain the exact commit/tag elsewhere if immediate rollback is important.

`settings.json` stores only versioned CoPicker preferences, is written atomically with mode `0600`, and survives ordinary reinstall and watcher disable/enable cycles.

## Permissions and signatures

Reinstalling or updating CoPicker on the same Mac does not change the official Codex bundle, Team ID, designated requirement, signature, Keychain groups, App Groups, or bundle identifier. Existing permissions granted to the official app are therefore not reset by a CoPicker reinstall.

On another Mac, Codex may request its normal first-use permissions for that device. Those prompts belong to the official app. CoPicker does not require Accessibility or Screen Recording permissions and does not use those systems to proxy clicks.

## Default preferences on a new machine

If no settings file exists, current code defaults are:

- enabled: `true`;
- visible models: Sol, Terra, Luna;
- preferred placement: `top`;
- appearance: `dark`;
- settings schema: `1`;
- revision: `0`.

Use the in-app settings page to configure the machine. A model toggle does not grant account access; availability still comes from that machine/account's official Codex catalog.

## Optional preference migration

CoPicker settings do not sync automatically between Macs. The recommended migration is to configure the target through the in-app settings page.

If an exact preference copy is required:

1. install the same or a compatible settings schema on the target;
2. disable the target watcher;
3. copy only `settings.json` through a trusted channel;
4. place it at `~/Library/Application Support/Copicker/settings.json`;
5. set mode `0600`;
6. run read-only status, then re-enable the watcher;
7. reopen Codex yourself and verify every setting.

```bash
COPICKER_BIN="$HOME/Library/Application Support/Copicker/bin/copicker"

"$COPICKER_BIN" autostart disable
chmod 600 "$HOME/Library/Application Support/Copicker/settings.json"
"$COPICKER_BIN" autostart enable
```

Do not copy another Mac's executable, resource bundle, LaunchAgent plist, watcher state, logs, plugin cache, PIDs, or Inspector state. Build and install natively on the target.

## Reinstall the same pinned version

Stop the existing watcher before replacing its managed artifacts. This does not remove an already injected hook from the current Codex process:

```bash
COPICKER_BIN="$HOME/Library/Application Support/Copicker/bin/copicker"

if [[ -x "$COPICKER_BIN" ]]; then
  "$COPICKER_BIN" autostart disable
fi

git status --short --branch
git rev-parse HEAD
./script/install.sh
```

The installer refreshes the same marketplace/plugin ID rather than creating a duplicate. Confirm installed and watcher versions afterward, then reopen Codex yourself if you need a clean new-process acceptance.

## Update to a later release or accepted commit

Use a separate clean checkout rather than moving a development worktree into detached HEAD:

```bash
COPICKER_REF="replace-with-exact-tag-or-commit"
COPICKER_BIN="$HOME/Library/Application Support/Copicker/bin/copicker"

git clone https://github.com/Wineondili/copicker.git "copicker-$COPICKER_REF"
cd "copicker-$COPICKER_REF"
git checkout --detach "$COPICKER_REF"

if [[ -x "$COPICKER_BIN" ]]; then
  "$COPICKER_BIN" autostart disable
fi

./script/install.sh
```

Before updating, read the release/baseline notes and retain the previous checkout. After updating, verify the exact ref, CLI/watcher version, resource bundle, plugin, Codex build, injection result, UI, restart reinjection, and Inspector closure separately.

Do not assume a newer `main` commit is accepted merely because it builds.

## Roll back

Keep or recreate an exact prior checkout, then:

1. disable the current watcher;
2. run the prior checkout's installer;
3. quit and reopen Codex yourself so the older renderer payload owns the new process;
4. verify versions, behavior, and Inspector closure.

If the current process must be cleaned before quitting:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" remove
```

`remove` is a live guarded Inspector action. Do not run it without the applicable authorization.

The current packaged rollback point is `v0.99.0`; the exact live-acceptance runtime anchor is `c0343d4`; the historical three-model release is `v0.11.0`.

## Recover from an interrupted or failed install

The installer stops at the first failed command. It does not automatically restore an earlier CoPicker binary or LaunchAgent after a partial artifact/launchctl/plugin failure. It still never changes the official Codex bundle.

1. Do not repeatedly enable autostart while port `9229` has an unknown listener.
2. Read the installed structured status when available:

   ```bash
   "$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
   ```

3. Verify the intended checkout and offline build:

   ```bash
   git status --short --branch
   git rev-parse HEAD
   swift test
   swift build -c release
   ```

4. Check plugin registrations:

   ```bash
   codex plugin marketplace list --json
   codex plugin list --json
   ```

5. Fix the exact build, filesystem, compatibility, plugin, or `launchctl` error.
6. Rerun the installer from the exact clean checkout.
7. Verify installed executable, resource bundle, watcher, plugin, current PID result, UI, and Inspector closure independently.

A failed install may leave CoPicker-managed artifacts or logs for diagnosis even when the LaunchAgent is absent.

## Disable automatic injection

Disable future automatic injection without changing the current Codex process:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart disable
```

Disable future injection and remove the current-process hook when Codex is running:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart disable --remove
```

The second form briefly uses the guarded loopback Inspector. Neither form modifies the official application. Disabling leaves the stable CLI, settings, state, and logs for inspection/re-enabling.

## Completely uninstall CoPicker

These steps permanently remove CoPicker-managed state. Review the exact targets before running them.

First disable and remove the current hook when possible:

```bash
COPICKER_BIN="$HOME/Library/Application Support/Copicker/bin/copicker"
"$COPICKER_BIN" autostart disable --remove
```

If Codex is not running, no in-memory hook exists. If guarded removal cannot run, quitting Codex clears the in-memory renderer state.

Then remove the registered plugin and only CoPicker-managed files:

```bash
codex plugin remove copicker@copicker-local
codex plugin marketplace remove copicker-local
rm -f -- "$HOME/Library/LaunchAgents/io.github.wineondili.copicker.plist"
rm -rf -- "$HOME/Library/Application Support/Copicker"
rm -rf -- "$HOME/Library/Logs/Copicker"
```

This removes the installed CLI, resource bundle, preferences, marketplace copy, LaunchAgent, structured state, and logs. It does not touch `/Applications/ChatGPT.app`.

## Troubleshooting

Start with structured status:

```bash
"$HOME/Library/Application Support/Copicker/bin/copicker" autostart status
```

Then inspect only CoPicker operational logs:

```bash
tail -n 80 "$HOME/Library/Logs/Copicker/autostart.log"
tail -n 80 "$HOME/Library/Logs/Copicker/autostart-error.log"
```

Common result codes:

- `injection-succeeded`: hook installation was confirmed for the handled PID;
- `waiting-for-codex`: watcher is loaded and no Codex process is present;
- `incompatible-installation`: app/fuse/process safety gate failed;
- `inspector-busy`: port `9229` has pre-existing or unverified ownership;
- `inspector-timeout`: bounded Inspector startup/recovery did not complete;
- `settings-disabled`: persisted CoPicker enablement prevented automatic injection.

Do not repeatedly enable the watcher to bypass a blocked result. Record CoPicker ref/version, Codex version/build, macOS/architecture, exact status, plugin state, result code, and which live gates were actually tested. Never include conversation content, task contents/IDs, authentication information, cookies, or tokens.

For picker-specific behavior, see [usage.md](usage.md). For the full proof checklist, see [validation.md](validation.md).

## New-machine completion checklist

- [ ] Exact tag/commit recorded.
- [ ] `arm64`, Swift 6+, Codex CLI, and official app path checked.
- [ ] Release build and offline tests passed on the target.
- [ ] Installer ran without `sudo`.
- [ ] Installed CLI and watcher versions match.
- [ ] Resource bundle exists.
- [ ] Marketplace and plugin IDs are present.
- [ ] Codex version/build recorded.
- [ ] Current PID reports `injection-succeeded`.
- [ ] First-level picker activates CoPicker; full-width list does not.
- [ ] Models, Fast restrictions, keyboard/pointer, `Other`, placement, and submenu latching checked.
- [ ] Settings entry, geometry, persistence, and Apply-now behavior checked.
- [ ] Codex restart reinjection checked.
- [ ] Cold login/reboot checked separately or recorded as not tested.
- [ ] Port `9229` has no idle listener.
