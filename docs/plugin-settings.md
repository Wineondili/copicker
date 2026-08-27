# CoPicker settings plugin

CoPicker's settings entry is packaged as a local Codex plugin backed by the existing native `copicker` executable. This keeps the settings integration outside the signed Codex application bundle and avoids adding another persistent helper process.

## Current phase

The repository currently contains the offline integration and persistence foundation:

- `Plugin/copicker/`: distributable Codex plugin package;
- `Plugin/copicker/assets/model-picker-grid.svg`: the supplied source icon;
- explicit light and dark icon variants for plugin surfaces;
- `copicker mcp-server`: a private stdio MCP server mode;
- `ui://copicker/settings/v2.html`: the versioned MCP App resource;
- a native `CoPicker` MCP settings entrypoint plus an injected sidebar fallback placed after the built-in Plugins and Browser entries;
- a Codex-native-styled, transparent, network-free interactive settings page;
- a versioned preference store at `~/Library/Application Support/Copicker/settings.json`.

The store contains only CoPicker enablement, visible supported-model keys, preferred placement, appearance, schema version, and revision. Writes are validated, atomic, permissioned `0600`, and protected by an optimistic revision check so a stale settings page cannot silently replace a newer edit.

The page exposes native, keyboard-accessible controls for:

- enabling or disabling the injected rail;
- showing GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna, Daybreak Blue, GPT-5.5, and GPT-5.3 Codex Spark, with at least one model retained;
- selecting a top, left, or right preferred placement;
- following Codex, following macOS, or forcing a light or dark rail.

The right pane mirrors the current Codex settings hierarchy: a responsive content column capped at 768 pixels and centered so wider panes add equal side whitespace instead of stretching the settings, the same compact settings-group header treatment, grouped sections, 16-pixel settings cards using the renderer's 8-percent default border, inset row separators, and 32-by-20 switches with a 16-pixel thumb. The immediate-apply row sits directly below the CoPicker enablement row instead of creating a separate bottom group. Placement and appearance use Codex's default segmented-control variant: the group itself is transparent, only the selected option receives the 5-percent text fill, and no selected-item shadow is added. Apply and retry actions use the same borderless 28-pixel `secondary` toolbar-button treatment as built-in settings actions. The document implements those primitives locally instead of importing private Codex React modules, so the native MCP App route and the injected sandboxed fallback share one stable visual surface without coupling preference behavior to minified host component names. The native MCP route consumes Codex's injected MCP style variables directly; the fallback resolves the corresponding current renderer variables and forwards them into its script-disabled frame so both paths follow the active Codex typography, surfaces, default border, focus ring, blue accent, font, and shadow scale without fixed theme approximations.

Autosaves are serialized and always use the last authoritative revision. A stale window displays the newer stored values instead of overwriting them. The UI never uses browser storage. By default, saved settings take effect when Codex is next started and the next process injection runs. The explicit **Apply now** button is enabled only after saving finishes and applies the persisted snapshot to the current Codex process without restarting it.

The settings copy records the non-Fast contracts for Daybreak and Codex Spark, the possible Codex Trusted Access for Cyber requirement for Daybreak, and the possible ChatGPT Pro 5x / 20x requirement for Codex Spark. These notices do not grant model access; availability still comes from the signed-in account's official `model/list` catalog.

## Runtime contract

All three settings tools are host-only. Their `_meta.ui.visibility` contains only `app`, so they are not offered as normal model-callable tools. `copicker_settings` is the read-only render entrypoint and declares the standard MCP App resource through `_meta.ui.resourceUri`; `copicker_settings_save` accepts a complete preference snapshot plus the caller's expected revision. Repeating an already-applied save is idempotent, while a stale save returns the current authoritative snapshot. `copicker_settings_apply` is called only by the explicit UI action and launches the installed executable's existing guarded `inject` command.

The current Codex settings sidebar additionally discovers `_meta["openai/ui"].entrypoints` entries whose type is `settings`. That metadata and server-icon handling are private Codex compatibility points and must be rechecked after desktop updates.

Codex `26.820.60940` parses that metadata but filters local plugin settings views behind a remote rollout gate and plugin allowlist. CoPicker therefore also installs a renderer-side compatibility entry when the native item is absent. The fallback clones the built-in Browser navigation control, replaces only its icon and label, and opens the same bundled settings document over the right settings pane. If a later Codex build admits the native CoPicker entry, the fallback removes itself instead of creating a duplicate.

The fallback does not add a port or a second settings store. Codex's top-level CSP blocks inline scripts inherited by `about:srcdoc`, so the fallback removes scripts from its frame copy, keeps the frame in a script-disabled same-origin sandbox, and attaches the form controller from the already injected parent world. The parent controller permits only the three CoPicker tool names, resolves an already loaded task, and uses the documented `mcpServer/tool/call` app-server method to reach the same native stdio server and atomic preference store. The original MCP App resource keeps its inline controller for a future native settings entry, along with networking and nested frames disabled by CSP.

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

Expected output is three newline-delimited JSON-RPC responses. They should report the `CoPicker` server, app-only `copicker_settings`, `copicker_settings_save`, and `copicker_settings_apply` tools, and the versioned HTML resource with the MCP App MIME type. This listing does not call the apply tool and therefore does not open Inspector.

## Installation

`script/install.sh` copies the marketplace descriptor and plugin package to `~/Library/Application Support/Copicker/plugin-marketplace`, registers the `copicker-local` marketplace, and installs `copicker@copicker-local` through the Codex CLI. This stable copy keeps the settings entry working after the source checkout is removed. Reinstallation refreshes the same plugin ID.

Reading and autosaving settings do not open Inspector or mutate a live task. Saved changes are consumed by the watcher on the next Codex process injection. Clicking **Apply now** is the sole settings-page action that deliberately opens the temporary loopback Inspector through the existing guarded injection path; it does not restart Codex, and Inspector shutdown is scheduled immediately afterward. Disabling CoPicker prevents the watcher from opening Inspector for a later Codex process, while applying that disabled snapshot removes the active rail behavior from the current renderer.

## Remaining host-loop validation

After the settings contents are approved:

1. install it explicitly on a test device;
2. restart Codex only outside an active Codex task;
3. verify sidebar order, fallback/native deduplication, light and dark icons, settings rendering, persistence, each configured model shape, all three placements, latching, and existing selection behavior separately;
4. record the exact Codex version and build used for host-loop acceptance.

The offline suite and a standalone app-server smoke test validate the package, MCP runtime, read path, and non-mutating stale-write conflict transport. A real Codex restart is still required to accept the injected sidebar placement and end-to-end save behavior for each desktop build.
