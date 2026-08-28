# Design QA

## 2026-08-28 — Pointer-release reliability candidate

- Target flow: isolated Model Rail tuner loads, a non-thumb cell click commits once, a continuous drag commits the final release cell once without pausing, and a stationary thumb click toggles Fast once.
- Environment: Codex in-app browser, `http://127.0.0.1:8766/tools/model-rail-tuner.html`, native browser viewport, rendered stage `194 × 88` CSS pixels. The server and tab were temporary development surfaces.
- Interaction evidence: a Terra/low cell click changed the commit counter from `0` to `1`; one continuous Terra/low-to-Luna/xhigh drag changed it to `2` with committed row `2`, index `3`, Fast `false`; a stationary click on that final thumb changed it to `3` with Fast `true` and did not change the selected cell.
- Rendered evidence: the final screenshot showed the unchanged accepted rail geometry in Luna/xhigh/Fast state, with no clipping, overlap, blank page, framework overlay, console warning, or console error. Position easing is disabled only during an active drag; resting appearance is unchanged.
- Source behavior evidence: executable JavaScriptCore tests cover a release displacement with no qualifying intermediate move, a moved gesture returning to its start, ordinary cell selection, Fast preservation across preview-only compatible rows, non-Fast clearing, pointer cancellation rollback, and exact/ambiguous task-ID resolution.
- Boundary: this is isolated browser and offline source validation for renderer `0.12.9`. It did not attach to, inject, restart, or mutate the running Codex app and is not new live-runtime acceptance.

candidate result: isolated interaction passed; live Codex acceptance not tested

## 2026-08-15 — Runtime Model Rail v0.8.0

- Historical source reference: a 752 × 724 pixel Sol/xhigh preview was compared with the runtime component. The original image existed only in a machine-local temporary directory and is not a portable repository asset.
- Historical runtime reference: a 3104 × 1844 pixel Codex screenshot captured the Sol/xhigh state. The original image existed only in a machine-local temporary directory and is not a portable repository asset.
- Density normalization: structural comparison used CSS measurements because the full-page screenshots have different pixel densities. Source and runtime both measured 289.75 × 134.75 CSS pixels; the selector stage measured 194 × 88 CSS pixels.
- Full-view check: the detached rail stayed outside the official first-level picker without overlap.
- Focused check: typography, label placement, gradients, dot spacing, fill/thumb geometry, endpoint labels, shell color, and outer footprint matched the approved preview.
- Interaction check: the user confirmed arrow-key navigation and Space-based Fast toggling in the live app.
- Final result: passed by user acceptance. No visual changes remain requested.

## 2026-08-27 — CoPicker settings native-control realignment

- Source visual truth:
  - `/Users/jonas/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Pasted 2026-08-27 at 11.03.30.png` — current Codex General settings at 3104 × 1844 pixels.
  - `/Users/jonas/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Pasted 2026-08-27 at 11.04.54.png` — current Codex default segmented control at 166 × 68 pixels.
  - `/Users/jonas/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Pasted 2026-08-27 at 11.05.26.png` — current Codex secondary toolbar button at 94 × 66 pixels.
- Rendered implementation evidence:
  - `/tmp/copicker-design-qa/implementation-pass-2-full.jpg` — reconstructed in-app-browser document capture at 657 × 1021 pixels.
  - `/tmp/copicker-design-qa/comparison-pass-2.jpg` — combined official-source and rendered-implementation comparison, including focused control regions.
- Viewport and density normalization: the official full screenshot is an @2x 3104 × 1844 capture representing a 1552 × 922 CSS-pixel app window. The focused segmented and button sources were downsampled by exactly 0.5 to 83 × 34 and 47 × 33 CSS-pixel evidence. The implementation was captured by the Codex in-app browser at a 657 × 724 CSS-pixel viewport and device scale 1; two captures at `scrollY=0` and `scrollY=297.5` were joined without rescaling. The full views therefore document responsive hierarchy rather than pixel-coordinate identity, while all focused controls are compared at one image pixel per CSS pixel.
- State: Simplified Chinese, light appearance, CoPicker enabled, Sol/Terra/Luna visible, top placement selected, Codex appearance selected, and focused controls captured without hover. The source page contains General settings copy while the implementation contains CoPicker-specific copy; component structure, theme, and checked/selected states are the comparison targets.
- Full-view comparison evidence: both surfaces use the same settings-group hierarchy, 768-pixel maximum content column, 16-pixel card radius, 12-by-16 row inset, 24-pixel row gap, compact group headings, and responsive shrink behavior. CoPicker's additional groups and model rows are intentional product content, not visual drift.
- Focused comparison evidence:
  - Card: white light fill, 8-percent default border, 16-pixel radius, and no superellipse override.
  - Switch: 32 × 20 track, 16 × 16 border-box thumb, 2-pixel unchecked offset, 14-pixel checked offset, 10-percent off fill, and current Codex chart blue when checked.
  - Segmented control: transparent group, 2-pixel option gap, 24-pixel option box, fully rounded option, tertiary unselected text, and selected-only 5-percent text fill with no shadow.
  - Action: 28-pixel toolbar height, 8-pixel horizontal padding, 10-pixel radius, transparent border, 14-pixel text, and 5-percent/10-percent normal/hover fills.
- Required fidelity surfaces:
  - Fonts and typography: system/OpenAI host font variables, 14-pixel group titles and toolbar actions, 12-pixel row labels/options, 11-pixel descriptions, native weights, and native line heights are aligned. No wrapping or truncation regression was visible at 657 pixels.
  - Spacing and layout rhythm: native row, card, section-header, option, switch, and action dimensions are aligned; the narrower implementation capture exercised responsive layout without overlap or clipping.
  - Colors and visual tokens: card fill, 8-percent border, 5-percent selected/action fill, 10-percent hover/off fill, tertiary text, focus ring, and chart blue now map to the current renderer semantics.
  - Image quality and assets: this settings surface contains no visible product imagery or custom icons; no raster, SVG, emoji, or CSS-art substitute is present.
  - Copy and content: CoPicker-specific labels and access/subscription notices remain unchanged and readable; the source General-page copy is intentionally not duplicated.
- Interaction evidence: the preview bridge returned an authoritative snapshot, six inputs rendered selected, placement selection remained keyboard-native through radio inputs, and **立即应用** completed with `已应用到当前 Codex`, `当前窗口已更新，无需重启。`, and no visible error panel. The live Codex process was not attached, signalled, restarted, or reinjected for this QA pass.
- Comparison history:
  - Pass 1 found four P1 mismatches: an oversized pseudo-element switch thumb, a stronger outline token, the inset segmented-control variant, and an outlined pill action. It also found a large standalone page title and a gray fallback card fill that did not match the current light Codex surface.
  - Fixes replaced the pseudo-element with a border-box thumb element; mapped the default 8-percent border; implemented the default transparent segmented variant; implemented the `secondary` toolbar action; changed the top treatment to the native compact settings-group header; and made the light fallback panel pure white while retaining forwarded host tokens.
  - Pass 2 used `/tmp/copicker-design-qa/comparison-pass-2.jpg`; no actionable P0, P1, or P2 mismatch remained in the required fidelity surfaces. The different source copy, model-row count, and responsive viewport width are documented constraints rather than visual defects.

final result: passed

## 2026-08-28 — CoPicker page-title hierarchy

- Source visual truth:
  - `/Users/jonas/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Pasted 2026-08-28 at 00.02.56.png` — current official Codex General settings at 3104 × 1844 pixels, showing the page-level heading, its vertical clearance, and compact group headings.
  - `/Users/jonas/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Pasted 2026-08-28 at 00.02.59.png` — the accepted CoPicker controls before this correction, showing that only the page-title hierarchy and missing first group label required adjustment.
- Rendered implementation evidence:
  - `/tmp/copicker-design-qa-2026-08-28.png` — updated CoPicker settings document captured at a 1552 × 922 CSS-pixel viewport in the Codex in-app browser.
  - `/tmp/copicker-design-qa-comparison-2026-08-28.png` — one combined comparison input containing the official reference downsampled from @2x and the implementation at one image pixel per CSS pixel.
- Viewport and density normalization: the 3104 × 1844 official screenshot was downsampled exactly to 1552 × 922 before comparison. The isolated implementation uses the same viewport but intentionally omits the surrounding native settings sidebar and toolbar; relative page-title, group-title, and card spacing are therefore the authoritative comparison surfaces.
- State: Simplified Chinese, dark appearance, CoPicker enabled, all six adapted models visible, top placement selected, Codex appearance selected, saved status visible, and no hover or focus treatment active. The preview used an isolated local bridge and did not attach to, signal, inject into, terminate, or restart Codex.
- Native source confirmation: the current Codex renderer wraps settings pages with a 768-pixel maximum content column, a `heading-lg font-normal` page heading, 32 pixels of bottom padding, 40-pixel group gaps, and compact toolbar-height section headers. The implementation now follows that same hierarchy while retaining the already accepted local control primitives.
- Measured implementation:
  - Page title: 24-pixel font, 400 weight, 28.8-pixel line height, starting at the content inset.
  - Page-title wrapper: 32-pixel bottom padding.
  - First group title: `常规`, 14-pixel font, 500 weight, 21-pixel line height.
  - First card: 768-pixel width at the same left edge as both headings; all lower groups retain their previous 40-pixel spacing.
- Required fidelity surfaces:
  - Typography: the page title now has the official visual prominence while section headings remain compact; row labels, descriptions, warnings, and controls are unchanged.
  - Spacing: the page title no longer collapses into the first card, and the new `常规` label occupies the same group-header rhythm used by official settings.
  - Layout: the existing centered 768-pixel maximum width, card geometry, row separators, model order, placement controls, and appearance controls remain unchanged.
  - Color and assets: the accepted dark theme tokens, colored warning text, switches, and icon-free settings body remain unchanged.
- Comparison history:
  - Pass 1 is the user-supplied CoPicker screenshot: the outer title incorrectly reused the 14-pixel group-title treatment and the first card had no visible group label.
  - Pass 2 is `/tmp/copicker-design-qa-comparison-2026-08-28.png`: the outer heading matches the official 24-pixel page treatment, the relative blank space matches the native wrapper contract, and the first group now reads `常规`. No visible regression was found in the accepted lower controls.

final result: passed

## 2026-08-28 — Superseded screenshot-derived page-top inset

> Historical result only. This screenshot-based 42-pixel inset was later disproved by direct live DOM and computed-style measurements. The current accepted contract is recorded in the final section below and in `docs/accepted-baseline.md`.

- Source visual truth:
  - `/Users/jonas/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Pasted 2026-08-28 at 01.15.19.png` — live CoPicker settings at 3104 × 1844 pixels before the correction, showing the page title too close to the host toolbar edge.
  - `/Users/jonas/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Pasted 2026-08-28 at 01.15.23.png` — official Codex General settings at 3104 × 1844 pixels, used to confirm the intended page-level vertical breathing room.
- Rendered implementation evidence:
  - `/tmp/copicker-design-qa-top-inset-2026-08-28.png` — corrected CoPicker settings document captured in the Codex in-app browser at a 1552 × 922 CSS-pixel viewport.
  - `/tmp/copicker-design-qa-top-inset-comparison-2026-08-28.png` — combined full-view and focused comparison of the observed live page before the fix and the corrected implementation.
- Viewport and density normalization: the live 3104 × 1844 source was downsampled exactly to 1552 × 922. The implementation was captured at 1552 × 922 with one image pixel per CSS pixel. The focused comparison aligns the host content edge and page-title region so surrounding sidebar and toolbar differences do not distort the whitespace judgment.
- State: Simplified Chinese, dark appearance, CoPicker enabled, all six adapted models visible, top placement selected, Codex appearance selected, saved status visible, and no hover or focus treatment active. The preview used an isolated local bridge and did not attach to, signal, inject into, terminate, or restart Codex.
- Findings and comparison history:
  - Pass 1 found one P2 spacing mismatch: the live page left approximately half as much clear space above `CoPicker` as between `CoPicker` and `常规`, making the page title appear pinned to the host toolbar edge.
  - The fix changed only the body page-top inset from 20 to 42 pixels and advanced the renderer compatibility identifier so a subsequent injection replaces the older settings surface.
  - Pass 2 measured 42 pixels from the content top to the page-title top and 41.5 pixels from the page-title bottom to the `常规` title top. The 0.5-pixel difference is subpixel layout rounding; no actionable P0, P1, or P2 mismatch remains.
- Required fidelity surfaces:
  - Fonts and typography: the accepted 24-pixel, 400-weight page title and 14-pixel, 500-weight group headings are unchanged.
  - Spacing and layout rhythm: only the page-top inset changed; the first card begins at the same position relative to `常规`, and all 40-pixel lower group gaps remain unchanged.
  - Colors and visual tokens: dark surface, text, border, warning, switch, and selected-control tokens are unchanged.
  - Image quality and assets: the settings body contains no visible product imagery or new assets.
  - Copy and content: all labels, descriptions, access notices, model order, and save/apply messages are unchanged.
- Interaction evidence: the preview loaded the authoritative snapshot and **立即应用** still completed with `已应用到当前 Codex` and `当前窗口已更新，无需重启。` after the spacing-only change.

historical result: superseded; do not use the 42-pixel inset as a current implementation target

## 2026-08-28 — CoPicker live native settings viewport alignment

- Source of truth: bounded `getBoundingClientRect()` and `getComputedStyle()` readings from the running official General settings page, not screenshot estimation or guessed minified utility classes.
- Exact environment:
  - runtime source `c0343d4d76e4094cd99ba9ff7fe0fb71fc3edbbb`;
  - CoPicker CLI/plugin `0.12.0-dev`;
  - renderer compatibility `0.12.8`;
  - Codex desktop `26.820.60940` build `7119`;
  - Apple silicon `arm64`;
  - `1440 × 810` CSS-pixel window at device-pixel ratio `2`.
- Direct official measurements:
  - right-pane toolbar: `top=0`, `height=46`;
  - scroll viewport: `left=268.828125`, `top=46`, `width=1171.171875`, `height=764`, `overflow-y=auto`, and `20px` padding on every side;
  - centered content: `left=470.41`, `top=66`, `width=768`, `max-width=768px`;
  - page heading: `top=66`, `height=28.8`, `font-size=24px`, `line-height=28.8px`, `font-weight=400`;
  - title block: `height=60.8`, including `32px` bottom padding;
  - first group title: `top=136.3`, `height=21`, `font-size=14px`, `line-height=21px`, `font-weight=500`;
  - heading top to group-title top: `70.3px`; heading bottom to group-title top: `41.5px`.
- Root cause of the superseded pass: the fallback host covered the whole right pane from `y=0`, so the fixed 42-pixel body inset attempted to absorb both the toolbar and panel spacing. It also inherited a 32-pixel `text-2xl` line height instead of the official unitless `1.2` heading line height.
- Accepted implementation:
  - detect the full-width native `overflow-y: auto|scroll` viewport inside the settings panel;
  - position the fallback host to that viewport rectangle below the toolbar;
  - use a 20-pixel iframe body inset, centered 768-pixel maximum content column, 24-pixel heading, unitless `1.2` line height, 32-pixel title bottom padding, and 40-pixel group gaps;
  - retain responsive measurement instead of hard-coding the observed sidebar width or window coordinate.
- Regression boundary: `model-rail.js` keeps the wide-scroll-viewport predicate, forwards the native heading line-height variable, and deliberately does not forward `--text-2xl--line-height`; `copicker-settings-v2.html` keeps `--copicker-page-top-inset: 20px`.
- Acceptance: the corrected payload was installed and reviewed in the running Codex app. The user explicitly confirmed that the page was completely identical to the official settings geometry.
- Safety evidence: the bounded inspection/injection closed Inspector afterward; the official app bundle was not modified or re-signed, and Codex was not terminated or restarted by the agent.

final result: passed for the exact runtime and Codex build above; later Codex builds require independent remeasurement
