# CoPicker settings plugin

CoPicker's settings entry is a local Codex plugin backed by the installed native `copicker` executable. It keeps settings outside the signed Codex bundle and adds no persistent network service or second preference store.

Current versions:

| Layer | Value |
| --- | --- |
| CLI/plugin release | `0.99.0` |
| Settings schema | `1` |
| MCP App resource | `ui://copicker/settings/v2.html` |
| Renderer fallback on current `main` | `0.12.11` development candidate |
| Renderer fallback in `v0.99.0` | `0.12.8` |
| Accepted runtime code | `c0343d4` |
| Live-accepted CLI label | `0.12.0-dev` |
| Accepted Codex | `26.820.60940` build `7119` |

## Package layout

- `Plugin/copicker/.codex-plugin/plugin.json`: plugin metadata and light/dark icon references;
- `Plugin/copicker/.mcp.json`: private stdio MCP server registration;
- `Plugin/copicker/bin/copicker-mcp`: launcher for the stable installed CLI;
- `Plugin/copicker/assets/model-picker-grid.svg`: source icon;
- `model-picker-grid-light.svg` and `model-picker-grid-dark.svg`: explicit host variants;
- `.agents/plugins/marketplace.json`: repository-local marketplace descriptor;
- `Sources/CopickerCore/CopickerMCPProtocol.swift`: app-only tool/resource contract;
- `Sources/CopickerCore/CopickerSettings.swift`: validated atomic store;
- `Sources/CopickerCLI/CopickerMCPServer.swift`: newline-delimited stdio transport;
- `Sources/CopickerCLI/Resources/copicker-settings-v2.html`: interactive network-free document;
- `Sources/CopickerCLI/Resources/model-rail.js`: native-entry detection and compatibility fallback.

The installer copies the marketplace/plugin into a stable Application Support directory and registers `copicker@copicker-local`. The source checkout is unnecessary after installation.

## Settings data model

The only persisted fields are:

| Field | Type/values | Default |
| --- | --- | --- |
| `schemaVersion` | integer, currently `1` | `1` |
| `revision` | non-negative integer | `0` |
| `enabled` | boolean | `true` |
| `visibleModels` | ordered adapted-model keys, at least one | Sol, Terra, Luna |
| `preferredPlacement` | `top`, `left`, `right` | `top` |
| `appearance` | `codex`, `system`, `light`, `dark` | `dark` |

The file is `~/Library/Application Support/Copicker/settings.json`. Writes are validated, normalized to the fixed model order, atomic, and mode `0600`.

Saves carry the caller's expected revision. An identical save is idempotent. A real change increments the revision. A stale save fails with the current authoritative snapshot so an old window cannot overwrite a newer edit.

The page never uses localStorage, sessionStorage, IndexedDB, cookies, or a second settings file.

## App-only MCP tools

All three tools have `_meta.ui.visibility: ["app"]`; they are Codex host controls and are not presented as ordinary model-callable tools.

### `copicker_settings`

- read-only entrypoint;
- returns the authoritative snapshot;
- declares `_meta.ui.resourceUri` and `openai/outputTemplate` for `ui://copicker/settings/v2.html`;
- advertises the private settings entry metadata.

### `copicker_settings_save`

- accepts a complete preference snapshot plus expected revision;
- validates schema, revision, model keys/count, placement, and appearance;
- returns the authoritative saved/current snapshot;
- does not open Inspector or mutate the current renderer.

### `copicker_settings_apply`

- invoked only through the explicit **Apply now** action;
- requires the installed host apply handler;
- reuses the guarded current-process `inject` path;
- does not restart Codex;
- reports current-process success or a fail-closed error;
- schedules Inspector shutdown after the bounded action.

## Native entry and compatibility fallback

The plugin declares a settings entry through private Codex metadata, including an `openai/ui` settings entrypoint and themed icon data. Routing is keyed by the CoPicker server/tool contract.

Codex `26.820.60940` build `7119` parses this metadata but may filter local plugin settings views behind a remote rollout/allowlist. The accepted renderer therefore supplies a fallback only when the native item is absent.

The fallback:

1. finds the built-in Browser or Plugins settings item;
2. checks for an existing native `CoPicker` item;
3. clones the native sidebar control structure;
4. replaces only the ID, icon, label, slug, and click behavior;
5. inserts CoPicker after the built-in integration items;
6. opens the same bundled settings document over the official right scroll viewport;
7. removes/suppresses itself when a native CoPicker item appears;
8. closes when Settings navigation leaves CoPicker.

Only one settings entry and one preference store are allowed.

## CSP and controller boundary

The original MCP App resource contains its inline controller for a future/allowed native settings route. Its CSP disables all external resources, network connections, and nested frames.

Codex's top-level CSP prevents inline scripts inherited by an `about:srcdoc` fallback. The renderer therefore:

- parses the settings document;
- removes scripts from the fallback copy;
- sets `sandbox="allow-same-origin"` without `allow-scripts`;
- attaches the form controller from the already injected parent world;
- permits only `copicker_settings`, `copicker_settings_save`, and `copicker_settings_apply` through `mcpServer/tool/call`;
- uses the same stdio server and atomic settings file.

The fallback adds no port and makes no external network request.

## Native-aligned visual contract

The page implements semantic local controls because private minified Codex React modules cannot be safely imported into both the native MCP App and script-disabled fallback.

Visual inputs are:

- current Codex theme/font/border/focus/shadow variables;
- explicit light/dark fallbacks;
- measured official DOM/computed geometry;
- local controls with native checkbox/radio semantics.

### Page shell

The fallback host targets the actual full-width official settings scroll viewport, leaving the native 46-pixel toolbar visible. It does not cover the whole right pane and then guess a replacement top inset.

Accepted shell values:

| Parameter | Value |
| --- | ---: |
| Official toolbar | `46px` |
| Frame body inset | `20px` on all sides |
| Content max width | `768px`, centered |
| Page heading | `24px`, weight `400`, line height `28.8px` |
| Heading wrapper bottom padding | `32px` |
| Group gap | `40px` |
| Section header | minimum `46px`, bottom padding `6px`, gap `16px` |
| First group title | `常规`, `14px`, weight `500`, line height `21px` |

At the accepted `1440 × 810`, DPR 2 window, the official scroll viewport was measured as `left=268.828125`, `top=46`, `width=1171.171875`, `height=764`; the heading was at `y=66`, and the first group-title top was 70.3 pixels below the heading top. The implementation dynamically targets the viewport rather than hard-coding those window coordinates.

### Local control primitives

- card: 1-pixel native default border, 16-pixel radius;
- row: 12-by-16 padding and 24-pixel content/control gap;
- inset separator: 0.5 pixel with 16-pixel sides;
- switch: 32-by-20 track, 16-by-16 thumb, 2/14-pixel translations;
- segmented group: transparent, 2-pixel gaps, selected-only 5-percent fill, no shadow;
- segment: 24-pixel minimum height, 2-by-8 padding, full pill radius;
- Apply/retry: borderless/transparent-border 28-pixel action, 8-pixel horizontal padding, 10-pixel radius;
- responsive stacking: adaptive rows below 640 pixels, page header below 420 pixels.

The Apply row sits below Enable CoPicker. There is no separate bottom Apply group.

The earlier screenshot-derived 42-pixel iframe inset is superseded. It incorrectly combined toolbar and panel spacing while retaining a 32-pixel text-2xl line height. Renderer `0.12.8` uses the native viewport plus 20-pixel inset and the official 1.2 heading line height.

## Settings behavior

The page exposes:

- enabled/disabled rail;
- visibility toggles for all six adapted models, with one retained;
- top/left/right preferred placement;
- Codex/system/light/dark appearance.

Autosaves are serialized from the last authoritative revision. Loading and saving do not open Inspector. Save state remains separate from current-process apply state.

By default, a saved snapshot takes effect on the next injection. **Apply now** becomes available only after saving completes. On success it reports that the current window was updated without restart. On failure it states that the saved snapshot will still apply on the next normal injection.

The page includes the Daybreak Trusted Access/network notice, Codex Spark subscription notice, effort counts, and non-Fast behavior. Those notices do not grant model availability.

## Theme forwarding

The native MCP page consumes Codex-provided MCP style variables. The fallback maps current renderer tokens for:

- surfaces and panels;
- primary/secondary/tertiary text;
- default border and focus ring;
- info/warning/danger and chart blue;
- font family, text scales, weights, and page-heading size;
- shadows and white thumb token.

The page-heading line height deliberately does not fall back to the unrelated `text-2xl` line-height variable; it uses the official heading value when present and otherwise unitless `1.2`.

## Installation and update behavior

`script/install.sh`:

1. installs the CLI/resource bundle and watcher;
2. copies the marketplace/plugin package into Application Support;
3. adds marketplace `copicker-local` when absent;
4. removes the old registration for `copicker@copicker-local` when present;
5. adds the refreshed plugin under the same ID.

This refreshes the package without duplicating the entry. `settings.json` remains separate and persists.

The settings item is normally available after Codex next opens and the new renderer payload is injected.

## Offline validation

```bash
swift build
swift test

printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  '{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"ui://copicker/settings/v2.html"}}' \
  | .build/debug/copicker mcp-server
```

Expected responses advertise CoPicker server metadata, the three app-only tools, the versioned MCP App resource, themed icons, and empty network/frame allowlists. Listing/reading these contracts does not call Apply and does not open Inspector.

## Live acceptance status

The current settings surface is no longer in a pending visual phase. For runtime commit `c0343d4` on Codex build `7119`:

- sidebar fallback/native deduplication was operational;
- persistence and Apply-now behavior were operational;
- the final settings layout was measured against the live official General page;
- the corrected version was installed;
- the user confirmed that the result is completely identical;
- Inspector closure was verified.

A later Codex build still requires new host-loop checks. Use [validation.md](validation.md#live-settings-acceptance-checklist) and record the exact build rather than carrying this acceptance forward automatically.
