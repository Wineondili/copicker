# Design QA

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
