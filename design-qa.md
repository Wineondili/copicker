# Design QA

## 2026-08-15 — Runtime Model Rail v0.8.0

- Historical source reference: a 752 × 724 pixel Sol/xhigh preview was compared with the runtime component. The original image existed only in a machine-local temporary directory and is not a portable repository asset.
- Historical runtime reference: a 3104 × 1844 pixel Codex screenshot captured the Sol/xhigh state. The original image existed only in a machine-local temporary directory and is not a portable repository asset.
- Density normalization: structural comparison used CSS measurements because the full-page screenshots have different pixel densities. Source and runtime both measured 289.75 × 134.75 CSS pixels; the selector stage measured 194 × 88 CSS pixels.
- Full-view check: the detached rail stayed outside the official first-level picker without overlap.
- Focused check: typography, label placement, gradients, dot spacing, fill/thumb geometry, endpoint labels, shell color, and outer footprint matched the approved preview.
- Interaction check: the user confirmed arrow-key navigation and Space-based Fast toggling in the live app.
- Final result: passed by user acceptance. No visual changes remain requested.
