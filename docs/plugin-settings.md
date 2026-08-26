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
- a transparent, network-free settings page shell;
- a versioned preference store at `~/Library/Application Support/Copicker/settings.json`.

The store contains only CoPicker enablement, visible supported-model keys, preferred placement, appearance, schema version, and revision. Writes are validated, atomic, permissioned `0600`, and protected by an optimistic revision check so a stale settings page cannot silently replace a newer edit. The plugin package is not yet installed by `script/install.sh`, and this phase does not change a personal plugin marketplace or the running Codex application.

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

## Remaining integration work

After the settings contents are approved:

1. implement the interactive controls and connect authoritative read/save snapshots to the MCP App;
2. add installation, update, and removal for the plugin package;
3. install it explicitly on a test device;
4. restart Codex only outside an active Codex task;
5. verify sidebar order, light and dark icons, settings rendering, persistence, and existing model-rail behavior separately;
6. record the exact Codex version and build used for host-loop acceptance.

Until those gates are complete, the current work establishes a validated source package and MCP runtime, not a live-installed settings entry.
