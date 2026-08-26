# CoPicker settings plugin

CoPicker's settings entry is packaged as a local Codex plugin backed by the existing native `copicker` executable. This keeps the settings integration outside the signed Codex application bundle and avoids adding another persistent helper process.

## Current phase

The repository currently contains the offline integration and persistence foundation:

- `Plugin/copicker/`: distributable Codex plugin package;
- `Plugin/copicker/assets/model-picker-grid.svg`: the supplied source icon;
- explicit light and dark icon variants for plugin surfaces;
- `copicker mcp-server`: a private stdio MCP server mode;
- `ui://copicker/settings/v2.html`: the versioned MCP App resource;
- a `CoPicker` settings entrypoint intended to appear after the built-in Plugins and Browser entries;
- a transparent, network-free interactive settings page;
- a versioned preference store at `~/Library/Application Support/Copicker/settings.json`.

The store contains only CoPicker enablement, visible supported-model keys, preferred placement, appearance, schema version, and revision. Writes are validated, atomic, permissioned `0600`, and protected by an optimistic revision check so a stale settings page cannot silently replace a newer edit.

The page exposes native, keyboard-accessible controls for:

- enabling or disabling the injected rail;
- showing GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna, Daybreak Blue, GPT-5.5, and GPT-5.3 Codex Spark, with at least one model retained;
- selecting a top, left, or right preferred placement;
- following Codex, following macOS, or forcing a light or dark rail.

Autosaves are serialized and always use the last authoritative revision. A stale window displays the newer stored values instead of overwriting them. The UI never uses browser storage, and settings take effect on the next injection rather than opening Inspector from the settings page.

The settings copy records the non-Fast contracts for Daybreak and Codex Spark, the possible Codex Trusted Access for Cyber requirement for Daybreak, and the possible ChatGPT Pro 5x / 20x requirement for Codex Spark. These notices do not grant model access; availability still comes from the signed-in account's official `model/list` catalog.

## Runtime contract

Both settings tools are host-only. Their `_meta.ui.visibility` contains only `app`, so they are not offered as normal model-callable tools. `copicker_settings` is the read-only render entrypoint and declares the standard MCP App resource through `_meta.ui.resourceUri`; `copicker_settings_save` accepts a complete preference snapshot plus the caller's expected revision. Repeating an already-applied save is idempotent, while a stale save returns the current authoritative snapshot.

The current Codex settings sidebar additionally discovers `_meta["openai/ui"].entrypoints` entries whose type is `settings`. That metadata and server-icon handling are private Codex compatibility points and must be rechecked after desktop updates.

The server advertises the supplied icon as `data:` SVGs with separate `light` and `dark` themes. It serves the settings page with `text/html;profile=mcp-app`, an empty network CSP allowlist, and no iframe or external-resource domains.

## Offline validation

The following checks do not install the plugin, open Inspector, signal Codex, or modify the user LaunchAgent:

```bash
swift build
swift test

printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  '{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"ui://copicker/settings/v2.html"}}' \
  | .build/debug/copicker mcp-server
```

Expected output is three newline-delimited JSON-RPC responses. They should report the `CoPicker` server, app-only `copicker_settings` and `copicker_settings_save` tools, and the versioned HTML resource with the MCP App MIME type.

## Installation

`script/install.sh` copies the marketplace descriptor and plugin package to `~/Library/Application Support/Copicker/plugin-marketplace`, registers the `copicker-local` marketplace, and installs `copicker@copicker-local` through the Codex CLI. This stable copy keeps the settings entry working after the source checkout is removed. Reinstallation refreshes the same plugin ID.

The settings page does not open Inspector or mutate a live task. Saved changes are consumed by the watcher on the next Codex process injection. Disabling CoPicker prevents the watcher from opening Inspector for that Codex process.

## Remaining host-loop validation

After the settings contents are approved:

1. install it explicitly on a test device;
2. restart Codex only outside an active Codex task;
3. verify sidebar order, light and dark icons, settings rendering, persistence, each configured model shape, all three placements, latching, and existing selection behavior separately;
4. record the exact Codex version and build used for host-loop acceptance.

Until those gates are complete, the current work establishes a validated source package and MCP runtime, not a live-installed settings entry.
